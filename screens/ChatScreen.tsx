import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from '../src/components/ProfileAvatar';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import { COLORS } from '../src/data/mockData';
import type { DiscoveryProfile, MatchWithProfile } from '../src/types/database';
import { sendLocalNotification } from '../src/lib/notifications';
import { rateLimitAction } from '../src/lib/rateLimit';
import {
  ChatMessage,
  fetchMessages,
  formatMessageTime,
  markMessagesAsRead,
  sendMessage,
  subscribeToChatRealtime,
} from '../src/lib/messages';
import MatchProfile from './MatchProfile';

const TYPING_STOP_MS = 2000;

type ChatScreenProps = {
  matchId: string;
  profile: DiscoveryProfile;
  onBack: () => void;
};

function mergeMessage(prev: ChatMessage[], next: ChatMessage): ChatMessage[] {
  const idx = prev.findIndex((m) => m.id === next.id);
  if (idx >= 0) {
    const copy = [...prev];
    copy[idx] = next;
    return copy;
  }
  return [...prev, next];
}

export default function ChatScreen({ matchId, profile, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showModerationSheet, setShowModerationSheet] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const realtimeRef = useRef<ReturnType<typeof subscribeToChatRealtime> | null>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const match: MatchWithProfile = {
    matchId,
    profile,
    matchedAt: new Date().toISOString(),
  };

  const markRead = useCallback(async () => {
    try {
      await markMessagesAsRead(matchId);
    } catch {
      // non-blocking
    }
  }, [matchId]);

  const loadMessages = useCallback(async () => {
    setError('');
    try {
      const rows = await fetchMessages(matchId);
      setMessages(rows);
      await markRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [matchId, markRead]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const handle = subscribeToChatRealtime(matchId, profile.id, {
      onMessage: (incoming) => {
        let shouldNotify = false;
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          if (!incoming.isMine) shouldNotify = true;
          return [...prev, incoming];
        });
        if (shouldNotify) {
          const senderName = profile.name?.trim() || 'Someone';
          void sendLocalNotification(senderName, incoming.body).catch(() => {});
          void markRead();
        }
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      },
      onMessageUpdated: (updated) => {
        setMessages((prev) => mergeMessage(prev, updated));
      },
      onTyping: (isTyping) => {
        setOtherTyping(isTyping);
      },
    });
    realtimeRef.current = handle;
    return () => {
      handle.unsubscribe();
      realtimeRef.current = null;
    };
  }, [matchId, profile.id, profile.name, markRead]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;
    realtimeRef.current?.broadcastTyping(isTyping);
  }, []);

  const handleDraftChange = (text: string) => {
    setDraft(text);
    if (typingStopRef.current) clearTimeout(typingStopRef.current);

    if (text.trim()) {
      setTyping(true);
      typingStopRef.current = setTimeout(() => setTyping(false), TYPING_STOP_MS);
    } else {
      setTyping(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      setTyping(false);
    };
  }, [setTyping]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    if (!rateLimitAction('message_send', 50, 3_600_000)) {
      setError('Message limit reached. You can send up to 50 messages per hour.');
      return;
    }

    setTyping(false);
    setSending(true);
    setDraft('');
    try {
      const sent = await sendMessage(matchId, text);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    } catch (err) {
      setDraft(text);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const lastMineId = [...messages].reverse().find((m) => m.isMine)?.id;

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const prev = index > 0 ? messages[index - 1] : null;
    const showTime =
      !prev ||
      new Date(item.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000;
    const showRead = item.isMine && !!item.readAt && item.id === lastMineId;

    return (
      <View>
        {showTime && (
          <Text style={styles.timeDivider}>{formatMessageTime(item.createdAt)}</Text>
        )}
        <View
          style={[
            styles.bubbleRow,
            item.isMine ? styles.bubbleRowSent : styles.bubbleRowReceived,
          ]}
        >
          <View
            style={[
              styles.bubble,
              item.isMine ? styles.bubbleSent : styles.bubbleReceived,
            ]}
          >
            <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextSent]}>
              {item.body}
            </Text>
          </View>
          {showRead ? (
            <View style={styles.readReceipt}>
              <Ionicons name="checkmark-done" size={14} color="rgba(7, 77, 46, 0.5)" />
              <Text style={styles.readReceiptText}>Read</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  if (showProfile) {
    return (
      <MatchProfile
        match={match}
        onBack={() => setShowProfile(false)}
        onSendMessage={() => setShowProfile(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <ProfileAvatar
          name={profile.name}
          gradient={profile.gradient}
          avatarUrl={profile.avatarUrl}
          size={42}
        />
        <View style={styles.headerText}>
          <Text style={styles.chatName}>{profile.name}</Text>
          {otherTyping ? (
            <Text style={styles.typingMeta}>typing…</Text>
          ) : (
            <Text style={styles.chatMeta}>{profile.compatibility}% genotype match</Text>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.profileBtn, pressed && styles.profileBtnPressed]}
          onPress={() => setShowProfile(true)}
          accessibilityLabel="View profile"
        >
          <Ionicons name="person-circle-outline" size={24} color={COLORS.forest} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && styles.profileBtnPressed]}
          onPress={() => setShowModerationSheet(true)}
          accessibilityLabel="Report or block"
        >
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.forest} />
        </Pressable>
      </View>

      <ReportBlockSheet
        visible={showModerationSheet}
        onClose={() => setShowModerationSheet(false)}
        targetUserId={profile.id}
        targetName={profile.name}
        onBlocked={onBack}
      />

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.forest} size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintText}>
                You matched! Say hello and start your compatibility journey.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          value={draft}
          onChangeText={handleDraftChange}
          placeholder="Type a message..."
          placeholderTextColor="rgba(7, 77, 46, 0.35)"
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <Pressable
          style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!draft.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.forest} size="small" />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(7, 77, 46, 0.08)',
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 213, 186, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 22,
    color: COLORS.forest,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
  },
  chatMeta: {
    fontSize: 12,
    color: 'rgba(7, 77, 46, 0.55)',
    fontWeight: '600',
    marginTop: 2,
  },
  typingMeta: {
    fontSize: 12,
    color: COLORS.sage,
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: 2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  profileBtnPressed: {
    opacity: 0.85,
  },
  profileBtnIcon: {
    fontSize: 18,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    color: '#A32D2D',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  timeDivider: {
    alignSelf: 'center',
    fontSize: 11,
    color: 'rgba(7, 77, 46, 0.45)',
    fontWeight: '600',
    marginVertical: 10,
  },
  emptyHint: {
    alignSelf: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(168, 213, 186, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: '90%',
  },
  emptyHintText: {
    fontSize: 13,
    color: COLORS.forest,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },
  bubbleRow: {
    marginBottom: 6,
    maxWidth: '82%',
  },
  bubbleRowSent: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleRowReceived: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleSent: {
    backgroundColor: COLORS.forest,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.1)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.forest,
    fontWeight: '500',
  },
  bubbleTextSent: {
    color: COLORS.ivory,
  },
  readReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
    marginRight: 2,
  },
  readReceiptText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.5)',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(7, 77, 46, 0.08)',
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.12)',
    backgroundColor: COLORS.ivory,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.forest,
    fontWeight: '500',
  },
  sendBtn: {
    minWidth: 72,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.forest,
  },
});

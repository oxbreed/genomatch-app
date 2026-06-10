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
import FamilyPlanningCard from '../src/components/FamilyPlanningCard';
import ProfileAvatar from '../src/components/ProfileAvatar';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import { getInitials } from '../src/data/mockData';
import { COLORS, RADIUS, SHADOWS } from '../src/theme';
import { getCurrentProfile } from '../src/lib/profiles';
import type { DiscoveryProfile, Genotype, MatchWithProfile } from '../src/types/database';
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
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);
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
    void getCurrentProfile().then((row) => setViewerGenotype(row?.genotype ?? null));
  }, []);

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
              <Ionicons name="checkmark-done" size={14} color={COLORS.textSubtle} />
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
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.headerIconBtnPressed]}
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.forest} />
        </Pressable>
        {profile.avatarUrl?.trim() || profile.photos[0]?.trim() ? (
          <ProfileAvatar
            name={profile.name}
            gradient={profile.gradient}
            avatarUrl={profile.avatarUrl ?? profile.photos[0]}
            size={42}
            noPhotoBackground={COLORS.forest}
            noPhotoInitialColor={COLORS.linen}
          />
        ) : (
          <View style={styles.chatHeaderAvatarFallback}>
            <Text style={styles.chatHeaderAvatarInitials}>
              {getInitials(profile.name)}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.chatName}>{profile.name}</Text>
          {otherTyping ? (
            <Text style={styles.typingMeta}>typing…</Text>
          ) : (
            <Text style={styles.chatMeta}>{profile.compatibility}% genotype match</Text>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.headerIconBtnPressed]}
          onPress={() => setShowProfile(true)}
          accessibilityLabel="View profile"
        >
          <Ionicons name="person-circle-outline" size={22} color={COLORS.forest} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.headerIconBtnPressed]}
          onPress={() => setShowModerationSheet(true)}
          accessibilityLabel="Report or block"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.forest} />
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
              <FamilyPlanningCard
                viewerGenotype={viewerGenotype}
                candidateGenotype={profile.genotype}
              />
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
          placeholderTextColor={COLORS.textSubtle}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <Pressable
          style={({ pressed }) => [styles.sendBtnWrap, pressed && styles.sendBtnPressed]}
          onPress={handleSend}
          disabled={sending || !draft.trim()}
        >
          <View style={styles.sendBtn}>
            {sending ? (
              <ActivityIndicator color="#0D2818" size="small" />
            ) : (
              <Text style={styles.sendBtnText}>Send</Text>
            )}
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.linen,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
    flexShrink: 0,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.2)',
  },
  headerIconBtnPressed: {
    opacity: 0.88,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  chatHeaderAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chatHeaderAvatarInitials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 16,
    color: COLORS.gold,
    textAlign: 'center',
  },
  chatName: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 17,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  },
  chatMeta: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  typingMeta: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
    fontStyle: 'italic',
    marginTop: 2,
  },
  errorBanner: {
    fontFamily: 'Satoshi-Medium',
    backgroundColor: COLORS.errorBg,
    color: COLORS.error,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 13,
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
    fontFamily: 'Satoshi-Medium',
    alignSelf: 'center',
    fontSize: 11,
    letterSpacing: 0.3,
    color: COLORS.textSubtle,
    marginVertical: 10,
  },
  emptyHint: {
    alignSelf: 'stretch',
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 14,
    maxWidth: '100%',
  },
  emptyHintText: {
    alignSelf: 'center',
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.forest,
    textAlign: 'center',
    lineHeight: 19,
    backgroundColor: COLORS.chipFill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  bubbleRow: {
    marginBottom: 8,
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
    borderRadius: 20,
  },
  bubbleSent: {
    backgroundColor: '#1A3D28',
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E0D5',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.forest,
  },
  bubbleTextSent: {
    color: COLORS.linen,
  },
  readReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
    marginRight: 2,
  },
  readReceiptText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: COLORS.textSubtle,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#D4A843',
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D4A843',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: COLORS.forest,
  },
  sendBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  sendBtnPressed: {
    opacity: 0.9,
  },
  sendBtn: {
    minWidth: 76,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#D4A843',
  },
  sendBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0D2818',
  },
});

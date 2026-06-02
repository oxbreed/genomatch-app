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
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { COLORS } from '../src/data/mockData';
import type { DiscoveryProfile, MatchWithProfile } from '../src/types/database';
import {
  ChatMessage,
  fetchMessages,
  formatMessageTime,
  sendMessage,
  subscribeToMessages,
} from '../src/lib/messages';
import MatchProfile from './MatchProfile';

type ChatScreenProps = {
  matchId: string;
  profile: DiscoveryProfile;
  onBack: () => void;
};

export default function ChatScreen({ matchId, profile, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const match: MatchWithProfile = {
    matchId,
    profile,
    matchedAt: new Date().toISOString(),
  };

  const loadMessages = useCallback(async () => {
    setError('');
    try {
      const rows = await fetchMessages(matchId);
      setMessages(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(matchId, (incoming) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    });
    return unsubscribe;
  }, [matchId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft('');
    try {
      const sent = await sendMessage(matchId, text);
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

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const prev = index > 0 ? messages[index - 1] : null;
    const showTime =
      !prev ||
      new Date(item.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000;

    return (
      <View>
        {showTime && (
          <Text style={styles.timeDivider}>{formatMessageTime(item.createdAt)}</Text>
        )}
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
          <Text style={styles.chatMeta}>{profile.compatibility}% genotype match</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.profileBtn, pressed && styles.profileBtnPressed]}
          onPress={() => setShowProfile(true)}
          accessibilityLabel="View profile"
        >
          <Ionicons name="person-circle-outline" size={24} color={COLORS.forest} />
        </Pressable>
      </View>

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
          onChangeText={setDraft}
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
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 6,
  },
  bubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.forest,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    alignSelf: 'flex-start',
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

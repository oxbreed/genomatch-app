import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import EmptyState from '../src/components/EmptyState';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { logAuthState } from '../src/lib/auth';
import { COLORS } from '../src/data/mockData';
import { fetchConversations, formatMessageTime } from '../src/lib/messages';
import { fetchMatches } from '../src/lib/matches';
import type { ConversationPreview, DiscoveryProfile, MatchWithProfile } from '../src/types/database';
import ChatScreen from './ChatScreen';
import MatchProfile from './MatchProfile';

type MessagesProps = {
  initialChatMatchId?: string | null;
  onChatOpened?: () => void;
};

function conversationToMatch(item: ConversationPreview): MatchWithProfile {
  return {
    matchId: item.matchId,
    profile: item.profile,
    matchedAt: item.lastMessageAt ?? new Date().toISOString(),
  };
}

export default function Messages({ initialChatMatchId, onChatOpened }: MessagesProps) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    profile: DiscoveryProfile;
  } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

  const openChat = (matchId: string, profile: DiscoveryProfile) => {
    setSelectedMatch(null);
    setActiveChat({ matchId, profile });
  };

  const loadConversations = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await logAuthState('Messages.loadConversations');
      const rows = await fetchConversations();
      console.log('[Messages] fetch result', { count: rows.length, conversations: rows });
      setConversations(rows);
    } catch (err) {
      console.error('[Messages] load failed', err);
      setError(err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!initialChatMatchId) return;

    const openFromDeepLink = async () => {
      const existing = conversations.find((c) => c.matchId === initialChatMatchId);
      if (existing) {
        openChat(existing.matchId, existing.profile);
        onChatOpened?.();
        return;
      }

      try {
        const matches = await fetchMatches();
        const match = matches.find((m) => m.matchId === initialChatMatchId);
        if (match) {
          openChat(match.matchId, match.profile);
        }
      } catch {
        // ignore
      } finally {
        onChatOpened?.();
      }
    };

    if (!loading) {
      openFromDeepLink();
    }
  }, [conversations, initialChatMatchId, loading, onChatOpened]);

  if (activeChat) {
    return (
      <ChatScreen
        matchId={activeChat.matchId}
        profile={activeChat.profile}
        onBack={() => {
          setActiveChat(null);
          loadConversations();
        }}
      />
    );
  }

  if (selectedMatch) {
    return (
      <MatchProfile
        match={selectedMatch}
        onBack={() => setSelectedMatch(null)}
        onSendMessage={() => openChat(selectedMatch.matchId, selectedMatch.profile)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Start a conversation with your matches</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.forest} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={loadConversations}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.matchId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              type="no-messages"
              title="No conversations yet"
              subtitle="When you match with someone, your chats will show up here."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                style={({ pressed }) => [styles.profileTap, pressed && styles.rowPressed]}
                onPress={() => setSelectedMatch(conversationToMatch(item))}
              >
                <ProfileAvatar
                  name={item.profile.name}
                  gradient={item.profile.gradient}
                  avatarUrl={item.profile.avatarUrl}
                  size={54}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.profile.name}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.previewTap, pressed && styles.rowPressed]}
                onPress={() => openChat(item.matchId, item.profile)}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.lastMessage ?? 'Say hello'}
                  </Text>
                  <Text style={styles.time}>
                    {item.lastMessageAt ? formatMessageTime(item.lastMessageAt) : 'New'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
                onPress={() => openChat(item.matchId, item.profile)}
              >
                <Text style={styles.chatBtnText}>Chat</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#A32D2D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.forest,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.ivory,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  rowPressed: {
    backgroundColor: 'rgba(168, 213, 186, 0.15)',
  },
  profileTap: {
    alignItems: 'center',
    width: 72,
    gap: 6,
    borderRadius: 12,
    paddingVertical: 2,
  },
  previewTap: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.forest,
    textAlign: 'center',
    maxWidth: 72,
  },
  time: {
    fontSize: 11,
    color: 'rgba(7, 77, 46, 0.45)',
    fontWeight: '600',
    flexShrink: 0,
  },
  preview: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
    marginRight: 8,
  },
  chatBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatBtnPressed: {
    opacity: 0.88,
  },
  chatBtnText: {
    color: COLORS.forest,
    fontSize: 12,
    fontWeight: '800',
  },
});

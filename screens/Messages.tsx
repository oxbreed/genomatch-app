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
import { COLORS, getInitials } from '../src/data/mockData';
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
            <View style={styles.card}>
              <Pressable
                style={({ pressed }) => [styles.avatarTap, pressed && styles.cardPressed]}
                onPress={() => setSelectedMatch(conversationToMatch(item))}
              >
                <View style={styles.avatarWrap}>
                  {item.profile.avatarUrl?.trim() || item.profile.photos[0]?.trim() ? (
                    <ProfileAvatar
                      name={item.profile.name}
                      gradient={item.profile.gradient}
                      avatarUrl={item.profile.avatarUrl ?? item.profile.photos[0]}
                      size={56}
                      noPhotoBackground="#1A3D28"
                      noPhotoInitialColor="#FFFFFF"
                    />
                  ) : (
                    <View style={styles.conversationAvatarFallback}>
                      <Text style={styles.conversationAvatarInitials}>
                        {getInitials(item.profile.name)}
                      </Text>
                    </View>
                  )}
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.cardBody, pressed && styles.cardPressed]}
                onPress={() => openChat(item.matchId, item.profile)}
              >
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.profile.name}
                  </Text>
                  <Text style={styles.time}>
                    {item.lastMessageAt ? formatMessageTime(item.lastMessageAt) : 'New'}
                  </Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage ?? 'Say hello'}
                </Text>
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
    backgroundColor: COLORS.linen,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 32,
    color: '#0D2818',
  },
  subtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    marginTop: 6,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: 'Satoshi-Medium',
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
    color: COLORS.linen,
    fontWeight: '800',
  },
  list: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
  },
  avatarTap: {
    marginRight: 12,
  },
  avatarWrap: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  conversationAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,67,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationAvatarInitials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    color: 'rgba(212,168,67,0.8)',
    textAlign: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4A843',
  },
  cardBody: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    fontWeight: '700',
    color: '#0D2818',
  },
  time: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#8FAF95',
    fontWeight: '500',
    flexShrink: 0,
  },
  preview: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#8FAF95',
    fontWeight: '500',
  },
  chatBtn: {
    alignSelf: 'center',
    flexShrink: 0,
    backgroundColor: '#D4A843',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatBtnPressed: {
    opacity: 0.88,
  },
  chatBtnText: {
    color: '#0D2818',
    fontSize: 13,
    fontWeight: '700',
  },
});

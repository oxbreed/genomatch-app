import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import EmptyState from '../src/components/EmptyState';
import { GenoPremiumChrome, GenoLogoCeremony } from '../src/brand/graphics';
import { GenoInboxCountBadge, GenoInboxHeader } from '../src/components/inbox';
import ConversationListCard from '../src/components/messages/ConversationListCard';
import { logAuthState } from '../src/lib/auth';
import { TAB_SCENE_BOTTOM_PADDING } from '../src/components/navigation/tabBarLayout';
import { COLORS } from '../src/theme';
import { fetchConversations } from '../src/lib/messages';
import { fetchMatches } from '../src/lib/matches';
import type { ConversationPreview, DiscoveryProfile, MatchWithProfile } from '../src/types/database';
import ChatScreen from './ChatScreen';
import MatchProfile from './MatchProfile';

type MessagesProps = {
  initialChatMatchId?: string | null;
  initialChatProfile?: DiscoveryProfile | null;
  onChatOpened?: () => void;
  onImmersiveChange?: (immersive: boolean) => void;
};

function conversationToMatch(item: ConversationPreview): MatchWithProfile {
  return {
    matchId: item.matchId,
    profile: item.profile,
    matchedAt: item.lastMessageAt ?? new Date().toISOString(),
  };
}

export default function Messages({
  initialChatMatchId,
  initialChatProfile,
  onChatOpened,
  onImmersiveChange,
}: MessagesProps) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    profile: DiscoveryProfile;
  } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

  const unreadCount = conversations.filter((c) => c.unread).length;

  const openChat = (matchId: string, profile: DiscoveryProfile) => {
    setSelectedMatch(null);
    setActiveChat({ matchId, profile });
  };

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    try {
      await logAuthState('Messages.loadConversations');
      const rows = await fetchConversations();
      setConversations(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    onImmersiveChange?.(!!activeChat || !!selectedMatch);
  }, [activeChat, onImmersiveChange, selectedMatch]);

  useEffect(() => {
    if (!initialChatMatchId) return;

    if (initialChatProfile) {
      openChat(initialChatMatchId, initialChatProfile);
      onChatOpened?.();
      return;
    }

    const openFromDeepLink = async () => {
      const existing = conversations.find((c) => c.matchId === initialChatMatchId);
      if (existing) {
        openChat(existing.matchId, existing.profile);
        onChatOpened?.();
        return;
      }

      try {
        const { matches } = await fetchMatches();
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
      void openFromDeepLink();
    }
  }, [conversations, initialChatMatchId, initialChatProfile, loading, onChatOpened]);

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
        onBack={() => {
          setSelectedMatch(null);
          loadConversations();
        }}
        onSendMessage={() => openChat(selectedMatch.matchId, selectedMatch.profile)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />

      <GenoInboxHeader
        title="Messages"
        subtitle="Conversations with your genotype-aligned matches"
        right={
          unreadCount > 0 ? (
            <GenoInboxCountBadge count={unreadCount} variant="alert" />
          ) : (
            <GenoInboxCountBadge count={conversations.length} />
          )
        }
      />

      {loading ? (
        <View style={styles.centered}>
          <GenoLogoCeremony variant="compact" tone="dark" />
          <Text style={styles.loadingText}>Loading conversations…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadConversations()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.matchId}
          contentContainerStyle={conversations.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadConversations(true);
              }}
              tintColor={COLORS.forest}
            />
          }
          renderItem={({ item }) => (
            <ConversationListCard
              item={item}
              onOpenProfile={() => setSelectedMatch(conversationToMatch(item))}
              onOpenChat={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openChat(item.matchId, item.profile);
              }}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              type="no-messages"
              title="No messages yet"
              subtitle="When you match and start chatting, conversations will show up here."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.linen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loadingText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  list: { paddingBottom: TAB_SCENE_BOTTOM_PADDING },
  emptyList: { flexGrow: 1 },
  error: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  retryText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
});

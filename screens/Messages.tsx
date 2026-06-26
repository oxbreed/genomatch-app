import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import EmptyState from '../src/components/EmptyState';
import { GenoPremiumChrome, GenoLogoCeremony } from '../src/brand/graphics';
import {
  GenoInboxCountBadge,
  GenoInboxHeader,
  GenoInboxMatchStrip,
  GenoInboxRetryPanel,
  GenoInboxUnreadBanner,
} from '../src/components/inbox';
import ConversationListCard from '../src/components/messages/ConversationListCard';
import { pickNewMatches } from '../src/lib/inboxMatches';
import { getOpenChatMatchId } from '../src/lib/activeChat';
import { logAuthState, getAuthenticatedUserId, peekUserId } from '../src/lib/auth';
import { sendLocalNotification } from '../src/lib/notifications';
import { TAB_SCENE_BOTTOM_PADDING } from '../src/components/navigation/tabBarLayout';
import { FONT_FAMILY, COLORS, MOTION } from '../src/theme';
import {
  applyInboxMessageToConversations,
  fetchConversations,
  subscribeToInboxRealtime,
} from '../src/lib/messages';
import { fetchMatches } from '../src/lib/matches';
import type { ConversationPreview, DiscoveryProfile, MatchWithProfile } from '../src/types/database';
import ChatScreen from './ChatScreen';
import MatchProfile from './MatchProfile';

type MessagesProps = {
  isActive?: boolean;
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
  isActive,
  initialChatMatchId,
  initialChatProfile,
  onChatOpened,
  onImmersiveChange,
}: MessagesProps) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [allMatches, setAllMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    profile: DiscoveryProfile;
  } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(() => peekUserId());
  const conversationsRef = useRef(conversations);
  const listFade = useRef(new Animated.Value(0)).current;

  conversationsRef.current = conversations;

  const unreadCount = conversations.filter((c) => c.unread).length;

  const newMatches = useMemo(
    () => pickNewMatches(allMatches, conversations),
    [allMatches, conversations]
  );

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (a.unread !== b.unread) return a.unread ? -1 : 1;
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      }),
    [conversations]
  );

  const openChat = (matchId: string, profile: DiscoveryProfile) => {
    setSelectedMatch(null);
    setActiveChat({ matchId, profile });
  };

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    try {
      await logAuthState('Messages.loadConversations');
      const [rows, { matches }] = await Promise.all([
        fetchConversations(),
        fetchMatches(),
      ]);
      setConversations(rows);
      setAllMatches(matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void getAuthenticatedUserId().then((id) => setUserId(id));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!isActive) return;
    void loadConversations(true);
  }, [isActive, loadConversations]);

  useEffect(() => {
    if (!userId) return;

    return subscribeToInboxRealtime({
      onNewMessage: (row) => {
        setConversations((prev) => {
          const next = applyInboxMessageToConversations(prev, row, userId);
          if (!next) {
            void loadConversations(true);
            return prev;
          }
          return next;
        });

        if (row.sender_id !== userId && getOpenChatMatchId() !== row.match_id) {
          const conversation = conversationsRef.current.find((c) => c.matchId === row.match_id);
          const senderName = conversation?.profile.name?.trim() || 'New message';
          void sendLocalNotification(senderName, row.body, {
            kind: 'message',
            data: { type: 'message', matchId: row.match_id },
          }).catch(() => {});
        }
      },
      onMessageUpdated: (row) => {
        setConversations((prev) => {
          const next = applyInboxMessageToConversations(prev, row, userId);
          return next ?? prev;
        });
      },
      onNewMatch: () => {
        void loadConversations(true);
      },
    });
  }, [loadConversations, userId]);

  useEffect(() => {
    onImmersiveChange?.(!!activeChat || !!selectedMatch);
  }, [activeChat, onImmersiveChange, selectedMatch]);

  useEffect(() => {
    if (loading) return;
    listFade.setValue(0);
    Animated.timing(listFade, {
      toValue: 1,
      duration: MOTION.tabFadeMs + 80,
      easing: MOTION.easing.sheetOut,
      useNativeDriver: true,
    }).start();
  }, [listFade, loading, sortedConversations.length]);

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
        userId={userId}
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
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="dark" />

      <GenoInboxHeader
        title="Messages"
        subtitle="Chat with your genotype-aligned matches"
        ceremonyMark={conversations.length > 0}
        glass
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
          <GenoInboxRetryPanel message={error} onRetry={() => loadConversations()} />
        </View>
      ) : (
        <Animated.View style={[styles.listWrap, { opacity: listFade }]}>
          <FlatList
            data={sortedConversations}
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
          ListHeaderComponent={
            conversations.length > 0 || newMatches.length > 0 ? (
              <>
                <GenoInboxMatchStrip
                  matches={newMatches}
                  onOpenMatch={(match) => openChat(match.matchId, match.profile)}
                />
                <GenoInboxUnreadBanner count={unreadCount} />
              </>
            ) : null
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
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.linen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loadingText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.sage,
  },
  listWrap: { flex: 1 },
  list: { paddingTop: 4, paddingBottom: TAB_SCENE_BOTTOM_PADDING },
  emptyList: { flexGrow: 1 },
});

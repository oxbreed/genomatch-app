import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Discovery from './Discovery';
import Matches from './Matches';
import Messages from './Messages';
import Profile from './Profile';
import GenoTabBar, { type GenoTabId } from '../src/components/navigation/GenoTabBar';
import { COLORS, MOTION } from '../src/theme';
import { fetchConversations, subscribeToInboxRealtime } from '../src/lib/messages';
import { fetchMatches } from '../src/lib/matches';
import { addNotificationOpenedListener, sendLocalNotification } from '../src/lib/notifications';
import { touchLastActive } from '../src/lib/presence';
import { syncPushTokenToProfile } from '../src/lib/pushRegistration';
import { syncProfileCityFromDevice } from '../src/lib/location';
import { getOpenChatMatchId } from '../src/lib/activeChat';
import { getAuthenticatedUserId } from '../src/lib/auth';
import type { DiscoveryProfile } from '../src/types/database';

const TAB_IDS: GenoTabId[] = ['discover', 'matches', 'messages', 'profile'];

type MainTabsProps = {
  onSignOut?: () => void;
};

function useTabSceneAnimation(activeTab: GenoTabId) {
  const scenes = useRef(
    Object.fromEntries(
      TAB_IDS.map((id) => [id, new Animated.Value(id === 'discover' ? 1 : 0)])
    ) as Record<GenoTabId, Animated.Value>
  ).current;

  useEffect(() => {
    TAB_IDS.forEach((id) => {
      Animated.timing(scenes[id], {
        toValue: activeTab === id ? 1 : 0,
        duration: MOTION.tabFadeMs,
        easing: MOTION.easing.out,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab, scenes]);

  return scenes;
}

export default function MainTabs({ onSignOut }: MainTabsProps) {
  const [activeTab, setActiveTab] = useState<GenoTabId>('discover');
  const [openChatMatchId, setOpenChatMatchId] = useState<string | null>(null);
  const [openChatProfile, setOpenChatProfile] = useState<DiscoveryProfile | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [immersiveOverlay, setImmersiveOverlay] = useState(false);
  const tabScenes = useTabSceneAnimation(activeTab);

  const refreshBadges = useCallback(async () => {
    try {
      const [{ matches }, conversations] = await Promise.all([
        fetchMatches(),
        fetchConversations(),
      ]);
      setMatchCount(matches.length);
      setUnreadCount(conversations.filter((c) => c.unread).length);
    } catch {
      // badges are non-critical
    }
  }, []);

  const handleStartChatFromNotification = useCallback((matchId: string) => {
    setOpenChatMatchId(matchId);
    setOpenChatProfile(null);
    setActiveTab('messages');
    void refreshBadges();
  }, [refreshBadges]);

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    let cancelled = false;
    let unsubInbox = () => {};

    void (async () => {
      await refreshBadges();
      await syncPushTokenToProfile();
      const userId = await getAuthenticatedUserId();
      if (cancelled || !userId) return;

      unsubInbox = subscribeToInboxRealtime({
        onNewMessage: (row) => {
          void refreshBadges();
          if (
            row.sender_id !== userId &&
            getOpenChatMatchId() !== row.match_id &&
            activeTabRef.current !== 'messages'
          ) {
            void sendLocalNotification('New message', row.body, {
              kind: 'message',
              data: { type: 'message', matchId: row.match_id },
            }).catch(() => {});
          }
        },
        onMessageUpdated: () => {
          void refreshBadges();
        },
        onNewMatch: () => {
          void refreshBadges();
          void sendLocalNotification('New match on GenoMatch', 'You have a new genotype match!', {
            kind: 'match',
          }).catch(() => {});
        },
      });
    })();

    const unsubNotification = addNotificationOpenedListener((data) => {
      const matchId = typeof data?.matchId === 'string' ? data.matchId : null;
      if (matchId) {
        handleStartChatFromNotification(matchId);
      }
    });

    return () => {
      cancelled = true;
      unsubInbox();
      unsubNotification();
    };
  }, [handleStartChatFromNotification, refreshBadges]);

  useEffect(() => {
    void touchLastActive();
    void syncProfileCityFromDevice();
    const interval = setInterval(() => void touchLastActive(), 2 * 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void touchLastActive();
        void syncProfileCityFromDevice();
        void syncPushTokenToProfile();
        void refreshBadges();
      }
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshBadges]);

  useEffect(() => {
    if (activeTab !== 'messages' && activeTab !== 'matches') {
      setImmersiveOverlay(false);
    }
  }, [activeTab]);

  const handleStartChat = (matchId: string, profile?: DiscoveryProfile) => {
    setOpenChatMatchId(matchId);
    setOpenChatProfile(profile ?? null);
    setActiveTab('messages');
    void refreshBadges();
  };

  const tabPane = (tab: GenoTabId, child: ReactNode) => {
    const progress = tabScenes[tab];
    return (
      <Animated.View
        key={tab}
        style={[
          styles.tabPane,
          {
            opacity: progress,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [MOTION.tabSlidePx, 0],
                }),
              },
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.992, 1],
                }),
              },
            ],
          },
          activeTab !== tab && styles.tabHidden,
        ]}
        pointerEvents={activeTab === tab ? 'auto' : 'none'}
      >
        {child}
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {tabPane(
          'discover',
          <Discovery onMatchCreated={refreshBadges} onStartChat={handleStartChat} />
        )}
        {tabPane(
          'matches',
          <Matches onStartChat={handleStartChat} onImmersiveChange={setImmersiveOverlay} />
        )}
        {tabPane(
          'messages',
          <Messages
            initialChatMatchId={openChatMatchId}
            initialChatProfile={openChatProfile}
            onChatOpened={() => {
              setOpenChatMatchId(null);
              setOpenChatProfile(null);
            }}
            onImmersiveChange={setImmersiveOverlay}
          />
        )}
        {tabPane('profile', <Profile onSignOut={onSignOut} />)}
      </View>
      {!immersiveOverlay ? (
        <View style={styles.tabBarOverlay} pointerEvents="box-none">
          <GenoTabBar tabs={tabsFromCounts(matchCount, unreadCount)} activeTab={activeTab} onSelect={setActiveTab} />
        </View>
      ) : null}
    </View>
  );
}

function tabsFromCounts(matchCount: number, unreadCount: number) {
  return [
    { id: 'discover' as const, label: 'Discover', icon: 'search-outline' as const, iconActive: 'search' as const },
    {
      id: 'matches' as const,
      label: 'Matches',
      icon: 'heart-outline' as const,
      iconActive: 'heart' as const,
      badge: matchCount,
    },
    {
      id: 'messages' as const,
      label: 'Messages',
      icon: 'chatbubble-outline' as const,
      iconActive: 'chatbubble' as const,
      badge: unreadCount,
    },
    { id: 'profile' as const, label: 'Profile', icon: 'person-outline' as const, iconActive: 'person' as const },
  ];
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  tabBarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  tabPane: {
    ...StyleSheet.absoluteFillObject,
  },
  tabHidden: {
    zIndex: -1,
  },
});

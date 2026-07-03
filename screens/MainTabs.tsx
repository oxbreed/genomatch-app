import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Animated, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GenoTabBar, { type GenoTabId } from '../src/components/navigation/GenoTabBar';
import { COLORS, MOTION } from '../src/theme';
import { fetchConversations, startInboxRealtime, subscribeToInboxRealtime } from '../src/lib/messages';
import { pickNewMatches } from '../src/lib/inboxMatches';
import { fetchMatches } from '../src/lib/matches';
import { addNotificationOpenedListener, sendLocalNotification } from '../src/lib/notifications';
import { touchLastActive } from '../src/lib/presence';
import { syncPushTokenToProfile } from '../src/lib/pushRegistration';
import { syncProfileCityFromDevice } from '../src/lib/location';
import { getOpenChatMatchId } from '../src/lib/activeChat';
import { getAuthenticatedUserId } from '../src/lib/auth';
import type { DiscoveryProfile } from '../src/types/database';

const TAB_IDS: GenoTabId[] = ['discover', 'matches', 'messages', 'profile'];

type TabModule = {
  discover: ComponentType<{
    isActive: boolean;
    onMatchCreated: () => void;
    onStartChat: (matchId: string, profile?: DiscoveryProfile) => void;
  }>;
  matches: ComponentType<{
    isActive: boolean;
    onStartChat: (matchId: string, profile?: DiscoveryProfile) => void;
    onImmersiveChange: (immersive: boolean) => void;
  }>;
  messages: ComponentType<{
    isActive: boolean;
    initialChatMatchId: string | null;
    initialChatProfile: DiscoveryProfile | null;
    onChatOpened: () => void;
    onImmersiveChange: (immersive: boolean) => void;
  }>;
  profile: ComponentType<{ onSignOut?: () => void }>;
};

const TAB_LOADERS: Record<GenoTabId, () => Promise<{ default: TabModule[GenoTabId] }>> = {
  discover: () => import('./Discovery'),
  matches: () => import('./Matches'),
  messages: () => import('./Messages'),
  profile: () => import('./Profile'),
};

function LazyTab<K extends GenoTabId>({
  tab,
  active,
  loaded,
  onLoaded,
  children,
}: {
  tab: K;
  active: boolean;
  loaded: TabModule[K] | null;
  onLoaded: (tab: K, component: TabModule[K]) => void;
  children: (Screen: TabModule[K]) => ReactNode;
}) {
  useEffect(() => {
    if (loaded) return;
    if (!active && tab !== 'discover') return;

    let cancelled = false;
    void TAB_LOADERS[tab]().then((mod) => {
      if (!cancelled) onLoaded(tab, mod.default as TabModule[K]);
    });
    return () => {
      cancelled = true;
    };
  }, [active, loaded, onLoaded, tab]);

  if (!loaded) return null;
  return <>{children(loaded)}</>;
}

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
  const [tabScreens, setTabScreens] = useState<Partial<TabModule>>({});
  const [openChatMatchId, setOpenChatMatchId] = useState<string | null>(null);
  const [openChatProfile, setOpenChatProfile] = useState<DiscoveryProfile | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [immersiveOverlay, setImmersiveOverlay] = useState(false);
  const tabScenes = useTabSceneAnimation(activeTab);

  const markTabLoaded = useCallback(<K extends GenoTabId>(tab: K, component: TabModule[K]) => {
    setTabScreens((prev) => (prev[tab] ? prev : { ...prev, [tab]: component }));
  }, []);

  const refreshBadges = useCallback(async () => {
    try {
      const [{ matches }, conversations] = await Promise.all([
        fetchMatches(),
        fetchConversations(),
      ]);
      setMatchCount(pickNewMatches(matches, conversations).length);
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
      startInboxRealtime();
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
      <StatusBar style="light" />
      <View style={styles.content}>
        {tabPane(
          'discover',
          <LazyTab
            tab="discover"
            active={activeTab === 'discover'}
            loaded={tabScreens.discover ?? null}
            onLoaded={markTabLoaded}
          >
            {(Discovery) => (
              <Discovery
                isActive={activeTab === 'discover'}
                onMatchCreated={refreshBadges}
                onStartChat={handleStartChat}
              />
            )}
          </LazyTab>
        )}
        {tabPane(
          'matches',
          <LazyTab
            tab="matches"
            active={activeTab === 'matches'}
            loaded={tabScreens.matches ?? null}
            onLoaded={markTabLoaded}
          >
            {(Matches) => (
              <Matches
                isActive={activeTab === 'matches'}
                onStartChat={handleStartChat}
                onImmersiveChange={setImmersiveOverlay}
              />
            )}
          </LazyTab>
        )}
        {tabPane(
          'messages',
          <LazyTab
            tab="messages"
            active={activeTab === 'messages'}
            loaded={tabScreens.messages ?? null}
            onLoaded={markTabLoaded}
          >
            {(Messages) => (
              <Messages
                isActive={activeTab === 'messages'}
                initialChatMatchId={openChatMatchId}
                initialChatProfile={openChatProfile}
                onChatOpened={() => {
                  setOpenChatMatchId(null);
                  setOpenChatProfile(null);
                }}
                onImmersiveChange={setImmersiveOverlay}
              />
            )}
          </LazyTab>
        )}
        {tabPane(
          'profile',
          <LazyTab
            tab="profile"
            active={activeTab === 'profile'}
            loaded={tabScreens.profile ?? null}
            onLoaded={markTabLoaded}
          >
            {(Profile) => <Profile onSignOut={onSignOut} />}
          </LazyTab>
        )}
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
    backgroundColor: COLORS.background,
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

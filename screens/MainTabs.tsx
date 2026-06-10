import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Discovery from './Discovery';
import Matches from './Matches';
import Messages from './Messages';
import Profile from './Profile';
import GenoTabBar, { type GenoTabId } from '../src/components/navigation/GenoTabBar';
import { COLORS } from '../src/theme';
import { fetchConversations } from '../src/lib/messages';
import { fetchMatches } from '../src/lib/matches';
import { touchLastActive } from '../src/lib/presence';
import type { DiscoveryProfile } from '../src/types/database';

type MainTabsProps = {
  onSignOut?: () => void;
};

export default function MainTabs({ onSignOut }: MainTabsProps) {
  const [activeTab, setActiveTab] = useState<GenoTabId>('discover');
  const [openChatMatchId, setOpenChatMatchId] = useState<string | null>(null);
  const [openChatProfile, setOpenChatProfile] = useState<DiscoveryProfile | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [immersiveOverlay, setImmersiveOverlay] = useState(false);

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

  useEffect(() => {
    refreshBadges();
  }, [refreshBadges, activeTab]);

  useEffect(() => {
    void touchLastActive();
    const interval = setInterval(() => void touchLastActive(), 2 * 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void touchLastActive();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

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

  const tabPane = (tab: GenoTabId, child: ReactNode) => (
    <View
      key={tab}
      style={[styles.tabPane, activeTab !== tab && styles.tabHidden]}
      pointerEvents={activeTab === tab ? 'auto' : 'none'}
    >
      {child}
    </View>
  );

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
        <GenoTabBar tabs={tabsFromCounts(matchCount, unreadCount)} activeTab={activeTab} onSelect={setActiveTab} />
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
  tabPane: {
    ...StyleSheet.absoluteFillObject,
  },
  tabHidden: {
    opacity: 0,
    zIndex: -1,
  },
});

import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Discovery from './Discovery';
import Matches from './Matches';
import Messages from './Messages';
import Profile from './Profile';
import GenoTabBar, { type GenoTabId } from '../src/components/navigation/GenoTabBar';
import { COLORS } from '../src/theme';
import { fetchConversations } from '../src/lib/messages';
import { fetchMatches } from '../src/lib/matches';

type MainTabsProps = {
  onSignOut?: () => void;
};

export default function MainTabs({ onSignOut }: MainTabsProps) {
  const [activeTab, setActiveTab] = useState<GenoTabId>('discover');
  const [openChatMatchId, setOpenChatMatchId] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const handleStartChat = (matchId: string) => {
    setOpenChatMatchId(matchId);
    setActiveTab('messages');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <Discovery />;
      case 'matches':
        return <Matches onStartChat={handleStartChat} />;
      case 'messages':
        return (
          <Messages
            initialChatMatchId={openChatMatchId}
            onChatOpened={() => setOpenChatMatchId(null)}
          />
        );
      case 'profile':
        return <Profile onSignOut={onSignOut} />;
      default:
        return <Discovery />;
    }
  };

  const tabs = [
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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderContent()}</View>
      <GenoTabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  content: {
    flex: 1,
  },
});

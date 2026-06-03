import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StatusBar } from 'expo-status-bar';
import Discovery from './Discovery';
import Matches from './Matches';
import Messages from './Messages';
import Profile from './Profile';
import { COLORS, TYPOGRAPHY } from '../src/theme';

type TabId = 'discover' | 'matches' | 'messages' | 'profile';
type IonName = ComponentProps<typeof Ionicons>['name'];

const TABS: { id: TabId; label: string; icon: IonName; iconActive: IonName }[] = [
  { id: 'discover', label: 'Discover', icon: 'search-outline', iconActive: 'search' },
  { id: 'matches', label: 'Matches', icon: 'heart-outline', iconActive: 'heart' },
  { id: 'messages', label: 'Messages', icon: 'chatbubble-outline', iconActive: 'chatbubble' },
  { id: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

type MainTabsProps = {
  onSignOut?: () => void;
};

export default function MainTabs({ onSignOut }: MainTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('discover');
  const [openChatMatchId, setOpenChatMatchId] = useState<string | null>(null);

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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderContent()}</View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={22}
                color={active ? COLORS.gold : 'rgba(245, 239, 230, 0.55)'}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {active && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBar,
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 52,
  },
  tabLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: 'rgba(245, 239, 230, 0.55)',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: COLORS.gold,
    fontFamily: TYPOGRAPHY.label.fontFamily,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
});

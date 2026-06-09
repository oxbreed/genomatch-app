import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY } from '../../theme';
import { GENO_TAB_BAR_HEIGHT } from './tabBarLayout';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type GenoTabId = 'discover' | 'matches' | 'messages' | 'profile';

export type GenoTabConfig = {
  id: GenoTabId;
  label: string;
  icon: IonName;
  iconActive: IonName;
  badge?: number;
};

type Props = {
  tabs: GenoTabConfig[];
  activeTab: GenoTabId;
  onSelect: (id: GenoTabId) => void;
};

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: GenoTabConfig;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(active ? 1 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.06 : 1,
      friction: 8,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [active, scale]);

  return (
    <Pressable style={styles.tabItem} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Animated.View style={[styles.iconWrap, active && styles.iconWrapActive, { transform: [{ scale }] }]}>
        <Ionicons
          name={active ? tab.iconActive : tab.icon}
          size={22}
          color={active ? COLORS.gold : 'rgba(245, 239, 230, 0.48)'}
        />
        {tab.badge != null && tab.badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

export default function GenoTabBar({ tabs, activeTab, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['transparent', 'rgba(212, 168, 67, 0.55)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.topRule}
        pointerEvents="none"
      />
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <TabItem
              key={tab.id}
              tab={tab}
              active={active}
              onPress={() => {
                if (tab.id !== activeTab) {
                  void Haptics.selectionAsync();
                }
                onSelect(tab.id);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export { GENO_TAB_BAR_HEIGHT };

const styles = StyleSheet.create({
  wrap: {
    height: GENO_TAB_BAR_HEIGHT,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    borderRadius: 28,
    backgroundColor: 'rgba(22, 53, 34, 0.82)',
    overflow: 'hidden',
    shadowColor: '#0B1F13',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 2,
  },
  iconWrap: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.tabBar,
  },
  badgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: COLORS.forestDeep,
  },
  tabLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(245, 239, 230, 0.48)',
  },
  tabLabelActive: {
    color: COLORS.gold,
    fontFamily: TYPOGRAPHY.label.fontFamily,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import * as Haptics from 'expo-haptics';
import { GenoBondMark } from '../../brand';
import { COLORS, TYPOGRAPHY } from '../../theme';

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

export default function GenoTabBar({ tabs, activeTab, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['rgba(13, 40, 24, 0.98)', COLORS.tabBar]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topRule} pointerEvents="none">
        <LinearGradient
          colors={['transparent', COLORS.gold, 'rgba(61, 122, 82, 0.5)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ruleGradient}
        />
      </View>

      <View style={styles.markRow} pointerEvents="none">
        <GenoBondMark size={20} opacity={0.35} />
      </View>

      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={styles.tabItem}
              onPress={() => {
                if (tab.id !== activeTab) {
                  void Haptics.selectionAsync();
                }
                onSelect(tab.id);
              }}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={active ? tab.iconActive : tab.icon}
                  size={22}
                  color={active ? COLORS.gold : 'rgba(245, 239, 230, 0.5)'}
                />
                {tab.badge != null && tab.badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {active ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingBottom: 26,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  ruleGradient: { flex: 1, height: 1 },
  markRow: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    opacity: 0.5,
  },
  tabsRow: {
    flexDirection: 'row',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 52,
    paddingTop: 6,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
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
    fontSize: 11,
    color: 'rgba(245, 239, 230, 0.5)',
  },
  tabLabelActive: {
    color: COLORS.gold,
    fontFamily: TYPOGRAPHY.label.fontFamily,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 2,
  },
});

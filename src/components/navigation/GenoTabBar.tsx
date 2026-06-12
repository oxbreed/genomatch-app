import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import * as Haptics from 'expo-haptics';
import { GenoGlassSurface } from '../../brand/graphics';
import { GENO_VISUAL } from '../../brand/graphics/genoVisualTokens';
import { FONT_FAMILY, COLORS, GLASS, MOTION, TYPOGRAPHY } from '../../theme';
import { GENO_TAB_BAR_BOTTOM_MARGIN, GENO_TAB_BAR_HEIGHT, GENO_TAB_BAR_PILL_HEIGHT } from './tabBarLayout';

const TAB_BAR_H_MARGIN = 14;
const TAB_BAR_RADIUS = 999;

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
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? GENO_VISUAL.glass.motion.tabScale : 1,
      ...MOTION.springSnappy,
    }).start();
  }, [active, scale]);

  return (
    <Pressable
      style={styles.tabItem}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
        <Ionicons
          name={active ? tab.iconActive : tab.icon}
          size={22}
          color={active ? COLORS.forestDeep : 'rgba(22, 53, 34, 0.4)'}
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
  const [barWidth, setBarWidth] = useState(
    Dimensions.get('window').width - TAB_BAR_H_MARGIN * 2
  );
  const indicatorX = useRef(new Animated.Value(0)).current;
  const tabWidth = barWidth / tabs.length;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeTab));

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: activeIndex * tabWidth + 6,
      ...MOTION.springSheetFloat,
    }).start();
  }, [activeIndex, indicatorX, tabWidth]);

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.outer}>
      <GenoGlassSurface
        variant="tabBar"
        borderRadius={TAB_BAR_RADIUS}
        shadow="glassFloat"
        showTopRule={false}
        showSheen
        intensity={72}
        style={styles.wrap}
        contentStyle={styles.barInner}
      >
        <View style={styles.tabsRow} onLayout={onBarLayout}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: Math.max(0, tabWidth - 12),
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
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
      </GenoGlassSurface>
    </View>
  );
}

export { GENO_TAB_BAR_HEIGHT };

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: TAB_BAR_H_MARGIN,
    marginBottom: GENO_TAB_BAR_BOTTOM_MARGIN,
    borderRadius: TAB_BAR_RADIUS,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.forestDeep,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  wrap: {
    borderRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
  },
  barInner: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: GENO_TAB_BAR_PILL_HEIGHT - 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: TAB_BAR_RADIUS,
    backgroundColor: GLASS.tabBarIndicator,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.22)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 3,
    zIndex: 1,
  },
  iconWrap: {
    position: 'relative',
    width: 34,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 9,
    color: COLORS.forestDeep,
  },
  tabLabel: {
    ...TYPOGRAPHY.navLabel,
  },
  tabLabelActive: {
    ...TYPOGRAPHY.navLabelActive,
  },
});

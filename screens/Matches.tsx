import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
  GenoInboxNewBanner,
  GenoInboxRetryPanel,
} from '../src/components/inbox';
import MatchListCard, { isRecentMatch } from '../src/components/matches/MatchListCard';
import { logAuthState } from '../src/lib/auth';
import { TAB_SCENE_BOTTOM_PADDING } from '../src/components/navigation/tabBarLayout';
import { FONT_FAMILY, COLORS, MOTION } from '../src/theme';
import type { DiscoveryProfile, Genotype, MatchWithProfile } from '../src/types/database';
import { fetchMatches, unmatchByMatchId } from '../src/lib/matches';
import MatchProfile from './MatchProfile';

type MatchesProps = {
  onStartChat?: (matchId: string, profile?: DiscoveryProfile) => void;
  onImmersiveChange?: (immersive: boolean) => void;
};

export default function Matches({ onStartChat, onImmersiveChange }: MatchesProps) {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const listFade = useRef(new Animated.Value(0)).current;

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const aNew = isRecentMatch(a.matchedAt);
        const bNew = isRecentMatch(b.matchedAt);
        if (aNew !== bNew) return aNew ? -1 : 1;
        return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
      }),
    [matches]
  );

  const newMatchCount = useMemo(
    () => matches.filter((m) => isRecentMatch(m.matchedAt)).length,
    [matches]
  );

  const loadMatches = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    try {
      await logAuthState('Matches.load');
      const { matches: rows, viewerGenotype: viewer } = await fetchMatches();
      setMatches(rows);
      setViewerGenotype(viewer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    onImmersiveChange?.(!!selectedMatch);
  }, [onImmersiveChange, selectedMatch]);

  useEffect(() => {
    if (loading) return;
    listFade.setValue(0);
    Animated.timing(listFade, {
      toValue: 1,
      duration: MOTION.tabFadeMs + 80,
      easing: MOTION.easing.sheetOut,
      useNativeDriver: true,
    }).start();
  }, [listFade, loading, sortedMatches.length]);

  const handleUnmatch = (item: MatchWithProfile) => {
    Alert.alert(
      'Unmatch',
      `Remove ${item.profile.name} from your matches? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            try {
              await unmatchByMatchId(item.matchId);
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setMatches((prev) => prev.filter((m) => m.matchId !== item.matchId));
            } catch (err) {
              Alert.alert(
                'Could not unmatch',
                err instanceof Error ? err.message : 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  if (selectedMatch) {
    return (
      <MatchProfile
        match={selectedMatch}
        onBack={() => {
          setSelectedMatch(null);
          loadMatches();
        }}
        onSendMessage={() => {
          onStartChat?.(selectedMatch.matchId, selectedMatch.profile);
          setSelectedMatch(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="dark" />

      <GenoInboxHeader
        title="Your matches"
        subtitle="Mutual likes — bond score and chat in one place"
        ceremonyMark={matches.length > 0}
        glass
        right={<GenoInboxCountBadge count={matches.length} />}
      />

      {loading ? (
        <View style={styles.centered}>
          <GenoLogoCeremony variant="compact" tone="dark" />
          <Text style={styles.loadingText}>Loading matches…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <GenoInboxRetryPanel message={error} onRetry={() => loadMatches()} />
        </View>
      ) : (
        <Animated.View style={[styles.listWrap, { opacity: listFade }]}>
          <FlatList
            data={sortedMatches}
            keyExtractor={(item) => item.matchId}
            contentContainerStyle={matches.length === 0 ? styles.emptyList : styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadMatches(true);
                }}
                tintColor={COLORS.forest}
              />
            }
            ListHeaderComponent={
              matches.length > 0 ? <GenoInboxNewBanner count={newMatchCount} /> : null
            }
            renderItem={({ item }) => (
              <MatchListCard
                item={item}
                viewerGenotype={viewerGenotype}
                onOpenProfile={() => setSelectedMatch(item)}
                onStartChat={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onStartChat?.(item.matchId, item.profile);
                }}
                onUnmatch={() => handleUnmatch(item)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                type="no-matches"
                title="No matches yet"
                subtitle="Keep discovering — when you both like each other, they'll appear here."
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

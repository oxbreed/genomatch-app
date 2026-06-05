import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import EmptyState from '../src/components/EmptyState';
import { GenoPremiumChrome, GenoLogoCeremony } from '../src/brand/graphics';
import { GenoInboxCountBadge, GenoInboxHeader } from '../src/components/inbox';
import MatchListCard from '../src/components/matches/MatchListCard';
import { logAuthState } from '../src/lib/auth';
import { TAB_SCENE_BOTTOM_PADDING } from '../src/components/navigation/tabBarLayout';
import { COLORS } from '../src/theme';
import type { Genotype, MatchWithProfile } from '../src/types/database';
import { fetchMatches, unmatchByMatchId } from '../src/lib/matches';
import MatchProfile from './MatchProfile';

type MatchesProps = {
  onStartChat?: (matchId: string) => void;
  onImmersiveChange?: (immersive: boolean) => void;
};

export default function Matches({ onStartChat, onImmersiveChange }: MatchesProps) {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

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
          onStartChat?.(selectedMatch.matchId);
          setSelectedMatch(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />

      <GenoInboxHeader
        title="Your matches"
        subtitle="People who liked you back — genotype bond at a glance"
        right={<GenoInboxCountBadge count={matches.length} />}
      />

      {loading ? (
        <View style={styles.centered}>
          <GenoLogoCeremony variant="compact" tone="dark" />
          <Text style={styles.loadingText}>Loading matches…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadMatches()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={matches}
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
          renderItem={({ item }) => (
            <MatchListCard
              item={item}
              viewerGenotype={viewerGenotype}
              onOpenProfile={() => setSelectedMatch(item)}
              onStartChat={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onStartChat?.(item.matchId);
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.linen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loadingText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  list: { paddingBottom: TAB_SCENE_BOTTOM_PADDING },
  emptyList: { flexGrow: 1 },
  error: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  retryText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
});

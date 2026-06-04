import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import EmptyState from '../src/components/EmptyState';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { logAuthState } from '../src/lib/auth';
import { getGenotypeCompatibilityLine } from '../src/lib/compatibility';
import { COLORS, getInitials } from '../src/data/mockData';
import { fetchMatches } from '../src/lib/matches';
import type { MatchWithProfile } from '../src/types/database';
import MatchProfile from './MatchProfile';

type MatchesProps = {
  onStartChat?: (matchId: string) => void;
};

export default function Matches({ onStartChat }: MatchesProps) {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

  const loadMatches = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await logAuthState('Matches.loadMatches');
      const rows = await fetchMatches();
      console.log('[Matches] fetch result', { count: rows.length, matches: rows });
      setMatches(rows);
    } catch (err) {
      console.error('[Matches] load failed', err);
      setError(err instanceof Error ? err.message : 'Could not load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  if (selectedMatch) {
    return (
      <MatchProfile
        match={selectedMatch}
        onBack={() => setSelectedMatch(null)}
        onSendMessage={() => {
          onStartChat?.(selectedMatch.matchId);
          setSelectedMatch(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Your Matches</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{matches.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>People who liked you back</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.forest} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={loadMatches}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.matchId}
          contentContainerStyle={[
            styles.list,
            matches.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <EmptyState
                type="no-matches"
                title="No matches yet"
                subtitle="Keep swiping to find your match"
              />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={({ pressed }) => [styles.cardMain, pressed && styles.cardMainPressed]}
                onPress={() => setSelectedMatch(item)}
              >
                <View style={styles.avatarWrap}>
                  {item.profile.avatarUrl?.trim() || item.profile.photos[0]?.trim() ? (
                    <ProfileAvatar
                      name={item.profile.name}
                      gradient={item.profile.gradient}
                      avatarUrl={item.profile.avatarUrl ?? item.profile.photos[0]}
                      size={60}
                      noPhotoBackground="#1A3D28"
                      noPhotoInitialColor="#FFFFFF"
                    />
                  ) : (
                    <View style={styles.matchAvatarFallback}>
                      <Text style={styles.matchAvatarInitials}>
                        {getInitials(item.profile.name)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.profile.name}
                    </Text>
                    <GenotypeBadge genotype={item.profile.genotype} />
                  </View>
                  <View style={styles.compatPill}>
                    <Text style={styles.compatText}>
                      {item.profile.compatibility}% match
                    </Text>
                  </View>
                  <Text style={styles.compatLine} numberOfLines={2}>
                    {getGenotypeCompatibilityLine(null, item.profile.genotype)}
                  </Text>
                  <Text style={styles.city} numberOfLines={1}>
                    {item.profile.city}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onStartChat?.(item.matchId);
                }}
              >
                <Text style={styles.chatBtnText}>Start Chat</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 32,
    color: '#0D2818',
  },
  countBadge: {
    minWidth: 28,
    borderRadius: 12,
    backgroundColor: '#D4A843',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D2818',
  },
  subtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    marginTop: 6,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: 'Satoshi-Medium',
    color: '#A32D2D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.forest,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.linen,
    fontWeight: '800',
  },
  list: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  cardMainPressed: {
    opacity: 0.85,
  },
  avatarWrap: {
    marginRight: 12,
    alignSelf: 'center',
  },
  matchAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,67,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchAvatarInitials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    color: 'rgba(212,168,67,0.8)',
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 12,
    minWidth: 0,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  name: {
    flexShrink: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
  },
  compatPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDF3EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  compatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D2818',
  },
  compatLine: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#8FAF95',
  },
  city: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: 'rgba(13, 40, 24, 0.55)',
    fontWeight: '500',
  },
  chatBtn: {
    alignSelf: 'center',
    minWidth: 100,
    flexShrink: 0,
    backgroundColor: '#D4A843',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatBtnPressed: {
    opacity: 0.88,
  },
  chatBtnText: {
    color: '#0D2818',
    fontSize: 13,
    fontWeight: '700',
  },
});

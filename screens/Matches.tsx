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
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { logAuthState } from '../src/lib/auth';
import { COLORS } from '../src/data/mockData';
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyBody}>No matches yet. Start swiping! 💚</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                style={({ pressed }) => [styles.rowTap, pressed && styles.rowTapPressed]}
                onPress={() => setSelectedMatch(item)}
              >
                <ProfileAvatar
                  name={item.profile.name}
                  gradient={item.profile.gradient}
                  avatarUrl={item.profile.avatarUrl}
                  size={58}
                />
                <View style={styles.rowBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.profile.name}</Text>
                    <GenotypeBadge genotype={item.profile.genotype} />
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.compatPill}>
                      <Text style={styles.compatText}>
                        {item.profile.compatibility}% match
                      </Text>
                    </View>
                    <Text style={styles.city}>{item.profile.city}</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
                onPress={() => onStartChat?.(item.matchId)}
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
    backgroundColor: COLORS.ivory,
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.8,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.forest,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
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
    color: COLORS.ivory,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  rowTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowTapPressed: {
    opacity: 0.85,
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  compatPill: {
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  compatText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.forest,
  },
  city: {
    fontSize: 12,
    color: 'rgba(7, 77, 46, 0.55)',
    fontWeight: '500',
  },
  chatBtn: {
    backgroundColor: COLORS.forest,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatBtnPressed: {
    opacity: 0.88,
  },
  chatBtnText: {
    color: COLORS.ivory,
    fontSize: 12,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.forest,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(7, 77, 46, 0.6)',
    textAlign: 'center',
    fontWeight: '500',
  },
});

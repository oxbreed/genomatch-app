import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { COLORS, MOCK_MATCHES } from '../src/data/mockData';

type MatchesProps = {
  onStartChat?: (matchId: string) => void;
};

export default function Matches({ onStartChat }: MatchesProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Your Matches</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{MOCK_MATCHES.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>People who liked you back</Text>
      </View>

      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ProfileAvatar name={item.name} gradient={item.gradient} size={58} />
            <View style={styles.rowBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <GenotypeBadge genotype={item.genotype} />
              </View>
              <View style={styles.metaRow}>
                <View style={styles.compatPill}>
                  <Text style={styles.compatText}>{item.compatibility}% match</Text>
                </View>
                <Text style={styles.city}>{item.city}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
              onPress={() => onStartChat?.(item.id)}
            >
              <Text style={styles.chatBtnText}>Start Chat</Text>
            </Pressable>
          </View>
        )}
      />
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
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
});

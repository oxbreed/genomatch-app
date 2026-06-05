import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { INBOX } from '../inbox/inboxTokens';
import { COLORS } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLS = 3;
const GAP = 8;
const MARGIN = INBOX.cardMarginH;
const CELL = (SCREEN_WIDTH - MARGIN * 2 - GAP * (COLS - 1)) / COLS;

type Props = {
  photos: string[];
  editing: boolean;
  canAdd: boolean;
  uploading: boolean;
  onAdd: () => void;
  onDelete: (index: number) => void;
};

export default function ProfilePhotosGrid({
  photos,
  editing,
  canAdd,
  uploading,
  onAdd,
  onDelete,
}: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((uri, index) => (
        <View key={`${uri}-${index}`} style={styles.cell}>
          <LinearGradient
            colors={
              editing
                ? ['rgba(212, 168, 67, 0.5)', 'rgba(61, 122, 82, 0.3)']
                : ['rgba(61, 122, 82, 0.2)', 'rgba(212, 168, 67, 0.2)']
            }
            style={styles.cellBorder}
          >
            <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
          </LinearGradient>
          {index === 0 ? (
            <View style={styles.mainBadge}>
              <Text style={styles.mainText}>Main</Text>
            </View>
          ) : null}
          <Pressable style={styles.deleteBtn} onPress={() => onDelete(index)}>
            <Ionicons name="close" size={14} color={COLORS.white} />
          </Pressable>
        </View>
      ))}
      {canAdd ? (
        <Pressable
          style={({ pressed }) => [styles.cell, styles.addCell, pressed && styles.pressed]}
          onPress={onAdd}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={COLORS.gold} />
          ) : (
            <>
              <Ionicons name="add" size={28} color={COLORS.gold} />
              <Text style={styles.addLabel}>Add</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL * 1.25,
    position: 'relative',
  },
  cellBorder: {
    flex: 1,
    borderRadius: 12,
    padding: 2,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mainText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: COLORS.forestDeep,
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCell: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 168, 67, 0.55)',
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: COLORS.forest,
  },
  pressed: { opacity: 0.88 },
});

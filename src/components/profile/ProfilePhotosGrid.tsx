import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoLogoCeremony } from '../../brand/graphics';
import { INBOX } from '../inbox/inboxTokens';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLS = 3;
const GAP = 10;
const MARGIN = INBOX.cardMarginH;
const CELL = (SCREEN_WIDTH - MARGIN * 2 - GAP * (COLS - 1) - 36) / COLS;

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
  if (photos.length === 0 && !editing) {
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyText}>No photos yet — open Profile Studio to add your gallery.</Text>
      </View>
    );
  }

  if (photos.length === 0 && editing) {
    return (
      <Pressable
        style={({ pressed }) => [styles.emptyStudio, pressed && styles.pressed]}
        onPress={onAdd}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={COLORS.gold} size="large" />
        ) : (
          <>
            <GenoLogoCeremony variant="compact" tone="dark" />
            <Text style={styles.emptyStudioTitle}>Add your first photo</Text>
            <Text style={styles.emptyStudioSub}>Your main photo appears on Discover & Matches</Text>
            <View style={styles.emptyStudioBtn}>
              <Ionicons name="camera-outline" size={18} color={COLORS.forestDeep} />
              <Text style={styles.emptyStudioBtnText}>Choose photo</Text>
            </View>
          </>
        )}
      </Pressable>
    );
  }

  return (
    <View>
      {editing ? (
        <Text style={styles.hint}>First photo is your main — shown on Discover cards</Text>
      ) : null}
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.cell}>
            <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
            {index === 0 ? (
              <View style={styles.mainBadge}>
                <Text style={styles.mainText}>Main</Text>
              </View>
            ) : null}
            {editing ? (
              <Pressable style={styles.deleteBtn} onPress={() => onDelete(index)}>
                <Ionicons name="close" size={14} color={COLORS.white} />
              </Pressable>
            ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL * 1.28,
    position: 'relative',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.mint,
    ...SHADOWS.card,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(13, 40, 24, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  mainText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.linen,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 40, 24, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCell: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(143, 175, 149, 0.55)',
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowOpacity: 0,
    elevation: 0,
  },
  addLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: COLORS.sage,
  },
  emptyView: {
    paddingVertical: 22,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.sage,
    textAlign: 'center',
  },
  emptyStudio: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(143, 175, 149, 0.45)',
    backgroundColor: COLORS.mint,
    gap: 8,
  },
  emptyStudioTitle: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 17,
    color: COLORS.forestDeep,
    marginTop: 4,
  },
  emptyStudioSub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 4,
  },
  emptyStudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  emptyStudioBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  pressed: { opacity: 0.88 },
});

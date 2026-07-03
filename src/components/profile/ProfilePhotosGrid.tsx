import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GenoLogoCeremony,
  GenoMirrorGoldFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { INBOX } from '../inbox/inboxTokens';
import { FONT_FAMILY, COLORS, GLASS, LOGO_GOLD, RADIUS } from '../../theme';

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
      <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.md} style={styles.emptyRim}>
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>No photos yet. Open Edit profile to add your gallery.</Text>
        </View>
      </GenoMirrorRimFrame>
    );
  }

  if (photos.length === 0 && editing) {
    return (
      <Pressable onPress={onAdd} disabled={uploading} style={({ pressed }) => [pressed && styles.pressed]}>
        <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.md} style={styles.emptyRim}>
          <GenoMirrorSteelFill style={styles.emptyStudio}>
            {uploading ? (
              <ActivityIndicator color={LOGO_GOLD} size="large" />
            ) : (
              <>
                <GenoLogoCeremony variant="compact" tone="dark" />
                <Text style={styles.emptyStudioTitle}>Add your first photo</Text>
                <Text style={styles.emptyStudioSub}>
                  Your main photo appears on Discover & Matches
                </Text>
                <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.pill}>
                  <GenoMirrorGoldFill style={styles.emptyStudioBtn}>
                    <GenoMirrorMetallicIcon name="camera" size={18} tone="gold" />
                    <Text style={styles.emptyStudioBtnText}>Choose photo</Text>
                  </GenoMirrorGoldFill>
                </GenoMirrorRimFrame>
              </>
            )}
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
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
          <GenoMirrorRimFrame
            key={`${uri}-${index}`}
            kind={index === 0 ? 'gold' : 'steel'}
            borderRadius={RADIUS.sm}
            style={styles.cellRim}
          >
            <View style={styles.cell}>
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
              {index === 0 ? (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainText}>Main</Text>
                </View>
              ) : null}
              {editing ? (
                <Pressable style={styles.deleteBtn} onPress={() => onDelete(index)}>
                  <GenoMirrorMetallicIcon name="close" size={14} tone="chrome" />
                </Pressable>
              ) : null}
            </View>
          </GenoMirrorRimFrame>
        ))}
        {canAdd ? (
          <Pressable onPress={onAdd} disabled={uploading} style={({ pressed }) => [pressed && styles.pressed]}>
            <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.sm} style={styles.cellRim}>
              <View style={[styles.cell, styles.addCell]}>
                {uploading ? (
                  <ActivityIndicator color={LOGO_GOLD} />
                ) : (
                  <>
                    <GenoMirrorMetallicIcon name="add" size={28} tone="gold" />
                    <Text style={styles.addLabel}>Add</Text>
                  </>
                )}
              </View>
            </GenoMirrorRimFrame>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cellRim: {
    width: CELL,
  },
  cell: {
    width: '100%',
    height: CELL * 1.28,
    position: 'relative',
    borderRadius: RADIUS.sm - 1.5,
    overflow: 'hidden',
    backgroundColor: GLASS.insetFill,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(10, 10, 10, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  mainText: {
    fontFamily: FONT_FAMILY.gothamBold,
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
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  addLabel: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    color: LOGO_GOLD,
  },
  emptyRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  emptyView: {
    paddingVertical: 22,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md - 1.5,
    backgroundColor: GLASS.insetFill,
  },
  emptyText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyStudio: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md - 1.5,
    gap: 8,
  },
  emptyStudioTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    color: COLORS.text,
    marginTop: 4,
  },
  emptyStudioSub: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
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
    borderRadius: RADIUS.pill,
  },
  emptyStudioBtnText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.text,
  },
  pressed: { opacity: 0.88 },
});

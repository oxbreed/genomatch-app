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
import { COLORS } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLS = 3;
const GAP = 8;
const H_PADDING = 20;
const CELL_SIZE =
  (SCREEN_WIDTH - H_PADDING * 2 - GAP * (COLS - 1)) / COLS;

type PhotoGridProps = {
  photos: string[];
  onAddPhoto: () => void;
  onDeletePhoto: (index: number) => void;
  uploading?: boolean;
  maxPhotos?: number;
};

export default function PhotoGrid({
  photos,
  onAddPhoto,
  onDeletePhoto,
  uploading = false,
  maxPhotos = 6,
}: PhotoGridProps) {
  const canAdd = photos.length < maxPhotos;
  const slotCount = photos.length + (canAdd ? 1 : 0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Photos</Text>
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.cell}>
            <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
            {index === 0 ? (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deletePressed]}
              onPress={() => onDeletePhoto(index)}
              accessibilityLabel="Delete photo"
            >
              <Ionicons name="close" size={14} color={COLORS.white} />
            </Pressable>
          </View>
        ))}

        {canAdd ? (
          <Pressable
            style={({ pressed }) => [
              styles.cell,
              styles.addCell,
              pressed && styles.addPressed,
            ]}
            onPress={onAddPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.forest} size="small" />
            ) : (
              <>
                <Ionicons name="add" size={28} color={COLORS.forest} />
                <Text style={styles.addText}>Add Photo</Text>
              </>
            )}
          </Pressable>
        ) : null}

        {slotCount % COLS !== 0 &&
          Array.from({ length: COLS - (slotCount % COLS) }).map((_, i) => (
            <View key={`spacer-${i}`} style={styles.cellSpacer} />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.sage,
    marginBottom: 10,
    paddingHorizontal: H_PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: H_PADDING,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cellSpacer: {
    width: CELL_SIZE,
    height: 0,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.forest,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePressed: {
    opacity: 0.85,
  },
  addCell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(143, 175, 149, 0.25)',
    borderStyle: 'dashed',
    borderColor: 'rgba(13, 40, 24, 0.25)',
  },
  addPressed: {
    opacity: 0.88,
  },
  addText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.forest,
  },
});

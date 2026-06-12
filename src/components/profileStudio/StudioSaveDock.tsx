import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GenoGlassSurface, GenoLogoCeremony } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  hasChanges: boolean;
  saving: boolean;
  saveDisabled: boolean;
  onDiscard: () => void;
  onSave: () => void;
};

export default function StudioSaveDock({
  hasChanges,
  saving,
  saveDisabled,
  onDiscard,
  onSave,
}: Props) {
  const handleSave = () => {
    if (saveDisabled || saving) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave();
  };

  return (
    <View style={styles.dock}>
      <LinearGradient
        colors={['rgba(245, 239, 230, 0)', 'rgba(245, 239, 230, 0.95)', COLORS.linen]}
        style={styles.fade}
        pointerEvents="none"
      />
      <GenoGlassSurface
        variant="linen"
        borderRadius={22}
        shadow="glassElevated"
        showTopRule
        style={styles.panelGlass}
        contentStyle={styles.panel}
      >
        <View style={styles.meta}>
          <GenoLogoCeremony variant="mark" tone="dark" subtle style={styles.mark} />
          <View style={styles.metaCopy}>
            <View style={styles.metaTitleRow}>
              <View style={[styles.statusDot, hasChanges && styles.statusDotLive]} />
              <Text style={styles.metaTitle}>
                {hasChanges ? 'Ready to publish' : 'Studio draft'}
              </Text>
            </View>
            <Text style={styles.metaSub}>
              {hasChanges
                ? 'Matches will see updates on Discover after you publish'
                : 'Make changes above, then publish when ready'}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.discard, pressed && styles.pressed]}
            onPress={onDiscard}
            disabled={saving}
          >
            <Text style={styles.discardText}>Discard</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.saveWrap,
              pressed && styles.pressed,
              saveDisabled && styles.saveDisabled,
            ]}
            onPress={handleSave}
            disabled={saveDisabled}
          >
            <LinearGradient
              colors={
                saveDisabled
                  ? ['rgba(143, 175, 149, 0.5)', 'rgba(143, 175, 149, 0.35)']
                  : [COLORS.gold, '#C49A38']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.save}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.forestDeep} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color={COLORS.forestDeep} />
                  <Text style={styles.saveText}>Publish profile</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </GenoGlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  fade: {
    height: 28,
    width: '100%',
  },
  panelGlass: {
    overflow: 'hidden',
  },
  panel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 44,
    height: 44,
  },
  metaCopy: {
    flex: 1,
    gap: 3,
  },
  metaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(143, 175, 149, 0.45)',
  },
  statusDotLive: {
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  metaTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  metaSub: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.sage,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  discard: {
    flex: 0.36,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 40, 24, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.linen,
  },
  discardText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.forest,
  },
  saveWrap: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveDisabled: {
    opacity: 0.7,
  },
  save: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  pressed: {
    opacity: 0.88,
  },
});

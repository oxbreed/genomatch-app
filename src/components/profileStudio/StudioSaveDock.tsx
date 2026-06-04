import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';

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
  return (
    <View style={styles.dock}>
      <LinearGradient
        colors={['rgba(245, 239, 230, 0)', 'rgba(245, 239, 230, 0.95)', COLORS.linen]}
        style={styles.fade}
        pointerEvents="none"
      />
      <View style={styles.panel}>
        <View style={styles.meta}>
          <View style={[styles.statusDot, hasChanges && styles.statusDotLive]} />
          <View style={styles.metaCopy}>
            <Text style={styles.metaTitle}>
              {hasChanges ? 'Ready to publish' : 'Studio draft'}
            </Text>
            <Text style={styles.metaSub}>
              {hasChanges
                ? 'Matches will see updates on Discover after save'
                : 'Tweak your gallery, story, or intent above'}
            </Text>
          </View>
          <Ionicons
            name={hasChanges ? 'rocket-outline' : 'color-wand-outline'}
            size={22}
            color={hasChanges ? COLORS.gold : COLORS.sage}
          />
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
            onPress={onSave}
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
      </View>
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
  panel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.25)',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    gap: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(143, 175, 149, 0.45)',
  },
  statusDotLive: {
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  metaTitle: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  metaSub: {
    fontFamily: 'Satoshi-Medium',
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
    fontFamily: 'Satoshi-Bold',
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  pressed: {
    opacity: 0.88,
  },
});

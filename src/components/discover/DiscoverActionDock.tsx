import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GenoMirrorActionButton } from '../../brand/graphics';

type Props = {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  likePulseScale: Animated.Value;
  disabled?: boolean;
  variant?: 'overlay' | 'standalone' | 'glass';
  style?: StyleProp<ViewStyle>;
};

export default function DiscoverActionDock({
  onPass,
  onLike,
  onSuperLike,
  likePulseScale,
  disabled,
  variant = 'overlay',
  style,
}: Props) {
  const overlay = variant === 'overlay';
  const passSize = overlay ? 58 : 52;
  const superSize = overlay ? 52 : 48;
  const likeSize = overlay ? 66 : 60;
  const passIcon = overlay ? 26 : 22;
  const superIcon = overlay ? 22 : 20;
  const likeIcon = overlay ? 28 : 24;

  return (
    <View style={[styles.actions, overlay && styles.actionsOverlay, style]}>
      <GenoMirrorActionButton
        size={passSize}
        kind="steel"
        icon="close"
        iconSize={passIcon}
        onPress={onPass}
        disabled={disabled}
        accessibilityLabel="Pass"
      />

      <GenoMirrorActionButton
        size={superSize}
        kind="gold"
        icon="star"
        iconSize={superIcon}
        iconTone="chrome"
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityLabel="Super like"
      />

      <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
        <GenoMirrorActionButton
          size={likeSize}
          kind="red"
          icon="heart"
          iconSize={likeIcon}
          onPress={onLike}
          disabled={disabled}
          accessibilityLabel="Like"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  actionsOverlay: {
    gap: 26,
    paddingHorizontal: 8,
  },
});

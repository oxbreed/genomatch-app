import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import ProfileAvatar from './ProfileAvatar';

type AvatarPhotoPickerProps = {
  name: string;
  gradient: [string, string];
  size?: number;
  avatarUrl?: string | null;
  uploading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'circle' | 'hero';
  heroHeight?: number;
};

export default function AvatarPhotoPicker({
  name,
  gradient,
  size = 100,
  avatarUrl,
  uploading = false,
  disabled = false,
  onPress,
  variant = 'circle',
  heroHeight = 280,
}: AvatarPhotoPickerProps) {
  const isHero = variant === 'hero';
  const badgeSize = isHero ? 36 : Math.max(Math.round(size * 0.34), 30);

  if (isHero) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || uploading}
        style={[styles.heroWrap, { height: heroHeight }]}
        accessibilityLabel="Upload profile photo"
        accessibilityRole="button"
      >
        <ProfileAvatar
          name={name}
          gradient={gradient}
          avatarUrl={avatarUrl}
          width="100%"
          height={heroHeight}
          borderRadius={0}
          initialsPosition="top"
          initialsOpacity={0.15}
        />
        <View
          style={[
            styles.heroCameraBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          {uploading ? (
            <ActivityIndicator color={COLORS.forest} size="small" />
          ) : (
            <Ionicons name="camera" size={16} color={COLORS.forest} />
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || uploading}
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityLabel="Upload profile photo"
      accessibilityRole="button"
    >
      <ProfileAvatar name={name} gradient={gradient} avatarUrl={avatarUrl} size={size} />
      <View
        style={[
          styles.cameraBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
          },
        ]}
      >
        {uploading ? (
          <ActivityIndicator color={COLORS.forest} size="small" />
        ) : (
          <Ionicons name="camera" size={badgeSize * 0.45} color={COLORS.forest} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroCameraBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: COLORS.forest,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  wrap: {
    alignSelf: 'center',
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.gold,
    borderWidth: 2.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

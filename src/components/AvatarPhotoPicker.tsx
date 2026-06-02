import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../data/mockData';
import ProfileAvatar from './ProfileAvatar';

type AvatarPhotoPickerProps = {
  name: string;
  gradient: [string, string];
  size?: number;
  avatarUrl?: string | null;
  uploading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function AvatarPhotoPicker({
  name,
  gradient,
  size = 100,
  avatarUrl,
  uploading = false,
  disabled = false,
  onPress,
}: AvatarPhotoPickerProps) {
  const badgeSize = Math.max(Math.round(size * 0.34), 30);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || uploading}
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityLabel="Upload profile photo"
      accessibilityRole="button"
    >
      <ProfileAvatar
        name={name}
        gradient={gradient}
        avatarUrl={avatarUrl}
        size={size}
      />
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
          <Text style={[styles.cameraIcon, { fontSize: badgeSize * 0.42 }]}>📷</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  cameraIcon: {
    lineHeight: undefined,
  },
});

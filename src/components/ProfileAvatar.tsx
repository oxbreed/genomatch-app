import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, getInitials } from '../data/mockData';

type ProfileAvatarProps = {
  name: string;
  gradient: [string, string];
  size?: number;
  avatarUrl?: string | null;
};

export default function ProfileAvatar({
  name,
  gradient,
  size = 56,
  avatarUrl,
}: ProfileAvatarProps) {
  const innerSize = size - 6;
  const fontSize = size * 0.32;
  const hasPhoto = Boolean(avatarUrl?.trim());

  return (
    <View
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: hasPhoto ? COLORS.white : gradient[0],
          borderWidth: hasPhoto ? 2 : 0,
          borderColor: 'rgba(168, 213, 186, 0.5)',
        },
      ]}
    >
      {hasPhoto ? (
        <Image
          source={{ uri: avatarUrl! }}
          style={{
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: gradient[1],
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

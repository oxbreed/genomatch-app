import { StyleSheet, Text, View } from 'react-native';
import { COLORS, getInitials } from '../data/mockData';

type ProfileAvatarProps = {
  name: string;
  gradient: [string, string];
  size?: number;
};

export default function ProfileAvatar({ name, gradient, size = 56 }: ProfileAvatarProps) {
  const innerSize = size - 6;
  const fontSize = size * 0.32;

  return (
    <View
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: gradient[0],
        },
      ]}
    >
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
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
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

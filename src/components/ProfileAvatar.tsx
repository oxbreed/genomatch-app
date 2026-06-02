import { DimensionValue, Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, getInitials } from '../data/mockData';

type ProfileAvatarProps = {
  name: string;
  gradient: [string, string];
  size?: number;
  avatarUrl?: string | null;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  initialsPosition?: 'top' | 'center';
  initialsOpacity?: number;
};

export default function ProfileAvatar({
  name,
  gradient,
  size = 56,
  avatarUrl,
  width,
  height,
  borderRadius,
  initialsPosition = 'center',
  initialsOpacity = 1,
}: ProfileAvatarProps) {
  const isCover = height != null;
  const outerWidth = isCover ? (width ?? size) : size;
  const outerHeight = isCover ? height : size;
  const outerRadius = isCover ? (borderRadius ?? 0) : size / 2;
  const innerSize = size - 6;
  const isTopInitials = isCover && initialsPosition === 'top';
  const fontSize = isCover
    ? isTopInitials
      ? outerHeight * 0.34
      : outerHeight * 0.28
    : size * 0.32;
  const hasPhoto = Boolean(avatarUrl?.trim());
  const initials = getInitials(name);

  const initialsNode = (
    <Text
      style={[
        styles.initials,
        { fontSize, opacity: initialsOpacity },
        isTopInitials && styles.initialsTop,
      ]}
    >
      {initials}
    </Text>
  );

  return (
    <View
      style={[
        styles.outer,
        {
          width: outerWidth,
          height: outerHeight,
          borderRadius: outerRadius,
          backgroundColor: hasPhoto ? COLORS.white : gradient[0],
          borderWidth: hasPhoto && !isCover ? 2 : 0,
          borderColor: 'rgba(168, 213, 186, 0.5)',
        },
      ]}
    >
      {hasPhoto ? (
        <Image
          source={{ uri: avatarUrl! }}
          style={
            isCover
              ? {
                  width: '100%',
                  height: '100%',
                  borderRadius: outerRadius,
                }
              : {
                  width: size - 4,
                  height: size - 4,
                  borderRadius: (size - 4) / 2,
                }
          }
          resizeMode="cover"
        />
      ) : isCover ? (
        <View
          style={[
            styles.coverFallback,
            StyleSheet.absoluteFillObject,
            {
              borderRadius: outerRadius,
              backgroundColor: gradient[1],
            },
          ]}
        >
          {!isTopInitials ? initialsNode : null}
        </View>
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
          {initialsNode}
        </View>
      )}
      {isTopInitials ? (
        <View style={styles.coverInitialsTop} pointerEvents="none">
          {initialsNode}
        </View>
      ) : null}
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
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitialsTop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 18,
    zIndex: 1,
  },
  initialsTop: {
    letterSpacing: 2,
  },
  initials: {
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

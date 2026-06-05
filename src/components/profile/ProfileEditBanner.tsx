import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoBondMark } from '../../brand';
import { COLORS } from '../../theme';

export default function ProfileEditBanner() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <Animated.View style={{ opacity }}>
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.35)', 'rgba(61, 122, 82, 0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <GenoBondMark size={28} opacity={0.9} />
        <View style={styles.copy}>
          <Text style={styles.kicker}>GENOMATCH</Text>
          <Text style={styles.title}>Editing your bond profile</Text>
          <Text style={styles.sub}>Changes apply when you tap Save</Text>
        </View>
        <Ionicons name="create-outline" size={22} color={COLORS.forestDeep} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.45)',
  },
  copy: { flex: 1, gap: 2 },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  sub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
  },
});

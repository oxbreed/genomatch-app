import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame } from '../../brand/graphics';
import { GenoBondMark } from '../../brand';
import { COLORS } from '../../theme';
import { PROFILE } from './profileTokens';

type Props = {
  genotype: string;
  onVerify: () => void;
};

export default function ProfileVerifyCard({ genotype, onVerify }: Props) {
  return (
    <GenoCardFrame>
      <View style={styles.inner}>
        <GenoBondMark size={32} opacity={0.88} />
        <View style={styles.copy}>
          <Text style={styles.title}>Verify you&apos;re real</Text>
          <Text style={styles.body}>
            Confirm your {genotype} genotype so matches know your profile is authentic.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={onVerify}
          >
            <LinearGradient
              colors={[COLORS.forestDeep, COLORS.forest]}
              style={styles.btnGradient}
            >
              <Ionicons name="shield-checkmark" size={18} color={COLORS.linen} />
              <Text style={styles.btnText}>Verify genotype</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    alignItems: 'flex-start',
  },
  copy: { flex: 1, gap: 8 },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: PROFILE.sectionTitleSize,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: 'Satoshi-Medium',
    fontSize: PROFILE.metaSize,
    lineHeight: 16,
    color: COLORS.sage,
  },
  btn: { borderRadius: 12, overflow: 'hidden', alignSelf: 'flex-start' },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: COLORS.linen,
  },
  pressed: { opacity: 0.9 },
});

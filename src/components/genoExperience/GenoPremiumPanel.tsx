import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  icon?: IonName;
  children: ReactNode;
};

export default function GenoPremiumPanel({ label, icon, children }: Props) {
  return (
    <View style={styles.panel}>
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.08)', 'transparent']}
        style={styles.panelSheen}
        pointerEvents="none"
      />
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={16} color={COLORS.forest} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.08)',
    overflow: 'hidden',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  panelSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: COLORS.sage,
    textTransform: 'uppercase',
  },
});

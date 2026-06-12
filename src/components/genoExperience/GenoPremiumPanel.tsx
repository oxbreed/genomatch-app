import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { GenoGlassSurface } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  icon?: IonName;
  children: ReactNode;
};

export default function GenoPremiumPanel({ label, icon, children }: Props) {
  return (
    <GenoGlassSurface
      variant="light"
      borderRadius={RADIUS.lg}
      shadow="glass"
      style={styles.panel}
      contentStyle={styles.panelContent}
    >
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={16} color={COLORS.forest} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {children}
    </GenoGlassSurface>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginBottom: 14,
    overflow: 'hidden',
  },
  panelContent: {
    padding: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: COLORS.sage,
    textTransform: 'uppercase',
  },
});

import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { GenoGlassSurface } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = TextInputProps & {
  label: string;
  icon?: IonName;
  rightAction?: { label: string; onPress: () => void };
};

export default function AuthField({ label, icon, rightAction, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightAction ? (
          <Text style={styles.rightAction} onPress={rightAction.onPress}>
            {rightAction.label}
          </Text>
        ) : null}
      </View>
      <GenoGlassSurface
        variant="light"
        borderRadius={RADIUS.md}
        shadow="none"
        intensity={52}
        style={styles.glass}
        contentStyle={styles.inputRow}
      >
        {icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color={COLORS.sage} />
          </View>
        ) : null}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : null, style]}
          placeholderTextColor={COLORS.textSubtle}
          {...inputProps}
        />
      </GenoGlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forestDeep,
    letterSpacing: 0.2,
  },
  rightAction: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forest,
  },
  glass: {
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  iconWrap: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 14,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
});

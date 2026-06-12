import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { FONT_FAMILY, COLORS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type GenotypeOption = {
  id: string;
  icon: IonName;
  name: string;
  accent: string;
};

type Props = {
  options: GenotypeOption[];
  selected: string;
  onSelect: (id: string) => void;
  cardScales: Animated.Value[];
  pulseScale: Animated.Value;
};

export default function GenotypePicker({
  options,
  selected,
  onSelect,
  cardScales,
  pulseScale,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>Your genotype</Text>
        <View style={styles.required}>
          <Text style={styles.requiredText}>Required</Text>
        </View>
      </View>
      <Text style={styles.hint}>Used only for compatibility — never shared publicly as raw data.</Text>

      <Animated.View style={[styles.grid, { transform: [{ scale: pulseScale }] }]}>
        {options.map((item, index) => {
          const isSelected = selected === item.id;
          return (
            <Animated.View
              key={item.id}
              style={[styles.cardWrap, { transform: [{ scale: cardScales[index] }] }]}
            >
              <Pressable
                onPress={() => onSelect(item.id)}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isSelected && { borderColor: item.accent },
                ]}
              >
                <View
                  style={[
                    styles.iconBubble,
                    isSelected && { backgroundColor: `${item.accent}22` },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isSelected ? item.accent : COLORS.forest}
                  />
                </View>
                <Text style={[styles.genoId, isSelected && { color: item.accent }]}>{item.id}</Text>
                <Text style={styles.genoName}>{item.name}</Text>
                {isSelected ? (
                  <View style={[styles.badge, { backgroundColor: item.accent }]}>
                    <Ionicons name="checkmark" size={10} color={COLORS.white} />
                  </View>
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  required: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
  },
  requiredText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    color: '#8C6A00',
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 12,
    color: COLORS.sage,
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 17,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    minHeight: 118,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    backgroundColor: COLORS.mint,
    shadowColor: COLORS.forest,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  genoId: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 22,
    color: COLORS.forestDeep,
    marginBottom: 2,
  },
  genoName: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    color: COLORS.sage,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

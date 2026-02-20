import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { DynamicIcon } from '../common/DynamicIcon';
import { usePinStore, ALL_PINS } from '@/src/stores/usePinStore';
import { useSkillTreeStore, SKILL_TREE_PINS } from '@/src/stores/useSkillTreeStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PinRarity } from '@/src/types';

const RARITY_COLORS: Record<PinRarity, string> = {
  common: '#8B9DAF',
  uncommon: '#4CAF50',
  rare: '#3B82F6',
  legendary: '#D4A44C',
};

export function PinCollection() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const collected = usePinStore((s) => s.collected);
  const skillTreeUnlocked = useSkillTreeStore((s) => s.unlocked);

  // Combine shop pins + skill tree pins into one collection
  const shopPins = ALL_PINS.filter((p) => collected.some((c) => c.pinId === p.id));
  const treePins = SKILL_TREE_PINS.filter((p) => skillTreeUnlocked[p.id]);

  const allOwned = [
    ...shopPins.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.color, rarity: p.rarity, source: 'shop' as const })),
    ...treePins.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.color, rarity: p.rarity, source: 'tree' as const })),
  ];

  const totalAvailable = ALL_PINS.length + SKILL_TREE_PINS.length;

  if (allOwned.length === 0) {
    return (
      <View style={[styles.emptyState, { borderColor: colors.border }]}>
        <FontAwesome name="lock" size={32} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          No pins yet
        </Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Purchase pins from the Store or unlock them through the Skill Tree!
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
        {allOwned.length} / {totalAvailable} collected
      </Text>
      <View style={styles.grid}>
        {allOwned.map((pin) => {
          const rarityColor = RARITY_COLORS[pin.rarity];
          return (
            <View
              key={pin.id}
              style={[styles.pinItem, { backgroundColor: colors.inputBackground, borderColor: pin.color + '40' }]}
            >
              <View style={[styles.pinCircle, { backgroundColor: pin.color + '25', borderColor: pin.color }]}>
                <DynamicIcon name={pin.icon} size={20} color={pin.color} />
              </View>
              <Text style={[styles.pinName, { color: colors.text }]} numberOfLines={1}>
                {pin.name}
              </Text>
              <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  countLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pinItem: {
    width: '30%' as any,
    flexGrow: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  rarityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

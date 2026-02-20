import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { DynamicIcon } from '../common/DynamicIcon';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { useSkillTreeStore, SKILL_TREE_PINS, SKILL_TREE_CATEGORIES } from '@/src/stores/useSkillTreeStore';
import { DEFAULT_CATEGORIES } from '@/src/stores/useCustomCategoryStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import { SkillTreeCategory, PinRarity } from '@/src/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const RARITY_COLORS: Record<PinRarity, string> = {
  common: '#8B9DAF',
  uncommon: '#4CAF50',
  rare: '#3B82F6',
  legendary: '#D4A44C',
};

function getCategoryCompletions(habits: ReturnType<typeof useHabitStore.getState>['habits']): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const h of habits) {
    counts[h.category] = (counts[h.category] ?? 0) + h.completedDates.length;
  }
  return counts;
}

export function SkillTree() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const habits = useHabitStore((s) => s.habits);
  const unlocked = useSkillTreeStore((s) => s.unlocked);

  const completions = getCategoryCompletions(habits);
  const [expandedCategory, setExpandedCategory] = useState<SkillTreeCategory | null>(null);

  return (
    <View>
      {SKILL_TREE_CATEGORIES.map((cat) => {
        const catMeta = DEFAULT_CATEGORIES.find((c) => c.id === cat);
        const catColor = catMeta?.color ?? '#888';
        const catIcon = catMeta?.icon ?? 'star';
        const catName = catMeta?.name ?? cat;
        const catPins = SKILL_TREE_PINS.filter((p) => p.category === cat);
        const count = completions[cat] ?? 0;
        const unlockedCount = catPins.filter((p) => unlocked[p.id]).length;
        const isExpanded = expandedCategory === cat;

        return (
          <View key={cat} style={[styles.branchContainer, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.branchHeader}
              activeOpacity={0.7}
              onPress={() => setExpandedCategory(isExpanded ? null : cat)}
            >
              <View style={[styles.branchIcon, { backgroundColor: catColor + '20' }]}>
                <DynamicIcon name={catIcon} size={18} color={catColor} />
              </View>
              <View style={styles.branchInfo}>
                <Text style={[styles.branchName, { color: colors.text }]}>{catName}</Text>
                <Text style={[styles.branchProgress, { color: colors.textSecondary }]}>
                  {unlockedCount}/{catPins.length} pins · {count} completions
                </Text>
              </View>
              <FontAwesome
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.tierList}>
                {catPins.map((pin, idx) => {
                  const isOwned = !!unlocked[pin.id];
                  const prevUnlocked = idx === 0 || !!unlocked[catPins[idx - 1].id];
                  const progress = Math.min(count / pin.requiredCompletions, 1);
                  const rarityColor = RARITY_COLORS[pin.rarity];

                  return (
                    <View key={pin.id}>
                      {/* Connector line */}
                      {idx > 0 && (
                        <View style={styles.connectorWrap}>
                          <View
                            style={[
                              styles.connector,
                              {
                                backgroundColor: isOwned
                                  ? catColor
                                  : colors.border,
                              },
                            ]}
                          />
                        </View>
                      )}
                      <View
                        style={[
                          styles.tierRow,
                          {
                            backgroundColor: isOwned
                              ? catColor + '12'
                              : colors.inputBackground,
                            borderColor: isOwned ? catColor + '40' : colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.tierIcon,
                            {
                              backgroundColor: isOwned ? catColor + '30' : colors.inputBackground,
                              borderColor: isOwned ? catColor : colors.border,
                            },
                          ]}
                        >
                          <DynamicIcon
                            name={pin.icon}
                            size={isOwned ? 20 : 18}
                            color={isOwned ? catColor : (prevUnlocked ? colors.textSecondary : colors.textMuted)}
                          />
                        </View>
                        <View style={styles.tierInfo}>
                          <View style={styles.tierNameRow}>
                            <Text
                              style={[
                                styles.tierName,
                                { color: isOwned ? colors.text : colors.textSecondary },
                              ]}
                              numberOfLines={1}
                            >
                              {pin.name}
                            </Text>
                            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
                              <Text style={[styles.rarityText, { color: rarityColor }]}>
                                {pin.rarity}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={[styles.tierDesc, { color: colors.textMuted }]}
                            numberOfLines={1}
                          >
                            {pin.description}
                          </Text>
                          {!isOwned && (
                            <View style={styles.progressRow}>
                              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                                <View
                                  style={[
                                    styles.progressFill,
                                    {
                                      backgroundColor: catColor,
                                      width: `${Math.round(progress * 100)}%` as any,
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={[styles.progressText, { color: colors.textMuted }]}>
                                {count}/{pin.requiredCompletions}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  branchContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  branchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  branchProgress: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  tierList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  connectorWrap: {
    alignItems: 'center',
    height: 16,
  },
  connector: {
    width: 2,
    height: 16,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  tierIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  tierInfo: {
    flex: 1,
  },
  tierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tierName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierDesc: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
});

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { TokenBadge } from '../common/TokenBadge';
import { XPBadge } from '../common/XPBadge';
import { Habit } from '@/src/types';
import { HABIT_CATEGORY_COLORS, HABIT_CATEGORY_ICONS } from '@/src/utils/levels';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  date?: string;
}

export function HabitCard({ habit, onToggle, date }: HabitCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const dateStr = date || format(new Date(), 'yyyy-MM-dd');
  const isCompleted = habit.completedDates.includes(dateStr);
  const categoryColor = HABIT_CATEGORY_COLORS[habit.category] || colors.primary;

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.checkbox,
            {
              borderColor: isCompleted ? categoryColor : colors.border,
              backgroundColor: isCompleted ? categoryColor : 'transparent',
            },
          ]}
        >
          {isCompleted && (
            <FontAwesome name="check" size={14} color="#FFF" />
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          <Text
            style={[
              styles.name,
              { color: colors.text },
              isCompleted && styles.completedText,
            ]}
          >
            {habit.name}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColor + '20' },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {habit.category}
              </Text>
            </View>
            {habit.currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <FontAwesome name="fire" size={12} color="#E87D2F" />
                <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                  {habit.currentStreak}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rewards}>
          <TokenBadge amount={habit.tokenReward} size="small" />
          <XPBadge amount={habit.xpReward} size="small" />
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  rewards: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
});

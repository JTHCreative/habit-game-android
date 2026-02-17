import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { TokenBadge } from '../common/TokenBadge';
import { XPBadge } from '../common/XPBadge';
import { Habit } from '@/src/types';
import { HABIT_CATEGORY_COLORS, isHabitCompletedForPeriod } from '@/src/utils/levels';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const FREQUENCY_LABELS: Record<string, string> = {
  one_time: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
};

const FREQUENCY_COLORS: Record<string, string> = {
  one_time: '#9CA3AF',
  daily: '#3B82F6',
  weekly: '#8B5CF6',
};

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  date?: string;
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isCompleted = isHabitCompletedForPeriod(habit.frequency, habit.completedDates);
  const categoryColor = HABIT_CATEGORY_COLORS[habit.category] || colors.primary;
  const frequencyColor = FREQUENCY_COLORS[habit.frequency] || colors.textSecondary;

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
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: frequencyColor + '20' },
              ]}
            >
              <Text style={[styles.categoryText, { color: frequencyColor }]}>
                {FREQUENCY_LABELS[habit.frequency]}
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

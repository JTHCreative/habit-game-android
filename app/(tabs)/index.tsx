import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { PlayerHeader } from '@/src/components/profile/PlayerHeader';
import { HabitCard } from '@/src/components/habits/HabitCard';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { useUserStore } from '@/src/stores/useUserStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { HabitCategory } from '@/src/types';
import {
  HABIT_CATEGORY_COLORS,
  HABIT_CATEGORY_ICONS,
} from '@/src/utils/levels';

const CATEGORIES: HabitCategory[] = [
  'health',
  'fitness',
  'mindfulness',
  'productivity',
  'learning',
  'social',
  'finance',
  'custom',
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const today = format(new Date(), 'yyyy-MM-dd');

  const habits = useHabitStore((s) => s.habits);
  const toggleHabitCompletion = useHabitStore((s) => s.toggleHabitCompletion);
  const addHabit = useHabitStore((s) => s.addHabit);
  const addXP = useUserStore((s) => s.addXP);
  const removeXP = useUserStore((s) => s.removeXP);
  const addTokens = useUserStore((s) => s.addTokens);
  const removeTokens = useUserStore((s) => s.removeTokens);
  const incrementHabitsCompleted = useUserStore((s) => s.incrementHabitsCompleted);
  const decrementHabitsCompleted = useUserStore((s) => s.decrementHabitsCompleted);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('health');

  const activeHabits = habits.filter((h) => h.isActive);
  const completedToday = activeHabits.filter((h) =>
    h.completedDates.includes(today)
  );
  const completionRate =
    activeHabits.length > 0
      ? Math.round((completedToday.length / activeHabits.length) * 100)
      : 0;

  const handleToggle = (habitId: string) => {
    const { completed, habit } = toggleHabitCompletion(habitId, today);
    if (habit) {
      if (completed) {
        addXP(habit.xpReward);
        addTokens(habit.tokenReward);
        incrementHabitsCompleted();
      } else {
        removeXP(habit.xpReward);
        removeTokens(habit.tokenReward);
        decrementHabitsCompleted();
      }
    }
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    addHabit({
      name: newHabitName.trim(),
      description: newHabitDescription.trim(),
      category: selectedCategory,
      frequency: 'daily',
      targetCount: 1,
      tokenReward: 10,
      xpReward: 15,
      icon: HABIT_CATEGORY_ICONS[selectedCategory] || 'star',
      color: HABIT_CATEGORY_COLORS[selectedCategory] || '#D4A44C',
    });
    setNewHabitName('');
    setNewHabitDescription('');
    setSelectedCategory('health');
    setShowAddModal(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PlayerHeader />

        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Today's Habits
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {completedToday.length}/{activeHabits.length} completed ({completionRate}%)
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <FontAwesome name="plus" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {activeHabits.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <FontAwesome name="plus-circle" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                No habits yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Tap the + button to create your first habit and start earning rewards!
              </Text>
            </View>
          ) : (
            activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                date={today}
                onToggle={() => handleToggle(habit.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New Habit
            </Text>
            <TouchableOpacity onPress={handleAddHabit}>
              <Text
                style={[
                  styles.modalSave,
                  {
                    color: newHabitName.trim()
                      ? colors.primary
                      : colors.textMuted,
                  },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Habit Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g., Drink 8 glasses of water"
              placeholderTextColor={colors.textMuted}
              value={newHabitName}
              onChangeText={setNewHabitName}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Description (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Why is this habit important to you?"
              placeholderTextColor={colors.textMuted}
              value={newHabitDescription}
              onChangeText={setNewHabitDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategory === cat
                          ? HABIT_CATEGORY_COLORS[cat]
                          : colors.inputBackground,
                      borderColor:
                        selectedCategory === cat
                          ? HABIT_CATEGORY_COLORS[cat]
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedCategory === cat
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.rewardPreview, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[styles.rewardPreviewTitle, { color: colors.text }]}>
                Rewards per completion
              </Text>
              <View style={styles.rewardPreviewRow}>
                <View style={styles.rewardItem}>
                  <FontAwesome name="diamond" size={16} color="#D4A44C" />
                  <Text style={[styles.rewardValue, { color: colors.text }]}>
                    10 Tokens
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <FontAwesome name="bolt" size={16} color="#E87D2F" />
                  <Text style={[styles.rewardValue, { color: colors.text }]}>
                    15 XP
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  body: {
    padding: spacing.md,
    marginTop: -spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A55',
  },
  modalCancel: {
    fontSize: fontSize.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalSave: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rewardPreview: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  rewardPreviewTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  rewardPreviewRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

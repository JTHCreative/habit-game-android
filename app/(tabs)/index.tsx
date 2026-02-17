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
import { PlayerHeader } from '@/src/components/profile/PlayerHeader';
import { HabitCard } from '@/src/components/habits/HabitCard';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { useUserStore } from '@/src/stores/useUserStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { HabitCategory, HabitFrequency } from '@/src/types';
import {
  HABIT_CATEGORY_COLORS,
  HABIT_CATEGORY_ICONS,
  getPSTDateString,
  isHabitCompletedForPeriod,
  getCompletedDateForCurrentPeriod,
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

const FREQUENCIES: { value: HabitFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Resets daily at 12am PST' },
  { value: 'weekly', label: 'Weekly', description: 'Resets Sundays at 12am PST' },
  { value: 'one_time', label: 'One-time', description: 'Disappears when completed' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const today = getPSTDateString();

  const habits = useHabitStore((s) => s.habits);
  const toggleHabitCompletion = useHabitStore((s) => s.toggleHabitCompletion);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const addXP = useUserStore((s) => s.addXP);
  const removeXP = useUserStore((s) => s.removeXP);
  const addTokens = useUserStore((s) => s.addTokens);
  const removeTokens = useUserStore((s) => s.removeTokens);
  const incrementHabitsCompleted = useUserStore((s) => s.incrementHabitsCompleted);
  const decrementHabitsCompleted = useUserStore((s) => s.decrementHabitsCompleted);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('health');
  const [selectedFrequency, setSelectedFrequency] = useState<HabitFrequency>('daily');
  const [customTokenReward, setCustomTokenReward] = useState('10');
  const [customXPReward, setCustomXPReward] = useState('15');
  const [showRewardInputs, setShowRewardInputs] = useState(false);
  const isEditing = editingHabitId !== null;

  const activeHabits = habits.filter((h) => h.isActive);
  const completedToday = activeHabits.filter((h) =>
    isHabitCompletedForPeriod(h.frequency, h.completedDates)
  );
  const completionRate =
    activeHabits.length > 0
      ? Math.round((completedToday.length / activeHabits.length) * 100)
      : 0;

  const handleToggle = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    if (habit.frequency === 'weekly') {
      const existingDate = getCompletedDateForCurrentPeriod(habit.frequency, habit.completedDates);
      if (existingDate) {
        // Un-mark: remove the date that was completed this week
        const { completed, habit: updated } = toggleHabitCompletion(habitId, existingDate);
        if (updated && !completed) {
          removeXP(updated.xpReward);
          removeTokens(updated.tokenReward);
          decrementHabitsCompleted();
        }
      } else {
        // Mark: add today's PST date
        const { completed, habit: updated } = toggleHabitCompletion(habitId, today);
        if (updated && completed) {
          addXP(updated.xpReward);
          addTokens(updated.tokenReward);
          incrementHabitsCompleted();
        }
      }
    } else {
      // daily or one_time
      const { completed, habit: updated } = toggleHabitCompletion(habitId, today);
      if (updated) {
        if (completed) {
          addXP(updated.xpReward);
          addTokens(updated.tokenReward);
          incrementHabitsCompleted();
          if (habit.frequency === 'one_time') {
            updateHabit(habitId, { isActive: false });
          }
        } else {
          removeXP(updated.xpReward);
          removeTokens(updated.tokenReward);
          decrementHabitsCompleted();
        }
      }
    }
  };

  const resetModal = () => {
    setNewHabitName('');
    setNewHabitDescription('');
    setSelectedCategory('health');
    setSelectedFrequency('daily');
    setCustomTokenReward('10');
    setCustomXPReward('15');
    setShowRewardInputs(false);
    setEditingHabitId(null);
  };

  const handleOpenEdit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    setEditingHabitId(habitId);
    setNewHabitName(habit.name);
    setNewHabitDescription(habit.description);
    setSelectedCategory(habit.category);
    setSelectedFrequency(habit.frequency);
    setCustomTokenReward(String(habit.tokenReward));
    setCustomXPReward(String(habit.xpReward));
    setShowRewardInputs(false);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!newHabitName.trim()) return;
    if (isEditing) {
      updateHabit(editingHabitId, {
        name: newHabitName.trim(),
        description: newHabitDescription.trim(),
        category: selectedCategory,
        frequency: selectedFrequency,
        tokenReward: parseInt(customTokenReward, 10) || 10,
        xpReward: parseInt(customXPReward, 10) || 15,
        icon: HABIT_CATEGORY_ICONS[selectedCategory] || 'star',
        color: HABIT_CATEGORY_COLORS[selectedCategory] || '#D4A44C',
      });
    } else {
      addHabit({
        name: newHabitName.trim(),
        description: newHabitDescription.trim(),
        category: selectedCategory,
        frequency: selectedFrequency,
        targetCount: 1,
        tokenReward: parseInt(customTokenReward, 10) || 10,
        xpReward: parseInt(customXPReward, 10) || 15,
        icon: HABIT_CATEGORY_ICONS[selectedCategory] || 'star',
        color: HABIT_CATEGORY_COLORS[selectedCategory] || '#D4A44C',
      });
    }
    resetModal();
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
              onPress={() => { resetModal(); setShowAddModal(true); }}
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
                onLongPress={() => handleOpenEdit(habit.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { resetModal(); setShowAddModal(false); }}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { resetModal(); setShowAddModal(false); }}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Habit' : 'New Habit'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
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

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
          >
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

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Frequency
            </Text>
            <View style={styles.categoryGrid}>
              {FREQUENCIES.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedFrequency === freq.value
                          ? colors.primary
                          : colors.inputBackground,
                      borderColor:
                        selectedFrequency === freq.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedFrequency(freq.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedFrequency === freq.value
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.frequencyDescription, { color: colors.textMuted }]}>
              {FREQUENCIES.find((f) => f.value === selectedFrequency)?.description}
            </Text>

            <TouchableOpacity
              style={[
                styles.rewardPreview,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                showRewardInputs && styles.rewardPreviewExpanded,
              ]}
              onPress={() => setShowRewardInputs(!showRewardInputs)}
              activeOpacity={0.7}
            >
              <View style={styles.rewardPreviewHeader}>
                <Text style={[styles.rewardPreviewTitle, { color: colors.text }]}>
                  Rewards per completion
                </Text>
                <FontAwesome
                  name={showRewardInputs ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.rewardPreviewRow}>
                <View style={styles.rewardItem}>
                  <FontAwesome name="diamond" size={16} color="#D4A44C" />
                  <Text style={[styles.rewardValue, { color: colors.text }]}>
                    {customTokenReward || '0'} Tokens
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <FontAwesome name="bolt" size={16} color="#E87D2F" />
                  <Text style={[styles.rewardValue, { color: colors.text }]}>
                    {customXPReward || '0'} XP
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            {showRewardInputs && (
              <View style={[styles.rewardInputsContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.rewardInputRow}>
                  <FontAwesome name="diamond" size={16} color="#D4A44C" />
                  <Text style={[styles.rewardInputLabel, { color: colors.textSecondary }]}>
                    Tokens
                  </Text>
                  <TextInput
                    style={[
                      styles.rewardInput,
                      {
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={customTokenReward}
                    onChangeText={(text) => setCustomTokenReward(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.rewardInputRow}>
                  <FontAwesome name="bolt" size={16} color="#E87D2F" />
                  <Text style={[styles.rewardInputLabel, { color: colors.textSecondary }]}>
                    XP
                  </Text>
                  <TextInput
                    style={[
                      styles.rewardInput,
                      {
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={customXPReward}
                    onChangeText={(text) => setCustomXPReward(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            )}
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
  modalBodyContent: {
    paddingBottom: spacing.xxl * 2,
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
  frequencyDescription: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  rewardPreview: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  rewardPreviewExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  rewardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardPreviewTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  rewardInputsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    gap: spacing.md,
  },
  rewardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardInputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    width: 55,
  },
  rewardInput: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    borderWidth: 1,
    textAlign: 'center',
  },
});

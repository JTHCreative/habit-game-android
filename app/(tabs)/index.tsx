import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
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
import { DynamicIcon } from '@/src/components/common/DynamicIcon';
import { HabitCategory, HabitFrequency, HabitType } from '@/src/types';
import { useCategoryStore, DEFAULT_CATEGORY_IDS } from '@/src/stores/useCustomCategoryStore';
import { useMissionStore } from '@/src/stores/useMissionStore';
import { useAchievementChecker } from '@/src/hooks/useAchievementChecker';
import {
  getPSTDateString,
  isHabitCompletedForPeriod,
  getCompletedDateForCurrentPeriod,
} from '@/src/utils/levels';

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B', '#3B82F6',
  '#EC4899', '#10B981', '#6366F1', '#EF4444', '#14B8A6',
  '#F97316', '#8B5CF6', '#06B6D4', '#D946EF', '#84CC16',
  '#E11D48',
];

const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'heart', label: 'heart' },
  { value: 'mci:dumbbell', label: 'dumbbell' },
  { value: 'leaf', label: 'leaf' },
  { value: 'rocket', label: 'rocket' },
  { value: 'book', label: 'book' },
  { value: 'users', label: 'users' },
  { value: 'dollar', label: 'dollar' },
  { value: 'tag', label: 'tag' },
  { value: 'star', label: 'star' },
  { value: 'music', label: 'music' },
  { value: 'paint-brush', label: 'paint-brush' },
  { value: 'futbol-o', label: 'futbol-o' },
  { value: 'bicycle', label: 'bicycle' },
  { value: 'cutlery', label: 'cutlery' },
  { value: 'home', label: 'home' },
  { value: 'tree', label: 'tree' },
  { value: 'paw', label: 'paw' },
  { value: 'trophy', label: 'trophy' },
];

const FREQUENCIES: { value: HabitFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Resets daily at 12am PST' },
  { value: 'weekly', label: 'Weekly', description: 'Resets Sundays at 12am PST' },
  { value: 'one_time', label: 'One-time', description: 'Disappears when completed' },
];

const HABIT_TYPES: { value: HabitType; label: string; icon: string }[] = [
  { value: 'positive', label: 'Positive', icon: 'plus' },
  { value: 'negative', label: 'Negative', icon: 'minus' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const today = getPSTDateString();

  const habits = useHabitStore((s) => s.habits);
  const toggleHabitCompletion = useHabitStore((s) => s.toggleHabitCompletion);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const addXP = useUserStore((s) => s.addXP);
  const removeXP = useUserStore((s) => s.removeXP);
  const addTokens = useUserStore((s) => s.addTokens);
  const removeTokens = useUserStore((s) => s.removeTokens);
  const incrementHabitsCompleted = useUserStore((s) => s.incrementHabitsCompleted);
  const decrementHabitsCompleted = useUserStore((s) => s.decrementHabitsCompleted);

  const onHabitCompleted = useMissionStore((s) => s.onHabitCompleted);
  const onStreakUpdated = useMissionStore((s) => s.onStreakUpdated);
  const checkAchievements = useAchievementChecker();

  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const removeCategory = useCategoryStore((s) => s.removeCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterFrequency, setFilterFrequency] = useState<HabitFrequency | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('health');
  const [selectedFrequency, setSelectedFrequency] = useState<HabitFrequency>('daily');
  const [selectedHabitType, setSelectedHabitType] = useState<HabitType>('positive');
  const [customTokenReward, setCustomTokenReward] = useState('10');
  const [customXPReward, setCustomXPReward] = useState('15');
  const [showRewardInputs, setShowRewardInputs] = useState(false);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PALETTE[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState('tag');
  const isEditing = editingHabitId !== null;

  const activeHabits = habits.filter((h) => h.isActive);
  const completedToday = activeHabits.filter((h) =>
    isHabitCompletedForPeriod(h.frequency, h.completedDates)
  );
  const completionRate =
    activeHabits.length > 0
      ? Math.round((completedToday.length / activeHabits.length) * 100)
      : 0;

  const filteredHabits = activeHabits.filter((h) => {
    if (filterCategory && (h.customCategoryId || h.category) !== filterCategory) return false;
    if (filterFrequency && h.frequency !== filterFrequency) return false;
    return true;
  });
  const hasActiveFilters = filterCategory !== null || filterFrequency !== null;

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
          onHabitCompleted(habit.category);
          onStreakUpdated(updated.currentStreak);
          checkAchievements();
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
          onHabitCompleted(habit.category);
          onStreakUpdated(updated.currentStreak);
          if (habit.frequency === 'one_time') {
            updateHabit(habitId, { isActive: false });
          }
          checkAchievements();
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
    setSelectedCategoryId(categories[0]?.id || 'health');
    setSelectedFrequency('daily');
    setSelectedHabitType('positive');
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
    setSelectedCategoryId(habit.customCategoryId || habit.category);
    setSelectedFrequency(habit.frequency);
    setSelectedHabitType(habit.habitType || 'positive');
    setCustomTokenReward(String(habit.tokenReward));
    setCustomXPReward(String(habit.xpReward));
    setShowRewardInputs(false);
    setShowAddModal(true);
  };

  const getSelectedCategoryStyle = () => {
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat) return { icon: cat.icon, color: cat.color };
    return { icon: 'star', color: '#6366F1' };
  };

  const resolveHabitCategory = (): HabitCategory => {
    return DEFAULT_CATEGORY_IDS.includes(selectedCategoryId)
      ? (selectedCategoryId as HabitCategory)
      : 'custom';
  };

  const handleSave = () => {
    if (!newHabitName.trim()) return;
    const { icon, color } = getSelectedCategoryStyle();
    const habitCategory = resolveHabitCategory();
    if (isEditing) {
      updateHabit(editingHabitId, {
        name: newHabitName.trim(),
        description: newHabitDescription.trim(),
        category: habitCategory,
        customCategoryId: selectedCategoryId,
        frequency: selectedFrequency,
        habitType: selectedHabitType,
        tokenReward: parseInt(customTokenReward, 10) || 10,
        xpReward: parseInt(customXPReward, 10) || 15,
        icon,
        color,
      });
    } else {
      addHabit({
        name: newHabitName.trim(),
        description: newHabitDescription.trim(),
        category: habitCategory,
        customCategoryId: selectedCategoryId,
        frequency: selectedFrequency,
        habitType: selectedHabitType,
        targetCount: 1,
        tokenReward: parseInt(customTokenReward, 10) || 10,
        xpReward: parseInt(customXPReward, 10) || 15,
        icon,
        color,
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
            <View style={styles.sectionHeaderActions}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: hasActiveFilters ? colors.primary : colors.surfaceElevated,
                    borderColor: hasActiveFilters ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <FontAwesome
                  name="filter"
                  size={14}
                  color={hasActiveFilters ? '#FFF' : colors.textSecondary}
                />
                {hasActiveFilters && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>
                      {(filterCategory ? 1 : 0) + (filterFrequency ? 1 : 0)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => { resetModal(); setShowAddModal(true); }}
              >
                <FontAwesome name="plus" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {showFilters && (
            <View style={[styles.filterPanel, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Category</Text>
                <View style={styles.filterChips}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor:
                            filterCategory === cat.id
                              ? cat.color
                              : colors.inputBackground,
                          borderColor:
                            filterCategory === cat.id
                              ? cat.color
                              : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setFilterCategory(filterCategory === cat.id ? null : cat.id)
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color:
                              filterCategory === cat.id ? '#FFF' : colors.textSecondary,
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Timeframe</Text>
                <View style={styles.filterChips}>
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq.value}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor:
                            filterFrequency === freq.value
                              ? colors.primary
                              : colors.inputBackground,
                          borderColor:
                            filterFrequency === freq.value
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setFilterFrequency(
                          filterFrequency === freq.value ? null : freq.value
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color:
                              filterFrequency === freq.value
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
              </View>
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearFilters}
                  onPress={() => {
                    setFilterCategory(null);
                    setFilterFrequency(null);
                  }}
                >
                  <FontAwesome name="times" size={12} color={colors.textMuted} />
                  <Text style={[styles.clearFiltersText, { color: colors.textMuted }]}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
          ) : filteredHabits.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <FontAwesome name="filter" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                No matching habits
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Try adjusting your filters to see more habits.
              </Text>
            </View>
          ) : (
            filteredHabits.map((habit) => {
              const cat = categories.find((c) => c.id === (habit.customCategoryId || habit.category));
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  categoryName={cat?.name}
                  date={today}
                  onToggle={() => handleToggle(habit.id)}
                  onLongPress={() => handleOpenEdit(habit.id)}
                />
              );
            })
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
              Habit Type
            </Text>
            <View style={styles.habitTypeRow}>
              {HABIT_TYPES.map((ht) => {
                const isSelected = selectedHabitType === ht.value;
                const typeColor = ht.value === 'positive' ? '#4CAF50' : '#EF4444';
                return (
                  <TouchableOpacity
                    key={ht.value}
                    style={[
                      styles.habitTypeButton,
                      {
                        backgroundColor: isSelected ? typeColor : colors.inputBackground,
                        borderColor: isSelected ? typeColor : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedHabitType(ht.value)}
                  >
                    <FontAwesome
                      name={ht.icon as any}
                      size={14}
                      color={isSelected ? '#FFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.habitTypeButtonText,
                        { color: isSelected ? '#FFF' : colors.textSecondary },
                      ]}
                    >
                      {ht.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedHabitType === 'negative' && (
              <Text style={[styles.habitTypeHelpText, { color: colors.textMuted }]}>
                "{newHabitName.trim() || 'This habit'}" is something you want to stop doing. You'll be rewarded for not doing it each {selectedFrequency === 'daily' ? 'day' : selectedFrequency === 'weekly' ? 'week' : 'time'}.
              </Text>
            )}

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategoryId === cat.id
                          ? cat.color
                          : colors.inputBackground,
                      borderColor:
                        selectedCategoryId === cat.id
                          ? cat.color
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedCategoryId === cat.id
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowCategoryEditor(true)}
              >
                <FontAwesome name="cog" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Manage
                </Text>
              </TouchableOpacity>
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
                  <FontAwesome name="ticket" size={16} color="#D4A44C" />
                  <Text style={[styles.rewardValue, { color: colors.text }]}>
                    {customTokenReward || '0'} Tickets
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
                  <View style={styles.rewardInputIcon}>
                    <FontAwesome name="ticket" size={16} color="#D4A44C" />
                  </View>
                  <Text style={[styles.rewardInputLabel, { color: colors.textSecondary }]}>
                    Tickets
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
                  <View style={styles.rewardInputIcon}>
                    <FontAwesome name="bolt" size={16} color="#E87D2F" />
                  </View>
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
            {isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  removeHabit(editingHabitId);
                  resetModal();
                  setShowAddModal(false);
                }}
              >
                <FontAwesome name="trash" size={16} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete Habit</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCategoryEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCategoryForm(false);
          setEditingCategoryId(null);
          setShowCategoryEditor(false);
        }}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCategoryForm(false);
              setEditingCategoryId(null);
              setShowCategoryEditor(false);
            }}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                Back
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Categories
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
          >
            {categories.length === 0 && !showCategoryForm && (
              <View style={[styles.emptyState, { borderColor: colors.border, marginBottom: spacing.lg }]}>
                <FontAwesome name="folder-open" size={40} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                  No categories
                </Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Add categories with custom names, colors, and icons.
                </Text>
              </View>
            )}

            <View style={styles.customCategoryGrid}>
              {categories.map((cc) => {
                const isSelected = selectedCategoryId === cc.id;
                return (
                  <TouchableOpacity
                    key={cc.id}
                    style={[
                      styles.customCategoryCard,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: isSelected ? cc.color : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cc.id);
                      setEditingCategoryId(cc.id);
                      setNewCategoryName(cc.name);
                      setNewCategoryColor(cc.color);
                      setNewCategoryIcon(cc.icon);
                      setShowCategoryForm(true);
                    }}
                    onLongPress={() => {
                      if (categories.length <= 1) return;
                      Alert.alert(
                        'Delete Category',
                        `Are you sure you want to delete "${cc.name}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              if (selectedCategoryId === cc.id) {
                                const next = categories.find((c) => c.id !== cc.id);
                                if (next) setSelectedCategoryId(next.id);
                              }
                              removeCategory(cc.id);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.customCategoryCardIcon,
                        { backgroundColor: cc.color + '20' },
                      ]}
                    >
                      <DynamicIcon name={cc.icon} size={20} color={cc.color} />
                    </View>
                    <Text
                      style={[styles.customCategoryCardName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {cc.name}
                    </Text>
                    <View
                      style={[styles.customCategoryCardColorDot, { backgroundColor: cc.color }]}
                    />
                    {isSelected && (
                      <View style={[styles.customCategorySelectedBadge, { backgroundColor: cc.color }]}>
                        <FontAwesome name="check" size={10} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {showCategoryForm ? (
              <View style={[styles.addCategoryForm, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.addCategoryFormTitle, { color: colors.text }]}>
                  {editingCategoryId ? 'Edit Category' : 'New Category'}
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Name
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
                  placeholder="e.g., Creativity"
                  placeholderTextColor={colors.textMuted}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Color
                </Text>
                <View style={styles.colorPalette}>
                  {COLOR_PALETTE.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c },
                        newCategoryColor === c && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setNewCategoryColor(c)}
                    >
                      {newCategoryColor === c && (
                        <FontAwesome name="check" size={12} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Icon
                </Text>
                <View style={styles.iconPalette}>
                  {ICON_OPTIONS.map((ic) => (
                    <TouchableOpacity
                      key={ic.value}
                      style={[
                        styles.iconChoice,
                        {
                          backgroundColor:
                            newCategoryIcon === ic.value
                              ? newCategoryColor + '20'
                              : colors.inputBackground,
                          borderColor:
                            newCategoryIcon === ic.value
                              ? newCategoryColor
                              : colors.border,
                        },
                      ]}
                      onPress={() => setNewCategoryIcon(ic.value)}
                    >
                      <DynamicIcon
                        name={ic.value}
                        size={18}
                        color={newCategoryIcon === ic.value ? newCategoryColor : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.addCategoryActions}>
                  <TouchableOpacity
                    style={[styles.addCategoryCancel, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowCategoryForm(false);
                      setEditingCategoryId(null);
                      setNewCategoryName('');
                      setNewCategoryColor(COLOR_PALETTE[0]);
                      setNewCategoryIcon('tag');
                    }}
                  >
                    <Text style={[styles.addCategoryCancelText, { color: colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  {editingCategoryId ? (
                    <TouchableOpacity
                      style={[
                        styles.addCategorySave,
                        {
                          backgroundColor: newCategoryName.trim()
                            ? newCategoryColor
                            : colors.inputBackground,
                        },
                      ]}
                      onPress={() => {
                        if (!newCategoryName.trim()) return;
                        updateCategory(editingCategoryId, {
                          name: newCategoryName.trim(),
                          color: newCategoryColor,
                          icon: newCategoryIcon,
                        });
                        setShowCategoryForm(false);
                        setEditingCategoryId(null);
                        setNewCategoryName('');
                        setNewCategoryColor(COLOR_PALETTE[0]);
                        setNewCategoryIcon('tag');
                      }}
                    >
                      <Text
                        style={[
                          styles.addCategorySaveText,
                          { color: newCategoryName.trim() ? '#FFF' : colors.textMuted },
                        ]}
                      >
                        Save Changes
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.addCategorySave,
                        {
                          backgroundColor: newCategoryName.trim()
                            ? newCategoryColor
                            : colors.inputBackground,
                        },
                      ]}
                      onPress={() => {
                        if (!newCategoryName.trim()) return;
                        const created = addCategory(
                          newCategoryName.trim(),
                          newCategoryColor,
                          newCategoryIcon
                        );
                        setSelectedCategoryId(created.id);
                        setNewCategoryName('');
                        setNewCategoryColor(COLOR_PALETTE[0]);
                        setNewCategoryIcon('tag');
                        setShowCategoryForm(false);
                        setShowCategoryEditor(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.addCategorySaveText,
                          { color: newCategoryName.trim() ? '#FFF' : colors.textMuted },
                        ]}
                      >
                        Create & Select
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addCategoryButton, { borderColor: colors.border }]}
                onPress={() => {
                  setEditingCategoryId(null);
                  setNewCategoryName('');
                  setNewCategoryColor(COLOR_PALETTE[0]);
                  setNewCategoryIcon('tag');
                  setShowCategoryForm(true);
                }}
              >
                <FontAwesome name="plus" size={16} color={colors.primary} />
                <Text style={[styles.addCategoryButtonText, { color: colors.primary }]}>
                  Add Category
                </Text>
              </TouchableOpacity>
            )}

            <Text style={[styles.customCategoryHint, { color: colors.textMuted }]}>
              Tap to edit. Long-press to delete.
            </Text>
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
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  filterPanel: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  filterSection: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  clearFiltersText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
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
  habitTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  habitTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  habitTypeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  habitTypeHelpText: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    lineHeight: 18,
    fontStyle: 'italic',
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
  rewardInputIcon: {
    width: 20,
    alignItems: 'center',
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  customCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  customCategoryCard: {
    width: '47%' as any,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  customCategoryCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCategoryCardName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  customCategoryCardColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  customCategorySelectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addCategoryButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  addCategoryForm: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  addCategoryFormTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  iconPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconChoice: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addCategoryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addCategoryCancel: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  addCategoryCancelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  addCategorySave: {
    flex: 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  addCategorySaveText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  customCategoryHint: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

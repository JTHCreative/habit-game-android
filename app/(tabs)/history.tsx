import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '@/src/components/common/Card';
import { HabitCalendar } from '@/src/components/history/HabitCalendar';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { useCategoryStore } from '@/src/stores/useCustomCategoryStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/Colors';
import { getPSTDateString } from '@/src/utils/levels';

type TimeRange = '7d' | '14d' | '30d';

function getDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
}

function getShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${month}/${day}`;
}

function getDateRange(days: number): string[] {
  const today = getPSTDateString();
  const [year, month, day] = today.split('-').map(Number);
  const todayDate = new Date(year, month - 1, day);
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${dd}`);
  }
  return dates;
}

function formatDateHeader(dateStr: string): string {
  const today = getPSTDateString();
  if (dateStr === today) return 'Today';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const todayParts = today.split('-').map(Number);
  const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const diff = Math.round(
    (todayDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 1) return 'Yesterday';

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const habits = useHabitStore((s) => s.habits);
  const categories = useCategoryStore((s) => s.categories);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const rangeDays = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
  const dateRange = useMemo(() => getDateRange(rangeDays), [rangeDays]);

  // Aggregate completions per date
  const completionsPerDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of dateRange) {
      map[d] = 0;
    }
    for (const habit of habits) {
      for (const d of habit.completedDates) {
        if (map[d] !== undefined) {
          map[d]++;
        }
      }
    }
    return map;
  }, [habits, dateRange]);

  const maxCompletions = Math.max(1, ...Object.values(completionsPerDate));

  // Build flat list of completions grouped by date (most recent first)
  const completionList = useMemo(() => {
    const entries: { date: string; habitId: string; habitName: string; habitColor: string; categoryName: string }[] = [];
    for (const habit of habits) {
      const cat = categories.find(
        (c) => c.id === (habit.customCategoryId || habit.category)
      );
      for (const d of habit.completedDates) {
        entries.push({
          date: d,
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color || colors.primary,
          categoryName: cat?.name || habit.category,
        });
      }
    }
    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  }, [habits, categories, colors.primary]);

  // Group by date for sections
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: typeof completionList }[] = [];
    let currentDate = '';
    let currentItems: typeof completionList = [];
    for (const entry of completionList) {
      if (entry.date !== currentDate) {
        if (currentDate) {
          groups.push({ date: currentDate, items: currentItems });
        }
        currentDate = entry.date;
        currentItems = [];
      }
      currentItems.push(entry);
    }
    if (currentDate) {
      groups.push({ date: currentDate, items: currentItems });
    }
    return groups;
  }, [completionList]);

  // Stats
  const totalCompletions = completionList.length;
  const totalInRange = Object.values(completionsPerDate).reduce(
    (a, b) => a + b,
    0
  );
  const activeDaysInRange = Object.values(completionsPerDate).filter(
    (v) => v > 0
  ).length;

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '14d', label: '14 Days' },
    { value: '30d', label: '30 Days' },
  ];

  // For 14d/30d, show fewer labels to avoid crowding
  const showLabel = (index: number) => {
    if (rangeDays <= 7) return true;
    if (rangeDays <= 14) return index % 2 === 0 || index === rangeDays - 1;
    return index % 5 === 0 || index === rangeDays - 1;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FontAwesome name="history" size={28} color="#D4A44C" />
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSubtitle}>
            {totalCompletions} total completion{totalCompletions !== 1 ? 's' : ''}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time range selector */}
        <View style={styles.rangeSelectorRow}>
          {timeRanges.map((tr) => (
            <TouchableOpacity
              key={tr.value}
              style={[
                styles.rangeChip,
                {
                  backgroundColor:
                    timeRange === tr.value
                      ? colors.primary
                      : colors.inputBackground,
                  borderColor:
                    timeRange === tr.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setTimeRange(tr.value)}
            >
              <Text
                style={[
                  styles.rangeChipText,
                  {
                    color:
                      timeRange === tr.value ? '#FFF' : colors.textSecondary,
                  },
                ]}
              >
                {tr.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {totalInRange}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Complete
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {activeDaysInRange}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active Days
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {activeDaysInRange > 0
                ? (totalInRange / activeDaysInRange).toFixed(1)
                : '0'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Avg / Day
            </Text>
          </Card>
        </View>

        {/* Bar chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Daily Completions
          </Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {dateRange.map((date) => {
                const count = completionsPerDate[date] || 0;
                const height = (count / maxCompletions) * 120;
                const isToday = date === getPSTDateString();
                return (
                  <View key={date} style={styles.barColumn}>
                    <Text
                      style={[styles.barValue, { color: colors.textMuted }]}
                    >
                      {count > 0 ? count : ''}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(count > 0 ? 4 : 0, height),
                            backgroundColor: isToday
                              ? colors.primary
                              : count > 0
                                ? colors.primary + 'AA'
                                : 'transparent',
                            borderRadius: 4,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLabels}>
              {dateRange.map((date, i) => {
                const isToday = date === getPSTDateString();
                return (
                  <View key={date} style={styles.barLabelSlot}>
                    {showLabel(i) && (
                      <Text
                        style={[
                          styles.barLabel,
                          { color: isToday ? colors.primary : colors.textMuted },
                          isToday && styles.barLabelToday,
                        ]}
                      >
                        {rangeDays <= 7 ? getDateLabel(date) : getShortDate(date)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Calendar view */}
        <View style={styles.calendarSection}>
          <HabitCalendar />
        </View>

        {/* Completion list */}
        <View style={styles.listSection}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Completion Log
          </Text>

          {groupedByDate.length === 0 ? (
            <View
              style={[styles.emptyState, { borderColor: colors.border }]}
            >
              <FontAwesome
                name="calendar-o"
                size={40}
                color={colors.textMuted}
              />
              <Text
                style={[styles.emptyTitle, { color: colors.textSecondary }]}
              >
                No completions yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Complete habits on the Home tab to see your history here.
              </Text>
            </View>
          ) : (
            groupedByDate.map((group) => (
              <View key={group.date} style={styles.dateGroup}>
                <View style={styles.dateHeaderRow}>
                  <Text
                    style={[
                      styles.dateHeaderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {formatDateHeader(group.date)}
                  </Text>
                  <View
                    style={[
                      styles.dateCountBadge,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateCountText,
                        { color: colors.primary },
                      ]}
                    >
                      {group.items.length}
                    </Text>
                  </View>
                </View>
                {group.items.map((item, idx) => (
                  <Card
                    key={`${item.habitId}-${item.date}-${idx}`}
                    style={styles.logItem}
                  >
                    <View style={styles.logRow}>
                      <View
                        style={[
                          styles.logDot,
                          { backgroundColor: item.habitColor },
                        ]}
                      />
                      <View style={styles.logContent}>
                        <Text
                          style={[styles.logHabitName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {item.habitName}
                        </Text>
                        <Text
                          style={[
                            styles.logCategory,
                            { color: item.habitColor },
                          ]}
                        >
                          {item.categoryName}
                        </Text>
                      </View>
                      <FontAwesome
                        name="check-circle"
                        size={18}
                        color={item.habitColor}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    gap: spacing.xs,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  rangeSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rangeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  rangeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  calendarSection: {
    marginBottom: spacing.md,
  },
  chartCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  chartContainer: {
    paddingTop: spacing.sm,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barLabelSlot: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    height: 14,
  },
  barTrack: {
    height: 120,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    minWidth: 4,
    maxWidth: 24,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  barLabelToday: {
    fontWeight: '700',
  },
  listSection: {
    marginTop: spacing.sm,
  },
  listTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
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
  dateGroup: {
    marginBottom: spacing.md,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateHeaderText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateCountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  dateCountText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  logItem: {
    marginBottom: spacing.xs,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logContent: {
    flex: 1,
  },
  logHabitName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  logCategory: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { getPSTDateString } from '@/src/utils/levels';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

type DayStatus = 'green' | 'yellow' | 'grey' | 'none' | 'future';

export function HabitCalendar() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const habits = useHabitStore((s) => s.habits);

  const today = getPSTDateString();
  const [todayYear, todayMonth] = today.split('-').map(Number);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth - 1); // 0-indexed

  const translateX = useRef(new Animated.Value(0)).current;

  // Store month/year in refs so the PanResponder always sees current values
  const monthRef = useRef(currentMonth);
  const yearRef = useRef(currentYear);
  monthRef.current = currentMonth;
  yearRef.current = currentYear;

  const goToPrevMonth = useCallback(() => {
    Animated.timing(translateX, {
      toValue: SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      setCurrentMonth((m) => {
        if (m === 0) {
          setCurrentYear((y) => y - 1);
          return 11;
        }
        return m - 1;
      });
    });
  }, [translateX]);

  const goToNextMonth = useCallback(() => {
    // Don't go past current month — read from refs for fresh values
    if (yearRef.current === todayYear && monthRef.current >= todayMonth - 1) return;
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      setCurrentMonth((m) => {
        if (m === 11) {
          setCurrentYear((y) => y + 1);
          return 0;
        }
        return m + 1;
      });
    });
  }, [translateX, todayYear, todayMonth]);

  // Use refs for callbacks so PanResponder always calls the latest version
  const goToPrevRef = useRef(goToPrevMonth);
  const goToNextRef = useRef(goToNextMonth);
  goToPrevRef.current = goToPrevMonth;
  goToNextRef.current = goToNextMonth;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          goToPrevRef.current();
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          goToNextRef.current();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Compute day statuses for the current month
  const dayStatuses = useMemo(() => {
    const dailyHabits = habits.filter(
      (h) => h.isActive && h.frequency === 'daily'
    );
    const totalDaily = dailyHabits.length;
    const daysInMonth = getMonthDays(currentYear, currentMonth);
    const statuses: Record<number, DayStatus> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(currentYear, currentMonth, day);

      // Future dates
      if (dateStr > today) {
        statuses[day] = 'future';
        continue;
      }

      if (totalDaily === 0) {
        statuses[day] = 'none';
        continue;
      }

      const completedCount = dailyHabits.filter((h) =>
        h.completedDates.includes(dateStr)
      ).length;

      if (completedCount >= totalDaily) {
        statuses[day] = 'green';
      } else if (completedCount >= totalDaily - 1 && totalDaily > 1) {
        statuses[day] = 'yellow';
      } else if (completedCount >= totalDaily - 1 && totalDaily === 1) {
        // If only 1 daily habit and it's not completed, that's grey
        statuses[day] = 'grey';
      } else {
        statuses[day] = 'grey';
      }
    }
    return statuses;
  }, [habits, currentYear, currentMonth, today]);

  const daysInMonth = getMonthDays(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const isCurrentMonth = currentYear === todayYear && currentMonth === todayMonth - 1;
  const todayDay = parseInt(today.split('-')[2], 10);

  // Build calendar grid rows
  const rows: (number | null)[][] = [];
  let row: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    row.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    row.push(day);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }

  const statusColor = (status: DayStatus) => {
    switch (status) {
      case 'green': return '#4CAF50';
      case 'yellow': return '#F5C842';
      case 'grey': return colors.border;
      case 'future': return 'transparent';
      case 'none': return colors.border;
    }
  };

  const textColorForStatus = (status: DayStatus, day: number) => {
    if (status === 'future') return colors.textMuted;
    if (isCurrentMonth && day === todayDay) return '#FFF';
    if (status === 'green') return '#FFF';
    if (status === 'yellow') return '#1A1A2E';
    return colors.textMuted;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>
      {/* Month header with arrows */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.arrowButton}>
          <FontAwesome name="chevron-left" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.arrowButton}
          disabled={isCurrentMonth}
        >
          <FontAwesome
            name="chevron-right"
            size={14}
            color={isCurrentMonth ? colors.textMuted : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Day name headers */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <Text style={[styles.dayNameText, { color: colors.textMuted }]}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {rows.map((week, rowIndex) => (
          <View key={rowIndex} style={styles.weekRow}>
            {week.map((day, colIndex) => {
              if (day === null) {
                return <View key={`empty-${colIndex}`} style={styles.dayCell} />;
              }
              const status = dayStatuses[day] || 'none';
              const isToday = isCurrentMonth && day === todayDay;
              return (
                <View key={day} style={styles.dayCell}>
                  <View
                    style={[
                      styles.daySquare,
                      {
                        backgroundColor: statusColor(status),
                      },
                      isToday && styles.todaySquare,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: textColorForStatus(status, day) },
                        isToday && styles.todayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>All done</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F5C842' }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Missed 1</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Incomplete</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  arrowButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  daySquare: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todaySquare: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.sm,
  },
  legendText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});

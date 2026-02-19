import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { Habit } from '@/src/types';
import { getPSTDateString } from '@/src/utils/levels';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';

const SWIPE_THRESHOLD = 50;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type DayStatus = 'green' | 'yellow' | 'grey' | 'none' | 'future';

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function offsetMonth(year: number, month: number, offset: number) {
  let m = month + offset;
  let y = year;
  while (m < 0) { m += 12; y--; }
  while (m > 11) { m -= 12; y++; }
  return { year: y, month: m };
}

function buildMonthRows(year: number, month: number) {
  const daysInMonth = getMonthDays(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const rows: (number | null)[][] = [];
  let row: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) row.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    row.push(day);
    if (row.length === 7) { rows.push(row); row = []; }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }
  return rows;
}

function computeDayStatuses(
  year: number,
  month: number,
  dailyHabits: Habit[],
  today: string,
): Record<number, DayStatus> {
  const totalDaily = dailyHabits.length;
  const daysInMonth = getMonthDays(year, month);
  const statuses: Record<number, DayStatus> = {};
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(year, month, day);
    if (dateStr > today) { statuses[day] = 'future'; continue; }
    if (totalDaily === 0) { statuses[day] = 'none'; continue; }
    const completedCount = dailyHabits.filter((h) =>
      h.completedDates.includes(dateStr)
    ).length;
    if (completedCount >= totalDaily) {
      statuses[day] = 'green';
    } else if (completedCount >= totalDaily - 1 && totalDaily > 1) {
      statuses[day] = 'yellow';
    } else {
      statuses[day] = 'grey';
    }
  }
  return statuses;
}

// ── Month grid (pure rendering, no animation) ──────────────────────────
function MonthGrid({
  year, month, dayStatuses, todayYear, todayMonth0, todayDay, colors, width,
}: {
  year: number; month: number;
  dayStatuses: Record<number, DayStatus>;
  todayYear: number; todayMonth0: number; todayDay: number;
  colors: (typeof Colors)['light'];
  width: number;
}) {
  const rows = useMemo(() => buildMonthRows(year, month), [year, month]);
  const isCurrentMonth = year === todayYear && month === todayMonth0;

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
    <View style={{ width }}>
      {rows.map((week, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {week.map((day, colIndex) => {
            if (day === null) {
              return <View key={`e-${colIndex}`} style={styles.dayCell} />;
            }
            const status = dayStatuses[day] || 'none';
            const isToday = isCurrentMonth && day === todayDay;
            return (
              <View key={day} style={styles.dayCell}>
                <View
                  style={[
                    styles.daySquare,
                    { backgroundColor: statusColor(status) },
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
    </View>
  );
}

// ── Main calendar component ─────────────────────────────────────────────
export function HabitCalendar() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const habits = useHabitStore((s) => s.habits);

  const today = getPSTDateString();
  const [todayYear, todayMonth] = today.split('-').map(Number);
  const todayMonth0 = todayMonth - 1; // 0-indexed
  const todayDay = parseInt(today.split('-')[2], 10);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth0);

  // Grid width from layout
  const [gridWidth, setGridWidth] = useState(0);

  // translateX: gesture/animation offset (0 = center panel visible).
  const translateX = useRef(new Animated.Value(0)).current;
  // Stable base offset that shifts the strip so center panel is at x=0.
  const baseOffset = useRef(new Animated.Value(0)).current;
  // Combined transform — created once, stays stable across renders.
  const stripTranslateX = useRef(Animated.add(translateX, baseOffset)).current;

  useEffect(() => {
    baseOffset.setValue(-gridWidth);
  }, [gridWidth, baseOffset]);

  const isAnimating = useRef(false);

  // Refs for current state (PanResponder reads these)
  const monthRef = useRef(currentMonth);
  const yearRef = useRef(currentYear);
  monthRef.current = currentMonth;
  yearRef.current = currentYear;

  const dailyHabits = useMemo(
    () => habits.filter((h) => h.isActive && h.frequency === 'daily'),
    [habits],
  );

  const prev = offsetMonth(currentYear, currentMonth, -1);
  const next = offsetMonth(currentYear, currentMonth, 1);

  const prevStatuses = useMemo(
    () => computeDayStatuses(prev.year, prev.month, dailyHabits, today),
    [prev.year, prev.month, dailyHabits, today],
  );
  const currStatuses = useMemo(
    () => computeDayStatuses(currentYear, currentMonth, dailyHabits, today),
    [currentYear, currentMonth, dailyHabits, today],
  );
  const nextStatuses = useMemo(
    () => computeDayStatuses(next.year, next.month, dailyHabits, today),
    [next.year, next.month, dailyHabits, today],
  );

  const isOnCurrentMonth = currentYear === todayYear && currentMonth === todayMonth0;

  const changeMonth = useCallback((direction: -1 | 1) => {
    if (isAnimating.current) return;
    if (direction === 1 && yearRef.current === todayYear && monthRef.current >= todayMonth0) return;
    isAnimating.current = true;

    Animated.timing(translateX, {
      toValue: -direction * gridWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Update state — DON'T reset translateX here.
      // useLayoutEffect will reset it after React re-renders with new months,
      // so there's no frame where the old center month flashes.
      const { year: newY, month: newM } = offsetMonth(yearRef.current, monthRef.current, direction);
      setCurrentYear(newY);
      setCurrentMonth(newM);
    });
  }, [translateX, gridWidth, todayYear, todayMonth0]);

  // After React re-renders with new month panels, snap the strip back to
  // center. useLayoutEffect fires synchronously after commit but before
  // paint, so the user never sees the stale position.
  useLayoutEffect(() => {
    if (isAnimating.current) {
      translateX.setValue(0);
      isAnimating.current = false;
    }
  }, [currentMonth, currentYear, translateX]);

  const changeMonthRef = useRef(changeMonth);
  changeMonthRef.current = changeMonth;

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
          changeMonthRef.current(-1); // prev
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          changeMonthRef.current(1); // next
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            overshootClamping: true,
          }).start();
        }
      },
    })
  ).current;

  const onGridLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    setGridWidth(e.nativeEvent.layout.width);
  }, []);

  const gridProps = { todayYear, todayMonth0, todayDay, colors };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>
      {/* Month header with arrows */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <FontAwesome name="chevron-left" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.arrowButton}
          disabled={isOnCurrentMonth}
        >
          <FontAwesome
            name="chevron-right"
            size={14}
            color={isOnCurrentMonth ? colors.textMuted : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Day name headers */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <Text style={[styles.dayNameText, { color: colors.textMuted }]}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Swipeable 3-month strip */}
      <View style={styles.gridClip} onLayout={onGridLayout}>
        {gridWidth > 0 && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.strip,
              {
                width: gridWidth * 3,
                transform: [{ translateX: stripTranslateX }],
              },
            ]}
          >
            <MonthGrid year={prev.year} month={prev.month} dayStatuses={prevStatuses} width={gridWidth} {...gridProps} />
            <MonthGrid year={currentYear} month={currentMonth} dayStatuses={currStatuses} width={gridWidth} {...gridProps} />
            <MonthGrid year={next.year} month={next.month} dayStatuses={nextStatuses} width={gridWidth} {...gridProps} />
          </Animated.View>
        )}
      </View>

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
  gridClip: {
    overflow: 'hidden',
  },
  strip: {
    flexDirection: 'row',
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

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

function formatDetailDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${dayNames[date.getDay()]}, ${MONTH_NAMES[month - 1]} ${day}`;
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
  selectedDate, onDayPress,
}: {
  year: number; month: number;
  dayStatuses: Record<number, DayStatus>;
  todayYear: number; todayMonth0: number; todayDay: number;
  colors: (typeof Colors)['light'];
  width: number;
  selectedDate: string | null;
  onDayPress: (dateStr: string) => void;
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
            const dateStr = formatDateStr(year, month, day);
            const isSelected = dateStr === selectedDate;
            const isTappable = status !== 'future';
            return (
              <View key={day} style={styles.dayCell}>
                <TouchableOpacity
                  activeOpacity={isTappable ? 0.6 : 1}
                  onPress={isTappable ? () => onDayPress(dateStr) : undefined}
                  style={[
                    styles.daySquare,
                    { backgroundColor: statusColor(status) },
                    isToday && styles.todaySquare,
                    isSelected && styles.selectedSquare,
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
                </TouchableOpacity>
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
      setSelectedDate(null);
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

  const onDayPress = useCallback((dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }, []);

  // Build the habit detail list for the selected date
  const selectedDayDetail = useMemo(() => {
    if (!selectedDate) return null;
    const completed = dailyHabits.filter((h) => h.completedDates.includes(selectedDate));
    const incomplete = dailyHabits.filter((h) => !h.completedDates.includes(selectedDate));
    return { completed, incomplete };
  }, [selectedDate, dailyHabits]);

  const gridProps = { todayYear, todayMonth0, todayDay, colors, selectedDate, onDayPress };

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

      {/* Selected day detail */}
      {selectedDate && selectedDayDetail && (
        <View style={[styles.detailPanel, { borderColor: colors.border }]}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>
            {formatDetailDate(selectedDate)}
          </Text>
          {dailyHabits.length === 0 ? (
            <Text style={[styles.detailEmpty, { color: colors.textMuted }]}>
              No daily habits tracked
            </Text>
          ) : (
            <>
              {selectedDayDetail.completed.map((h) => (
                <View key={h.id} style={styles.detailRow}>
                  <FontAwesome name="check-circle" size={16} color="#4CAF50" />
                  <Text style={[styles.detailHabitName, { color: colors.text }]} numberOfLines={1}>
                    {h.name}
                  </Text>
                </View>
              ))}
              {selectedDayDetail.incomplete.map((h) => (
                <View key={h.id} style={styles.detailRow}>
                  <FontAwesome name="times-circle" size={16} color={colors.textMuted} />
                  <Text
                    style={[
                      styles.detailHabitName,
                      styles.detailStrikethrough,
                      { color: colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {h.name}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

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
  selectedSquare: {
    borderWidth: 2,
    borderColor: '#D4A44C',
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '800',
  },
  detailPanel: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  detailTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  detailEmpty: {
    fontSize: fontSize.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailHabitName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  detailStrikethrough: {
    textDecorationLine: 'line-through',
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

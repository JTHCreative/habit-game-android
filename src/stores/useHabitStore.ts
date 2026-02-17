import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { format } from 'date-fns';
import { Habit, HabitCategory, HabitFrequency } from '../types';
import { HABIT_CATEGORY_COLORS } from '../utils/levels';

interface HabitState {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'longestStreak' | 'isActive'>) => Habit;
  removeHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date?: string) => { completed: boolean; habit: Habit | undefined };
  getHabitsForDate: (date: string) => Habit[];
  getCompletedHabitsForDate: (date: string) => Habit[];
  getStreakForHabit: (id: string) => number;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: Crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          completedDates: [],
          currentStreak: 0,
          longestStreak: 0,
          isActive: true,
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        return newHabit;
      },

      removeHabit: (id: string) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      toggleHabitCompletion: (id: string, date?: string) => {
        const dateStr = date || format(new Date(), 'yyyy-MM-dd');
        let completed = false;
        let targetHabit: Habit | undefined;

        set((state) => {
          const habits = state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const alreadyCompleted = habit.completedDates.includes(dateStr);
            let completedDates: string[];

            if (alreadyCompleted) {
              completedDates = habit.completedDates.filter((d) => d !== dateStr);
              completed = false;
            } else {
              completedDates = [...habit.completedDates, dateStr];
              completed = true;
            }

            const currentStreak = calculateStreak(completedDates);
            const longestStreak = Math.max(currentStreak, habit.longestStreak);

            const updatedHabit = {
              ...habit,
              completedDates,
              currentStreak,
              longestStreak,
            };
            targetHabit = updatedHabit;
            return updatedHabit;
          });

          return { habits };
        });

        return { completed, habit: targetHabit };
      },

      getHabitsForDate: (date: string) => {
        return get().habits.filter((h) => h.isActive);
      },

      getCompletedHabitsForDate: (date: string) => {
        return get().habits.filter(
          (h) => h.isActive && h.completedDates.includes(date)
        );
      },

      getStreakForHabit: (id: string) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return 0;
        return calculateStreak(habit.completedDates);
      },

      updateHabit: (id: string, updates: Partial<Habit>) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(
    new Date(Date.now() - 86400000),
    'yyyy-MM-dd'
  );

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86400000
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

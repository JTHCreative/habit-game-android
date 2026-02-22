import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { UserProfile, Achievement, Habit } from '../types';
import { getXPForLevel, getTitleForLevel, calculateLevelFromTotalXP, getPSTDateString } from '../utils/levels';

interface UserState {
  profile: UserProfile;
  achievements: Achievement[];
  pendingLevelUp: number | null;
  addXP: (amount: number) => void;
  removeXP: (amount: number) => void;
  addTickets: (amount: number) => void;
  removeTickets: (amount: number) => void;
  spendTickets: (amount: number) => boolean;
  incrementHabitsCompleted: () => void;
  decrementHabitsCompleted: () => void;
  incrementMissionsCompleted: () => void;
  updateStreak: (streak: number) => void;
  unlockAchievement: (achievementId: string) => void;
  applyDecay: (habits: Habit[]) => number;
  setDisplayName: (name: string) => void;
  setProfileImage: (uri: string) => void;
  clearPendingLevelUp: () => void;
  resetProfile: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_habit',
    title: 'First Step',
    description: 'Complete your first habit',
    icon: 'star',
    isUnlocked: false,
    xpReward: 50,
    ticketReward: 25,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'fire',
    isUnlocked: false,
    xpReward: 200,
    ticketReward: 100,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'trophy',
    isUnlocked: false,
    xpReward: 500,
    ticketReward: 250,
  },
  {
    id: 'level_10',
    title: 'Double Digits',
    description: 'Reach level 10',
    icon: 'shield',
    isUnlocked: false,
    xpReward: 300,
    ticketReward: 150,
  },
  {
    id: 'missions_5',
    title: 'Mission Specialist',
    description: 'Complete 5 missions',
    icon: 'target',
    isUnlocked: false,
    xpReward: 250,
    ticketReward: 125,
  },
  {
    id: 'tickets_1000',
    title: 'Ticket Collector',
    description: 'Earn 1,000 total tickets',
    icon: 'gem',
    isUnlocked: false,
    xpReward: 150,
    ticketReward: 50,
  },
  {
    id: 'habits_100',
    title: 'Century Club',
    description: 'Complete 100 total habits',
    icon: 'award',
    isUnlocked: false,
    xpReward: 400,
    ticketReward: 200,
  },
  {
    id: 'level_25',
    title: 'Quarter Century',
    description: 'Reach level 25',
    icon: 'crown',
    isUnlocked: false,
    xpReward: 1000,
    ticketReward: 500,
  },
];

function createDefaultProfile(): UserProfile {
  return {
    id: Crypto.randomUUID(),
    displayName: 'Adventurer',
    level: 1,
    currentXP: 0,
    xpToNextLevel: getXPForLevel(1),
    totalXPEarned: 0,
    tickets: 0,
    totalTicketsEarned: 0,
    totalTicketsSpent: 0,
    totalHabitsCompleted: 0,
    totalMissionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    joinedAt: new Date().toISOString(),
    title: 'Newcomer',
    avatarId: 'default',
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: createDefaultProfile(),
      achievements: DEFAULT_ACHIEVEMENTS,
      pendingLevelUp: null,

      addXP: (amount: number) =>
        set((state) => {
          const oldLevel = state.profile.level;
          let { level, currentXP, xpToNextLevel } = state.profile;
          const totalXPEarned = state.profile.totalXPEarned + amount;
          currentXP += amount;

          while (currentXP >= xpToNextLevel) {
            currentXP -= xpToNextLevel;
            level++;
            xpToNextLevel = getXPForLevel(level);
          }

          const title = getTitleForLevel(level);

          return {
            pendingLevelUp: level > oldLevel ? level : state.pendingLevelUp,
            profile: {
              ...state.profile,
              level,
              currentXP,
              xpToNextLevel,
              totalXPEarned,
              title,
            },
          };
        }),

      removeXP: (amount: number) =>
        set((state) => {
          const totalXPEarned = Math.max(0, state.profile.totalXPEarned - amount);
          const { level, currentXP, xpToNextLevel } = calculateLevelFromTotalXP(totalXPEarned);
          const title = getTitleForLevel(level);

          return {
            profile: {
              ...state.profile,
              level,
              currentXP,
              xpToNextLevel,
              totalXPEarned,
              title,
            },
          };
        }),

      addTickets: (amount: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            tickets: state.profile.tickets + amount,
            totalTicketsEarned: state.profile.totalTicketsEarned + amount,
          },
        })),

      removeTickets: (amount: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            tickets: Math.max(0, state.profile.tickets - amount),
            totalTicketsEarned: Math.max(0, state.profile.totalTicketsEarned - amount),
          },
        })),

      spendTickets: (amount: number) => {
        let success = false;
        set((state) => {
          if (state.profile.tickets >= amount) {
            success = true;
            return {
              profile: {
                ...state.profile,
                tickets: state.profile.tickets - amount,
                totalTicketsSpent: state.profile.totalTicketsSpent + amount,
              },
            };
          }
          return state;
        });
        return success;
      },

      incrementHabitsCompleted: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            totalHabitsCompleted: state.profile.totalHabitsCompleted + 1,
          },
        })),

      decrementHabitsCompleted: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            totalHabitsCompleted: Math.max(0, state.profile.totalHabitsCompleted - 1),
          },
        })),

      incrementMissionsCompleted: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            totalMissionsCompleted: state.profile.totalMissionsCompleted + 1,
          },
        })),

      updateStreak: (streak: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            currentStreak: streak,
            longestStreak: Math.max(streak, state.profile.longestStreak),
          },
        })),

      unlockAchievement: (achievementId: string) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.isUnlocked) return state;

          const xpAmount = achievement.xpReward;
          const ticketAmount = achievement.ticketReward;

          const oldLevel = state.profile.level;
          let { level, currentXP, xpToNextLevel } = state.profile;
          const totalXPEarned = state.profile.totalXPEarned + xpAmount;
          currentXP += xpAmount;

          while (currentXP >= xpToNextLevel) {
            currentXP -= xpToNextLevel;
            level++;
            xpToNextLevel = getXPForLevel(level);
          }

          const title = getTitleForLevel(level);

          return {
            pendingLevelUp: level > oldLevel ? level : state.pendingLevelUp,
            profile: {
              ...state.profile,
              level,
              currentXP,
              xpToNextLevel,
              totalXPEarned,
              title,
              tickets: state.profile.tickets + ticketAmount,
              totalTicketsEarned: state.profile.totalTicketsEarned + ticketAmount,
            },
            achievements: state.achievements.map((a) =>
              a.id === achievementId
                ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
                : a
            ),
          };
        }),

      applyDecay: (habits: Habit[]) => {
        const state = useUserStore.getState();
        const today = getPSTDateString();
        const lastDecay = state.profile.lastDecayDate;

        // Don't run more than once per day
        if (lastDecay === today) return 0;

        // Find the most recent completion date across all habits
        let lastCompletionDate: string | null = null;
        for (const habit of habits) {
          for (const d of habit.completedDates) {
            if (!lastCompletionDate || d > lastCompletionDate) {
              lastCompletionDate = d;
            }
          }
        }

        // If no completions ever, use join date
        if (!lastCompletionDate) {
          const joinDate = state.profile.joinedAt.split('T')[0];
          lastCompletionDate = joinDate;
        }

        // Calculate days since last completion (not counting today)
        const [ty, tm, td] = today.split('-').map(Number);
        const todayDate = new Date(ty, tm - 1, td);
        const [ly, lm, ld] = lastCompletionDate.split('-').map(Number);
        const lastDate = new Date(ly, lm - 1, ld);
        const daysSinceCompletion = Math.round(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // No decay if active within the last 3 days
        if (daysSinceCompletion < 3) {
          set((s) => ({
            profile: { ...s.profile, lastDecayDate: today },
          }));
          return 0;
        }

        // Figure out which days to apply decay for
        // Decay starts on day 3 after last completion
        const decayStartDate = new Date(ly, lm - 1, ld);
        decayStartDate.setDate(decayStartDate.getDate() + 3);

        // Already processed up to lastDecay, so start from day after
        let processFrom = decayStartDate;
        if (lastDecay) {
          const [dy, dm, dd] = lastDecay.split('-').map(Number);
          const lastDecayDate = new Date(dy, dm - 1, dd);
          lastDecayDate.setDate(lastDecayDate.getDate() + 1);
          if (lastDecayDate > processFrom) {
            processFrom = lastDecayDate;
          }
        }

        // Process through yesterday (today hasn't ended yet)
        const yesterday = new Date(ty, tm - 1, td);
        yesterday.setDate(yesterday.getDate() - 1);

        let decayDays = 0;
        if (processFrom <= yesterday) {
          decayDays = Math.round(
            (yesterday.getTime() - processFrom.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        }

        if (decayDays <= 0) {
          set((s) => ({
            profile: { ...s.profile, lastDecayDate: today },
          }));
          return 0;
        }

        const totalDecay = decayDays * 10;
        const totalXPEarned = Math.max(0, state.profile.totalXPEarned - totalDecay);
        const { level, currentXP, xpToNextLevel } = calculateLevelFromTotalXP(totalXPEarned);
        const title = getTitleForLevel(level);

        set(() => ({
          profile: {
            ...state.profile,
            level,
            currentXP,
            xpToNextLevel,
            totalXPEarned,
            title,
            lastDecayDate: today,
          },
        }));

        return totalDecay;
      },

      setDisplayName: (name: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            displayName: name,
          },
        })),

      setProfileImage: (uri: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            profileImageUri: uri,
          },
        })),

      clearPendingLevelUp: () => set({ pendingLevelUp: null }),

      resetProfile: () =>
        set({
          profile: createDefaultProfile(),
          achievements: DEFAULT_ACHIEVEMENTS,
          pendingLevelUp: null,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        achievements: state.achievements,
      }),
      merge: (persisted, current) => {
        const state = persisted as any;
        if (!state || !state.profile) return current as UserState;
        const p = state.profile;
        return {
          ...(current as UserState),
          profile: {
            ...p,
            tickets: p.tickets ?? p.tokens ?? 0,
            totalTicketsEarned: p.totalTicketsEarned ?? p.totalTokensEarned ?? 0,
            totalTicketsSpent: p.totalTicketsSpent ?? p.totalTokensSpent ?? 0,
            xpToNextLevel: getXPForLevel(p.level ?? 1),
          },
          achievements: (state.achievements || (current as UserState).achievements).map((a: any) => ({
            ...a,
            ticketReward: a.ticketReward ?? a.tokenReward ?? 0,
          })),
        };
      },
    }
  )
);

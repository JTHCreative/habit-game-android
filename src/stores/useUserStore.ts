import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { UserProfile, Achievement } from '../types';
import { getXPForLevel, getTitleForLevel } from '../utils/levels';

interface UserState {
  profile: UserProfile;
  achievements: Achievement[];
  addXP: (amount: number) => void;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  incrementHabitsCompleted: () => void;
  incrementMissionsCompleted: () => void;
  updateStreak: (streak: number) => void;
  unlockAchievement: (achievementId: string) => void;
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
    tokenReward: 25,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'fire',
    isUnlocked: false,
    xpReward: 200,
    tokenReward: 100,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'trophy',
    isUnlocked: false,
    xpReward: 500,
    tokenReward: 250,
  },
  {
    id: 'level_10',
    title: 'Double Digits',
    description: 'Reach level 10',
    icon: 'shield',
    isUnlocked: false,
    xpReward: 300,
    tokenReward: 150,
  },
  {
    id: 'missions_5',
    title: 'Mission Specialist',
    description: 'Complete 5 missions',
    icon: 'target',
    isUnlocked: false,
    xpReward: 250,
    tokenReward: 125,
  },
  {
    id: 'tokens_1000',
    title: 'Token Hoarder',
    description: 'Earn 1,000 total tokens',
    icon: 'gem',
    isUnlocked: false,
    xpReward: 150,
    tokenReward: 50,
  },
  {
    id: 'habits_100',
    title: 'Century Club',
    description: 'Complete 100 total habits',
    icon: 'award',
    isUnlocked: false,
    xpReward: 400,
    tokenReward: 200,
  },
  {
    id: 'level_25',
    title: 'Quarter Century',
    description: 'Reach level 25',
    icon: 'crown',
    isUnlocked: false,
    xpReward: 1000,
    tokenReward: 500,
  },
];

function createDefaultProfile(): UserProfile {
  return {
    id: Crypto.randomUUID(),
    displayName: 'Adventurer',
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXPEarned: 0,
    tokens: 0,
    totalTokensEarned: 0,
    totalTokensSpent: 0,
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

      addXP: (amount: number) =>
        set((state) => {
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

      addTokens: (amount: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            tokens: state.profile.tokens + amount,
            totalTokensEarned: state.profile.totalTokensEarned + amount,
          },
        })),

      spendTokens: (amount: number) => {
        let success = false;
        set((state) => {
          if (state.profile.tokens >= amount) {
            success = true;
            return {
              profile: {
                ...state.profile,
                tokens: state.profile.tokens - amount,
                totalTokensSpent: state.profile.totalTokensSpent + amount,
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
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
              : a
          ),
        })),

      resetProfile: () =>
        set({
          profile: createDefaultProfile(),
          achievements: DEFAULT_ACHIEVEMENTS,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

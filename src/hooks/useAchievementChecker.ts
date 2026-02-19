import { useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';

/**
 * Hook that checks all achievement conditions against the current profile
 * and unlocks any that have been met. Call after actions that could
 * trigger achievements (habit completion, streak update, level up, etc.).
 */
export function useAchievementChecker() {
  const profile = useUserStore((s) => s.profile);
  const achievements = useUserStore((s) => s.achievements);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);

  const checkAchievements = useCallback(() => {
    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_habit':
          shouldUnlock = profile.totalHabitsCompleted >= 1;
          break;
        case 'streak_7':
          shouldUnlock = profile.longestStreak >= 7;
          break;
        case 'streak_30':
          shouldUnlock = profile.longestStreak >= 30;
          break;
        case 'level_10':
          shouldUnlock = profile.level >= 10;
          break;
        case 'missions_5':
          shouldUnlock = profile.totalMissionsCompleted >= 5;
          break;
        case 'tickets_1000':
          shouldUnlock = profile.totalTicketsEarned >= 1000;
          break;
        case 'habits_100':
          shouldUnlock = profile.totalHabitsCompleted >= 100;
          break;
        case 'level_25':
          shouldUnlock = profile.level >= 25;
          break;
      }

      if (shouldUnlock) {
        unlockAchievement(achievement.id);
      }
    }
  }, [profile, achievements, unlockAchievement]);

  return checkAchievements;
}

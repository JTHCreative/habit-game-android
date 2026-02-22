import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPSTDateString, getPSTWeekStartString } from '../utils/levels';

export type ChallengeType = 'daily' | 'weekly';
export type ChallengeStatus = 'active' | 'completed' | 'claimed';

export interface Challenge {
  id: string;
  poolId: string;
  title: string;
  description: string;
  type: ChallengeType;
  icon: string;
  targetCount: number;
  currentCount: number;
  status: ChallengeStatus;
  ticketReward: number;
  xpReward: number;
  /** Pinned challenges always appear (e.g. "Log In") */
  pinned?: boolean;
  /** Tracks unique completion keys to prevent double-counting on toggle */
  completedHabitIds?: string[];
}

interface ChallengePool {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  icon: string;
  targetCount: number;
  ticketReward: number;
  xpReward: number;
  pinned?: boolean;
}

// ── Daily challenge pool (15 + 1 pinned) ────────────────────────────

const DAILY_POOL: ChallengePool[] = [
  // Pinned – always present
  { id: 'd_login', title: 'Log In', description: 'Open the app today', type: 'daily', icon: 'sign-in', targetCount: 1, ticketReward: 5, xpReward: 10, pinned: true },
  // Rotating pool
  { id: 'd_complete_1', title: 'Quick Win', description: 'Complete 1 habit', type: 'daily', icon: 'check', targetCount: 1, ticketReward: 5, xpReward: 10 },
  { id: 'd_complete_3', title: 'Triple Threat', description: 'Complete 3 habits', type: 'daily', icon: 'check-circle', targetCount: 3, ticketReward: 10, xpReward: 20 },
  { id: 'd_complete_5', title: 'High Five', description: 'Complete 5 habits', type: 'daily', icon: 'hand-peace-o', targetCount: 5, ticketReward: 15, xpReward: 30 },
  { id: 'd_health', title: 'Healthy Day', description: 'Complete a health habit', type: 'daily', icon: 'heart', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_fitness', title: 'Get Moving', description: 'Complete a fitness habit', type: 'daily', icon: 'bicycle', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_mindful', title: 'Mindful Moment', description: 'Complete a mindfulness habit', type: 'daily', icon: 'leaf', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_productive', title: 'Productive Push', description: 'Complete a productivity habit', type: 'daily', icon: 'rocket', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_learning', title: 'Learn Something', description: 'Complete a learning habit', type: 'daily', icon: 'book', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_social', title: 'Social Butterfly', description: 'Complete a social habit', type: 'daily', icon: 'users', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_finance', title: 'Money Moves', description: 'Complete a finance habit', type: 'daily', icon: 'dollar', targetCount: 1, ticketReward: 8, xpReward: 15 },
  { id: 'd_positive_2', title: 'Positive Vibes', description: 'Complete 2 positive habits', type: 'daily', icon: 'plus-circle', targetCount: 2, ticketReward: 10, xpReward: 20 },
  { id: 'd_streak_maintain', title: 'Keep It Going', description: 'Maintain your streak today', type: 'daily', icon: 'bolt', targetCount: 1, ticketReward: 10, xpReward: 15 },
  { id: 'd_early_bird', title: 'Early Bird', description: 'Complete a habit before noon', type: 'daily', icon: 'sun-o', targetCount: 1, ticketReward: 10, xpReward: 15 },
  { id: 'd_all_habits', title: 'Perfect Day', description: 'Complete all your habits today', type: 'daily', icon: 'star', targetCount: 1, ticketReward: 20, xpReward: 35 },
  { id: 'd_variety', title: 'Mix It Up', description: 'Complete habits from 2 categories', type: 'daily', icon: 'random', targetCount: 2, ticketReward: 12, xpReward: 20 },
];

// ── Weekly challenge pool (15 + 1 pinned) ───────────────────────────

const WEEKLY_POOL: ChallengePool[] = [
  // Pinned – always present
  { id: 'w_login_7', title: 'Log In Every Day', description: 'Log in 7 days this week', type: 'weekly', icon: 'calendar-check-o', targetCount: 7, ticketReward: 30, xpReward: 50, pinned: true },
  // Rotating pool
  { id: 'w_complete_10', title: 'Tenacious Ten', description: 'Complete 10 habits this week', type: 'weekly', icon: 'check-circle', targetCount: 10, ticketReward: 25, xpReward: 40 },
  { id: 'w_complete_20', title: 'Score Twenty', description: 'Complete 20 habits this week', type: 'weekly', icon: 'trophy', targetCount: 20, ticketReward: 40, xpReward: 60 },
  { id: 'w_complete_30', title: 'Thirty Thrills', description: 'Complete 30 habits this week', type: 'weekly', icon: 'diamond', targetCount: 30, ticketReward: 60, xpReward: 80 },
  { id: 'w_health_5', title: 'Health Week', description: 'Complete 5 health habits', type: 'weekly', icon: 'heart', targetCount: 5, ticketReward: 25, xpReward: 40 },
  { id: 'w_fitness_5', title: 'Fitness Frenzy', description: 'Complete 5 fitness habits', type: 'weekly', icon: 'bicycle', targetCount: 5, ticketReward: 25, xpReward: 40 },
  { id: 'w_mindful_5', title: 'Zen Week', description: 'Complete 5 mindfulness habits', type: 'weekly', icon: 'leaf', targetCount: 5, ticketReward: 25, xpReward: 40 },
  { id: 'w_productive_5', title: 'Productivity Sprint', description: 'Complete 5 productivity habits', type: 'weekly', icon: 'rocket', targetCount: 5, ticketReward: 25, xpReward: 40 },
  { id: 'w_learning_5', title: 'Knowledge Seeker', description: 'Complete 5 learning habits', type: 'weekly', icon: 'book', targetCount: 5, ticketReward: 25, xpReward: 40 },
  { id: 'w_streak_5', title: '5-Day Streak', description: 'Reach a 5-day streak', type: 'weekly', icon: 'bolt', targetCount: 5, ticketReward: 30, xpReward: 50 },
  { id: 'w_streak_7', title: 'Full Week Streak', description: 'Reach a 7-day streak', type: 'weekly', icon: 'fire', targetCount: 7, ticketReward: 50, xpReward: 75 },
  { id: 'w_categories_3', title: 'Well-Rounded', description: 'Complete habits in 3 categories', type: 'weekly', icon: 'random', targetCount: 3, ticketReward: 30, xpReward: 45 },
  { id: 'w_categories_5', title: 'Renaissance', description: 'Complete habits in 5 categories', type: 'weekly', icon: 'compass', targetCount: 5, ticketReward: 45, xpReward: 65 },
  { id: 'w_perfect_3', title: '3 Perfect Days', description: 'Complete all habits on 3 days', type: 'weekly', icon: 'star', targetCount: 3, ticketReward: 40, xpReward: 60 },
  { id: 'w_social_3', title: 'Social Week', description: 'Complete 3 social habits', type: 'weekly', icon: 'users', targetCount: 3, ticketReward: 20, xpReward: 35 },
  { id: 'w_finance_3', title: 'Finance Focus', description: 'Complete 3 finance habits', type: 'weekly', icon: 'dollar', targetCount: 3, ticketReward: 20, xpReward: 35 },
];

/**
 * Simple seeded PRNG (mulberry32) so challenge selection is deterministic
 * for a given date string.
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

/** Pick `count` random items from `arr` using a seeded RNG. */
function pickRandom<T>(arr: T[], count: number, rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function selectChallengesForPeriod(
  pool: ChallengePool[],
  periodKey: string,
  total: number
): Challenge[] {
  const pinned = pool.filter((c) => c.pinned);
  const rotating = pool.filter((c) => !c.pinned);
  const rng = seededRandom(hashString(periodKey));
  const picked = pickRandom(rotating, total - pinned.length, rng);

  return [...pinned, ...picked].map((p) => ({
    id: `${p.id}_${periodKey}`,
    poolId: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    icon: p.icon,
    targetCount: p.targetCount,
    currentCount: 0,
    status: 'active' as ChallengeStatus,
    ticketReward: p.ticketReward,
    xpReward: p.xpReward,
    pinned: p.pinned,
  }));
}

// ── Store ────────────────────────────────────────────────────────────

interface ChallengeState {
  dailyChallenges: Challenge[];
  weeklyChallenges: Challenge[];
  lastDailyDate: string;
  lastWeeklyDate: string;
  /** Dates (PST) on which the user has logged in this week */
  loginDates: string[];
  /** Call on app open / navigation to challenges tab */
  refreshChallenges: () => void;
  /** Record a login for the day (call on app open) */
  recordLogin: () => void;
  /** Called when a habit is completed */
  onHabitCompleted: (habitId: string, category: string, allHabitsComplete: boolean, totalCompletedToday: number, categoriesCompletedToday: string[]) => void;
  /** Called when a habit is uncompleted */
  onHabitUncompleted: (habitId: string, category: string, allHabitsComplete: boolean, totalCompletedToday: number, categoriesCompletedToday: string[]) => void;
  /** Called when streak changes */
  onStreakUpdated: (streak: number) => void;
  /** Claim reward for a completed challenge */
  claimChallenge: (challengeId: string) => { tickets: number; xp: number } | null;
  resetAll: () => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      dailyChallenges: [],
      weeklyChallenges: [],
      lastDailyDate: '',
      lastWeeklyDate: '',
      loginDates: [],

      refreshChallenges: () => {
        const today = getPSTDateString();
        const weekStart = getPSTWeekStartString();
        const state = get();

        let dailyChallenges = state.dailyChallenges;
        let weeklyChallenges = state.weeklyChallenges;
        let lastDailyDate = state.lastDailyDate;
        let lastWeeklyDate = state.lastWeeklyDate;

        if (lastDailyDate !== today) {
          dailyChallenges = selectChallengesForPeriod(DAILY_POOL, today, 3);
          lastDailyDate = today;
        }

        let loginDates = state.loginDates;

        if (lastWeeklyDate !== weekStart) {
          weeklyChallenges = selectChallengesForPeriod(WEEKLY_POOL, weekStart, 3);
          lastWeeklyDate = weekStart;
          loginDates = [];
        }

        set({ dailyChallenges, weeklyChallenges, lastDailyDate, lastWeeklyDate, loginDates });
      },

      recordLogin: () => {
        const today = getPSTDateString();
        set((state) => {
          const alreadyLoggedToday = state.loginDates.includes(today);

          // Mark daily login challenge (only once per day)
          const dailyChallenges = alreadyLoggedToday
            ? state.dailyChallenges
            : state.dailyChallenges.map((c) => {
                if (c.poolId === 'd_login' && c.status === 'active') {
                  const newCount = Math.min(c.currentCount + 1, c.targetCount);
                  return {
                    ...c,
                    currentCount: newCount,
                    status: (newCount >= c.targetCount ? 'completed' : 'active') as ChallengeStatus,
                  };
                }
                return c;
              });

          // Increment weekly login challenge (only once per unique day)
          const weeklyChallenges = alreadyLoggedToday
            ? state.weeklyChallenges
            : state.weeklyChallenges.map((c) => {
                if (c.poolId === 'w_login_7' && c.status === 'active') {
                  const newCount = Math.min(c.currentCount + 1, c.targetCount);
                  return {
                    ...c,
                    currentCount: newCount,
                    status: (newCount >= c.targetCount ? 'completed' : 'active') as ChallengeStatus,
                  };
                }
                return c;
              });

          const loginDates = alreadyLoggedToday
            ? state.loginDates
            : [...state.loginDates, today];

          return { dailyChallenges, weeklyChallenges, loginDates };
        });
      },

      onHabitCompleted: (habitId, category, allHabitsComplete, totalCompletedToday, categoriesCompletedToday) => {
        const today = getPSTDateString();
        const updateChallenge = (c: Challenge): Challenge => {
          if (c.status !== 'active') return c;

          const pid = c.poolId;

          // State-derived challenges (no dedup needed, always recomputed)
          if (pid === 'd_all_habits' && allHabitsComplete) {
            return { ...c, currentCount: c.targetCount, status: 'completed' };
          }
          if (pid === 'd_variety' || pid === 'w_categories_3' || pid === 'w_categories_5') {
            return {
              ...c,
              currentCount: Math.min(categoriesCompletedToday.length, c.targetCount),
              status: categoriesCompletedToday.length >= c.targetCount ? 'completed' : 'active',
            };
          }

          // Counter-based challenges: check for duplicate
          let increment = 0;
          if (pid === 'd_complete_1' || pid === 'd_complete_3' || pid === 'd_complete_5') increment = 1;
          else if (pid === 'd_health' && category === 'health') increment = 1;
          else if (pid === 'd_fitness' && category === 'fitness') increment = 1;
          else if (pid === 'd_mindful' && category === 'mindfulness') increment = 1;
          else if (pid === 'd_productive' && category === 'productivity') increment = 1;
          else if (pid === 'd_learning' && category === 'learning') increment = 1;
          else if (pid === 'd_social' && category === 'social') increment = 1;
          else if (pid === 'd_finance' && category === 'finance') increment = 1;
          else if (pid === 'd_positive_2') increment = 1;
          else if (pid === 'd_streak_maintain') increment = 1;
          else if (pid === 'd_early_bird') {
            const hour = new Date().getHours();
            if (hour < 12) increment = 1;
          }
          else if (pid === 'w_complete_10' || pid === 'w_complete_20' || pid === 'w_complete_30') increment = 1;
          else if (pid === 'w_health_5' && category === 'health') increment = 1;
          else if (pid === 'w_fitness_5' && category === 'fitness') increment = 1;
          else if (pid === 'w_mindful_5' && category === 'mindfulness') increment = 1;
          else if (pid === 'w_productive_5' && category === 'productivity') increment = 1;
          else if (pid === 'w_learning_5' && category === 'learning') increment = 1;
          else if (pid === 'w_social_3' && category === 'social') increment = 1;
          else if (pid === 'w_finance_3' && category === 'finance') increment = 1;
          else if (pid === 'w_perfect_3' && allHabitsComplete) increment = 1;

          if (increment === 0) return c;

          // Use habitId for daily (one completion per habit per day),
          // habitId_date for weekly (same habit on different days counts separately)
          const ids = c.completedHabitIds || [];
          const key = c.type === 'daily' ? habitId : `${habitId}_${today}`;
          if (ids.includes(key)) return c; // already counted

          const newCount = Math.min(c.currentCount + increment, c.targetCount);
          return {
            ...c,
            currentCount: newCount,
            completedHabitIds: [...ids, key],
            status: newCount >= c.targetCount ? 'completed' : 'active',
          };
        };

        set((state) => ({
          dailyChallenges: state.dailyChallenges.map(updateChallenge),
          weeklyChallenges: state.weeklyChallenges.map(updateChallenge),
        }));
      },

      onHabitUncompleted: (habitId, category, allHabitsComplete, totalCompletedToday, categoriesCompletedToday) => {
        const today = getPSTDateString();
        const updateChallenge = (c: Challenge): Challenge => {
          if (c.status === 'claimed') return c;

          const pid = c.poolId;

          // State-derived challenges: recompute from current state
          if (pid === 'd_all_habits') {
            const newCount = allHabitsComplete ? c.targetCount : 0;
            return {
              ...c,
              currentCount: newCount,
              status: newCount >= c.targetCount ? 'completed' : 'active',
            };
          }
          if (pid === 'd_variety' || pid === 'w_categories_3' || pid === 'w_categories_5') {
            return {
              ...c,
              currentCount: Math.min(categoriesCompletedToday.length, c.targetCount),
              status: categoriesCompletedToday.length >= c.targetCount ? 'completed' : 'active',
            };
          }

          // Counter-based challenges: remove from tracked IDs and decrement
          const ids = c.completedHabitIds || [];
          const key = c.type === 'daily' ? habitId : `${habitId}_${today}`;
          if (!ids.includes(key)) return c; // wasn't counted

          const newCount = Math.max(c.currentCount - 1, 0);
          return {
            ...c,
            currentCount: newCount,
            completedHabitIds: ids.filter((id) => id !== key),
            status: newCount >= c.targetCount ? 'completed' : 'active',
          };
        };

        set((state) => ({
          dailyChallenges: state.dailyChallenges.map(updateChallenge),
          weeklyChallenges: state.weeklyChallenges.map(updateChallenge),
        }));
      },

      onStreakUpdated: (streak) => {
        set((state) => {
          const update = (c: Challenge): Challenge => {
            if (c.status !== 'active') return c;
            if (c.poolId !== 'w_streak_5' && c.poolId !== 'w_streak_7') return c;
            const newCount = Math.min(streak, c.targetCount);
            return {
              ...c,
              currentCount: newCount,
              status: newCount >= c.targetCount ? 'completed' : 'active',
            };
          };
          return {
            dailyChallenges: state.dailyChallenges,
            weeklyChallenges: state.weeklyChallenges.map(update),
          };
        });
      },

      claimChallenge: (challengeId) => {
        const state = get();
        const all = [...state.dailyChallenges, ...state.weeklyChallenges];
        const challenge = all.find((c) => c.id === challengeId);
        if (!challenge || challenge.status !== 'completed') return null;

        const markClaimed = (c: Challenge) =>
          c.id === challengeId ? { ...c, status: 'claimed' as ChallengeStatus } : c;

        set((s) => ({
          dailyChallenges: s.dailyChallenges.map(markClaimed),
          weeklyChallenges: s.weeklyChallenges.map(markClaimed),
        }));

        return { tickets: challenge.ticketReward, xp: challenge.xpReward };
      },

      resetAll: () =>
        set({ dailyChallenges: [], weeklyChallenges: [], lastDailyDate: '', lastWeeklyDate: '', loginDates: [] }),
    }),
    {
      name: 'challenge-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const state = persisted as any;
        if (!state) return current as ChallengeState;
        return {
          ...(current as ChallengeState),
          ...state,
          loginDates: state.loginDates ?? [],
        };
      },
    }
  )
);

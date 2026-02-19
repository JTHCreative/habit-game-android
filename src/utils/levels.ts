import { HabitFrequency } from '../types';

export const FREQUENCY_REWARDS: Record<HabitFrequency, { tickets: number; xp: number }> = {
  daily: { tickets: 1, xp: 5 },
  weekly: { tickets: 10, xp: 20 },
  monthly: { tickets: 40, xp: 50 },
  one_time: { tickets: 1, xp: 5 },
};

const TITLES: Record<number, string> = {
  1: 'Newcomer',
  2: 'Day Starter',
  3: 'Streak Seeker',
  4: 'Intentional Actor',
  5: 'Routine Recruit',
  6: 'Habitualist',
  7: 'Consistency Cadet',
  8: 'Repeat Performer',
  9: 'Focused Follower',
  10: 'Daily Disciplinarian',
  11: 'Pattern Finder',
  12: 'Momentum Maker',
  13: 'Standard Setter',
  14: 'Systemic Student',
  15: 'Steady State',
  16: 'Iron-Willed',
  17: 'Ritualist',
  18: 'Method Actor',
  19: 'Protocol Pilot',
  20: 'The Architect',
  21: 'Efficiency Expert',
  22: 'Flow State',
  23: 'Compound Gainer',
  24: 'Optimization Lead',
  25: 'Bio-Hacker',
  26: 'Performance Pilot',
  27: 'Discipline Director',
  28: 'Logic Master',
  29: 'System Sovereign',
  30: 'Unshakable Professional',
  31: 'Subconscious Striker',
  32: 'Reflexive Leader',
  33: 'Instinctualist',
  34: 'Cognitive Commander',
  35: 'High-Frequency Hero',
  36: 'Neural Navigator',
  37: 'Precision Pioneer',
  38: 'Absolute Automator',
  39: 'Grandmaster of Will',
  40: 'The Catalyst',
  41: 'Fission Of Focus',
  42: 'Molecular Consistency',
  43: 'Proton Pulse',
  44: 'Isotope Individual',
  45: 'Kinetic King',
  46: 'Nucleus Navigator',
  47: 'Quantum Controller',
  48: 'Reactor Soul',
  49: 'Singularity Specialist',
  50: 'Atomic Legend',
};

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getTitleForLevel(level: number): string {
  if (level >= 50) return TITLES[50];
  return TITLES[level] ?? 'Newcomer';
}

export function calculateLevelFromTotalXP(totalXP: number): {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
} {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= getXPForLevel(level)) {
    xpRemaining -= getXPForLevel(level);
    level++;
  }

  return {
    level,
    currentXP: xpRemaining,
    xpToNextLevel: getXPForLevel(level),
  };
}

// --- PST date helpers for frequency-aware habit tracking ---

export function getPSTDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

export function getPSTWeekStartString(): string {
  const todayPST = getPSTDateString();
  const [year, month, day] = todayPST.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sunday
  date.setDate(date.getDate() - dayOfWeek);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPSTMonthStartString(): string {
  const todayPST = getPSTDateString();
  const [year, month] = todayPST.split('-').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export function isHabitCompletedForPeriod(
  frequency: HabitFrequency,
  completedDates: string[]
): boolean {
  if (frequency === 'one_time') {
    return completedDates.length > 0;
  }
  if (frequency === 'monthly') {
    const monthStart = getPSTMonthStartString();
    return completedDates.some((d) => d >= monthStart);
  }
  if (frequency === 'weekly') {
    const weekStart = getPSTWeekStartString();
    return completedDates.some((d) => d >= weekStart);
  }
  // daily
  return completedDates.includes(getPSTDateString());
}

export function getCompletedDateForCurrentPeriod(
  frequency: HabitFrequency,
  completedDates: string[]
): string | undefined {
  if (frequency === 'monthly') {
    const monthStart = getPSTMonthStartString();
    return completedDates.find((d) => d >= monthStart);
  }
  if (frequency === 'weekly') {
    const weekStart = getPSTWeekStartString();
    return completedDates.find((d) => d >= weekStart);
  }
  const todayPST = getPSTDateString();
  return completedDates.includes(todayPST) ? todayPST : undefined;
}

export const HABIT_CATEGORY_ICONS: Record<string, string> = {
  health: 'heart',
  fitness: 'dumbbell',
  mindfulness: 'leaf',
  productivity: 'rocket',
  learning: 'book',
  social: 'users',
  finance: 'dollar',
  custom: 'star',
};

export const HABIT_CATEGORY_COLORS: Record<string, string> = {
  health: '#FF6B6B',
  fitness: '#4ECDC4',
  mindfulness: '#A78BFA',
  productivity: '#F59E0B',
  learning: '#3B82F6',
  social: '#EC4899',
  finance: '#10B981',
  custom: '#6366F1',
};

export const MISSION_DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  medium: '#D4A44C',
  hard: '#E87D2F',
  legendary: '#C25B28',
};

export const MISSION_DIFFICULTY_TICKETS: Record<string, number> = {
  easy: 50,
  medium: 150,
  hard: 300,
  legendary: 500,
};

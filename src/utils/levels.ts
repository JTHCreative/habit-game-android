const TITLES: Record<number, string> = {
  1: 'Newcomer',
  5: 'Apprentice',
  10: 'Habit Builder',
  15: 'Streak Master',
  20: 'Discipline Knight',
  25: 'Willpower Wizard',
  30: 'Legendary Achiever',
  40: 'Grand Champion',
  50: 'Habit Overlord',
};

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getTitleForLevel(level: number): string {
  let title = 'Newcomer';
  for (const [lvl, t] of Object.entries(TITLES)) {
    if (level >= Number(lvl)) {
      title = t;
    }
  }
  return title;
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

export function isHabitCompletedForPeriod(
  frequency: 'one_time' | 'daily' | 'weekly',
  completedDates: string[]
): boolean {
  if (frequency === 'one_time') {
    return completedDates.length > 0;
  }
  if (frequency === 'weekly') {
    const weekStart = getPSTWeekStartString();
    return completedDates.some((d) => d >= weekStart);
  }
  // daily
  return completedDates.includes(getPSTDateString());
}

export function getCompletedDateForCurrentPeriod(
  frequency: 'one_time' | 'daily' | 'weekly',
  completedDates: string[]
): string | undefined {
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

export const MISSION_DIFFICULTY_TOKENS: Record<string, number> = {
  easy: 50,
  medium: 150,
  hard: 300,
  legendary: 500,
};

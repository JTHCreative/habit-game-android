export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'social'
  | 'finance'
  | 'custom';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  tokenReward: number;
  xpReward: number;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'claimed';

export interface MissionObjective {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  habitCategory?: HabitCategory;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  objectives: MissionObjective[];
  tokenReward: number;
  xpReward: number;
  requiredLevel: number;
  icon: string;
  expiresAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  tokenCost: number;
  icon: string;
  category: 'self_care' | 'entertainment' | 'treat' | 'experience' | 'custom';
  isPurchased: boolean;
  isRedeemed: boolean;
  purchasedAt?: string;
  redeemedAt?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  tokens: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
  totalHabitsCompleted: number;
  totalMissionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  joinedAt: string;
  title: string;
  avatarId: string;
  profileImageUri?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  xpReward: number;
  tokenReward: number;
}

export interface DailyCheckIn {
  date: string;
  habitsCompleted: number;
  totalHabits: number;
  tokensEarned: number;
  xpEarned: number;
}

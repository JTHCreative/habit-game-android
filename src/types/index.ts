export type HabitFrequency = 'one_time' | 'daily' | 'weekly' | 'monthly';

export type HabitType = 'positive' | 'negative';

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'social'
  | 'finance'
  | 'custom';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  customCategoryId?: string;
  frequency: HabitFrequency;
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  ticketReward: number;
  xpReward: number;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  icon: string;
  color: string;
  isActive: boolean;
  habitType: HabitType;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'claimed';

export interface MissionObjective {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  habitCategory?: HabitCategory;
  trackStreak?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  objectives: MissionObjective[];
  ticketReward: number;
  xpReward: number;
  requiredLevel: number;
  icon: string;
  expiresAt?: string;
}

export type ReplenishPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RewardCategory = 'self_care' | 'entertainment' | 'treat' | 'experience' | 'custom';

export interface Reward {
  id: string;
  name: string;
  description: string;
  ticketCost: number;
  icon: string;
  category: RewardCategory;
  customCategoryId?: string;
  maxQuantity: number;
  remainingQuantity: number;
  replenishPeriod: ReplenishPeriod;
  lastReplenishedAt: string;
  isPurchased: boolean;
  isRedeemed: boolean;
  purchasedAt?: string;
  redeemedAt?: string;
}

export interface InventoryItem {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardDescription: string;
  rewardIcon: string;
  rewardCategory: Reward['category'];
  ticketCost: number;
  replenishPeriod: ReplenishPeriod;
  quantity: number;
  redeemedCount: number;
  periodStart: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  tickets: number;
  totalTicketsEarned: number;
  totalTicketsSpent: number;
  totalHabitsCompleted: number;
  totalMissionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  joinedAt: string;
  title: string;
  avatarId: string;
  profileImageUri?: string;
  lastDecayDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  xpReward: number;
  ticketReward: number;
}

export interface DailyCheckIn {
  date: string;
  habitsCompleted: number;
  totalHabits: number;
  ticketsEarned: number;
  xpEarned: number;
}

// ── Pins ────────────────────────────────────────────────
export type PinRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Pin {
  id: string;
  name: string;
  description: string;
  icon: string;           // FA or 'mci:' prefix
  color: string;          // enamel accent colour
  rarity: PinRarity;
  ticketCost: number;
}

export interface CollectedPin {
  pinId: string;
  collectedAt: string;    // ISO date
}

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { InventoryItem, ReplenishPeriod, Reward } from '../types';

function getPeriodStart(period: ReplenishPeriod, date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  switch (period) {
    case 'daily':
      return new Date(year, month, day).toISOString();
    case 'weekly': {
      const weekStart = new Date(year, month, day - dayOfWeek);
      return weekStart.toISOString();
    }
    case 'monthly':
      return new Date(year, month, 1).toISOString();
    case 'yearly':
      return new Date(year, 0, 1).toISOString();
  }
}

function shouldReplenish(reward: Reward): boolean {
  const now = new Date();
  const currentPeriodStart = getPeriodStart(reward.replenishPeriod, now);
  const lastReplenished = new Date(reward.lastReplenishedAt);
  const lastPeriodStart = getPeriodStart(reward.replenishPeriod, lastReplenished);
  return currentPeriodStart !== lastPeriodStart;
}

interface RewardState {
  rewards: Reward[];
  inventory: InventoryItem[];
  addReward: (reward: Omit<Reward, 'id' | 'isPurchased' | 'isRedeemed' | 'remainingQuantity' | 'lastReplenishedAt'>) => void;
  updateReward: (id: string, updates: Partial<Pick<Reward, 'name' | 'description' | 'tokenCost' | 'category' | 'maxQuantity' | 'replenishPeriod'>>) => void;
  removeReward: (id: string) => void;
  purchaseReward: (id: string) => void;
  redeemReward: (id: string) => void;
  redeemInventoryItem: (inventoryId: string) => void;
  replenishRewards: () => void;
  getActiveInventory: () => InventoryItem[];
  getPurchasedRewards: () => Reward[];
  getAvailableRewards: () => Reward[];
}

const DEFAULT_REWARDS: Reward[] = [
  {
    id: 'reward_1',
    name: 'Movie Night',
    description: 'Treat yourself to a movie of your choice',
    tokenCost: 100,
    icon: 'film',
    category: 'entertainment',
    maxQuantity: 1,
    remainingQuantity: 1,
    replenishPeriod: 'weekly',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_2',
    name: 'Favorite Snack',
    description: 'Get your favorite snack or treat',
    tokenCost: 50,
    icon: 'coffee',
    category: 'treat',
    maxQuantity: 3,
    remainingQuantity: 3,
    replenishPeriod: 'daily',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_3',
    name: 'Sleep In',
    description: 'Sleep in an extra hour tomorrow',
    tokenCost: 75,
    icon: 'moon',
    category: 'self_care',
    maxQuantity: 2,
    remainingQuantity: 2,
    replenishPeriod: 'weekly',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_4',
    name: 'Gaming Session',
    description: 'Enjoy a guilt-free gaming session',
    tokenCost: 80,
    icon: 'play',
    category: 'entertainment',
    maxQuantity: 2,
    remainingQuantity: 2,
    replenishPeriod: 'daily',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_5',
    name: 'Spa Day',
    description: 'Pamper yourself with a spa day or at-home spa',
    tokenCost: 200,
    icon: 'droplet',
    category: 'self_care',
    maxQuantity: 1,
    remainingQuantity: 1,
    replenishPeriod: 'monthly',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_6',
    name: 'New Book',
    description: 'Buy a new book you have been wanting',
    tokenCost: 150,
    icon: 'book-open',
    category: 'experience',
    maxQuantity: 1,
    remainingQuantity: 1,
    replenishPeriod: 'monthly',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_7',
    name: 'Dining Out',
    description: 'Enjoy a meal at your favorite restaurant',
    tokenCost: 250,
    icon: 'map-pin',
    category: 'experience',
    maxQuantity: 1,
    remainingQuantity: 1,
    replenishPeriod: 'weekly',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
  {
    id: 'reward_8',
    name: 'Day Off',
    description: 'Take a full day off from responsibilities',
    tokenCost: 500,
    icon: 'sun',
    category: 'self_care',
    maxQuantity: 1,
    remainingQuantity: 1,
    replenishPeriod: 'monthly',
    lastReplenishedAt: new Date().toISOString(),
    isPurchased: false,
    isRedeemed: false,
  },
];

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewards: DEFAULT_REWARDS,
      inventory: [] as InventoryItem[],

      addReward: (rewardData) =>
        set((state) => ({
          rewards: [
            ...state.rewards,
            {
              ...rewardData,
              id: Crypto.randomUUID(),
              remainingQuantity: rewardData.maxQuantity,
              lastReplenishedAt: new Date().toISOString(),
              isPurchased: false,
              isRedeemed: false,
            },
          ],
        })),

      updateReward: (id, updates) =>
        set((state) => ({
          rewards: state.rewards.map((r) => {
            if (r.id !== id) return r;
            const updated = { ...r, ...updates };
            if (updates.maxQuantity !== undefined && updates.maxQuantity > r.maxQuantity) {
              updated.remainingQuantity = r.remainingQuantity + (updates.maxQuantity - r.maxQuantity);
            }
            return updated;
          }),
        })),

      removeReward: (id) =>
        set((state) => ({
          rewards: state.rewards.filter((r) => r.id !== id),
        })),

      purchaseReward: (id) =>
        set((state) => {
          const reward = state.rewards.find((r) => r.id === id);
          if (!reward || reward.remainingQuantity <= 0) return state;

          const now = new Date();
          const periodStart = getPeriodStart(reward.replenishPeriod, now);

          // Check for existing inventory item for same reward in same period
          const existingIdx = state.inventory.findIndex(
            (item) => item.rewardId === id && item.periodStart === periodStart
          );

          let newInventory: InventoryItem[];
          if (existingIdx >= 0) {
            newInventory = state.inventory.map((item, idx) =>
              idx === existingIdx
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            newInventory = [
              ...state.inventory,
              {
                id: Crypto.randomUUID(),
                rewardId: reward.id,
                rewardName: reward.name,
                rewardDescription: reward.description,
                rewardIcon: reward.icon,
                rewardCategory: reward.category,
                tokenCost: reward.tokenCost,
                replenishPeriod: reward.replenishPeriod,
                quantity: 1,
                redeemedCount: 0,
                periodStart,
              },
            ];
          }

          return {
            rewards: state.rewards.map((r) =>
              r.id === id
                ? {
                    ...r,
                    remainingQuantity: r.remainingQuantity - 1,
                    purchasedAt: now.toISOString(),
                  }
                : r
            ),
            inventory: newInventory,
          };
        }),

      redeemReward: (id) =>
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.id === id
              ? { ...r, isRedeemed: true, redeemedAt: new Date().toISOString() }
              : r
          ),
        })),

      redeemInventoryItem: (inventoryId) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === inventoryId && item.redeemedCount < item.quantity
              ? { ...item, redeemedCount: item.redeemedCount + 1 }
              : item
          ),
        })),

      replenishRewards: () =>
        set((state) => {
          const now = new Date();
          return {
            rewards: state.rewards.map((r) => {
              if (shouldReplenish(r)) {
                return {
                  ...r,
                  remainingQuantity: r.maxQuantity,
                  lastReplenishedAt: now.toISOString(),
                };
              }
              return r;
            }),
            // Remove expired inventory items (from previous periods)
            inventory: state.inventory.filter((item) => {
              const currentPeriodStart = getPeriodStart(item.replenishPeriod, now);
              return item.periodStart === currentPeriodStart;
            }),
          };
        }),

      getActiveInventory: () => {
        const now = new Date();
        return get().inventory.filter((item) => {
          const currentPeriodStart = getPeriodStart(item.replenishPeriod, now);
          return item.periodStart === currentPeriodStart;
        });
      },

      getPurchasedRewards: () =>
        get().rewards.filter((r) => r.remainingQuantity === 0),

      getAvailableRewards: () =>
        get().rewards.filter((r) => r.remainingQuantity > 0),
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const state = persisted as RewardState;
        if (!state || !state.rewards) return current;
        return {
          ...current,
          rewards: state.rewards.map((r) => ({
            maxQuantity: 1,
            remainingQuantity: 1,
            replenishPeriod: 'daily' as ReplenishPeriod,
            lastReplenishedAt: new Date().toISOString(),
            ...r,
          })),
          inventory: state.inventory || [],
        };
      },
    }
  )
);

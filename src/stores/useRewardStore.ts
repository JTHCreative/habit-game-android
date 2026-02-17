import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Reward } from '../types';

interface RewardState {
  rewards: Reward[];
  addReward: (reward: Omit<Reward, 'id' | 'isPurchased' | 'isRedeemed'>) => void;
  removeReward: (id: string) => void;
  purchaseReward: (id: string) => void;
  redeemReward: (id: string) => void;
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
    isPurchased: false,
    isRedeemed: false,
  },
];

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewards: DEFAULT_REWARDS,

      addReward: (rewardData) =>
        set((state) => ({
          rewards: [
            ...state.rewards,
            {
              ...rewardData,
              id: uuidv4(),
              isPurchased: false,
              isRedeemed: false,
            },
          ],
        })),

      removeReward: (id) =>
        set((state) => ({
          rewards: state.rewards.filter((r) => r.id !== id),
        })),

      purchaseReward: (id) =>
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.id === id
              ? { ...r, isPurchased: true, purchasedAt: new Date().toISOString() }
              : r
          ),
        })),

      redeemReward: (id) =>
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.id === id
              ? { ...r, isRedeemed: true, redeemedAt: new Date().toISOString() }
              : r
          ),
        })),

      getPurchasedRewards: () =>
        get().rewards.filter((r) => r.isPurchased && !r.isRedeemed),

      getAvailableRewards: () =>
        get().rewards.filter((r) => !r.isPurchased),
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

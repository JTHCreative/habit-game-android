import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Category } from '../types';

export const DEFAULT_REWARD_CATEGORIES: Category[] = [
  { id: 'self_care', name: 'Self Care', color: '#A78BFA', icon: 'heart' },
  { id: 'entertainment', name: 'Entertainment', color: '#3B82F6', icon: 'star' },
  { id: 'treat', name: 'Treat', color: '#F59E0B', icon: 'mci:food-apple' },
  { id: 'experience', name: 'Experience', color: '#10B981', icon: 'mci:map-marker' },
];

export const DEFAULT_REWARD_CATEGORY_IDS = DEFAULT_REWARD_CATEGORIES.map((c) => c.id);

interface RewardCategoryState {
  categories: Category[];
  addCategory: (name: string, color: string, icon: string) => Category;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
}

export const useRewardCategoryStore = create<RewardCategoryState>()(
  persist(
    (set) => ({
      categories: DEFAULT_REWARD_CATEGORIES,

      addCategory: (name, color, icon) => {
        const newCategory: Category = {
          id: Crypto.randomUUID(),
          name,
          color,
          icon,
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        return newCategory;
      },

      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
    }),
    {
      name: 'reward-category-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

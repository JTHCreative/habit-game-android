import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'health', name: 'Health', color: '#FF6B6B', icon: 'heart' },
  { id: 'fitness', name: 'Fitness', color: '#4ECDC4', icon: 'mci:dumbbell' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#A78BFA', icon: 'leaf' },
  { id: 'productivity', name: 'Productivity', color: '#F59E0B', icon: 'rocket' },
  { id: 'learning', name: 'Learning', color: '#3B82F6', icon: 'book' },
  { id: 'social', name: 'Social', color: '#EC4899', icon: 'users' },
  { id: 'finance', name: 'Finance', color: '#10B981', icon: 'dollar' },
];

export const DEFAULT_CATEGORY_IDS = DEFAULT_CATEGORIES.map((c) => c.id);

interface CategoryState {
  categories: Category[];
  addCategory: (name: string, color: string, icon: string) => Category;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  resetAll: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,

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

      resetAll: () => set({ categories: DEFAULT_CATEGORIES }),
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

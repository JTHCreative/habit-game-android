import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { CustomCategory } from '../types';

interface CustomCategoryState {
  categories: CustomCategory[];
  addCategory: (name: string, color: string, icon: string) => CustomCategory;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Omit<CustomCategory, 'id'>>) => void;
}

export const useCustomCategoryStore = create<CustomCategoryState>()(
  persist(
    (set) => ({
      categories: [],

      addCategory: (name, color, icon) => {
        const newCategory: CustomCategory = {
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
      name: 'custom-category-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

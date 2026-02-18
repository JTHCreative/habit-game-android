import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontKey =
  | 'system'
  | 'inter'
  | 'poppins'
  | 'nunito'
  | 'raleway'
  | 'playfair'
  | 'lora'
  | 'merriweather'
  | 'sourceSerif';

export interface FontOption {
  key: FontKey;
  label: string;
  description: string;
  regular: string;
  bold: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'system',
    label: 'System Default',
    description: 'Platform default font',
    regular: '',
    bold: '',
  },
  {
    key: 'inter',
    label: 'Inter',
    description: 'Clean & modern sans-serif',
    regular: 'Inter_400Regular',
    bold: 'Inter_700Bold',
  },
  {
    key: 'poppins',
    label: 'Poppins',
    description: 'Geometric modern sans-serif',
    regular: 'Poppins_400Regular',
    bold: 'Poppins_700Bold',
  },
  {
    key: 'nunito',
    label: 'Nunito',
    description: 'Rounded friendly sans-serif',
    regular: 'Nunito_400Regular',
    bold: 'Nunito_700Bold',
  },
  {
    key: 'raleway',
    label: 'Raleway',
    description: 'Elegant thin sans-serif',
    regular: 'Raleway_400Regular',
    bold: 'Raleway_700Bold',
  },
  {
    key: 'playfair',
    label: 'Playfair Display',
    description: 'Elegant high-contrast serif',
    regular: 'PlayfairDisplay_400Regular',
    bold: 'PlayfairDisplay_700Bold',
  },
  {
    key: 'lora',
    label: 'Lora',
    description: 'Balanced transitional serif',
    regular: 'Lora_400Regular',
    bold: 'Lora_700Bold',
  },
  {
    key: 'merriweather',
    label: 'Merriweather',
    description: 'Strong readable serif',
    regular: 'Merriweather_400Regular',
    bold: 'Merriweather_700Bold',
  },
  {
    key: 'sourceSerif',
    label: 'Source Serif 4',
    description: 'Classic refined serif',
    regular: 'SourceSerif4_400Regular',
    bold: 'SourceSerif4_700Bold',
  },
];

interface SettingsState {
  fontKey: FontKey;
  setFontKey: (key: FontKey) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontKey: 'system',
      setFontKey: (key) => set({ fontKey: key }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

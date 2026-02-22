import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectedPin, Pin } from '../types';
import { useSkillTreeStore } from './useSkillTreeStore';

// ── 29 collectible enamel pins ──────────────────────────

export const ALL_PINS: Pin[] = [
  // ── Chinese Zodiac (12) ─────────────────────────────────
  {
    id: 'pin_rat',
    name: 'Year of the Rat',
    description: 'Clever and resourceful, first of the zodiac',
    icon: 'mci:rodent',
    color: '#78909C',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ox',
    name: 'Year of the Ox',
    description: 'Diligent and dependable, strength without end',
    icon: 'mci:cow',
    color: '#8D6E63',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_tiger',
    name: 'Year of the Tiger',
    description: 'Brave and fierce, ruler of the mountain',
    icon: 'mci:paw',
    color: '#E8602C',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_rabbit',
    name: 'Year of the Rabbit',
    description: 'Gentle and elegant, leaping through moonlight',
    icon: 'mci:rabbit',
    color: '#F5C6AA',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_dragon',
    name: 'Year of the Dragon',
    description: 'Majestic and powerful, the emperor of the zodiac',
    icon: 'mci:fire-circle',
    color: '#FFD700',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_snake',
    name: 'Year of the Snake',
    description: 'Wise and enigmatic, keeper of secrets',
    icon: 'mci:snake',
    color: '#66BB6A',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_horse',
    name: 'Year of the Horse',
    description: 'Free-spirited and energetic, galloping through fields',
    icon: 'mci:horse',
    color: '#A1887F',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_goat',
    name: 'Year of the Goat',
    description: 'Creative and gentle, at peace with the world',
    icon: 'mci:sheep',
    color: '#CE93D8',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_monkey',
    name: 'Year of the Monkey',
    description: 'Witty and inventive, the trickster of the zodiac',
    icon: 'mci:panda',
    color: '#FF7043',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_rooster',
    name: 'Year of the Rooster',
    description: 'Confident and punctual, herald of the dawn',
    icon: 'mci:feather',
    color: '#E53935',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_dog',
    name: 'Year of the Dog',
    description: 'Loyal and honest, a faithful companion',
    icon: 'mci:dog',
    color: '#D4A44C',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_pig',
    name: 'Year of the Pig',
    description: 'Generous and compassionate, last of the zodiac',
    icon: 'mci:pig',
    color: '#F48FB1',
    rarity: 'uncommon',
    ticketCost: 150,
  },

  // ── Enneagram Types (9) ────────────────────────────────
  {
    id: 'pin_ennea_1',
    name: 'Type 1 – The Reformer',
    description: 'Principled and purposeful, striving for integrity',
    icon: 'mci:scale-balance',
    color: '#5C6BC0',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_2',
    name: 'Type 2 – The Helper',
    description: 'Generous and warm-hearted, driven by love',
    icon: 'heart',
    color: '#E91E63',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_3',
    name: 'Type 3 – The Achiever',
    description: 'Ambitious and adaptable, reaching for the summit',
    icon: 'trophy',
    color: '#FFB300',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_4',
    name: 'Type 4 – The Individualist',
    description: 'Expressive and introspective, beautifully unique',
    icon: 'mci:palette',
    color: '#AB47BC',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_5',
    name: 'Type 5 – The Investigator',
    description: 'Perceptive and curious, seeking understanding',
    icon: 'mci:microscope',
    color: '#26A69A',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_6',
    name: 'Type 6 – The Loyalist',
    description: 'Committed and reliable, courage under pressure',
    icon: 'shield',
    color: '#42A5F5',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_7',
    name: 'Type 7 – The Enthusiast',
    description: 'Spontaneous and versatile, chasing every adventure',
    icon: 'mci:lightning-bolt',
    color: '#FFA726',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_8',
    name: 'Type 8 – The Challenger',
    description: 'Powerful and decisive, protecting what matters',
    icon: 'mci:arm-flex',
    color: '#EF5350',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_ennea_9',
    name: 'Type 9 – The Peacemaker',
    description: 'Easygoing and harmonious, bringing people together',
    icon: 'mci:peace',
    color: '#66BB6A',
    rarity: 'uncommon',
    ticketCost: 150,
  },

  // ── Avatar Benders (4) ──────────────────────────────────
  {
    id: 'pin_firebender',
    name: 'Firebender',
    description: 'Power and fury of the Fire Nation',
    icon: 'mci:fire',
    color: '#E53935',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_waterbender',
    name: 'Waterbender',
    description: 'Flow and grace of the Water Tribe',
    icon: 'mci:waves',
    color: '#1E88E5',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_earthbender',
    name: 'Earthbender',
    description: 'Strength and resolve of the Earth Kingdom',
    icon: 'mci:earth',
    color: '#6D9B3A',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_airbender',
    name: 'Airbender',
    description: 'Freedom and wisdom of the Air Nomads',
    icon: 'mci:weather-windy',
    color: '#FFB74D',
    rarity: 'rare',
    ticketCost: 300,
  },

  // ── Hogwarts Houses (4) ─────────────────────────────────
  {
    id: 'pin_gryffindor',
    name: 'Gryffindor',
    description: 'Where dwell the brave at heart, their daring and chivalry set Gryffindors apart',
    icon: 'mci:shield-sword',
    color: '#AE0001',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_hufflepuff',
    name: 'Hufflepuff',
    description: 'Those patient Hufflepuffs are true and unafraid of toil',
    icon: 'mci:sprout',
    color: '#ECBA22',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_slytherin',
    name: 'Slytherin',
    description: 'Those cunning folk use any means to achieve their ends',
    icon: 'mci:alpha-s-circle',
    color: '#1A472A',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_ravenclaw',
    name: 'Ravenclaw',
    description: 'Wit beyond measure is man\'s greatest treasure',
    icon: 'mci:bird',
    color: '#0E1A40',
    rarity: 'rare',
    ticketCost: 300,
  },
];

// ── Store ────────────────────────────────────────────────

export const PIN_BOARD_SLOTS = 5;

interface PinState {
  collected: CollectedPin[];
  /** 5 display slots – each holds a pinId or null */
  board: (string | null)[];
  purchasePin: (pinId: string) => boolean;
  hasPin: (pinId: string) => boolean;
  collectedCount: () => number;
  /** Assign a pin to a board slot (0-4). Pass null to clear. */
  setBoardSlot: (slot: number, pinId: string | null) => void;
  resetAll: () => void;
}

const EMPTY_BOARD: (string | null)[] = [null, null, null, null, null];

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      collected: [] as CollectedPin[],
      board: EMPTY_BOARD,

      purchasePin: (pinId: string) => {
        if (get().collected.some((c) => c.pinId === pinId)) return false;
        set((state) => ({
          collected: [
            ...state.collected,
            { pinId, collectedAt: new Date().toISOString() },
          ],
        }));
        return true;
      },

      hasPin: (pinId: string) =>
        get().collected.some((c) => c.pinId === pinId),

      collectedCount: () => get().collected.length,

      resetAll: () => set({ collected: [], board: [...EMPTY_BOARD] }),

      setBoardSlot: (slot: number, pinId: string | null) => {
        if (slot < 0 || slot >= PIN_BOARD_SLOTS) return;
        // If assigning a pin, make sure it's collected (shop or skill tree)
        if (pinId && !get().hasPin(pinId) && !useSkillTreeStore.getState().isUnlocked(pinId)) return;
        set((state) => {
          const board = [...state.board];
          // Remove pinId from any existing slot first
          if (pinId) {
            for (let i = 0; i < board.length; i++) {
              if (board[i] === pinId) board[i] = null;
            }
          }
          board[slot] = pinId;
          return { board };
        });
      },
    }),
    {
      name: 'pin-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const state = persisted as any;
        if (!state) return current as PinState;
        return {
          ...(current as PinState),
          collected: state.collected || [],
          board: state.board || EMPTY_BOARD,
        };
      },
    }
  )
);

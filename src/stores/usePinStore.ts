import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectedPin, Pin } from '../types';
import { useSkillTreeStore } from './useSkillTreeStore';

// ── 36 collectible enamel pins ──────────────────────────

export const ALL_PINS: Pin[] = [
  // ── Chinese Zodiac (12) ─────────────────────────────────
  {
    id: 'pin_rat',
    name: 'Year of the Rat',
    description: 'Clever and resourceful, first of the zodiac',
    icon: 'mci:rodent',
    color: '#78909C',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_ox',
    name: 'Year of the Ox',
    description: 'Diligent and dependable, strength without end',
    icon: 'mci:cow',
    color: '#8D6E63',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_tiger',
    name: 'Year of the Tiger',
    description: 'Brave and fierce, ruler of the mountain',
    icon: 'mci:cat',
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
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_dragon',
    name: 'Year of the Dragon',
    description: 'Majestic and powerful, the emperor of the zodiac',
    icon: 'mci:unicorn',
    color: '#FFD700',
    rarity: 'legendary',
    ticketCost: 600,
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
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_monkey',
    name: 'Year of the Monkey',
    description: 'Witty and inventive, the trickster of the zodiac',
    icon: 'mci:panda',
    color: '#FF7043',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_rooster',
    name: 'Year of the Rooster',
    description: 'Confident and punctual, herald of the dawn',
    icon: 'mci:bird',
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
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_pig',
    name: 'Year of the Pig',
    description: 'Generous and compassionate, last of the zodiac',
    icon: 'mci:pig',
    color: '#F48FB1',
    rarity: 'common',
    ticketCost: 75,
  },

  // ── Space & Adventure (6) ─────────────────────────────
  {
    id: 'pin_rocket',
    name: 'Starbound',
    description: 'A rocket blasting off to the stars',
    icon: 'rocket',
    color: '#E53935',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_shuttle',
    name: 'Orbiter',
    description: 'A shuttle drifting through the cosmos',
    icon: 'space-shuttle',
    color: '#546E7A',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_globe',
    name: 'World Traveler',
    description: 'A spinning globe for the adventurous spirit',
    icon: 'globe',
    color: '#1565C0',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_compass',
    name: 'True North',
    description: 'A golden compass that always finds the way',
    icon: 'mci:compass',
    color: '#D4A44C',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_anchor',
    name: 'Sea Dog',
    description: 'A heavy anchor from an old sailing ship',
    icon: 'anchor',
    color: '#78909C',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_plane',
    name: 'Sky Captain',
    description: 'A vintage biplane soaring through clouds',
    icon: 'plane',
    color: '#4FC3F7',
    rarity: 'uncommon',
    ticketCost: 150,
  },

  // ── Nature & Elements (7) ─────────────────────────────
  {
    id: 'pin_mountain',
    name: 'Summit',
    description: 'A snow-capped peak for the trailblazer',
    icon: 'mci:terrain',
    color: '#78909C',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_lightning',
    name: 'Thunderstrike',
    description: 'A crackling bolt of pure energy',
    icon: 'bolt',
    color: '#FDD835',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_snowflake',
    name: 'First Frost',
    description: 'A delicate crystalline snowflake',
    icon: 'snowflake-o',
    color: '#81D4FA',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_fire',
    name: 'Eternal Flame',
    description: 'A fire that never goes out',
    icon: 'fire',
    color: '#FF6F00',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_leaf',
    name: 'Evergreen',
    description: 'A lush leaf full of life',
    icon: 'leaf',
    color: '#43A047',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_cactus',
    name: 'Desert Bloom',
    description: 'A cactus thriving in the harshest sun',
    icon: 'mci:cactus',
    color: '#66BB6A',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_mushroom',
    name: 'Spore Scout',
    description: 'A whimsical mushroom from the forest floor',
    icon: 'mci:mushroom',
    color: '#D32F2F',
    rarity: 'rare',
    ticketCost: 300,
  },

  // ── Objects & Symbols (7) ─────────────────────────────
  {
    id: 'pin_diamond',
    name: 'Flawless',
    description: 'A brilliant diamond catching every light',
    icon: 'diamond',
    color: '#B3E5FC',
    rarity: 'legendary',
    ticketCost: 600,
  },
  {
    id: 'pin_crown',
    name: 'Royal Crest',
    description: 'A majestic crown fit for a ruler',
    icon: 'mci:crown',
    color: '#FFD700',
    rarity: 'legendary',
    ticketCost: 600,
  },
  {
    id: 'pin_key',
    name: 'Skeleton Key',
    description: 'An ancient key that opens any lock',
    icon: 'key',
    color: '#C9B037',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_shield',
    name: 'Guardian',
    description: 'A sturdy shield forged in battle',
    icon: 'mci:shield',
    color: '#5C6BC0',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_sword',
    name: 'Excalibur',
    description: 'A legendary blade pulled from stone',
    icon: 'mci:sword-cross',
    color: '#90A4AE',
    rarity: 'legendary',
    ticketCost: 600,
  },
  {
    id: 'pin_crystal',
    name: 'Crystal Ball',
    description: 'A mystical orb glowing with visions',
    icon: 'mci:crystal-ball',
    color: '#CE93D8',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_feather',
    name: 'Phoenix Plume',
    description: 'A blazing feather from a mythical bird',
    icon: 'mci:feather',
    color: '#FF7043',
    rarity: 'common',
    ticketCost: 75,
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

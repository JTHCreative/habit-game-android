import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectedPin, Pin } from '../types';

// ── 30 collectible enamel pins ──────────────────────────

export const ALL_PINS: Pin[] = [
  // ── Animals (10) ──────────────────────────────────────
  {
    id: 'pin_fox',
    name: 'Clever Fox',
    description: 'A sly red fox with bright eyes',
    icon: 'mci:fox',
    color: '#E8602C',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_owl',
    name: 'Night Owl',
    description: 'A wise owl perched under the moon',
    icon: 'mci:owl',
    color: '#8B6F47',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_cat',
    name: 'Lucky Cat',
    description: 'A playful cat bringing good fortune',
    icon: 'mci:cat',
    color: '#2D2D2D',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_penguin',
    name: 'Arctic Penguin',
    description: 'A dapper penguin in a tuxedo of feathers',
    icon: 'mci:penguin',
    color: '#1A1A2E',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_butterfly',
    name: 'Monarch',
    description: 'An elegant butterfly with golden wings',
    icon: 'mci:butterfly',
    color: '#E8A820',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_octopus',
    name: 'Deep Diver',
    description: 'A mysterious octopus from the abyss',
    icon: 'mci:octopus',
    color: '#7B2D8E',
    rarity: 'rare',
    ticketCost: 300,
  },
  {
    id: 'pin_turtle',
    name: 'Steady Shell',
    description: 'A patient turtle carrying the world',
    icon: 'mci:turtle',
    color: '#2E7D32',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_rabbit',
    name: 'Lucky Rabbit',
    description: 'A swift rabbit with a lucky streak',
    icon: 'mci:rabbit',
    color: '#F5C6AA',
    rarity: 'common',
    ticketCost: 75,
  },
  {
    id: 'pin_dolphin',
    name: 'Wave Rider',
    description: 'A graceful dolphin leaping over waves',
    icon: 'mci:dolphin',
    color: '#0288D1',
    rarity: 'uncommon',
    ticketCost: 150,
  },
  {
    id: 'pin_paw',
    name: 'Best Friend',
    description: 'A paw print from a loyal companion',
    icon: 'paw',
    color: '#A1887F',
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
    color: '#37474F',
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
    icon: 'mci:mountain',
    color: '#455A64',
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
];

// ── Store ────────────────────────────────────────────────

interface PinState {
  collected: CollectedPin[];
  purchasePin: (pinId: string) => boolean;
  hasPin: (pinId: string) => boolean;
  collectedCount: () => number;
}

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      collected: [] as CollectedPin[],

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
    }),
    {
      name: 'pin-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

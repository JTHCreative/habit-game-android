import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SkillTreeCategory, SkillTreePin } from '../types';

// Exponential thresholds: 5, 15, 40, 100, 250, 500
const THRESHOLDS = [5, 15, 40, 100, 250, 500];

// ── Skill-tree pin definitions (7 branches × 6 tiers) ──

export const SKILL_TREE_PINS: SkillTreePin[] = [
  // ── Health branch ───────────────────────────────────────
  { id: 'st_health_1', name: 'First Aid',          description: 'Take your first steps toward better health',          icon: 'mci:pill',              color: '#FF6B6B', rarity: 'common',    category: 'health', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_health_2', name: 'Vital Signs',        description: 'A steady heartbeat of healthy choices',               icon: 'mci:heart-pulse',       color: '#FF6B6B', rarity: 'common',    category: 'health', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_health_3', name: 'Clean Bill',          description: 'Your dedication to health is paying off',             icon: 'mci:stethoscope',       color: '#FF6B6B', rarity: 'uncommon',  category: 'health', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_health_4', name: 'Nourished',           description: 'A body fuelled by discipline',                        icon: 'mci:food-apple',        color: '#FF6B6B', rarity: 'rare',      category: 'health', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_health_5', name: 'Radiant Wellness',    description: 'You glow with vitality',                              icon: 'mci:white-balance-sunny', color: '#FF6B6B', rarity: 'rare',    category: 'health', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_health_6', name: 'Immortal Vigor',      description: 'An unstoppable force of health and longevity',        icon: 'mci:infinity',          color: '#FF6B6B', rarity: 'legendary', category: 'health', tier: 6, requiredCompletions: THRESHOLDS[5] },

  // ── Fitness branch ──────────────────────────────────────
  { id: 'st_fitness_1', name: 'Warm Up',            description: 'Get moving and start building strength',              icon: 'mci:run',               color: '#4ECDC4', rarity: 'common',    category: 'fitness', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_fitness_2', name: 'Reps In',            description: 'Building a solid foundation of fitness',              icon: 'mci:dumbbell',          color: '#4ECDC4', rarity: 'common',    category: 'fitness', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_fitness_3', name: 'Iron Will',          description: 'Pushing past limits with raw determination',          icon: 'mci:weight-lifter',     color: '#4ECDC4', rarity: 'uncommon',  category: 'fitness', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_fitness_4', name: 'Peak Form',          description: 'Your body is a finely tuned machine',                 icon: 'mci:arm-flex',          color: '#4ECDC4', rarity: 'rare',      category: 'fitness', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_fitness_5', name: 'Martial Spirit',     description: 'Discipline forged through relentless training',       icon: 'mci:karate',            color: '#4ECDC4', rarity: 'rare',      category: 'fitness', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_fitness_6', name: 'Titan',              description: 'A legendary athlete who defies human limits',         icon: 'mci:lightning-bolt',    color: '#4ECDC4', rarity: 'legendary', category: 'fitness', tier: 6, requiredCompletions: THRESHOLDS[5] },

  // ── Mindfulness branch ──────────────────────────────────
  { id: 'st_mind_1', name: 'First Breath',          description: 'Begin the journey inward',                            icon: 'leaf',                  color: '#A78BFA', rarity: 'common',    category: 'mindfulness', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_mind_2', name: 'Still Water',           description: 'A calm mind like an undisturbed lake',                icon: 'mci:meditation',        color: '#A78BFA', rarity: 'common',    category: 'mindfulness', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_mind_3', name: 'Inner Peace',           description: 'Harmony between mind, body, and spirit',              icon: 'mci:peace',             color: '#A78BFA', rarity: 'uncommon',  category: 'mindfulness', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_mind_4', name: 'Third Eye',             description: 'Seeing the world with clarity and wisdom',            icon: 'mci:yoga',              color: '#A78BFA', rarity: 'rare',      category: 'mindfulness', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_mind_5', name: 'Lotus Bloom',           description: 'Beauty rising from the depths of practice',           icon: 'mci:flower-lotus',      color: '#A78BFA', rarity: 'rare',      category: 'mindfulness', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_mind_6', name: 'Enlightened',           description: 'A transcendent state of total awareness',             icon: 'mci:star-shooting',     color: '#A78BFA', rarity: 'legendary', category: 'mindfulness', tier: 6, requiredCompletions: THRESHOLDS[5] },

  // ── Productivity branch ─────────────────────────────────
  { id: 'st_prod_1', name: 'Quick Start',           description: 'Igniting the spark of productivity',                  icon: 'rocket',                color: '#F59E0B', rarity: 'common',    category: 'productivity', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_prod_2', name: 'On a Roll',             description: 'Momentum building with every completed task',         icon: 'mci:timer',             color: '#F59E0B', rarity: 'common',    category: 'productivity', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_prod_3', name: 'Efficient Machine',     description: 'Streamlined and unstoppable',                         icon: 'mci:head-cog',          color: '#F59E0B', rarity: 'uncommon',  category: 'productivity', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_prod_4', name: 'Trailblazer',           description: 'Cutting new paths through sheer output',              icon: 'mci:torch',             color: '#F59E0B', rarity: 'rare',      category: 'productivity', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_prod_5', name: 'Grandmaster',           description: 'Mastery over time and task',                          icon: 'mci:trophy-award',      color: '#F59E0B', rarity: 'rare',      category: 'productivity', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_prod_6', name: 'Forge Lord',            description: 'A legendary force that shapes worlds through work',   icon: 'mci:sword',             color: '#F59E0B', rarity: 'legendary', category: 'productivity', tier: 6, requiredCompletions: THRESHOLDS[5] },

  // ── Learning branch ─────────────────────────────────────
  { id: 'st_learn_1', name: 'Curious Mind',         description: 'The first spark of lifelong learning',                icon: 'book',                  color: '#3B82F6', rarity: 'common',    category: 'learning', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_learn_2', name: 'Studious',             description: 'Building knowledge page by page',                     icon: 'mci:notebook',          color: '#3B82F6', rarity: 'common',    category: 'learning', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_learn_3', name: 'Scholar',              description: 'Deep understanding earned through dedication',         icon: 'mci:school',            color: '#3B82F6', rarity: 'uncommon',  category: 'learning', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_learn_4', name: 'Visionary',            description: 'Seeing connections others miss',                      icon: 'mci:telescope',         color: '#3B82F6', rarity: 'rare',      category: 'learning', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_learn_5', name: 'Renaissance',          description: 'A polymath who masters many arts',                    icon: 'mci:palette',           color: '#3B82F6', rarity: 'rare',      category: 'learning', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_learn_6', name: 'Omniscient',           description: 'A legendary intellect that knows no bounds',          icon: 'mci:atom',              color: '#3B82F6', rarity: 'legendary', category: 'learning', tier: 6, requiredCompletions: THRESHOLDS[5] },

  // ── Social branch ───────────────────────────────────────
  { id: 'st_social_1', name: 'Hello World',         description: 'Reaching out and making connections',                 icon: 'mci:hand-heart',        color: '#EC4899', rarity: 'common',    category: 'social', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_social_2', name: 'Good Neighbor',       description: 'Building bonds that matter',                          icon: 'mci:human-greeting',    color: '#EC4899', rarity: 'common',    category: 'social', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_social_3', name: 'Inner Circle',        description: 'A trusted presence in every group',                   icon: 'mci:account-group',     color: '#EC4899', rarity: 'uncommon',  category: 'social', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_social_4', name: 'Peacekeeper',         description: 'Bringing harmony wherever you go',                    icon: 'mci:handshake',         color: '#EC4899', rarity: 'rare',      category: 'social', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_social_5', name: 'Beloved',             description: 'Cherished by everyone who knows you',                 icon: 'mci:emoticon',          color: '#EC4899', rarity: 'rare',      category: 'social', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_social_6', name: 'Legendary Ally',      description: 'A mythical companion who lifts entire communities',   icon: 'mci:shield-star',       color: '#EC4899', rarity: 'legendary', category: 'social', tier: 6, requiredCompletions: THRESHOLDS[5] },

  // ── Finance branch ──────────────────────────────────────
  { id: 'st_finance_1', name: 'Penny Wise',         description: 'Smart money habits start here',                       icon: 'mci:cash',              color: '#10B981', rarity: 'common',    category: 'finance', tier: 1, requiredCompletions: THRESHOLDS[0] },
  { id: 'st_finance_2', name: 'Budgeted',           description: 'Every dollar has a purpose',                          icon: 'mci:chart-bar',         color: '#10B981', rarity: 'common',    category: 'finance', tier: 2, requiredCompletions: THRESHOLDS[1] },
  { id: 'st_finance_3', name: 'Investor',           description: 'Growing wealth through discipline',                   icon: 'mci:chart-line',        color: '#10B981', rarity: 'uncommon',  category: 'finance', tier: 3, requiredCompletions: THRESHOLDS[2] },
  { id: 'st_finance_4', name: 'Nest Egg',           description: 'A fortune built on daily habits',                     icon: 'mci:piggy-bank',        color: '#10B981', rarity: 'rare',      category: 'finance', tier: 4, requiredCompletions: THRESHOLDS[3] },
  { id: 'st_finance_5', name: 'Magnate',            description: 'Your financial empire grows by the day',              icon: 'mci:safe',              color: '#10B981', rarity: 'rare',      category: 'finance', tier: 5, requiredCompletions: THRESHOLDS[4] },
  { id: 'st_finance_6', name: 'Golden Vault',       description: 'Legendary wealth forged through unbreakable habits',  icon: 'mci:bank',              color: '#10B981', rarity: 'legendary', category: 'finance', tier: 6, requiredCompletions: THRESHOLDS[5] },
];

export const SKILL_TREE_CATEGORIES: SkillTreeCategory[] = [
  'health', 'fitness', 'mindfulness', 'productivity', 'learning', 'social', 'finance',
];

// ── Store ────────────────────────────────────────────────

interface SkillTreeState {
  /** pinId → ISO date when it was unlocked */
  unlocked: Record<string, string>;
  /** Check and unlock any newly earned pins. Returns newly unlocked pin IDs. */
  checkUnlocks: (categoryCompletions: Record<string, number>) => string[];
  isUnlocked: (pinId: string) => boolean;
}

export const useSkillTreeStore = create<SkillTreeState>()(
  persist(
    (set, get) => ({
      unlocked: {},

      checkUnlocks: (categoryCompletions) => {
        const current = get().unlocked;
        const newlyUnlocked: string[] = [];

        for (const pin of SKILL_TREE_PINS) {
          if (current[pin.id]) continue;
          const count = categoryCompletions[pin.category] ?? 0;
          if (count >= pin.requiredCompletions) {
            newlyUnlocked.push(pin.id);
          }
        }

        if (newlyUnlocked.length > 0) {
          const now = new Date().toISOString();
          set((state) => {
            const updated = { ...state.unlocked };
            for (const id of newlyUnlocked) {
              updated[id] = now;
            }
            return { unlocked: updated };
          });
        }

        return newlyUnlocked;
      },

      isUnlocked: (pinId) => !!get().unlocked[pinId],
    }),
    {
      name: 'skill-tree-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ unlocked: state.unlocked }),
    }
  )
);

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mission, MissionDifficulty } from '../types';

interface MissionState {
  missions: Mission[];
  initializeDefaultMissions: () => void;
  updateMissionProgress: (missionId: string, objectiveId: string, increment: number) => void;
  claimMissionReward: (missionId: string) => { tokens: number; xp: number } | null;
  getAvailableMissions: (level: number) => Mission[];
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'mission_starter_1',
    title: 'Getting Started',
    description: 'Begin your journey by creating and completing habits',
    difficulty: 'easy',
    status: 'available',
    objectives: [
      {
        id: 'obj_1',
        description: 'Complete any habit 3 times',
        targetCount: 3,
        currentCount: 0,
      },
    ],
    tokenReward: 50,
    xpReward: 75,
    requiredLevel: 1,
    icon: 'flag',
  },
  {
    id: 'mission_streak_1',
    title: 'Streak Starter',
    description: 'Build consistency by maintaining a daily streak',
    difficulty: 'easy',
    status: 'available',
    objectives: [
      {
        id: 'obj_2',
        description: 'Achieve a 3-day streak',
        targetCount: 3,
        currentCount: 0,
      },
    ],
    tokenReward: 75,
    xpReward: 100,
    requiredLevel: 1,
    icon: 'zap',
  },
  {
    id: 'mission_health_1',
    title: 'Health Hero',
    description: 'Focus on your health habits',
    difficulty: 'medium',
    status: 'available',
    objectives: [
      {
        id: 'obj_3',
        description: 'Complete health habits 10 times',
        targetCount: 10,
        currentCount: 0,
        habitCategory: 'health',
      },
    ],
    tokenReward: 150,
    xpReward: 200,
    requiredLevel: 3,
    icon: 'heart',
  },
  {
    id: 'mission_variety_1',
    title: 'Well-Rounded',
    description: 'Complete habits across multiple categories',
    difficulty: 'medium',
    status: 'available',
    objectives: [
      {
        id: 'obj_4a',
        description: 'Complete 5 fitness habits',
        targetCount: 5,
        currentCount: 0,
        habitCategory: 'fitness',
      },
      {
        id: 'obj_4b',
        description: 'Complete 5 mindfulness habits',
        targetCount: 5,
        currentCount: 0,
        habitCategory: 'mindfulness',
      },
    ],
    tokenReward: 200,
    xpReward: 250,
    requiredLevel: 5,
    icon: 'compass',
  },
  {
    id: 'mission_marathon_1',
    title: 'Marathon Runner',
    description: 'Show true dedication with a long streak',
    difficulty: 'hard',
    status: 'locked',
    objectives: [
      {
        id: 'obj_5',
        description: 'Achieve a 14-day streak',
        targetCount: 14,
        currentCount: 0,
      },
    ],
    tokenReward: 300,
    xpReward: 400,
    requiredLevel: 8,
    icon: 'award',
  },
  {
    id: 'mission_legend_1',
    title: 'The Legendary Grind',
    description: 'Only the most dedicated can complete this quest',
    difficulty: 'legendary',
    status: 'locked',
    objectives: [
      {
        id: 'obj_6a',
        description: 'Complete 50 total habits',
        targetCount: 50,
        currentCount: 0,
      },
      {
        id: 'obj_6b',
        description: 'Achieve a 30-day streak',
        targetCount: 30,
        currentCount: 0,
      },
    ],
    tokenReward: 500,
    xpReward: 750,
    requiredLevel: 15,
    icon: 'crown',
  },
];

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: DEFAULT_MISSIONS,

      initializeDefaultMissions: () => {
        if (get().missions.length === 0) {
          set({ missions: DEFAULT_MISSIONS });
        }
      },

      updateMissionProgress: (missionId, objectiveId, increment) =>
        set((state) => ({
          missions: state.missions.map((mission) => {
            if (mission.id !== missionId) return mission;
            if (mission.status === 'completed' || mission.status === 'claimed')
              return mission;

            const objectives = mission.objectives.map((obj) => {
              if (obj.id !== objectiveId) return obj;
              return {
                ...obj,
                currentCount: Math.min(
                  obj.currentCount + increment,
                  obj.targetCount
                ),
              };
            });

            const allComplete = objectives.every(
              (obj) => obj.currentCount >= obj.targetCount
            );

            return {
              ...mission,
              objectives,
              status: allComplete
                ? ('completed' as const)
                : ('in_progress' as const),
            };
          }),
        })),

      claimMissionReward: (missionId) => {
        const mission = get().missions.find((m) => m.id === missionId);
        if (!mission || mission.status !== 'completed') return null;

        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === missionId ? { ...m, status: 'claimed' as const } : m
          ),
        }));

        return { tokens: mission.tokenReward, xp: mission.xpReward };
      },

      getAvailableMissions: (level) => {
        return get().missions.filter(
          (m) =>
            m.requiredLevel <= level &&
            m.status !== 'claimed' &&
            m.status !== 'locked'
        );
      },
    }),
    {
      name: 'mission-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

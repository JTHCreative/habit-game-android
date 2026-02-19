import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useUserStore } from '../stores/useUserStore';
import { useHabitStore } from '../stores/useHabitStore';

export function useDecayCheck() {
  const applyDecay = useUserStore((s) => s.applyDecay);
  const habits = useHabitStore((s) => s.habits);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const lost = applyDecay(habits);
    if (lost > 0) {
      Alert.alert(
        'XP Decay',
        `You lost ${lost} XP for being inactive! Complete at least 1 habit every 3 days to avoid decay.`
      );
    }
  }, [applyDecay, habits]);
}

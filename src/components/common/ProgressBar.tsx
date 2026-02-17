import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius } from '@/constants/Spacing';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  gradientColors?: readonly [string, string, ...string[]];
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  gradientColors = ['#6C5CE7', '#A29BFE'],
  backgroundColor = '#E9ECEF',
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      {clampedProgress > 0 && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              height,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});

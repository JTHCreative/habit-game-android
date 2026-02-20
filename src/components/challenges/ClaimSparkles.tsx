import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

const SPARK_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B',
  '#EC4899', '#10B981', '#3B82F6', '#D4A44C', '#84CC16',
];

const NUM_PARTICLES = 16;
const NUM_STARS = 6;

interface SparkConfig {
  x: number;
  y: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

interface StarConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

function generateSparks(accentColor: string): SparkConfig[] {
  const sparks: SparkConfig[] = [];
  const colors = [accentColor, ...SPARK_COLORS.slice(0, 4)];

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / NUM_PARTICLES + (Math.random() - 0.5) * 0.4;
    const distance = 30 + Math.random() * 50;
    // Start from scattered positions around the card center
    const startX = 50 + (Math.random() - 0.5) * 60;
    const startY = 50 + (Math.random() - 0.5) * 30;
    sparks.push({
      x: startX,
      y: startY,
      endX: startX + Math.cos(angle) * distance,
      endY: startY + Math.sin(angle) * distance,
      size: 3 + Math.random() * 4,
      color: colors[i % colors.length],
      delay: Math.random() * 150,
      duration: 450 + Math.random() * 250,
    });
  }
  return sparks;
}

function generateStars(accentColor: string): StarConfig[] {
  const colors = [accentColor, '#FFD700', '#FFF', accentColor, '#FFD700', '#FFF'];
  return Array.from({ length: NUM_STARS }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 3 + Math.random() * 3,
    color: colors[i % colors.length],
    delay: 100 + Math.random() * 300,
  }));
}

function Spark({ config }: { config: SparkConfig }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 80 }),
        withDelay(config.duration - 180, withTiming(0, { duration: 200 }))
      )
    );
    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: config.duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: config.size,
    height: config.size,
    borderRadius: config.size / 2,
    backgroundColor: config.color,
    opacity: opacity.value,
    left: interpolate(progress.value, [0, 1], [config.x, config.endX]),
    top: interpolate(progress.value, [0, 1], [config.y, config.endY]),
    transform: [
      { scale: interpolate(progress.value, [0, 0.3, 1], [0.2, 1.2, 0.2]) },
    ],
  }));

  return <Animated.View style={style} />;
}

function Star({ config }: { config: StarConfig }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(200, withTiming(0, { duration: 250 }))
      )
    );
    scale.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back(2)) }),
        withDelay(200, withTiming(0, { duration: 250 }))
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: config.x,
    top: config.y,
    width: config.size * 2,
    height: config.size * 2,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{
          position: 'absolute',
          width: config.size * 2,
          height: 1.5,
          backgroundColor: config.color,
          top: config.size - 0.75,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 1.5,
          height: config.size * 2,
          backgroundColor: config.color,
          left: config.size - 0.75,
          borderRadius: 1,
        }}
      />
    </Animated.View>
  );
}

interface ClaimSparklesProps {
  color: string;
  onFinish: () => void;
}

export function ClaimSparkles({ color, onFinish }: ClaimSparklesProps) {
  const sparks = useMemo(() => generateSparks(color), []);
  const stars = useMemo(() => generateStars(color), []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, 900);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      {sparks.map((s, i) => (
        <Spark key={i} config={s} />
      ))}
      {stars.map((s, i) => (
        <Star key={`star-${i}`} config={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    overflow: 'visible',
  },
});

import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const SPARK_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B',
  '#EC4899', '#10B981', '#3B82F6', '#D4A44C', '#84CC16',
];

const NUM_PARTICLES = 16;
const NUM_STARS = 6;

interface SparkConfig {
  /** Start X as 0-1 fraction of card width */
  xPct: number;
  /** Start Y as 0-1 fraction of card height */
  yPct: number;
  /** Travel X in pixels */
  dx: number;
  /** Travel Y in pixels */
  dy: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

interface StarConfig {
  xPct: number;
  yPct: number;
  size: number;
  color: string;
  delay: number;
}

function generateSparks(accentColor: string): SparkConfig[] {
  const sparks: SparkConfig[] = [];
  const colors = [accentColor, ...SPARK_COLORS.slice(0, 4)];

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / NUM_PARTICLES + (Math.random() - 0.5) * 0.4;
    const distance = 25 + Math.random() * 40;
    sparks.push({
      xPct: 0.05 + Math.random() * 0.9,
      yPct: 0.05 + Math.random() * 0.9,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
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
    xPct: 0.05 + Math.random() * 0.9,
    yPct: 0.05 + Math.random() * 0.9,
    size: 3 + Math.random() * 3,
    color: colors[i % colors.length],
    delay: 100 + Math.random() * 300,
  }));
}

function Spark({ config, cardW, cardH }: { config: SparkConfig; cardW: number; cardH: number }) {
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

  const left = config.xPct * cardW;
  const top = config.yPct * cardH;

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, config.dx]) },
      { translateY: interpolate(progress.value, [0, 1], [0, config.dy]) },
      { scale: interpolate(progress.value, [0, 0.3, 1], [0.2, 1.2, 0.2]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left,
          top,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
}

function Star({ config, cardW, cardH }: { config: StarConfig; cardW: number; cardH: number }) {
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

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: config.xPct * cardW,
          top: config.yPct * cardH,
          width: config.size * 2,
          height: config.size * 2,
        },
        animStyle,
      ]}
    >
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
  const [layout, setLayout] = useState<{ w: number; h: number } | null>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: width, h: height });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, 900);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none" onLayout={handleLayout}>
      {layout && (
        <>
          {sparks.map((s, i) => (
            <Spark key={i} config={s} cardW={layout.w} cardH={layout.h} />
          ))}
          {stars.map((s, i) => (
            <Star key={`star-${i}`} config={s} cardW={layout.w} cardH={layout.h} />
          ))}
        </>
      )}
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

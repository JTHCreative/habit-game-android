import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DynamicIcon } from './DynamicIcon';
import { Reward, RewardCategory } from '@/src/types';

const { width, height } = Dimensions.get('window');

const CATEGORY_COLORS: Record<RewardCategory, string> = {
  self_care: '#A78BFA',
  entertainment: '#3B82F6',
  treat: '#F59E0B',
  experience: '#10B981',
  custom: '#EC4899',
};

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  self_care: 'Self Care',
  entertainment: 'Entertainment',
  treat: 'Treat',
  experience: 'Experience',
  custom: 'Custom',
};

const PARTICLE_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B',
  '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#D4A44C',
  '#F97316', '#8B5CF6', '#06B6D4', '#84CC16', '#E11D48',
];

const NUM_PARTICLES = 30;
const NUM_SPARKLES = 10;

interface ParticleConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

interface SparkleConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

function generateParticles(accentColor: string): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  const cx = width / 2;
  const cy = height * 0.38;

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / NUM_PARTICLES + Math.random() * 0.3;
    const distance = 80 + Math.random() * 100;
    const colors = [accentColor, ...PARTICLE_COLORS];
    particles.push({
      startX: cx,
      startY: cy,
      endX: cx + Math.cos(angle) * distance,
      endY: cy + Math.sin(angle) * distance,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 5,
      delay: Math.random() * 300,
      duration: 600 + Math.random() * 400,
    });
  }
  return particles;
}

function generateSparkles(accentColor: string): SparkleConfig[] {
  const colors = [accentColor, ...PARTICLE_COLORS];
  return Array.from({ length: NUM_SPARKLES }, (_, i) => ({
    x: Math.random() * width * 0.8 + width * 0.1,
    y: Math.random() * height * 0.5 + height * 0.15,
    size: 2 + Math.random() * 3,
    color: colors[i % colors.length],
    delay: 400 + Math.random() * 1200,
  }));
}

function Particle({ config }: { config: ParticleConfig }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(config.duration - 200, withTiming(0, { duration: 300 }))
      )
    );
    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: config.duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: config.size,
    height: config.size,
    borderRadius: config.size / 2,
    backgroundColor: config.color,
    opacity: opacity.value,
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [config.startX, config.endX]) },
      { translateY: interpolate(progress.value, [0, 1], [config.startY, config.endY + 20]) },
      { scale: interpolate(progress.value, [0, 0.3, 1], [0, 1.2, 0.3]) },
    ],
  }));

  return <Animated.View style={style} />;
}

function Sparkle({ config }: { config: SparkleConfig }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        3,
        false
      )
    );
    scale.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
          withTiming(0, { duration: 300 })
        ),
        3,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: config.x,
    top: config.y,
    width: config.size * 2,
    height: config.size * 2,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <View
        style={{
          width: config.size * 2,
          height: 2,
          backgroundColor: config.color,
          position: 'absolute',
          top: config.size - 1,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: 2,
          height: config.size * 2,
          backgroundColor: config.color,
          position: 'absolute',
          left: config.size - 1,
          borderRadius: 1,
        }}
      />
    </Animated.View>
  );
}

interface PrizeClaimSplashProps {
  reward: Reward;
  onFinish: () => void;
}

export function PrizeClaimSplash({ reward, onFinish }: PrizeClaimSplashProps) {
  const categoryColor = CATEGORY_COLORS[reward.category] || '#D4A44C';
  const categoryLabel = CATEGORY_LABELS[reward.category] || 'Reward';
  const particles = useMemo(() => generateParticles(categoryColor), [categoryColor]);
  const sparkles = useMemo(() => generateSparkles(categoryColor), [categoryColor]);

  const containerOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-20);
  const glowOpacity = useSharedValue(0);
  const nameOpacity = useSharedValue(0);
  const nameTranslateY = useSharedValue(15);
  const descOpacity = useSharedValue(0);
  const descTranslateY = useSharedValue(15);
  const categoryOpacity = useSharedValue(0);
  const tapHintOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in backdrop
    containerOpacity.value = withTiming(1, { duration: 300 });

    // Expanding ring burst
    ringScale.value = withDelay(200, withTiming(3, { duration: 800, easing: Easing.out(Easing.cubic) }));
    ringOpacity.value = withDelay(200, withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 700 })
    ));

    // Icon entrance
    iconScale.value = withDelay(
      250,
      withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.cubic) })
      )
    );
    iconRotate.value = withDelay(
      250,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Glow pulse
    glowOpacity.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(0.15, { duration: 800 })
      ),
      -1,
      true
    ));

    // Category badge
    categoryOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

    // Reward name
    nameOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    nameTranslateY.value = withDelay(700, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    // Description
    descOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    descTranslateY.value = withDelay(900, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Tap hint
    tapHintOpacity.value = withDelay(1600, withTiming(0.6, { duration: 500 }));
  }, []);

  const handleDismiss = () => {
    containerOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(onFinish)();
      }
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: categoryColor,
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    backgroundColor: categoryColor,
    opacity: glowOpacity.value,
  }));

  const categoryStyle = useAnimatedStyle(() => ({
    opacity: categoryOpacity.value,
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameTranslateY.value }],
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descTranslateY.value }],
  }));

  const tapHintStyle = useAnimatedStyle(() => ({
    opacity: tapHintOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleDismiss}
      >
        <LinearGradient
          colors={['rgba(15, 15, 26, 0.95)', 'rgba(26, 26, 46, 0.98)']}
          style={styles.gradient}
        >
          {/* Particles */}
          {particles.map((p, i) => (
            <Particle key={i} config={p} />
          ))}

          {/* Sparkles */}
          {sparkles.map((s, i) => (
            <Sparkle key={`sparkle-${i}`} config={s} />
          ))}

          <View style={styles.content}>
            {/* Expanding ring */}
            <Animated.View style={ringStyle} />

            {/* Prize icon circle */}
            <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
              <Animated.View style={glowStyle} />
              <View style={[styles.iconCircle, { borderColor: categoryColor }]}>
                <View style={[styles.iconCircleInner, { backgroundColor: categoryColor + '18' }]}>
                  <DynamicIcon name={reward.icon} size={48} color={categoryColor} />
                </View>
              </View>
            </Animated.View>

            {/* Category badge */}
            <Animated.View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30', borderColor: categoryColor }, categoryStyle]}>
              <Animated.Text style={[styles.categoryText, { color: categoryColor }]}>
                {categoryLabel}
              </Animated.Text>
            </Animated.View>

            {/* Title */}
            <Animated.Text style={[styles.headerText, { color: categoryColor }]} numberOfLines={1}>
              PRIZE CLAIMED!
            </Animated.Text>

            {/* Reward name */}
            <Animated.Text style={[styles.rewardName, nameStyle]}>
              {reward.name}
            </Animated.Text>

            {/* Description */}
            {reward.description ? (
              <Animated.View style={[styles.descContainer, descStyle]}>
                <Animated.Text style={styles.descText}>
                  {reward.description}
                </Animated.Text>
              </Animated.View>
            ) : null}

            {/* Tap to dismiss */}
            <Animated.Text style={[styles.tapHint, tapHintStyle]}>
              Tap anywhere to continue
            </Animated.Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const ICON_CIRCLE_SIZE = 130;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
  },
  iconCircleInner: {
    width: ICON_CIRCLE_SIZE - 14,
    height: ICON_CIRCLE_SIZE - 14,
    borderRadius: (ICON_CIRCLE_SIZE - 14) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  rewardName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F0E6D3',
    marginBottom: 12,
  },
  descContainer: {
    paddingHorizontal: 40,
    maxWidth: width * 0.85,
  },
  descText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#B8A990',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tapHint: {
    position: 'absolute',
    bottom: 80,
    fontSize: 13,
    fontWeight: '500',
    color: '#706880',
    letterSpacing: 0.5,
  },
});

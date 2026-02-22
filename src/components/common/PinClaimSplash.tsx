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
import { Pin, PinRarity } from '@/src/types';

const { width, height } = Dimensions.get('window');

const RARITY_COLORS: Record<PinRarity, string> = {
  common: '#8B9DAF',
  uncommon: '#4CAF50',
  rare: '#3B82F6',
  legendary: '#D4A44C',
};

const RARITY_LABELS: Record<PinRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
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

function generateParticles(pinColor: string): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  const cx = width / 2;
  const cy = height * 0.38;

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / NUM_PARTICLES + Math.random() * 0.3;
    const distance = 80 + Math.random() * 100;
    const colors = [pinColor, ...PARTICLE_COLORS];
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

function generateSparkles(pinColor: string): SparkleConfig[] {
  const colors = [pinColor, ...PARTICLE_COLORS];
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

interface PinClaimSplashProps {
  pin: Pin;
  onFinish: () => void;
}

export function PinClaimSplash({ pin, onFinish }: PinClaimSplashProps) {
  const rarityColor = RARITY_COLORS[pin.rarity];
  const particles = useMemo(() => generateParticles(pin.color), [pin.color]);
  const sparkles = useMemo(() => generateSparkles(pin.color), [pin.color]);

  const containerOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const pinScale = useSharedValue(0);
  const pinRotate = useSharedValue(-20);
  const glowOpacity = useSharedValue(0);
  const nameOpacity = useSharedValue(0);
  const nameTranslateY = useSharedValue(15);
  const descOpacity = useSharedValue(0);
  const descTranslateY = useSharedValue(15);
  const rarityOpacity = useSharedValue(0);
  const tapHintOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in backdrop
    containerOpacity.value = withTiming(1, { duration: 300 });

    // Expanding ring burst in pin color
    ringScale.value = withDelay(200, withTiming(3, { duration: 800, easing: Easing.out(Easing.cubic) }));
    ringOpacity.value = withDelay(200, withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 700 })
    ));

    // Pin icon entrance
    pinScale.value = withDelay(
      250,
      withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.cubic) })
      )
    );
    pinRotate.value = withDelay(
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

    // Rarity badge
    rarityOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

    // Pin name
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
    width: PIN_CIRCLE_SIZE,
    height: PIN_CIRCLE_SIZE,
    borderRadius: PIN_CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: pin.color,
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const pinStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pinScale.value },
      { rotate: `${pinRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    borderRadius: PIN_CIRCLE_SIZE / 2,
    backgroundColor: pin.color,
    opacity: glowOpacity.value,
  }));

  const rarityStyle = useAnimatedStyle(() => ({
    opacity: rarityOpacity.value,
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

            {/* Pin circle */}
            <Animated.View style={[styles.pinContainer, pinStyle]}>
              <Animated.View style={glowStyle} />
              <View style={[styles.pinCircle, { borderColor: pin.color }]}>
                <View style={[styles.pinCircleInner, { backgroundColor: pin.color + '18' }]}>
                  <DynamicIcon name={pin.icon} size={48} color={pin.color} />
                </View>
              </View>
            </Animated.View>

            {/* Rarity badge */}
            <Animated.View style={[styles.rarityBadge, { backgroundColor: rarityColor + '30', borderColor: rarityColor }, rarityStyle]}>
              <Animated.Text style={[styles.rarityText, { color: rarityColor }]}>
                {RARITY_LABELS[pin.rarity]}
              </Animated.Text>
            </Animated.View>

            {/* Title */}
            <Animated.Text style={[styles.headerText, { color: pin.color }]} numberOfLines={1}>
              PIN COLLECTED!
            </Animated.Text>

            {/* Pin name */}
            <Animated.Text style={[styles.pinName, nameStyle]}>
              {pin.name}
            </Animated.Text>

            {/* Description */}
            <Animated.View style={[styles.descContainer, descStyle]}>
              <Animated.Text style={styles.descText}>
                {pin.description}
              </Animated.Text>
            </Animated.View>

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

const PIN_CIRCLE_SIZE = 130;

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
  pinContainer: {
    width: PIN_CIRCLE_SIZE,
    height: PIN_CIRCLE_SIZE,
    borderRadius: PIN_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pinCircle: {
    width: PIN_CIRCLE_SIZE,
    height: PIN_CIRCLE_SIZE,
    borderRadius: PIN_CIRCLE_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
  },
  pinCircleInner: {
    width: PIN_CIRCLE_SIZE - 14,
    height: PIN_CIRCLE_SIZE - 14,
    borderRadius: (PIN_CIRCLE_SIZE - 14) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  rarityText: {
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
  pinName: {
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

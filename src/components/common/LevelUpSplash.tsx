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
import { brand } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

const QUOTES = [
  'Leveling up my life, one habit at a time.',
  'Real-life XP earned.',
  'My character grows as I grow.',
  'Consistency is my highest stat.',
  'Turning daily chores into epic quests.',
  'Skill unlocked: Self-Discipline.',
  'Small wins, big levels.',
  'Evolution happens in the daily grind.',
  'My avatar is looking as strong as my routine.',
  'Buffed by productivity.',
  'From "To-Do" to "Ta-Da!"',
  'Leveling up: Life Edition.',
  'Building a better me, one checkbox at a time.',
  'The grind is real, and so are the gains.',
  'Habit streak: Immortal.',
  'Powering up my physical and mental health.',
  'Mastery over the mundane.',
  'Leveling up is a side effect of showing up.',
  'My productivity is my power-up.',
  'Skill Point Spent: Time Management.',
  'Real-world rewards for digital progress.',
  'Consistency is the cheat code.',
  'Every habit is a step toward the Final Boss: Success.',
  'Upgraded my morning routine.',
  'Experience points gained in the real world.',
  'Leaving my "Level 1" self behind.',
  'The best game I\'ve ever played is my own life.',
  'My skill tree is finally branching out.',
  'Achievement Unlocked: 7-Day Streak.',
  'Turning "I should" into "I did."',
  'Leveling up feels better when it\'s tangible.',
  'Status: Disciplined.',
  'My life is the campaign; my habits are the gear.',
  'Strengthening the mind, one task at a time.',
  'The dopamine hit of a completed list.',
  'Leveling up through the power of "Done."',
  'Grinding for a better future.',
  'New Level. New Mindset.',
  'Productivity: Optimized.',
  'My habits are the ultimate armor.',
  'Building legendary routines.',
  'Taking control of the controller.',
  'Another level closer to my goals.',
  'Success is a series of small levels.',
  'My avatar reflects my effort.',
  'Investing XP into my future self.',
  'The most rewarding grind there is.',
  'From habit-slayer to life-player.',
  'Leveling up while staying grounded.',
  "Today's effort is tomorrow's level.",
];

// Firework particle colors
const PARTICLE_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B',
  '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#D4A44C',
  '#F97316', '#8B5CF6', '#06B6D4', '#84CC16', '#E11D48',
];

const NUM_PARTICLES = 40;
const NUM_SPARKLES = 12;

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

function generateParticles(): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  // Create multiple bursts from different positions
  const burstPoints = [
    { x: width * 0.2, y: height * 0.25 },
    { x: width * 0.8, y: height * 0.2 },
    { x: width * 0.5, y: height * 0.15 },
    { x: width * 0.3, y: height * 0.7 },
    { x: width * 0.7, y: height * 0.65 },
  ];

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const burst = burstPoints[i % burstPoints.length];
    const angle = (Math.PI * 2 * i) / (NUM_PARTICLES / burstPoints.length) + Math.random() * 0.5;
    const distance = 60 + Math.random() * 120;
    particles.push({
      startX: burst.x,
      startY: burst.y,
      endX: burst.x + Math.cos(angle) * distance,
      endY: burst.y + Math.sin(angle) * distance,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 4 + Math.random() * 6,
      delay: Math.floor(i / (NUM_PARTICLES / burstPoints.length)) * 300 + Math.random() * 200,
      duration: 600 + Math.random() * 400,
    });
  }
  return particles;
}

function generateSparkles(): SparkleConfig[] {
  return Array.from({ length: NUM_SPARKLES }, (_, i) => ({
    x: Math.random() * width * 0.8 + width * 0.1,
    y: Math.random() * height * 0.6 + height * 0.1,
    size: 2 + Math.random() * 3,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    delay: 400 + Math.random() * 1500,
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
      {
        translateX: interpolate(progress.value, [0, 1], [config.startX, config.endX]),
      },
      {
        translateY: interpolate(progress.value, [0, 1], [config.startY, config.endY + 30]),
      },
      {
        scale: interpolate(progress.value, [0, 0.3, 1], [0, 1.2, 0.3]),
      },
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

interface LevelUpSplashProps {
  level: number;
  onFinish: () => void;
}

export function LevelUpSplash({ level, onFinish }: LevelUpSplashProps) {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const particles = useMemo(() => generateParticles(), []);
  const sparkles = useMemo(() => generateSparkles(), []);

  const containerOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(-15);
  const levelScale = useSharedValue(0.5);
  const levelOpacity = useSharedValue(0);
  const quoteOpacity = useSharedValue(0);
  const quoteTranslateY = useSharedValue(20);
  const tapHintOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in backdrop
    containerOpacity.value = withTiming(1, { duration: 300 });

    // Expanding ring burst
    ringScale.value = withDelay(200, withTiming(3, { duration: 800, easing: Easing.out(Easing.cubic) }));
    ringOpacity.value = withDelay(200, withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 700 })
    ));

    // Badge entrance
    badgeScale.value = withDelay(
      250,
      withSequence(
        withTiming(1.15, { duration: 400, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.cubic) })
      )
    );
    badgeRotate.value = withDelay(
      250,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Level number
    levelOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    levelScale.value = withDelay(
      500,
      withSequence(
        withTiming(1.3, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 200 })
      )
    );

    // Quote text
    quoteOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    quoteTranslateY.value = withDelay(800, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Tap to dismiss hint
    tapHintOpacity.value = withDelay(1800, withTiming(0.6, { duration: 500 }));
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
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: brand.primary,
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }));

  const levelStyle = useAnimatedStyle(() => ({
    opacity: levelOpacity.value,
    transform: [{ scale: levelScale.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteTranslateY.value }],
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
          {/* Firework particles */}
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

            {/* Level badge */}
            <Animated.View style={[styles.badgeContainer, badgeStyle]}>
              <LinearGradient
                colors={['#D4A44C', '#E87D2F']}
                style={styles.badge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.badgeInner}>
                  <Animated.Text style={[styles.levelLabel, levelStyle]}>
                    LEVEL
                  </Animated.Text>
                  <Animated.Text style={[styles.levelNumber, levelStyle]}>
                    {level}
                  </Animated.Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Congrats text */}
            <Animated.Text style={[styles.congratsText, levelStyle]}>
              LEVEL UP!
            </Animated.Text>

            {/* Quote */}
            <Animated.View style={[styles.quoteContainer, quoteStyle]}>
              <Animated.Text style={styles.quoteText}>
                "{quote}"
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

const BADGE_SIZE = 130;

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
  badgeContainer: {
    marginBottom: 24,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4A44C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeInner: {
    width: BADGE_SIZE - 10,
    height: BADGE_SIZE - 10,
    borderRadius: (BADGE_SIZE - 10) / 2,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 164, 76, 0.3)',
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4A44C',
    letterSpacing: 3,
    marginBottom: 2,
  },
  levelNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#F0E6D3',
  },
  congratsText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D4A44C',
    letterSpacing: 6,
    marginBottom: 24,
    textShadowColor: 'rgba(212, 164, 76, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  quoteContainer: {
    paddingHorizontal: 40,
    maxWidth: width * 0.85,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B8A990',
    textAlign: 'center',
    lineHeight: 24,
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

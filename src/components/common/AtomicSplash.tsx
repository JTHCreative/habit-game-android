import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { brand } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = width * 0.45;
const DISPLAY_DURATION = 3000;
const FADE_IN_DURATION = 600;
const FADE_OUT_DURATION = 500;

interface AtomicSplashProps {
  onFinish: () => void;
}

export default function AtomicSplash({ onFinish }: AtomicSplashProps) {
  const opacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in the whole screen
    opacity.value = withTiming(1, { duration: FADE_IN_DURATION, easing: Easing.out(Easing.cubic) });

    // Logo scales up
    logoScale.value = withTiming(1, { duration: FADE_IN_DURATION + 200, easing: Easing.out(Easing.back(1.1)) });

    // Title text fades in with slight upward motion
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Subtitle fades in after title
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Fade out after display duration, then call onFinish
    opacity.value = withDelay(
      DISPLAY_DURATION,
      withTiming(0, { duration: FADE_OUT_DURATION, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <View style={styles.logoGlow} />
            <Image
              source={require('../../../assets/images/splash-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text style={[styles.title, titleStyle]}>
            ATOMIC
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            Build habits. Level up.
          </Animated.Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: LOGO_SIZE * 0.7,
    height: LOGO_SIZE * 0.7,
    borderRadius: LOGO_SIZE * 0.35,
    backgroundColor: brand.primary,
    opacity: 0.12,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B8A990',
    letterSpacing: 2,
  },
});

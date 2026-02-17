import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '../common/ProgressBar';
import { TokenBadge } from '../common/TokenBadge';
import { useUserStore } from '@/src/stores/useUserStore';
import { gradients } from '@/constants/Colors';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export function PlayerHeader() {
  const profile = useUserStore((s) => s.profile);
  const xpProgress = profile.xpToNextLevel > 0
    ? profile.currentXP / profile.xpToNextLevel
    : 0;

  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={28} color="#6C5CE7" />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.title}>{profile.title}</Text>
        </View>

        <TokenBadge amount={profile.tokens} size="medium" />
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>
            <FontAwesome name="bolt" size={12} color="#FDCB6E" /> XP
          </Text>
          <Text style={styles.xpNumbers}>
            {profile.currentXP} / {profile.xpToNextLevel}
          </Text>
        </View>
        <ProgressBar
          progress={xpProgress}
          height={8}
          gradientColors={['#FDCB6E', '#E17055']}
          backgroundColor="rgba(255,255,255,0.2)"
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <FontAwesome name="fire" size={14} color="#FF7675" />
          <Text style={styles.statValue}>{profile.currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <FontAwesome name="check-circle" size={14} color="#00B894" />
          <Text style={styles.statValue}>{profile.totalHabitsCompleted}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <FontAwesome name="trophy" size={14} color="#FDCB6E" />
          <Text style={styles.statValue}>{profile.totalMissionsCompleted}</Text>
          <Text style={styles.statLabel}>Missions</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    paddingTop: spacing.xxl + spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FDCB6E',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  levelText: {
    color: '#2D3436',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#FFF',
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  xpSection: {
    marginBottom: spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  xpLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  xpNumbers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

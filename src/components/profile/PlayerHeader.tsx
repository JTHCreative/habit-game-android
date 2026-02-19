import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '../common/ProgressBar';
import { TicketBadge } from '../common/TicketBadge';
import { useUserStore } from '@/src/stores/useUserStore';
import { gradients } from '@/constants/Colors';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export function PlayerHeader() {
  const profile = useUserStore((s) => s.profile);
  const router = useRouter();
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
            {profile.profileImageUri ? (
              <Image
                source={{ uri: profile.profileImageUri }}
                style={styles.avatarImage}
              />
            ) : (
              <FontAwesome name="user" size={28} color="#D4A44C" />
            )}
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.title}>{profile.title}</Text>
        </View>

        <TicketBadge amount={profile.tokens} size="medium" />
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>
            <FontAwesome name="bolt" size={12} color="#D4A44C" /> XP
          </Text>
          <Text style={styles.xpNumbers}>
            {profile.currentXP} / {profile.xpToNextLevel}
          </Text>
        </View>
        <ProgressBar
          progress={xpProgress}
          height={8}
          gradientColors={['#D4A44C', '#E8C97A']}
          backgroundColor="rgba(255,255,255,0.15)"
        />
      </View>

      <TouchableOpacity
        style={styles.statsRow}
        activeOpacity={0.7}
        onPress={() => router.push('/history')}
      >
        <View style={styles.stat}>
          <FontAwesome name="fire" size={14} color="#E87D2F" />
          <Text style={styles.statValue}>{profile.currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <FontAwesome name="check-circle" size={14} color="#4CAF50" />
          <Text style={styles.statValue}>{profile.totalHabitsCompleted}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <FontAwesome name="trophy" size={14} color="#D4A44C" />
          <Text style={styles.statValue}>{profile.totalMissionsCompleted}</Text>
          <Text style={styles.statLabel}>Challenges</Text>
        </View>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#D4A44C',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A2A3D',
  },
  levelText: {
    color: '#1A1A2E',
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
    color: 'rgba(255,255,255,0.7)',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

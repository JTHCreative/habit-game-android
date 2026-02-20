import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '../common/ProgressBar';
import { TicketBadge } from '../common/TicketBadge';
import { useUserStore } from '@/src/stores/useUserStore';
import { useChallengeStore, Challenge } from '@/src/stores/useChallengeStore';
import { gradients } from '@/constants/Colors';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

interface PlayerHeaderProps {
  completedCount?: number;
  totalCount?: number;
  allComplete?: boolean;
  bonusTickets?: number;
  bonusXP?: number;
}

function ChallengeMiniRow({ challenge }: { challenge: Challenge }) {
  const done = challenge.status === 'completed' || challenge.status === 'claimed';

  return (
    <View style={styles.challengeMiniRow}>
      <FontAwesome
        name={done ? 'check-circle' : (challenge.icon as any)}
        size={10}
        color={done ? '#4CAF50' : 'rgba(255,255,255,0.45)'}
      />
      <Text
        style={[styles.challengeMiniTitle, done && styles.challengeMiniDone]}
        numberOfLines={1}
      >
        {challenge.title}
      </Text>
      <Text style={styles.challengeMiniCount}>
        {challenge.currentCount}/{challenge.targetCount}
      </Text>
    </View>
  );
}

export function PlayerHeader({
  completedCount = 0,
  totalCount = 0,
  allComplete = false,
  bonusTickets = 10,
  bonusXP = 25,
}: PlayerHeaderProps) {
  const profile = useUserStore((s) => s.profile);
  const router = useRouter();
  const xpProgress = profile.xpToNextLevel > 0
    ? profile.currentXP / profile.xpToNextLevel
    : 0;

  const dailyChallenges = useChallengeStore((s) => s.dailyChallenges);
  const weeklyChallenges = useChallengeStore((s) => s.weeklyChallenges);

  const allChallenges = [...dailyChallenges, ...weeklyChallenges];
  const completedChallenges = allChallenges.filter(
    (c) => c.status === 'completed' || c.status === 'claimed'
  ).length;

  const hasChallenges = allChallenges.length > 0;
  const hasHabits = totalCount > 0;

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

        <TicketBadge amount={profile.tickets} size="medium" />
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

      {(hasChallenges || hasHabits) ? (
        <View style={styles.dashboard}>
          {/* Left column – Daily Completion Bonus */}
          <View style={styles.bonusCol}>
            <FontAwesome
              name={allComplete ? 'check-circle' : 'star'}
              size={18}
              color={allComplete ? '#4CAF50' : '#D4A44C'}
            />
            <Text style={[styles.bonusLabel, allComplete && styles.bonusLabelDone]}>
              {allComplete ? 'Bonus\nEarned!' : 'Daily\nBonus'}
            </Text>
            {hasHabits && (
              <View style={styles.bonusProgress}>
                <Text style={styles.bonusProgressText}>
                  {completedCount}/{totalCount}
                </Text>
                <ProgressBar
                  progress={totalCount > 0 ? completedCount / totalCount : 0}
                  height={3}
                  gradientColors={allComplete ? ['#4CAF50', '#66BB6A'] : ['#D4A44C', '#E8C97A']}
                  backgroundColor="rgba(255,255,255,0.12)"
                />
              </View>
            )}
            <View style={styles.bonusRewardRow}>
              <FontAwesome name="ticket" size={9} color="#D4A44C" />
              <Text style={styles.bonusRewardVal}>+{bonusTickets}</Text>
              <FontAwesome name="bolt" size={9} color="#E87D2F" />
              <Text style={styles.bonusRewardVal}>+{bonusXP}</Text>
            </View>
          </View>

          <View style={styles.dashDivider} />

          {/* Right column – All challenges */}
          <TouchableOpacity
            style={styles.challengeCol}
            activeOpacity={0.7}
            onPress={() => router.push('/challenges')}
          >
            <View style={styles.challengeColHeader}>
              <FontAwesome name="bullseye" size={11} color="#D4A44C" />
              <Text style={styles.challengeColTitle}>Challenges</Text>
              <Text style={styles.challengeColCount}>
                {completedChallenges}/{allChallenges.length}
              </Text>
            </View>

            {dailyChallenges.length > 0 && (
              <View style={styles.challengeGroup}>
                <Text style={styles.challengeGroupLabel}>Daily</Text>
                {dailyChallenges.map((c) => (
                  <ChallengeMiniRow key={c.id} challenge={c} />
                ))}
              </View>
            )}

            {weeklyChallenges.length > 0 && (
              <View style={styles.challengeGroup}>
                <Text style={[styles.challengeGroupLabel, { color: '#A78BFA' }]}>Weekly</Text>
                {weeklyChallenges.map((c) => (
                  <ChallengeMiniRow key={c.id} challenge={c} />
                ))}
              </View>
            )}
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
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

  // ── Two-column dashboard ──────────────────────────────
  dashboard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
  },

  // Left – bonus
  bonusCol: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bonusLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
  },
  bonusLabelDone: {
    color: '#4CAF50',
  },
  bonusProgress: {
    width: '100%',
    gap: 2,
  },
  bonusProgressText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  bonusRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  bonusRewardVal: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '700',
  },

  dashDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // Right – challenges
  challengeCol: {
    flex: 1,
    gap: 3,
  },
  challengeColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  challengeColTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    fontWeight: '700',
    flex: 1,
  },
  challengeColCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
  challengeGroup: {
    gap: 1,
  },
  challengeGroupLabel: {
    color: '#4ECDC4',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  challengeMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 1,
  },
  challengeMiniTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    flex: 1,
  },
  challengeMiniDone: {
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
  challengeMiniCount: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '600',
  },

  // ── Fallback stats row ──────────────────────────────
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

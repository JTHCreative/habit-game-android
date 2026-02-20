import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '../common/ProgressBar';
import { TicketBadge } from '../common/TicketBadge';
import { useUserStore } from '@/src/stores/useUserStore';
import { useChallengeStore } from '@/src/stores/useChallengeStore';
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

  const dailyCompleted = dailyChallenges.filter(
    (c) => c.status === 'completed' || c.status === 'claimed'
  ).length;
  const weeklyCompleted = weeklyChallenges.filter(
    (c) => c.status === 'completed' || c.status === 'claimed'
  ).length;

  const hasChallenges = dailyChallenges.length > 0 || weeklyChallenges.length > 0;
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
          {/* Left card – Daily Completion Bonus */}
          <View style={styles.bonusCard}>
            <FontAwesome
              name={allComplete ? 'check-circle' : 'star'}
              size={24}
              color={allComplete ? '#4CAF50' : '#D4A44C'}
            />
            <Text style={[styles.bonusLabel, allComplete && styles.bonusLabelDone]}>
              {allComplete ? 'Bonus Earned!' : 'Daily Bonus'}
            </Text>
            {hasHabits && (
              <View style={styles.bonusProgress}>
                <Text style={styles.bonusProgressText}>
                  {completedCount}/{totalCount} daily habits
                </Text>
                <ProgressBar
                  progress={totalCount > 0 ? completedCount / totalCount : 0}
                  height={4}
                  gradientColors={allComplete ? ['#4CAF50', '#66BB6A'] : ['#D4A44C', '#E8C97A']}
                  backgroundColor="rgba(255,255,255,0.12)"
                />
              </View>
            )}
            <View style={styles.bonusRewardRow}>
              <FontAwesome name="ticket" size={12} color="#D4A44C" />
              <Text style={styles.bonusRewardVal}>+{bonusTickets}</Text>
              <FontAwesome name="bolt" size={12} color="#E87D2F" />
              <Text style={styles.bonusRewardVal}>+{bonusXP} XP</Text>
            </View>
          </View>

          {/* Right card – Challenge status */}
          <TouchableOpacity
            style={styles.challengeCard}
            activeOpacity={0.7}
            onPress={() => router.push('/challenges')}
          >
            {/* Decorative corner icons */}
            <View style={styles.challengeDecoTopLeft}>
              <FontAwesome name="bookmark" size={10} color="rgba(167,139,250,0.3)" />
            </View>
            <View style={styles.challengeDecoTopRight}>
              <FontAwesome name="bookmark" size={10} color="rgba(78,205,196,0.3)" />
            </View>

            {/* Trophy header */}
            <View style={styles.challengeHeader}>
              <FontAwesome name="trophy" size={20} color="#D4A44C" />
              <Text style={styles.challengeTitle}>Challenges</Text>
            </View>

            {/* Daily row */}
            <View style={styles.challengeStatusRow}>
              <View style={styles.challengeIconWrap}>
                <FontAwesome name="certificate" size={18} color="#4ECDC4" />
              </View>
              <Text style={styles.challengeStatusLabel}>Daily</Text>
              <Text style={[
                styles.challengeStatusValue,
                dailyCompleted >= dailyChallenges.length && dailyChallenges.length > 0 && styles.challengeStatusDone,
              ]}>
                {dailyCompleted}/{dailyChallenges.length}
              </Text>
            </View>

            {/* Weekly row */}
            <View style={styles.challengeStatusRow}>
              <View style={styles.challengeIconWrap}>
                <FontAwesome name="shield" size={18} color="#A78BFA" />
              </View>
              <Text style={styles.challengeStatusLabel}>Weekly</Text>
              <Text style={[
                styles.challengeStatusValue,
                weeklyCompleted >= weeklyChallenges.length && weeklyChallenges.length > 0 && styles.challengeStatusDone,
              ]}>
                {weeklyCompleted}/{weeklyChallenges.length}
              </Text>
            </View>

            {/* Bottom decorative ribbon */}
            <View style={styles.challengeRibbon}>
              <FontAwesome name="star" size={8} color="rgba(212,164,76,0.5)" />
              <View style={styles.ribbonLine} />
              <FontAwesome name="diamond" size={7} color="rgba(212,164,76,0.4)" />
              <View style={styles.ribbonLine} />
              <FontAwesome name="star" size={8} color="rgba(212,164,76,0.5)" />
            </View>

            <Text style={styles.challengeTapHint}>Tap to view</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.statsRow}
          activeOpacity={0.7}
          onPress={() => router.push('/history')}
        >
          <View style={styles.stat}>
            <FontAwesome name="fire" size={16} color="#E87D2F" />
            <Text style={styles.statValue}>{profile.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <FontAwesome name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{profile.totalHabitsCompleted}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <FontAwesome name="trophy" size={16} color="#D4A44C" />
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

  // ── Two-card dashboard ──────────────────────────────
  dashboard: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Left card – bonus
  bonusCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  bonusLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  bonusLabelDone: {
    color: '#4CAF50',
  },
  bonusProgress: {
    width: '100%',
    gap: 3,
  },
  bonusProgressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  bonusRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  bonusRewardVal: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  // Right card – challenges
  challengeCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(212,164,76,0.15)',
    overflow: 'hidden',
  },
  challengeDecoTopLeft: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  challengeDecoTopRight: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  challengeTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  challengeIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  challengeStatusLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  challengeStatusValue: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  challengeStatusDone: {
    color: '#4CAF50',
  },
  challengeRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ribbonLine: {
    width: 16,
    height: 1,
    backgroundColor: 'rgba(212,164,76,0.25)',
  },
  challengeTapHint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: fontSize.xs,
    fontWeight: '500',
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

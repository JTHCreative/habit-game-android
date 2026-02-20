import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { AchievementCard } from '@/src/components/achievements/AchievementCard';
import { ChallengeCard } from '@/src/components/challenges/ChallengeCard';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { useChallengeStore } from '@/src/stores/useChallengeStore';
import { useUserStore } from '@/src/stores/useUserStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAchievementChecker } from '@/src/hooks/useAchievementChecker';

export default function ChallengesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const addXP = useUserStore((s) => s.addXP);
  const addTickets = useUserStore((s) => s.addTickets);
  const incrementMissionsCompleted = useUserStore((s) => s.incrementMissionsCompleted);
  const achievements = useUserStore((s) => s.achievements);
  const checkAchievements = useAchievementChecker();

  const dailyChallenges = useChallengeStore((s) => s.dailyChallenges);
  const weeklyChallenges = useChallengeStore((s) => s.weeklyChallenges);
  const refreshChallenges = useChallengeStore((s) => s.refreshChallenges);
  const claimChallenge = useChallengeStore((s) => s.claimChallenge);

  useEffect(() => {
    refreshChallenges();
  }, []);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);
  const achievementProgress = achievements.length > 0
    ? unlockedAchievements.length / achievements.length
    : 0;

  const handleClaim = (challengeId: string) => {
    const reward = claimChallenge(challengeId);
    if (reward) {
      addXP(reward.xp);
      addTickets(reward.tickets);
      incrementMissionsCompleted();
      checkAchievements();
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FontAwesome name="bullseye" size={28} color="#D4A44C" />
          <Text style={styles.headerTitle}>Challenges</Text>
          <Text style={styles.headerSubtitle}>
            Complete objectives to earn big rewards
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenges */}
        <View style={styles.challengeSection}>
          <View style={styles.challengeSectionHeader}>
            <View style={[styles.challengeBadge, { backgroundColor: '#4ECDC420' }]}>
              <FontAwesome name="sun-o" size={14} color="#4ECDC4" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>
              Daily Challenges
            </Text>
            <Text style={[styles.refreshLabel, { color: colors.textMuted }]}>
              Resets at 12am PST
            </Text>
          </View>
          {dailyChallenges.length > 0 ? (
            dailyChallenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onClaim={() => handleClaim(c.id)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Loading challenges...
            </Text>
          )}
        </View>

        {/* Weekly Challenges */}
        <View style={styles.challengeSection}>
          <View style={styles.challengeSectionHeader}>
            <View style={[styles.challengeBadge, { backgroundColor: '#A78BFA20' }]}>
              <FontAwesome name="calendar" size={14} color="#A78BFA" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>
              Weekly Challenges
            </Text>
            <Text style={[styles.refreshLabel, { color: colors.textMuted }]}>
              Resets Sundays 12am PST
            </Text>
          </View>
          {weeklyChallenges.length > 0 ? (
            weeklyChallenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onClaim={() => handleClaim(c.id)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Loading challenges...
            </Text>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.achievementSection}>
          <View style={styles.achievementHeader}>
            <FontAwesome name="trophy" size={18} color="#D4A44C" />
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>
              Achievements ({unlockedAchievements.length}/{achievements.length})
            </Text>
          </View>
          <ProgressBar
            progress={achievementProgress}
            height={6}
            gradientColors={['#D4A44C', '#E87D2F']}
            backgroundColor={colors.inputBackground}
          />
          {lockedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
          {unlockedAchievements.length > 0 && (
            <>
              <Text style={[styles.achievementSubLabel, { color: colors.textSecondary }]}>
                Earned
              </Text>
              {unlockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    gap: spacing.xs,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.md,
    flex: 1,
  },
  challengeSection: {
    marginBottom: spacing.lg,
  },
  challengeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  challengeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshLabel: {
    fontSize: fontSize.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  achievementSection: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  achievementSubLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { MissionCard } from '@/src/components/missions/MissionCard';
import { AchievementCard } from '@/src/components/achievements/AchievementCard';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { useMissionStore } from '@/src/stores/useMissionStore';
import { useUserStore } from '@/src/stores/useUserStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAchievementChecker } from '@/src/hooks/useAchievementChecker';

export default function ChallengesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const profile = useUserStore((s) => s.profile);
  const addXP = useUserStore((s) => s.addXP);
  const addTokens = useUserStore((s) => s.addTokens);
  const incrementMissionsCompleted = useUserStore((s) => s.incrementMissionsCompleted);
  const achievements = useUserStore((s) => s.achievements);
  const checkAchievements = useAchievementChecker();
  const missions = useMissionStore((s) => s.missions);
  const claimMissionReward = useMissionStore((s) => s.claimMissionReward);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);
  const achievementProgress = achievements.length > 0
    ? unlockedAchievements.length / achievements.length
    : 0;

  const available = missions.filter(
    (m) => m.requiredLevel <= profile.level && m.status !== 'locked' && m.status !== 'claimed'
  );
  const locked = missions.filter(
    (m) => m.requiredLevel > profile.level || m.status === 'locked'
  );
  const claimed = missions.filter((m) => m.status === 'claimed');

  const handleClaim = (missionId: string) => {
    const reward = claimMissionReward(missionId);
    if (reward) {
      addXP(reward.xp);
      addTokens(reward.tokens);
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
        {available.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available ({available.length})
            </Text>
            {available.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={() => handleClaim(mission.id)}
              />
            ))}
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Locked ({locked.length})
            </Text>
            <View style={styles.lockedContainer}>
              {locked.map((mission) => (
                <View
                  key={mission.id}
                  style={[
                    styles.lockedCard,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                >
                  <FontAwesome name="lock" size={20} color={colors.textMuted} />
                  <View style={styles.lockedInfo}>
                    <Text style={[styles.lockedTitle, { color: colors.textMuted }]}>
                      {mission.title}
                    </Text>
                    <Text style={[styles.lockedLevel, { color: colors.textMuted }]}>
                      Unlocks at Level {mission.requiredLevel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {claimed.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Completed ({claimed.length})
            </Text>
            {claimed.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </>
        )}

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
  lockedContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  lockedInfo: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  lockedLevel: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});

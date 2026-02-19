import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { TicketBadge } from '../common/TicketBadge';
import { XPBadge } from '../common/XPBadge';
import { Mission } from '@/src/types';
import { MISSION_DIFFICULTY_COLORS } from '@/src/utils/levels';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface MissionCardProps {
  mission: Mission;
  onClaim?: () => void;
}

export function MissionCard({ mission, onClaim }: MissionCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const difficultyColor = MISSION_DIFFICULTY_COLORS[mission.difficulty];

  const totalProgress = mission.objectives.reduce(
    (acc, obj) => acc + obj.currentCount,
    0
  );
  const totalTarget = mission.objectives.reduce(
    (acc, obj) => acc + obj.targetCount,
    0
  );
  const progress = totalTarget > 0 ? totalProgress / totalTarget : 0;

  const isClaimable = mission.status === 'completed';
  const isClaimed = mission.status === 'claimed';

  return (
    <Card style={[styles.container, isClaimed ? styles.claimed : undefined]}>
      <View style={styles.header}>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: difficultyColor + '20' },
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: difficultyColor },
            ]}
          >
            {mission.difficulty.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.level, { color: colors.textMuted }]}>
          Lv. {mission.requiredLevel}+
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {mission.title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {mission.description}
      </Text>

      {mission.objectives.map((obj) => (
        <View key={obj.id} style={styles.objective}>
          <View style={styles.objectiveHeader}>
            <Text style={[styles.objectiveText, { color: colors.textSecondary }]}>
              {obj.description}
            </Text>
            <Text style={[styles.objectiveCount, { color: colors.textMuted }]}>
              {obj.currentCount}/{obj.targetCount}
            </Text>
          </View>
          <ProgressBar
            progress={obj.currentCount / obj.targetCount}
            height={6}
            gradientColors={[difficultyColor, difficultyColor + 'CC']}
            backgroundColor={colors.inputBackground}
          />
        </View>
      ))}

      <View style={styles.footer}>
        <View style={styles.rewardRow}>
          <TicketBadge amount={mission.tokenReward} size="small" />
          <XPBadge amount={mission.xpReward} size="small" />
        </View>

        {isClaimable && onClaim && (
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: colors.success }]}
            onPress={onClaim}
          >
            <FontAwesome name="gift" size={14} color="#FFF" />
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        )}

        {isClaimed && (
          <View style={[styles.claimedBadge]}>
            <FontAwesome name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.claimedText, { color: colors.success }]}>
              Claimed
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  claimed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  level: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  objective: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  objectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  objectiveText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  objectiveCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#3A3A55',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  claimText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { TicketBadge } from '../common/TicketBadge';
import { XPBadge } from '../common/XPBadge';
import { Challenge } from '@/src/stores/useChallengeStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim?: () => void;
}

const TYPE_COLORS = {
  daily: '#4ECDC4',
  weekly: '#A78BFA',
};

export function ChallengeCard({ challenge, onClaim }: ChallengeCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const typeColor = TYPE_COLORS[challenge.type];
  const progress = challenge.targetCount > 0 ? challenge.currentCount / challenge.targetCount : 0;
  const isClaimable = challenge.status === 'completed';
  const isClaimed = challenge.status === 'claimed';

  return (
    <Card style={[styles.container, isClaimed && styles.claimed]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: typeColor + '20' }]}>
          <FontAwesome name={challenge.icon as any} size={18} color={typeColor} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {challenge.title}
            </Text>
            {challenge.pinned && (
              <FontAwesome name="thumb-tack" size={10} color={colors.textMuted} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
            {challenge.description}
          </Text>
        </View>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {challenge.currentCount}/{challenge.targetCount}
        </Text>
      </View>

      <ProgressBar
        progress={progress}
        height={5}
        gradientColors={[typeColor, typeColor + 'CC']}
        backgroundColor={colors.inputBackground}
      />

      <View style={styles.footer}>
        <View style={styles.rewardRow}>
          <TicketBadge amount={challenge.ticketReward} size="small" />
          <XPBadge amount={challenge.xpReward} size="small" />
        </View>

        {isClaimable && onClaim && (
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: colors.success }]}
            onPress={onClaim}
          >
            <FontAwesome name="gift" size={12} color="#FFF" />
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        )}

        {isClaimed && (
          <View style={styles.claimedBadge}>
            <FontAwesome name="check-circle" size={13} color={colors.success} />
            <Text style={[styles.claimedText, { color: colors.success }]}>Done</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  claimed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  count: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  claimText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontWeight: '600',
    fontSize: fontSize.xs,
  },
});

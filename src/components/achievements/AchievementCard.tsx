import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { TicketBadge } from '../common/TicketBadge';
import { XPBadge } from '../common/XPBadge';
import { Achievement } from '@/src/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface AchievementCardProps {
  achievement: Achievement;
  onClaim?: () => void;
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  star: 'star',
  fire: 'fire',
  trophy: 'trophy',
  shield: 'shield',
  target: 'bullseye',
  gem: 'ticket',
  award: 'certificate',
  crown: 'star',
};

export function AchievementCard({ achievement, onClaim }: AchievementCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const iconName = ACHIEVEMENT_ICONS[achievement.icon] || 'trophy';
  const isClaimed = achievement.isUnlocked;

  return (
    <Card style={[styles.container, isClaimed ? styles.claimed : undefined]}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isClaimed
                ? '#D4A44C20'
                : colors.inputBackground,
            },
          ]}
        >
          <FontAwesome
            name={isClaimed ? (iconName as any) : 'lock'}
            size={24}
            color={isClaimed ? '#D4A44C' : colors.textMuted}
          />
        </View>
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              { color: isClaimed ? colors.text : colors.textSecondary },
            ]}
          >
            {achievement.title}
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            {achievement.description}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.rewardRow}>
          <TicketBadge amount={achievement.ticketReward} size="small" />
          <XPBadge amount={achievement.xpReward} size="small" />
        </View>

        {isClaimed && (
          <View style={styles.claimedBadge}>
            <FontAwesome name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.claimedText, { color: colors.success }]}>
              Earned
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
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 18,
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

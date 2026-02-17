import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { TokenBadge } from '../common/TokenBadge';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Reward } from '@/src/types';

const REWARD_CATEGORY_COLORS: Record<string, string> = {
  self_care: '#E8C97A',
  entertainment: '#E87D2F',
  treat: '#F0A060',
  experience: '#D4A44C',
  custom: '#CF6B30',
};

const REWARD_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  film: 'film',
  coffee: 'coffee',
  moon: 'moon-o',
  play: 'gamepad',
  droplet: 'tint',
  'book-open': 'book',
  'map-pin': 'map-marker',
  sun: 'sun-o',
};

interface RewardCardProps {
  reward: Reward;
  canAfford: boolean;
  onPurchase?: () => void;
  onRedeem?: () => void;
}

export function RewardCard({
  reward,
  canAfford,
  onPurchase,
  onRedeem,
}: RewardCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const categoryColor = REWARD_CATEGORY_COLORS[reward.category] || colors.primary;
  const iconName = REWARD_ICONS[reward.icon] || 'star';

  return (
    <Card style={styles.container}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: categoryColor + '20' },
          ]}
        >
          <FontAwesome name={iconName} size={24} color={categoryColor} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]}>
            {reward.name}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {reward.description}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TokenBadge amount={reward.tokenCost} size="medium" />

        {!reward.isPurchased && onPurchase && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: canAfford ? colors.primary : colors.inputBackground,
              },
            ]}
            onPress={onPurchase}
            disabled={!canAfford}
          >
            <Text
              style={[
                styles.buttonText,
                { color: canAfford ? '#FFF' : colors.textMuted },
              ]}
            >
              {canAfford ? 'Purchase' : 'Not enough'}
            </Text>
          </TouchableOpacity>
        )}

        {reward.isPurchased && !reward.isRedeemed && onRedeem && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={onRedeem}
          >
            <FontAwesome name="gift" size={14} color="#FFF" />
            <Text style={styles.buttonText}>Redeem</Text>
          </TouchableOpacity>
        )}

        {reward.isRedeemed && (
          <View style={styles.redeemedBadge}>
            <FontAwesome name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.redeemedText, { color: colors.success }]}>
              Redeemed
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#3A3A55',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  redeemedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  redeemedText: {
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});

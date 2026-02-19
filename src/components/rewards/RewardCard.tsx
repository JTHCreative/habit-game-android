import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import { TicketBadge } from '../common/TicketBadge';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Reward } from '@/src/types';

export const REWARD_CATEGORY_COLORS: Record<string, string> = {
  self_care: '#E8C97A',
  entertainment: '#E87D2F',
  treat: '#F0A060',
  experience: '#D4A44C',
  custom: '#CF6B30',
};

export const REWARD_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  film: 'film',
  coffee: 'coffee',
  moon: 'moon-o',
  play: 'gamepad',
  droplet: 'tint',
  'book-open': 'book',
  'map-pin': 'map-marker',
  sun: 'sun-o',
};

export const PERIOD_LABELS: Record<string, string> = {
  daily: 'today',
  weekly: 'this week',
  monthly: 'this month',
  yearly: 'this year',
};

interface RewardCardProps {
  reward: Reward;
  canAfford: boolean;
  onPurchase?: () => void;
  onLongPress?: () => void;
}

export function RewardCard({
  reward,
  canAfford,
  onPurchase,
  onLongPress,
}: RewardCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const categoryColor = REWARD_CATEGORY_COLORS[reward.category] || colors.primary;
  const iconName = REWARD_ICONS[reward.icon] || 'star';
  const hasStock = reward.remainingQuantity > 0;
  const canBuy = canAfford && hasStock;
  const periodLabel = PERIOD_LABELS[reward.replenishPeriod] || '';

  const MUTED_GREY = '#9CA3AF';
  const displayColor = hasStock ? categoryColor : MUTED_GREY;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
    <Card style={[styles.container, !hasStock && { opacity: 0.75 }]}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: displayColor + '20' },
          ]}
        >
          <FontAwesome name={iconName} size={24} color={displayColor} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: hasStock ? colors.text : colors.textMuted }]}>
            {reward.name}
          </Text>
          <Text style={[styles.description, { color: hasStock ? colors.textSecondary : colors.textMuted }]}>
            {reward.description}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TicketBadge amount={reward.tokenCost} size="medium" />
          <View style={[styles.quantityBadge, { backgroundColor: hasStock ? categoryColor + '20' : MUTED_GREY + '20' }]}>
            <Text style={[styles.quantityText, { color: hasStock ? categoryColor : MUTED_GREY }]}>
              {reward.remainingQuantity} remaining {periodLabel}
            </Text>
          </View>
        </View>

        {hasStock && onPurchase && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: canBuy ? colors.primary : colors.inputBackground,
              },
            ]}
            onPress={onPurchase}
            disabled={!canBuy}
          >
            <Text
              style={[
                styles.buttonText,
                { color: canBuy ? '#FFF' : colors.textMuted },
              ]}
            >
              {canAfford ? 'Claim' : 'Not enough'}
            </Text>
          </TouchableOpacity>
        )}

        {!hasStock && (
          <View style={[styles.outOfStockBadge, { backgroundColor: '#EF444420' }]}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
    </Card>
    </TouchableOpacity>
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
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  quantityText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
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
  outOfStockBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  outOfStockText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});

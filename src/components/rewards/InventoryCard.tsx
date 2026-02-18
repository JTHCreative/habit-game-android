import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '../common/Card';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { InventoryItem } from '@/src/types';
import { REWARD_CATEGORY_COLORS, REWARD_ICONS, PERIOD_LABELS } from './RewardCard';

interface InventoryCardProps {
  item: InventoryItem;
  onRedeem?: () => void;
}

export function InventoryCard({ item, onRedeem }: InventoryCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const categoryColor = REWARD_CATEGORY_COLORS[item.rewardCategory] || colors.primary;
  const iconName = REWARD_ICONS[item.rewardIcon] || 'star';
  const periodLabel = PERIOD_LABELS[item.replenishPeriod] || '';
  const remaining = item.quantity - item.redeemedCount;
  const allRedeemed = remaining <= 0;

  const MUTED_GREY = '#9CA3AF';
  const displayColor = allRedeemed ? MUTED_GREY : categoryColor;

  return (
    <Card style={[styles.container, allRedeemed && { opacity: 0.7 }]}>
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
          <Text style={[styles.name, { color: allRedeemed ? colors.textMuted : colors.text }]}>
            {item.rewardName}
          </Text>
          <Text style={[styles.description, { color: allRedeemed ? colors.textMuted : colors.textSecondary }]}>
            {item.rewardDescription}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {item.redeemedCount > 0 && (
            <View style={styles.greenBadge}>
              <FontAwesome name="check" size={10} color="#22C55E" />
              <Text style={styles.greenBadgeText}>
                {item.redeemedCount} redeemed
              </Text>
            </View>
          )}
          <View style={[styles.remainingBadge, { backgroundColor: displayColor + '20' }]}>
            <Text style={[styles.remainingText, { color: displayColor }]}>
              {remaining} left {periodLabel}
            </Text>
          </View>
        </View>

        {allRedeemed ? (
          <View style={[styles.redeemButton, { backgroundColor: '#3A3A55' }]}>
            <FontAwesome name="check" size={12} color="#E8C97A" />
            <Text style={[styles.redeemButtonText, { color: '#E8C97A' }]}>Redeemed</Text>
          </View>
        ) : onRedeem ? (
          <TouchableOpacity
            style={[styles.redeemButton, { backgroundColor: '#22C55E' }]}
            onPress={onRedeem}
          >
            <FontAwesome name="check" size={12} color="#FFF" />
            <Text style={styles.redeemButtonText}>Redeem</Text>
          </TouchableOpacity>
        ) : null}
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
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  greenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22C55E20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  greenBadgeText: {
    color: '#22C55E',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  remainingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  remainingText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  redeemedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  redeemedText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  redeemButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});

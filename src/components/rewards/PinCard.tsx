import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { DynamicIcon } from '../common/DynamicIcon';
import { TicketBadge } from '../common/TicketBadge';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pin, PinRarity } from '@/src/types';

const RARITY_COLORS: Record<PinRarity, string> = {
  common: '#8B9DAF',
  uncommon: '#4CAF50',
  rare: '#3B82F6',
  legendary: '#D4A44C',
};

const RARITY_LABELS: Record<PinRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
};

interface PinCardProps {
  pin: Pin;
  collected: boolean;
  canAfford: boolean;
  onPurchase?: () => void;
}

export function PinCard({ pin, collected, canAfford, onPurchase }: PinCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const rarityColor = RARITY_COLORS[pin.rarity];

  if (collected) {
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: rarityColor }]}>
        <View style={[styles.pinCircle, { backgroundColor: pin.color + '18', borderColor: pin.color }]}>
          <DynamicIcon name={pin.icon} size={28} color={pin.color} />
        </View>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {pin.name}
        </Text>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {RARITY_LABELS[pin.rarity]}
          </Text>
        </View>
        <View style={styles.collectedBadge}>
          <FontAwesome name="check-circle" size={14} color="#4CAF50" />
          <Text style={styles.collectedText}>Collected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>
      <View style={[styles.pinCircle, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <DynamicIcon name={pin.icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {pin.name}
      </Text>
      <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
        {pin.description}
      </Text>
      <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
        <Text style={[styles.rarityText, { color: rarityColor }]}>
          {RARITY_LABELS[pin.rarity]}
        </Text>
      </View>
      <View style={styles.costRow}>
        <TicketBadge amount={pin.ticketCost} size="small" />
      </View>
      {onPurchase && (
        <TouchableOpacity
          style={[
            styles.buyButton,
            {
              backgroundColor: canAfford ? colors.primary : colors.inputBackground,
            },
          ]}
          onPress={onPurchase}
          disabled={!canAfford}
        >
          <Text
            style={[
              styles.buyButtonText,
              { color: canAfford ? '#FFF' : colors.textMuted },
            ]}
          >
            {canAfford ? 'Buy' : 'Need more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%' as any,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  pinCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  collectedText: {
    color: '#4CAF50',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  costRow: {
    marginTop: 2,
  },
  buyButton: {
    width: '100%',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buyButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/Colors';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface TicketBadgeProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'gold' | 'dark';
}

export function TicketBadge({ amount, size = 'medium', variant = 'gold' }: TicketBadgeProps) {
  const sizeConfig = {
    small: { iconSize: 10, textSize: fontSize.xs, px: spacing.xs, py: 2 },
    medium: { iconSize: 14, textSize: fontSize.sm, px: spacing.sm, py: spacing.xs },
    large: { iconSize: 18, textSize: fontSize.lg, px: spacing.md, py: spacing.sm },
  };

  const config = sizeConfig[size];
  const padStyle = {
    paddingHorizontal: config.px,
    paddingVertical: config.py,
  };

  if (variant === 'dark') {
    return (
      <View style={[styles.badge, styles.darkBadge, padStyle]}>
        <FontAwesome name="ticket" size={config.iconSize} color="#F5C842" />
        <Text style={[styles.text, { fontSize: config.textSize, color: '#F5C842' }]}>
          {amount.toLocaleString()}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradients.gold}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.badge, padStyle]}
    >
      <FontAwesome name="ticket" size={config.iconSize} color="#FFF" />
      <Text style={[styles.text, { fontSize: config.textSize }]}>
        {amount.toLocaleString()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: borderRadius.full,
  },
  darkBadge: {
    backgroundColor: '#2A2A3E',
    borderWidth: 1.5,
    borderColor: '#D4A843',
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
  },
});

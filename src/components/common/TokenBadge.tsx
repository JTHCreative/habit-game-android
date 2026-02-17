import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/Colors';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface TokenBadgeProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
}

export function TokenBadge({ amount, size = 'medium' }: TokenBadgeProps) {
  const sizeConfig = {
    small: { iconSize: 10, textSize: fontSize.xs, px: spacing.xs, py: 2 },
    medium: { iconSize: 14, textSize: fontSize.sm, px: spacing.sm, py: spacing.xs },
    large: { iconSize: 18, textSize: fontSize.lg, px: spacing.md, py: spacing.sm },
  };

  const config = sizeConfig[size];

  return (
    <LinearGradient
      colors={gradients.gold}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.badge,
        {
          paddingHorizontal: config.px,
          paddingVertical: config.py,
        },
      ]}
    >
      <FontAwesome name="diamond" size={config.iconSize} color="#FFF" />
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
  text: {
    color: '#FFF',
    fontWeight: '700',
  },
});

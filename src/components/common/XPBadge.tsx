import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/Colors';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface XPBadgeProps {
  amount: number;
  size?: 'small' | 'medium';
}

export function XPBadge({ amount, size = 'medium' }: XPBadgeProps) {
  const isSmall = size === 'small';

  return (
    <LinearGradient
      colors={gradients.secondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.badge,
        {
          paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
          paddingVertical: isSmall ? 2 : spacing.xs,
        },
      ]}
    >
      <FontAwesome
        name="bolt"
        size={isSmall ? 10 : 14}
        color="#FFF"
      />
      <Text
        style={[
          styles.text,
          { fontSize: isSmall ? fontSize.xs : fontSize.sm },
        ]}
      >
        {amount} XP
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

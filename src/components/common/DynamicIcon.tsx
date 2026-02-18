import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface DynamicIconProps {
  name: string;
  size: number;
  color: string;
}

/**
 * Renders an icon from FontAwesome or MaterialCommunityIcons.
 * Use plain names (e.g. 'heart') for FontAwesome 4.
 * Use 'mci:' prefix (e.g. 'mci:dumbbell') for MaterialCommunityIcons.
 */
export function DynamicIcon({ name, size, color }: DynamicIconProps) {
  if (name.startsWith('mci:')) {
    const iconName = name.slice(4);
    return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
  }
  return <FontAwesome name={name as any} size={size} color={color} />;
}

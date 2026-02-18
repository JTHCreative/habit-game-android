/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useSettingsStore, FONT_OPTIONS } from '@/src/stores/useSettingsStore';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

const BOLD_WEIGHTS = new Set(['700', '800', '900', 'bold']);

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const fontKey = useSettingsStore((s) => s.fontKey);

  if (fontKey === 'system') {
    return <DefaultText style={[{ color }, style]} {...otherProps} />;
  }

  const option = FONT_OPTIONS.find((f) => f.key === fontKey);
  if (!option) {
    return <DefaultText style={[{ color }, style]} {...otherProps} />;
  }

  // Determine if bold variant should be used based on the resolved style
  const flat = StyleSheet.flatten(style);
  const weight = flat?.fontWeight;
  const isBold = weight != null && BOLD_WEIGHTS.has(String(weight));
  const fontFamily = isBold ? option.bold : option.regular;

  return (
    <DefaultText style={[{ color }, style, { fontFamily }]} {...otherProps} />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '@/src/components/common/Card';
import { useSettingsStore, FONT_OPTIONS, FontKey } from '@/src/stores/useSettingsStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const fontKey = useSettingsStore((s) => s.fontKey);
  const setFontKey = useSettingsStore((s) => s.setFontKey);

  const getFontFamily = (key: FontKey) => {
    const option = FONT_OPTIONS.find((f) => f.key === key);
    return option?.regular || undefined;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          App Font
        </Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Choose a font for the entire app
        </Text>

        <View style={styles.fontGrid}>
          {FONT_OPTIONS.map((option) => {
            const isSelected = fontKey === option.key;
            const previewFamily = getFontFamily(option.key);

            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.7}
                onPress={() => setFontKey(option.key)}
              >
                <Card
                  style={[
                    styles.fontCard,
                    isSelected && {
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={styles.fontCardHeader}>
                    <Text
                      style={[
                        styles.fontPreview,
                        { color: colors.text },
                        previewFamily ? { fontFamily: previewFamily } : undefined,
                      ]}
                    >
                      Aa
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <FontAwesome name="check" size={10} color="#FFF" />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.fontName,
                      { color: colors.text },
                      previewFamily ? { fontFamily: previewFamily } : undefined,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={[styles.fontDesc, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                  <Text
                    style={[
                      styles.fontSample,
                      { color: colors.textMuted },
                      previewFamily ? { fontFamily: previewFamily } : undefined,
                    ]}
                  >
                    The quick brown fox jumps over the lazy dog
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  fontGrid: {
    gap: spacing.sm,
  },
  fontCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  fontCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
  },
  fontPreview: {
    fontSize: 36,
    fontWeight: '700',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  fontDesc: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  fontSample: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '@/src/components/common/Card';
import { useSettingsStore, FONT_OPTIONS, FontKey } from '@/src/stores/useSettingsStore';
import { useUserStore } from '@/src/stores/useUserStore';
import { useHabitStore } from '@/src/stores/useHabitStore';
import { useMissionStore } from '@/src/stores/useMissionStore';
import { useChallengeStore } from '@/src/stores/useChallengeStore';
import { usePinStore } from '@/src/stores/usePinStore';
import { useSkillTreeStore } from '@/src/stores/useSkillTreeStore';
import { useRewardStore } from '@/src/stores/useRewardStore';
import { useCategoryStore } from '@/src/stores/useCustomCategoryStore';
import { useRewardCategoryStore } from '@/src/stores/useRewardCategoryStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

type SettingsTab = 'font' | 'account';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const fontKey = useSettingsStore((s) => s.fontKey);
  const setFontKey = useSettingsStore((s) => s.setFontKey);
  const [activeTab, setActiveTab] = useState<SettingsTab>('font');

  const resetProfile = useUserStore((s) => s.resetProfile);
  const resetHabits = useHabitStore((s) => s.resetAll);
  const resetMissions = useMissionStore((s) => s.resetAll);
  const resetChallenges = useChallengeStore((s) => s.resetAll);
  const resetPins = usePinStore((s) => s.resetAll);
  const resetSkillTree = useSkillTreeStore((s) => s.resetAll);
  const resetRewards = useRewardStore((s) => s.resetAll);
  const resetCategories = useCategoryStore((s) => s.resetAll);
  const resetRewardCategories = useRewardCategoryStore((s) => s.resetAll);

  const getFontFamily = (key: FontKey) => {
    const option = FONT_OPTIONS.find((f) => f.key === key);
    return option?.regular || undefined;
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'This will permanently erase all your habits, history, achievements, pins, challenges, tickets, and level progress. This cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetProfile();
            resetHabits();
            resetMissions();
            resetChallenges();
            resetPins();
            resetSkillTree();
            resetRewards();
            resetCategories();
            resetRewardCategories();
            Alert.alert('Progress Reset', 'All your data has been reset to a fresh start.');
          },
        },
      ]
    );
  };

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'font', label: 'Font', icon: 'font' },
    { key: 'account', label: 'Account', icon: 'user-circle' },
  ];

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

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <FontAwesome
                name={tab.icon as any}
                size={14}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.textMuted },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'font' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                    <View style={styles.fontCardRow}>
                      <Text
                        style={[
                          styles.fontPreview,
                          { color: colors.text },
                          previewFamily ? { fontFamily: previewFamily } : undefined,
                        ]}
                      >
                        Aa
                      </Text>
                      <View style={styles.fontCardInfo}>
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
                      </View>
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
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {activeTab === 'account' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Manage your account and app data
          </Text>

          <View style={styles.accountSection}>
            <Text style={[styles.dangerLabel, { color: colors.error }]}>
              Danger Zone
            </Text>
            <Card style={styles.dangerCard}>
              <View style={styles.dangerCardContent}>
                <View style={styles.dangerCardInfo}>
                  <Text style={[styles.dangerTitle, { color: colors.text }]}>
                    Reset All Progress
                  </Text>
                  <Text style={[styles.dangerDesc, { color: colors.textSecondary }]}>
                    Erase all habits, history, achievements, pins, challenges,
                    tickets, and level progress. Start completely fresh.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetProgress}
                >
                  <FontAwesome name="trash" size={14} color="#FFF" />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </ScrollView>
      )}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionDesc: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  fontGrid: {
    gap: spacing.sm,
  },
  fontCard: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  fontCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  fontPreview: {
    fontSize: 28,
    fontWeight: '700',
    width: 44,
    textAlign: 'center',
  },
  fontCardInfo: {
    flex: 1,
  },
  fontName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 1,
  },
  fontDesc: {
    fontSize: fontSize.xs,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountSection: {
    gap: spacing.sm,
  },
  dangerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dangerCard: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  dangerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  dangerCardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  dangerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  dangerDesc: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#EF4444',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});

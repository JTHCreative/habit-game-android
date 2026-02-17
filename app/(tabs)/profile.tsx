import React, { useState, useRef } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '@/src/components/common/Card';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { useUserStore } from '@/src/stores/useUserStore';
import { useHabitStore } from '@/src/stores/useHabitStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const profile = useUserStore((s) => s.profile);
  const setProfileImage = useUserStore((s) => s.setProfileImage);
  const setDisplayName = useUserStore((s) => s.setDisplayName);
  const achievements = useUserStore((s) => s.achievements);
  const habits = useHabitStore((s) => s.habits);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.displayName);
  const nameInputRef = useRef<TextInput>(null);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const achievementProgress = achievements.length > 0
    ? unlockedAchievements.length / achievements.length
    : 0;

  const xpProgress = profile.xpToNextLevel > 0
    ? profile.currentXP / profile.xpToNextLevel
    : 0;

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to set a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleEditName = () => {
    setEditedName(profile.displayName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (trimmed.length > 0) {
      setDisplayName(trimmed);
    } else {
      setEditedName(profile.displayName);
    }
    setIsEditingName(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7} style={styles.avatarWrapper}>
            <View style={styles.avatarLarge}>
              {profile.profileImageUri ? (
                <Image
                  source={{ uri: profile.profileImageUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <FontAwesome name="user" size={48} color="#D4A44C" />
              )}
            </View>
            <View style={styles.cameraIcon}>
              <FontAwesome name="camera" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.nameRow}>
            {isEditingName ? (
              <TextInput
                ref={nameInputRef}
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                maxLength={20}
                returnKeyType="done"
                selectTextOnFocus
              />
            ) : (
              <Text style={styles.profileName}>{profile.displayName}</Text>
            )}
            <TouchableOpacity
              onPress={isEditingName ? handleSaveName : handleEditName}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name={isEditingName ? 'check' : 'pencil'}
                size={16}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileTitle}>{profile.title}</Text>
          <View style={styles.levelSection}>
            <Text style={styles.levelLabel}>Level {profile.level}</Text>
            <ProgressBar
              progress={xpProgress}
              height={10}
              gradientColors={['#D4A44C', '#E8C97A']}
              backgroundColor="rgba(255,255,255,0.15)"
            />
            <Text style={styles.xpText}>
              {profile.currentXP} / {profile.xpToNextLevel} XP
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Statistics
          </Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <FontAwesome name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.totalHabitsCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Habits Done
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <FontAwesome name="fire" size={24} color="#E87D2F" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <FontAwesome name="diamond" size={24} color="#D4A44C" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.totalTokensEarned}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tokens Earned
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <FontAwesome name="crosshairs" size={24} color="#E87D2F" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.totalMissionsCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Challenges
              </Text>
            </Card>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </Text>
          <ProgressBar
            progress={achievementProgress}
            height={6}
            gradientColors={['#D4A44C', '#E87D2F']}
            backgroundColor={colors.inputBackground}
          />
          <View style={styles.achievementGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  {
                    backgroundColor: achievement.isUnlocked
                      ? colors.primary + '20'
                      : colors.inputBackground,
                    borderColor: achievement.isUnlocked
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <FontAwesome
                  name={achievement.isUnlocked ? 'trophy' : 'lock'}
                  size={20}
                  color={
                    achievement.isUnlocked ? '#D4A44C' : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.achievementTitle,
                    {
                      color: achievement.isUnlocked
                        ? colors.text
                        : colors.textMuted,
                    },
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDesc,
                    { color: colors.textMuted },
                  ]}
                  numberOfLines={2}
                >
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Active Habits ({habits.filter((h) => h.isActive).length})
          </Text>
          {habits.filter((h) => h.isActive).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No active habits. Go to the Home tab to add some!
            </Text>
          ) : (
            habits
              .filter((h) => h.isActive)
              .map((habit) => (
                <Card key={habit.id} style={styles.habitSummary}>
                  <View style={styles.habitSummaryRow}>
                    <View
                      style={[
                        styles.habitDot,
                        { backgroundColor: habit.color },
                      ]}
                    />
                    <View style={styles.habitSummaryInfo}>
                      <Text style={[styles.habitName, { color: colors.text }]}>
                        {habit.name}
                      </Text>
                      <Text
                        style={[
                          styles.habitMeta,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {habit.currentStreak} day streak | {habit.completedDates.length} total
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D4A44C',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    backgroundColor: '#D4A44C',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A2A3D',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameInput: {
    color: '#FFF',
    fontSize: fontSize.xxl,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 0,
    paddingHorizontal: 2,
    minWidth: 100,
    textAlign: 'center',
  },
  profileName: {
    color: '#FFF',
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  profileTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  levelSection: {
    width: '100%',
    gap: spacing.xs,
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  xpText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  body: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  achievementItem: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  achievementTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  habitSummary: {
    marginBottom: spacing.sm,
  },
  habitSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  habitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  habitSummaryInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  habitMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: spacing.lg,
  },
});

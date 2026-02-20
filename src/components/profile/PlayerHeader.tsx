import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Modal, ScrollView, Platform, StatusBar } from 'react-native';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../common/ProgressBar';
import { TicketBadge } from '../common/TicketBadge';
import { DynamicIcon } from '../common/DynamicIcon';
import { useUserStore } from '@/src/stores/useUserStore';
import { usePinStore, ALL_PINS, PIN_BOARD_SLOTS } from '@/src/stores/usePinStore';
import { useSkillTreeStore, SKILL_TREE_PINS } from '@/src/stores/useSkillTreeStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pin, PinRarity } from '@/src/types';

const RARITY_COLORS: Record<PinRarity, string> = {
  common: '#8B9DAF',
  uncommon: '#4CAF50',
  rare: '#3B82F6',
  legendary: '#D4A44C',
};

export function PlayerHeader() {
  const profile = useUserStore((s) => s.profile);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const xpProgress = profile.xpToNextLevel > 0
    ? profile.currentXP / profile.xpToNextLevel
    : 0;

  const board = usePinStore((s) => s.board);
  const collected = usePinStore((s) => s.collected);
  const setBoardSlot = usePinStore((s) => s.setBoardSlot);
  const skillTreeUnlocked = useSkillTreeStore((s) => s.unlocked);

  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Combine shop pins and unlocked skill tree pins
  const shopPins: Pin[] = ALL_PINS.filter((p) =>
    collected.some((c) => c.pinId === p.id)
  );
  const unlockedTreePins: Pin[] = SKILL_TREE_PINS
    .filter((p) => skillTreeUnlocked[p.id])
    .map((p) => ({ id: p.id, name: p.name, description: p.description, icon: p.icon, color: p.color, rarity: p.rarity, ticketCost: 0 }));
  const collectedPins: Pin[] = [...shopPins, ...unlockedTreePins];

  // All possible pins for board lookup
  const ALL_DISPLAYABLE_PINS: Pin[] = [
    ...ALL_PINS,
    ...SKILL_TREE_PINS.map((p) => ({ id: p.id, name: p.name, description: p.description, icon: p.icon, color: p.color, rarity: p.rarity, ticketCost: 0 })),
  ];

  const getBoardPin = (slot: number): Pin | undefined => {
    const pinId = board[slot];
    if (!pinId) return undefined;
    return ALL_DISPLAYABLE_PINS.find((p) => p.id === pinId);
  };

  return (
    <>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile.profileImageUri ? (
                <Image
                  source={{ uri: profile.profileImageUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <FontAwesome name="user" size={28} color="#D4A44C" />
              )}
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{profile.level}</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.title}>{profile.title}</Text>
          </View>

          <TicketBadge amount={profile.tickets} size="medium" />
        </View>

        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>
              <FontAwesome name="bolt" size={12} color="#D4A44C" /> XP
            </Text>
            <Text style={styles.xpNumbers}>
              {profile.currentXP} / {profile.xpToNextLevel}
            </Text>
          </View>
          <ProgressBar
            progress={xpProgress}
            height={8}
            gradientColors={['#D4A44C', '#E8C97A']}
            backgroundColor="rgba(255,255,255,0.15)"
          />
        </View>

        {/* Pin Display */}
        <View style={styles.pinDisplayBoard}>
          <View style={styles.pinDisplaySlots}>
            {Array.from({ length: PIN_BOARD_SLOTS }).map((_, i) => {
              const pin = getBoardPin(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pinSlot,
                    pin && { borderColor: pin.color + '60', borderStyle: 'solid', backgroundColor: pin.color + '20' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setEditingSlot(i)}
                >
                  {pin ? (
                    <View style={styles.pinSlotFilled}>
                      <View style={[styles.pinSlotGlow, { backgroundColor: pin.color + '40' }]} />
                      <DynamicIcon name={pin.icon} size={24} color={pin.color} />
                    </View>
                  ) : (
                    <View style={styles.pinSlotEmpty}>
                      <View style={styles.pinSlotDot} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.pinDisplayFooter}>
            <View style={styles.pinDisplayFooterLine} />
            <MaterialCommunityIcons name="pin" size={10} color="rgba(212,164,76,0.4)" />
            <Text style={styles.pinDisplayTitle}>Pin Display</Text>
            <MaterialCommunityIcons name="pin" size={10} color="rgba(212,164,76,0.4)" />
            <View style={styles.pinDisplayFooterLine} />
          </View>
        </View>
      </LinearGradient>

      {/* Pin picker modal */}
      <Modal
        visible={editingSlot !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingSlot(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setEditingSlot(null)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose a Pin
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (editingSlot !== null) {
                  setBoardSlot(editingSlot, null);
                  setEditingSlot(null);
                }
              }}
            >
              <Text style={[styles.modalClear, { color: '#EF4444' }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
          >
            {collectedPins.length === 0 ? (
              <View style={styles.emptyPins}>
                <MaterialCommunityIcons name="pin-off" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyPinsTitle, { color: colors.textSecondary }]}>
                  No pins collected yet
                </Text>
                <Text style={[styles.emptyPinsText, { color: colors.textMuted }]}>
                  Purchase pins from the Rewards shop to display them here!
                </Text>
              </View>
            ) : (
              <View style={styles.pinPickerGrid}>
                {collectedPins.map((pin) => {
                  const isOnBoard = board.includes(pin.id);
                  const rarityColor = RARITY_COLORS[pin.rarity];
                  return (
                    <TouchableOpacity
                      key={pin.id}
                      style={[
                        styles.pinPickerItem,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: isOnBoard ? colors.border : pin.color,
                        },
                      ]}
                      activeOpacity={0.7}
                      disabled={isOnBoard && !board.includes(pin.id)}
                      onPress={() => {
                        if (editingSlot !== null) {
                          setBoardSlot(editingSlot, pin.id);
                          setEditingSlot(null);
                        }
                      }}
                    >
                      <View style={[styles.pinPickerCircle, { backgroundColor: pin.color + '30', borderColor: pin.color }]}>
                        <DynamicIcon name={pin.icon} size={24} color={pin.color} />
                      </View>
                      <Text
                        style={[styles.pinPickerName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {pin.name}
                      </Text>
                      <View style={[styles.pinPickerRarity, { backgroundColor: rarityColor + '20' }]}>
                        <Text style={[styles.pinPickerRarityText, { color: rarityColor }]}>
                          {pin.rarity}
                        </Text>
                      </View>
                      {isOnBoard && (
                        <Text style={[styles.pinPickerOnBoard, { color: colors.textMuted }]}>
                          On board
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    paddingTop: spacing.xxl + spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#D4A44C',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A2A3D',
  },
  levelText: {
    color: '#1A1A2E',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#FFF',
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  title: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  xpSection: {
    marginBottom: spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  xpLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  xpNumbers: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  // ── Pin Display ──────────────────────────────────────
  pinDisplayBoard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    borderWidth: 2.5,
    borderColor: 'rgba(212,164,76,0.25)',
    padding: spacing.sm,
    paddingBottom: spacing.xs,
  },
  pinDisplayTitle: {
    color: 'rgba(212,164,76,0.7)',
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pinDisplaySlots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  pinSlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  pinSlotFilled: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSlotGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  pinSlotEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSlotDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pinDisplayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pinDisplayFooterLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212,164,76,0.12)',
  },

  // ── Pin picker modal ──────────────────────────────────
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: fontSize.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalClear: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: spacing.md,
  },
  modalBodyContent: {
    paddingBottom: spacing.xxl * 2,
  },
  emptyPins: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyPinsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptyPinsText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  pinPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  pinPickerItem: {
    width: '47%' as any,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  pinPickerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPickerName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  pinPickerRarity: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  pinPickerRarityText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pinPickerOnBoard: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

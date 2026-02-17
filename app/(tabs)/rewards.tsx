import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RewardCard } from '@/src/components/rewards/RewardCard';
import { TokenBadge } from '@/src/components/common/TokenBadge';
import { useRewardStore } from '@/src/stores/useRewardStore';
import { useUserStore } from '@/src/stores/useUserStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Reward } from '@/src/types';

type RewardCategory = Reward['category'];

const REWARD_CATEGORIES: RewardCategory[] = [
  'self_care',
  'entertainment',
  'treat',
  'experience',
  'custom',
];

export default function RewardsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const profile = useUserStore((s) => s.profile);
  const spendTokens = useUserStore((s) => s.spendTokens);
  const rewards = useRewardStore((s) => s.rewards);
  const purchaseReward = useRewardStore((s) => s.purchaseReward);
  const redeemReward = useRewardStore((s) => s.redeemReward);
  const addReward = useRewardStore((s) => s.addReward);
  const updateReward = useRewardStore((s) => s.updateReward);
  const removeReward = useRewardStore((s) => s.removeReward);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState('100');
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('custom');

  const [filter, setFilter] = useState<'available' | 'purchased'>('available');

  const available = rewards.filter((r) => !r.isPurchased);
  const purchased = rewards.filter((r) => r.isPurchased && !r.isRedeemed);
  const displayed = filter === 'available' ? available : purchased;

  const handlePurchase = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    const success = spendTokens(reward.tokenCost);
    if (success) {
      purchaseReward(rewardId);
    }
  };

  const handleRedeem = (rewardId: string) => {
    redeemReward(rewardId);
  };

  const resetModal = () => {
    setNewName('');
    setNewDescription('');
    setNewCost('100');
    setSelectedCategory('custom');
    setIsEditing(false);
    setEditingRewardId(null);
  };

  const handleEditReward = (reward: Reward) => {
    setIsEditing(true);
    setEditingRewardId(reward.id);
    setNewName(reward.name);
    setNewDescription(reward.description);
    setNewCost(String(reward.tokenCost));
    setSelectedCategory(reward.category);
    setShowAddModal(true);
  };

  const handleSaveReward = () => {
    if (!newName.trim()) return;
    if (isEditing && editingRewardId) {
      updateReward(editingRewardId, {
        name: newName.trim(),
        description: newDescription.trim(),
        tokenCost: parseInt(newCost, 10) || 100,
        category: selectedCategory,
      });
    } else {
      addReward({
        name: newName.trim(),
        description: newDescription.trim(),
        tokenCost: parseInt(newCost, 10) || 100,
        icon: 'star',
        category: selectedCategory,
      });
    }
    resetModal();
    setShowAddModal(false);
  };

  const handleDeleteReward = () => {
    if (editingRewardId) {
      removeReward(editingRewardId);
      resetModal();
      setShowAddModal(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradients.gold}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FontAwesome name="diamond" size={28} color="#FFF" />
          <Text style={styles.headerTitle}>Rewards Shop</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Your Balance:</Text>
            <TokenBadge amount={profile.tokens} size="large" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'available' && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setFilter('available')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === 'available' ? '#FFF' : colors.textSecondary,
              },
            ]}
          >
            Available ({available.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'purchased' && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setFilter('purchased')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === 'purchased' ? '#FFF' : colors.textSecondary,
              },
            ]}
          >
            Purchased ({purchased.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addSmallButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            resetModal();
            setShowAddModal(true);
          }}
        >
          <FontAwesome name="plus" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayed.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <FontAwesome
              name={filter === 'available' ? 'shopping-cart' : 'gift'}
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              {filter === 'available'
                ? 'No rewards available'
                : 'No purchased rewards'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {filter === 'available'
                ? 'Add custom rewards or check back later!'
                : 'Complete habits to earn tokens and purchase rewards!'}
            </Text>
          </View>
        ) : (
          displayed.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              canAfford={profile.tokens >= reward.tokenCost}
              onPurchase={() => handlePurchase(reward.id)}
              onRedeem={() => handleRedeem(reward.id)}
              onLongPress={() => handleEditReward(reward)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          resetModal();
          setShowAddModal(false);
        }}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              resetModal();
              setShowAddModal(false);
            }}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Reward' : 'New Reward'}
            </Text>
            <TouchableOpacity onPress={handleSaveReward}>
              <Text
                style={[
                  styles.modalSave,
                  {
                    color: newName.trim() ? colors.primary : colors.textMuted,
                  },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Reward Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g., Movie Night"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Describe the reward..."
              placeholderTextColor={colors.textMuted}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Token Cost
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="100"
              placeholderTextColor={colors.textMuted}
              value={newCost}
              onChangeText={setNewCost}
              keyboardType="numeric"
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {REWARD_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategory === cat
                          ? colors.primary
                          : colors.inputBackground,
                      borderColor:
                        selectedCategory === cat
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedCategory === cat
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteReward}
              >
                <FontAwesome name="trash" size={16} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete Reward</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    gap: spacing.xs,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  addSmallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A55',
  },
  modalCancel: {
    fontSize: fontSize.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalSave: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

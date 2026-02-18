import React, { useEffect, useState } from 'react';
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
import { InventoryCard } from '@/src/components/rewards/InventoryCard';
import { TokenBadge } from '@/src/components/common/TokenBadge';
import { useRewardStore } from '@/src/stores/useRewardStore';
import { useUserStore } from '@/src/stores/useUserStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ReplenishPeriod, Reward } from '@/src/types';

type RewardCategory = Reward['category'];

const REWARD_CATEGORIES: RewardCategory[] = [
  'self_care',
  'entertainment',
  'treat',
  'experience',
  'custom',
];

const REPLENISH_PERIODS: { value: ReplenishPeriod; label: string }[] = [
  { value: 'daily', label: 'Per Day' },
  { value: 'weekly', label: 'Per Week' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'yearly', label: 'Per Year' },
];

export default function RewardsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const profile = useUserStore((s) => s.profile);
  const spendTokens = useUserStore((s) => s.spendTokens);
  const rewards = useRewardStore((s) => s.rewards);
  const purchaseReward = useRewardStore((s) => s.purchaseReward);
  const addReward = useRewardStore((s) => s.addReward);
  const updateReward = useRewardStore((s) => s.updateReward);
  const removeReward = useRewardStore((s) => s.removeReward);
  const replenishRewards = useRewardStore((s) => s.replenishRewards);
  const inventory = useRewardStore((s) => s.inventory);
  const getActiveInventory = useRewardStore((s) => s.getActiveInventory);
  const redeemInventoryItem = useRewardStore((s) => s.redeemInventoryItem);

  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState('100');
  const [newQuantity, setNewQuantity] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('custom');
  const [selectedPeriod, setSelectedPeriod] = useState<ReplenishPeriod>('daily');

  useEffect(() => {
    replenishRewards();
  }, [replenishRewards]);

  // Show all rewards: available first, then out-of-stock
  const displayed = [...rewards].sort((a, b) => {
    const aStock = a.remainingQuantity > 0 ? 0 : 1;
    const bStock = b.remainingQuantity > 0 ? 0 : 1;
    return aStock - bStock;
  });

  const activeInventory = getActiveInventory();

  const handlePurchase = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward || reward.remainingQuantity <= 0) return;
    const success = spendTokens(reward.tokenCost);
    if (success) {
      purchaseReward(rewardId);
    }
  };

  const resetModal = () => {
    setNewName('');
    setNewDescription('');
    setNewCost('100');
    setNewQuantity('1');
    setSelectedCategory('custom');
    setSelectedPeriod('daily');
    setIsEditing(false);
    setEditingRewardId(null);
  };

  const handleEditReward = (reward: Reward) => {
    setIsEditing(true);
    setEditingRewardId(reward.id);
    setNewName(reward.name);
    setNewDescription(reward.description);
    setNewCost(String(reward.tokenCost));
    setNewQuantity(String(reward.maxQuantity));
    setSelectedCategory(reward.category);
    setSelectedPeriod(reward.replenishPeriod);
    setShowAddModal(true);
  };

  const handleSaveReward = () => {
    if (!newName.trim()) return;
    const quantity = parseInt(newQuantity, 10) || 1;
    if (isEditing && editingRewardId) {
      updateReward(editingRewardId, {
        name: newName.trim(),
        description: newDescription.trim(),
        tokenCost: parseInt(newCost, 10) || 100,
        category: selectedCategory,
        maxQuantity: quantity,
        replenishPeriod: selectedPeriod,
      });
    } else {
      addReward({
        name: newName.trim(),
        description: newDescription.trim(),
        tokenCost: parseInt(newCost, 10) || 100,
        icon: 'star',
        category: selectedCategory,
        maxQuantity: quantity,
        replenishPeriod: selectedPeriod,
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
          <Text style={styles.headerTitle}>Rewards</Text>
          <View style={styles.headerBottomRow}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Your Balance:</Text>
              <TokenBadge amount={profile.tokens} size="large" />
            </View>
            <TouchableOpacity
              style={styles.addHeaderButton}
              onPress={() => {
                resetModal();
                setShowAddModal(true);
              }}
            >
              <FontAwesome name="plus" size={14} color="#FFF" />
              <Text style={styles.addHeaderButtonText}>Add Reward</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'shop' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('shop')}
        >
          <FontAwesome
            name="shopping-cart"
            size={14}
            color={activeTab === 'shop' ? '#FFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'shop' ? '#FFF' : colors.textSecondary },
            ]}
          >
            Shop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'inventory' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('inventory')}
        >
          <FontAwesome
            name="archive"
            size={14}
            color={activeTab === 'inventory' ? '#FFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'inventory' ? '#FFF' : colors.textSecondary },
            ]}
          >
            Inventory ({activeInventory.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'shop' ? (
          displayed.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <FontAwesome
                name="shopping-cart"
                size={48}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                No rewards yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Add custom rewards to start earning!
              </Text>
            </View>
          ) : (
            displayed.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                canAfford={profile.tokens >= reward.tokenCost}
                onPurchase={() => handlePurchase(reward.id)}
                onLongPress={() => handleEditReward(reward)}
              />
            ))
          )
        ) : (
          activeInventory.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <FontAwesome
                name="archive"
                size={48}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                No claimed rewards
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Claim rewards from the shop to see them here!
              </Text>
            </View>
          ) : (
            activeInventory.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onRedeem={() => redeemInventoryItem(item.id)}
              />
            ))
          )
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
              Edit Reward
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
              Quantity
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
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="numeric"
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Replenishes
            </Text>
            <View style={styles.categoryGrid}>
              {REPLENISH_PERIODS.map((period) => (
                <TouchableOpacity
                  key={period.value}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedPeriod === period.value
                          ? colors.primary
                          : colors.inputBackground,
                      borderColor:
                        selectedPeriod === period.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(period.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedPeriod === period.value
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addHeaderButtonText: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
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
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  tabRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    paddingBottom: spacing.xxl * 2,
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

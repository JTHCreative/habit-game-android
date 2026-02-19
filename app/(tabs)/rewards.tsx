import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RewardCard } from '@/src/components/rewards/RewardCard';
import { InventoryCard } from '@/src/components/rewards/InventoryCard';
import { TokenBadge } from '@/src/components/common/TokenBadge';
import { DynamicIcon } from '@/src/components/common/DynamicIcon';
import { useRewardStore } from '@/src/stores/useRewardStore';
import { useUserStore } from '@/src/stores/useUserStore';
import { useRewardCategoryStore, DEFAULT_REWARD_CATEGORY_IDS } from '@/src/stores/useRewardCategoryStore';
import Colors, { gradients } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, fontSize, spacing } from '@/constants/Spacing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ReplenishPeriod, Reward, RewardCategory } from '@/src/types';

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B', '#3B82F6',
  '#EC4899', '#10B981', '#6366F1', '#EF4444', '#14B8A6',
  '#F97316', '#8B5CF6', '#06B6D4', '#D946EF', '#84CC16',
  '#E11D48',
];

const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'heart', label: 'heart' },
  { value: 'star', label: 'star' },
  { value: 'mci:food-apple', label: 'food' },
  { value: 'mci:map-marker', label: 'map' },
  { value: 'mci:dumbbell', label: 'dumbbell' },
  { value: 'leaf', label: 'leaf' },
  { value: 'rocket', label: 'rocket' },
  { value: 'book', label: 'book' },
  { value: 'users', label: 'users' },
  { value: 'dollar', label: 'dollar' },
  { value: 'tag', label: 'tag' },
  { value: 'music', label: 'music' },
  { value: 'paint-brush', label: 'paint-brush' },
  { value: 'trophy', label: 'trophy' },
  { value: 'home', label: 'home' },
  { value: 'tree', label: 'tree' },
  { value: 'paw', label: 'paw' },
  { value: 'cutlery', label: 'cutlery' },
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

  const rewardCategories = useRewardCategoryStore((s) => s.categories);
  const addCategory = useRewardCategoryStore((s) => s.addCategory);
  const removeCategory = useRewardCategoryStore((s) => s.removeCategory);
  const updateCategory = useRewardCategoryStore((s) => s.updateCategory);

  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState('100');
  const [newQuantity, setNewQuantity] = useState('1');
  const [selectedCategoryId, setSelectedCategoryId] = useState(rewardCategories[0]?.id || 'self_care');
  const [selectedPeriod, setSelectedPeriod] = useState<ReplenishPeriod>('daily');

  // Category editor state
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PALETTE[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState('tag');

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

  const resolveRewardCategory = (): RewardCategory => {
    return DEFAULT_REWARD_CATEGORY_IDS.includes(selectedCategoryId)
      ? (selectedCategoryId as RewardCategory)
      : 'custom';
  };

  const resetModal = () => {
    setNewName('');
    setNewDescription('');
    setNewCost('100');
    setNewQuantity('1');
    setSelectedCategoryId(rewardCategories[0]?.id || 'self_care');
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
    setSelectedCategoryId(reward.customCategoryId || reward.category);
    setSelectedPeriod(reward.replenishPeriod);
    setShowAddModal(true);
  };

  const handleSaveReward = () => {
    if (!newName.trim()) return;
    const quantity = parseInt(newQuantity, 10) || 1;
    const rewardCategory = resolveRewardCategory();
    if (isEditing && editingRewardId) {
      updateReward(editingRewardId, {
        name: newName.trim(),
        description: newDescription.trim(),
        tokenCost: parseInt(newCost, 10) || 100,
        category: rewardCategory,
        customCategoryId: selectedCategoryId,
        maxQuantity: quantity,
        replenishPeriod: selectedPeriod,
      });
    } else {
      addReward({
        name: newName.trim(),
        description: newDescription.trim(),
        tokenCost: parseInt(newCost, 10) || 100,
        icon: 'star',
        category: rewardCategory,
        customCategoryId: selectedCategoryId,
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
              <TokenBadge amount={profile.tokens} size="large" variant="dark" />
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

      {/* Add/Edit Reward Modal */}
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

          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
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
              {rewardCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategoryId === cat.id
                          ? cat.color
                          : colors.inputBackground,
                      borderColor:
                        selectedCategoryId === cat.id
                          ? cat.color
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          selectedCategoryId === cat.id
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowCategoryEditor(true)}
              >
                <FontAwesome name="cog" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Manage
                </Text>
              </TouchableOpacity>
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

      {/* Category Editor Modal */}
      <Modal
        visible={showCategoryEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCategoryForm(false);
          setEditingCategoryId(null);
          setShowCategoryEditor(false);
        }}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCategoryForm(false);
              setEditingCategoryId(null);
              setShowCategoryEditor(false);
            }}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                Back
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Categories
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
          >
            {rewardCategories.length === 0 && !showCategoryForm && (
              <View style={[styles.emptyState, { borderColor: colors.border, marginBottom: spacing.lg }]}>
                <FontAwesome name="folder-open" size={40} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                  No categories
                </Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Add categories with custom names, colors, and icons.
                </Text>
              </View>
            )}

            <View style={styles.customCategoryGrid}>
              {rewardCategories.map((cc) => {
                const isSelected = selectedCategoryId === cc.id;
                return (
                  <TouchableOpacity
                    key={cc.id}
                    style={[
                      styles.customCategoryCard,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: isSelected ? cc.color : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cc.id);
                      setEditingCategoryId(cc.id);
                      setNewCategoryName(cc.name);
                      setNewCategoryColor(cc.color);
                      setNewCategoryIcon(cc.icon);
                      setShowCategoryForm(true);
                    }}
                    onLongPress={() => {
                      if (rewardCategories.length <= 1) return;
                      Alert.alert(
                        'Delete Category',
                        `Are you sure you want to delete "${cc.name}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              if (selectedCategoryId === cc.id) {
                                const next = rewardCategories.find((c) => c.id !== cc.id);
                                if (next) setSelectedCategoryId(next.id);
                              }
                              removeCategory(cc.id);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.customCategoryCardIcon,
                        { backgroundColor: cc.color + '20' },
                      ]}
                    >
                      <DynamicIcon name={cc.icon} size={20} color={cc.color} />
                    </View>
                    <Text
                      style={[styles.customCategoryCardName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {cc.name}
                    </Text>
                    <View
                      style={[styles.customCategoryCardColorDot, { backgroundColor: cc.color }]}
                    />
                    {isSelected && (
                      <View style={[styles.customCategorySelectedBadge, { backgroundColor: cc.color }]}>
                        <FontAwesome name="check" size={10} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {showCategoryForm ? (
              <View style={[styles.addCategoryForm, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.addCategoryFormTitle, { color: colors.text }]}>
                  {editingCategoryId ? 'Edit Category' : 'New Category'}
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Name
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
                  placeholder="e.g., Gaming"
                  placeholderTextColor={colors.textMuted}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Color
                </Text>
                <View style={styles.colorPalette}>
                  {COLOR_PALETTE.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c },
                        newCategoryColor === c && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setNewCategoryColor(c)}
                    >
                      {newCategoryColor === c && (
                        <FontAwesome name="check" size={12} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Icon
                </Text>
                <View style={styles.iconPalette}>
                  {ICON_OPTIONS.map((ic) => (
                    <TouchableOpacity
                      key={ic.value}
                      style={[
                        styles.iconChoice,
                        {
                          backgroundColor:
                            newCategoryIcon === ic.value
                              ? newCategoryColor + '20'
                              : colors.inputBackground,
                          borderColor:
                            newCategoryIcon === ic.value
                              ? newCategoryColor
                              : colors.border,
                        },
                      ]}
                      onPress={() => setNewCategoryIcon(ic.value)}
                    >
                      <DynamicIcon
                        name={ic.value}
                        size={18}
                        color={newCategoryIcon === ic.value ? newCategoryColor : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.addCategoryActions}>
                  <TouchableOpacity
                    style={[styles.addCategoryCancel, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowCategoryForm(false);
                      setEditingCategoryId(null);
                      setNewCategoryName('');
                      setNewCategoryColor(COLOR_PALETTE[0]);
                      setNewCategoryIcon('tag');
                    }}
                  >
                    <Text style={[styles.addCategoryCancelText, { color: colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  {editingCategoryId ? (
                    <TouchableOpacity
                      style={[
                        styles.addCategorySave,
                        {
                          backgroundColor: newCategoryName.trim()
                            ? newCategoryColor
                            : colors.inputBackground,
                        },
                      ]}
                      onPress={() => {
                        if (!newCategoryName.trim()) return;
                        updateCategory(editingCategoryId, {
                          name: newCategoryName.trim(),
                          color: newCategoryColor,
                          icon: newCategoryIcon,
                        });
                        setShowCategoryForm(false);
                        setEditingCategoryId(null);
                        setNewCategoryName('');
                        setNewCategoryColor(COLOR_PALETTE[0]);
                        setNewCategoryIcon('tag');
                      }}
                    >
                      <Text
                        style={[
                          styles.addCategorySaveText,
                          { color: newCategoryName.trim() ? '#FFF' : colors.textMuted },
                        ]}
                      >
                        Save Changes
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.addCategorySave,
                        {
                          backgroundColor: newCategoryName.trim()
                            ? newCategoryColor
                            : colors.inputBackground,
                        },
                      ]}
                      onPress={() => {
                        if (!newCategoryName.trim()) return;
                        const created = addCategory(
                          newCategoryName.trim(),
                          newCategoryColor,
                          newCategoryIcon
                        );
                        setSelectedCategoryId(created.id);
                        setNewCategoryName('');
                        setNewCategoryColor(COLOR_PALETTE[0]);
                        setNewCategoryIcon('tag');
                        setShowCategoryForm(false);
                        setShowCategoryEditor(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.addCategorySaveText,
                          { color: newCategoryName.trim() ? '#FFF' : colors.textMuted },
                        ]}
                      >
                        Create & Select
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addCategoryButton, { borderColor: colors.border }]}
                onPress={() => {
                  setEditingCategoryId(null);
                  setNewCategoryName('');
                  setNewCategoryColor(COLOR_PALETTE[0]);
                  setNewCategoryIcon('tag');
                  setShowCategoryForm(true);
                }}
              >
                <FontAwesome name="plus" size={16} color={colors.primary} />
                <Text style={[styles.addCategoryButtonText, { color: colors.primary }]}>
                  Add Category
                </Text>
              </TouchableOpacity>
            )}

            <Text style={[styles.customCategoryHint, { color: colors.textMuted }]}>
              Tap to edit. Long-press to delete.
            </Text>
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
  },
  modalBodyContent: {
    paddingBottom: spacing.xxl * 3,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  customCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  customCategoryCard: {
    width: '47%' as any,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  customCategoryCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCategoryCardName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  customCategoryCardColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  customCategorySelectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addCategoryButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  addCategoryForm: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  addCategoryFormTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  iconPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconChoice: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addCategoryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addCategoryCancel: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  addCategoryCancelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  addCategorySave: {
    flex: 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  addCategorySaveText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  customCategoryHint: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

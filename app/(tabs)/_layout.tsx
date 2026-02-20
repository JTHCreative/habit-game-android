import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppFont } from '@/components/Themed';
import { useDecayCheck } from '@/src/hooks/useDecayCheck';
import { useRewardStore } from '@/src/stores/useRewardStore';
import { useChallengeStore } from '@/src/stores/useChallengeStore';
import { useUserStore } from '@/src/stores/useUserStore';
import { LevelUpSplash } from '@/src/components/common/LevelUpSplash';

const ICON_BOX = { width: 28, height: 28, alignItems: 'center' as const, justifyContent: 'center' as const };

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return (
    <View style={ICON_BOX}>
      <FontAwesome size={22} {...props} />
    </View>
  );
}

function TabBarMCIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}) {
  return (
    <View style={ICON_BOX}>
      <MaterialCommunityIcons size={24} {...props} />
    </View>
  );
}

function AlertBadge() {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -4,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -2,
        right: -4,
        transform: [{ translateY: bounce }],
      }}
    >
      <FontAwesome name="exclamation" size={10} color="#EF4444" />
    </Animated.View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { bold } = useAppFont();
  useDecayCheck();

  const getActiveInventory = useRewardStore((s) => s.getActiveInventory);
  const dailyChallenges = useChallengeStore((s) => s.dailyChallenges);
  const weeklyChallenges = useChallengeStore((s) => s.weeklyChallenges);

  const hasUnredeemedRewards = getActiveInventory().some(
    (item) => item.redeemedCount < item.quantity
  );
  const hasClaimableChallenges =
    dailyChallenges.some((c) => c.status === 'completed') ||
    weeklyChallenges.some((c) => c.status === 'completed');

  const pendingLevelUp = useUserStore((s) => s.pendingLevelUp);
  const clearPendingLevelUp = useUserStore((s) => s.clearPendingLevelUp);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 4,
            height: 88,
            marginBottom: 24,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            ...(bold ? { fontFamily: bold } : {}),
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color }) => <TabBarIcon name="check-square-o" color={color} />,
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Rewards',
            tabBarIcon: ({ color }) => (
              <View style={ICON_BOX}>
                <MaterialCommunityIcons size={24} name="store" color={color} />
                {hasUnredeemedRewards && <AlertBadge />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="history" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="challenges"
          options={{
            title: 'Challenges',
            tabBarIcon: ({ color }) => (
              <View style={ICON_BOX}>
                <FontAwesome size={22} name="bullseye" color={color} />
                {hasClaimableChallenges && <AlertBadge />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      </Tabs>
      {pendingLevelUp !== null && (
        <LevelUpSplash level={pendingLevelUp} onFinish={clearPendingLevelUp} />
      )}
    </>
  );
}

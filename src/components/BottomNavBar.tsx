import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { MainTabType } from '../types/navigation';
import { useTranslation } from '../hooks/useTranslation';

interface BottomNavBarProps {
  currentTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
}

interface TabConfig {
  id: MainTabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TabItem: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.12 : 1.0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.12 : 1.0,
      friction: 5,
      tension: 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isActive ? tab.activeIcon : tab.inactiveIcon}
          size={25}
          color={isActive ? COLORS.primaryDark : '#64748B'}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useTranslation();

  const tabs: TabConfig[] = [
    { id: 'home', label: t.nav.home, activeIcon: 'home', inactiveIcon: 'home-outline' },
    { id: 'scrapbook', label: (t.nav as any).scrapbook || 'Album', activeIcon: 'book', inactiveIcon: 'book-outline' },
    { id: 'games', label: t.nav.games, activeIcon: 'game-controller', inactiveIcon: 'game-controller-outline' },
    { id: 'mitr', label: t.nav.mitr, activeIcon: 'chatbubbles', inactiveIcon: 'chatbubbles-outline' },
    { id: 'dashboard', label: t.nav.dashboard, activeIcon: 'stats-chart', inactiveIcon: 'stats-chart-outline' },
    { id: 'profile', label: t.nav.profile, activeIcon: 'person', inactiveIcon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={currentTab === tab.id}
          onPress={() => onSelectTab(tab.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
});

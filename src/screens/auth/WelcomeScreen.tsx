import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '../../utils/validation';
import { SupportedLanguage } from '../../types/auth';

interface WelcomeScreenProps {
  onGoToLogin: () => void;
  onGoToSignup: () => void;
  onGoToCaregiver: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGoToLogin,
  onGoToSignup,
  onGoToCaregiver,
}) => {
  const { language, setLanguage } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.rootContainer}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.headerIconWrapper}>
            <MaterialCommunityIcons name="heart-cog-outline" size={24} color={COLORS.brandForest} />
          </View>
          <Text style={styles.headerBrandTitle}>Smriti AI</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Open settings menu"
        >
          <Ionicons name="menu" size={26} color={COLORS.brandForest} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/smriti_logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.heroTitle}>Welcome to Smriti AI</Text>
          <Text style={styles.heroSubtitle}>
            স্মৃতি - Your gentle companion{'\n'}for memory and connection{'\n'}in the North East.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Familiar North East Culture */}
          <View style={styles.featureCard}>
            <View style={[styles.cardIconBadge, { backgroundColor: '#154A3E' }]}>
              <MaterialCommunityIcons name="castle" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Familiar North East Culture</Text>
              <Text style={styles.cardDesc}>
                Activities and images designed with regional relevance to spark meaningful memories.
              </Text>
            </View>
          </View>

          {/* Card 2: Regional Language Support */}
          <View style={styles.featureCard}>
            <View style={[styles.cardIconBadge, { backgroundColor: '#FED7AA' }]}>
              <MaterialIcons name="translate" size={22} color="#9A3412" />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Regional Language Support</Text>
              <Text style={styles.cardDesc}>
                Speak comfortably in Assamese, Bengali, or English.
              </Text>
            </View>
          </View>

          {/* Card 3: Caregiver Connection */}
          <View style={styles.featureCard}>
            <View style={[styles.cardIconBadge, { backgroundColor: '#E2E8F0' }]}>
              <MaterialCommunityIcons name="transit-connection-variant" size={22} color="#1E293B" />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Caregiver Connection</Text>
              <Text style={styles.cardDesc}>
                Keep your loved ones gently informed of your progress.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Button 1: Create New Patient Account */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={onGoToSignup}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={20} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.primaryActionText}>Create New Patient Account</Text>
          </TouchableOpacity>

          {/* Button 2: Sign In to Existing Account */}
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={onGoToLogin}
            activeOpacity={0.85}
          >
            <MaterialIcons name="login" size={22} color={COLORS.brandForest} style={styles.btnIcon} />
            <Text style={styles.secondaryActionText}>Sign In to Existing Account</Text>
          </TouchableOpacity>

          {/* Button 3: Caregiver & Family Portal */}
          <TouchableOpacity
            style={styles.caregiverActionButton}
            onPress={onGoToCaregiver}
            activeOpacity={0.85}
          >
            <Ionicons name="people-outline" size={22} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.caregiverActionText}>Caregiver & Family Portal</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
          <Text style={styles.footerText}>
            Safe • High Contrast • Large Touch Targets
          </Text>
        </View>
      </ScrollView>

      {/* Slide-in Menu Modal for Language & Info */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuDrawer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Language & Settings</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.drawerSubtitle}>Select App Language</Text>
            <View style={styles.langList}>
              {SUPPORTED_LANGUAGES.map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <TouchableOpacity
                    key={langItem.code}
                    style={[
                      styles.langOption,
                      isSelected && styles.langOptionSelected,
                    ]}
                    onPress={() => {
                      setLanguage(langItem.code as SupportedLanguage);
                      setMenuVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.langNative,
                        isSelected && styles.langNativeSelected,
                      ]}
                    >
                      {langItem.native}
                    </Text>
                    <Text
                      style={[
                        styles.langLabel,
                        isSelected && styles.langLabelSelected,
                      ]}
                    >
                      {langItem.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.brandForest} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.drawerDivider} />

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>About Smriti AI</Text>
              <Text style={styles.infoDesc}>
                Empowering cognitive wellness for elders across North East India with culturally familiar reminiscence, gentle games, and family connection.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.bgWarmIvory,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.brandForest,
    letterSpacing: 0.2,
  },
  menuButton: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  logoContainer: {
    width: 136,
    height: 136,
    borderRadius: 68,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F3E37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: {
    width: 136,
    height: 136,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.brandForest,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.brandForest,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 19,
    fontWeight: '400',
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  primaryActionButton: {
    backgroundColor: COLORS.brandForest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: COLORS.brandForest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryActionText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.brandForest,
  },
  caregiverActionButton: {
    backgroundColor: COLORS.brandAmberBrown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: COLORS.brandAmberBrown,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  caregiverActionText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnIcon: {
    marginRight: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  menuDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  drawerSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  langList: {
    gap: 8,
    marginBottom: 16,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langOptionSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.brandForest,
  },
  langNative: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginRight: 8,
  },
  langNativeSelected: {
    color: COLORS.brandForest,
  },
  langLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
  },
  langLabelSelected: {
    color: COLORS.brandForest,
    fontWeight: '600',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  infoCard: {
    backgroundColor: '#FAF8F5',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.brandForest,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});

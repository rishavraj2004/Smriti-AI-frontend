import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { GameStatsProvider } from './src/context/GameStatsContext';

import { HeaderBar } from './src/components/HeaderBar';
import { BottomNavBar } from './src/components/BottomNavBar';
import { LoadingState } from './src/components/LoadingState';

import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { PatientLoginScreen } from './src/screens/auth/PatientLoginScreen';
import { PatientSignupScreen } from './src/screens/auth/PatientSignupScreen';
import { PairingCodeScreen } from './src/screens/auth/PairingCodeScreen';
import { CaregiverPortalScreen } from './src/screens/caregiver/CaregiverPortalScreen';
import { CaregiverDashboardScreen } from './src/screens/caregiver/CaregiverDashboardScreen';

import { HomeScreen } from './src/screens/home/HomeScreen';
import { FamilyScrapbookScreen } from './src/screens/scrapbook/FamilyScrapbookScreen';
import { GamesScreen } from './src/screens/games/GamesScreen';
import { MitrAIScreen } from './src/screens/mitr/MitrAIScreen';
import { DashboardScreen } from './src/screens/dashboard/DashboardScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';

import { AuthScreenType, MainTabType, GameViewType } from './src/types/navigation';
import { COLORS } from './src/theme/theme';

const AuthenticatedPatientApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<MainTabType>('home');
  const [targetGame, setTargetGame] = useState<GameViewType>('list');

  const handleLaunchGame = (game: GameViewType) => {
    setTargetGame(game);
    setCurrentTab('games');
  };

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen onNavigateTab={setCurrentTab} onLaunchGame={handleLaunchGame} />;
      case 'scrapbook':
        return <FamilyScrapbookScreen />;
      case 'games':
        return (
          <GamesScreen
            initialGame={targetGame}
            onResetInitialGame={() => setTargetGame('list')}
          />
        );
      case 'mitr':
        return <MitrAIScreen />;
      case 'dashboard':
        return <DashboardScreen onNavigateTab={setCurrentTab} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigateTab={setCurrentTab} onLaunchGame={handleLaunchGame} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <HeaderBar />
      <View style={styles.bodyContainer}>{renderActiveScreen()}</View>
      <BottomNavBar currentTab={currentTab} onSelectTab={setCurrentTab} />
    </SafeAreaView>
  );
};

const AuthenticatedCaregiverApp: React.FC = () => {
  return (
    <SafeAreaView style={styles.authSafeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <CaregiverDashboardScreen />
    </SafeAreaView>
  );
};

const UnauthenticatedFlow: React.FC = () => {
  const { pendingPairingCode, confirmSignupFlow } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('welcome');

  if (pendingPairingCode) {
    return (
      <SafeAreaView style={styles.authSafeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" />
        <PairingCodeScreen
          codeOverride={pendingPairingCode}
          onContinue={confirmSignupFlow}
        />
      </SafeAreaView>
    );
  }

  if (authScreen === 'login') {
    return (
      <SafeAreaView style={styles.authSafeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" />
        <PatientLoginScreen
          onBack={() => setAuthScreen('welcome')}
          onGoToSignup={() => setAuthScreen('signup')}
        />
      </SafeAreaView>
    );
  }

  if (authScreen === 'signup') {
    return (
      <SafeAreaView style={styles.authSafeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" />
        <PatientSignupScreen
          onBack={() => setAuthScreen('welcome')}
          onGoToLogin={() => setAuthScreen('login')}
          onSignupSuccess={() => {}}
        />
      </SafeAreaView>
    );
  }

  if (authScreen === 'caregiver') {
    return (
      <SafeAreaView style={styles.authSafeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" />
        <CaregiverPortalScreen onBack={() => setAuthScreen('welcome')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.authSafeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <WelcomeScreen
        onGoToLogin={() => setAuthScreen('login')}
        onGoToSignup={() => setAuthScreen('signup')}
        onGoToCaregiver={() => setAuthScreen('caregiver')}
      />
    </SafeAreaView>
  );
};

const RootNavigation: React.FC = () => {
  const { patient, caregiver, pendingPairingCode, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return <LoadingState message="Connecting to Smriti AI..." />;
  }

  // If a Caregiver is authenticated -> show the full Caregiver Dashboard Hub
  if (caregiver) {
    return <AuthenticatedCaregiverApp />;
  }

  // If a Patient is authenticated -> show the Patient Application
  if (patient && !pendingPairingCode) {
    return (
      <GameStatsProvider>
        <AuthenticatedPatientApp />
      </GameStatsProvider>
    );
  }

  // Otherwise, show unauthenticated onboarding / portal flow
  return <UnauthenticatedFlow />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  authSafeArea: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
});

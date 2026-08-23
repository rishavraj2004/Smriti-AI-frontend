import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { ttsService } from '../services/ttsService';

interface SpeakerButtonProps {
  text: string;
  language?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  text,
  language,
  size = 'medium',
  color,
  backgroundColor,
  style,
}) => {
  const { patient, appLanguage } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeLang = language || patient?.language || appLanguage || 'en';

  useEffect(() => {
    const unsubscribe = ttsService.subscribe((speaking, activeText) => {
      setIsSpeaking(speaking && activeText === text.trim());
    });
    return () => unsubscribe();
  }, [text]);

  const handlePress = async () => {
    if (!text) return;
    await ttsService.speak(text, activeLang);
  };

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { buttonSize: 28, iconSize: 16 };
      case 'large':
        return { buttonSize: 44, iconSize: 24 };
      case 'medium':
      default:
        return { buttonSize: 36, iconSize: 20 };
    }
  };

  const { buttonSize, iconSize } = getDimensions();
  const defaultIconColor = color || (isSpeaking ? '#FFFFFF' : COLORS.primary);
  const defaultBgColor =
    backgroundColor || (isSpeaking ? COLORS.primary : 'rgba(30, 27, 75, 0.08)');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: defaultBgColor,
        },
        isSpeaking && styles.buttonActive,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={isSpeaking ? 'Stop reading aloud' : 'Read aloud in your language'}
    >
      <Ionicons
        name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
        size={iconSize}
        color={defaultIconColor}
      />
      {isSpeaking && <View style={styles.pulseDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  pulseDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
});

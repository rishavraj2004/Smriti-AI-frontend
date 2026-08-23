import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme/theme';

interface ElderlyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  icon?: string;
  size?: 'normal' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const ElderlyButton: React.FC<ElderlyButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  size = 'large',
  style,
  textStyle,
  disabled = false,
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const useNative = Platform.OS !== 'web';

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: useNative,
      speed: 25,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      useNativeDriver: useNative,
      friction: 4,
      tension: 120,
    }).start();
  };

  const getBgColor = () => {
    if (disabled || loading) return '#CBD5E1';
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.secondary;
      case 'success':
        return COLORS.success;
      case 'danger':
        return COLORS.danger;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return '#64748B';
    if (variant === 'outline') return COLORS.primary;
    return '#FFFFFF';
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          size === 'large' ? styles.largeButton : styles.normalButton,
          { backgroundColor: getBgColor() },
          variant === 'outline' && { borderWidth: 2.5, borderColor: COLORS.primary },
          SHADOWS.button,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              size === 'large' && styles.largeText,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {icon ? `${icon}  ` : ''}
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  normalButton: {
    minHeight: 52,
    paddingVertical: 12,
  },
  largeButton: {
    minHeight: 62,
    paddingVertical: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  largeText: {
    fontSize: 20,
  },
});

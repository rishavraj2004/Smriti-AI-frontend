export const COLORS = {
  // Primary brand - Calming Teal & Forest Green
  primary: '#0F766E', // Deep Teal
  primaryLight: '#CCFBF1',
  primaryDark: '#115E59',
  
  // Secondary brand - Warm Amber & Sunset Orange
  secondary: '#D97706', // Warm Amber
  secondaryLight: '#FEF3C7',
  secondaryDark: '#B45309',

  // Backgrounds - Soothing Cream & Sand for elderly readability
  bgMain: '#F8F6F0',
  bgCard: '#FFFFFF',
  bgAccent: '#F0FDFA',

  // High contrast text colors for dementia readability
  textDark: '#0F172A',
  textMuted: '#475569',
  textLight: '#F8FAFC',

  // Status & Feedback colors
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#EAB308',
  warningLight: '#FEF9C3',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  // NER Cultural accents & Mockup Colors
  teaGreen: '#2D6A4F',
  bambooYellow: '#E9C46A',
  rhinoGrey: '#4A5568',
  flowerPink: '#E63946',
  skyBlue: '#0284C7',
  brandForest: '#14463A',
  brandForestDark: '#0E362C',
  brandAmberBrown: '#8C4900',
  brandAmberBrownDark: '#78350F',
  bgWarmIvory: '#FAF8F5',
  cardBorderLight: '#F1F5F9',
};

export const TYPOGRAPHY = {
  fontTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: COLORS.textDark,
  },
  fontSubtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.textDark,
  },
  fontBody: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: COLORS.textDark,
  },
  fontLargeButton: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
};

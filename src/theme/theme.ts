export const COLORS = {
  // Primary brand - Calming Forest Teal & Sage (Restful & High Accessibility)
  primary: '#0D6E66',        // Deep Calming Teal
  primaryLight: '#E8F5F3',   // Gentle Sage Tint (Eye Soothing)
  primaryDark: '#094E48',    // Rich Forest Spruce
  primaryMedium: '#14B8A6',  // Soft Aqua Accent

  // Secondary brand - Warm Terracotta & Amber (Gentle & Welcoming)
  secondary: '#C26A1B',      // Gentle Ochre Amber
  secondaryLight: '#FEF6E8', // Soft Sand Tint
  secondaryDark: '#9A4D0F',  // Warm Earth Terracotta

  // Backgrounds - Eye-soothing Warm Cream & Canvas for low eye strain
  bgMain: '#F7F6F2',         // Warm Linen / Soothing Canvas (Soft on eyes)
  bgCard: '#FFFFFF',         // Crisp White Surface
  bgCardSubtle: '#FDFDFC',   // Ultra-soft off-white
  bgAccent: '#EFF8F6',       // Gentle Mist Accent
  bgWarmIvory: '#FAF8F5',    // Soft Ivory
  
  // High contrast & readable text hierarchy
  textDark: '#1E293B',       // Deep Slate (Clear, high legibility without harsh black)
  textMuted: '#64748B',      // Refined Slate Muted
  textLight: '#F8FAFC',      // Crisp Off-White Text
  textSubtle: '#94A3B8',     // Gentle Placeholder / Subtitle

  // Borders & Dividers
  borderLight: '#E2E8F0',    // Clean subtle border
  borderMedium: '#CBD5E1',   // Defined border
  cardBorderLight: '#EBE8DF',// Warm subtle card border

  // Status & Feedback colors (Softer, less jarring)
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Cultural Accents (Northeast India - Muted & Harmonious)
  teaGreen: '#1E6B52',       // Assam Tea Green
  bambooYellow: '#D4A340',   // Natural Bamboo Ochre
  rhinoGrey: '#475569',      // Slate Rhino
  flowerPink: '#C026D3',     // Orchids / Muted Magenta
  skyBlue: '#0284C7',        // Brahmaputra Blue
  brandForest: '#0B4D3E',
  brandForestDark: '#083B30',
  brandAmberBrown: '#8C4900',
  brandAmberBrownDark: '#78350F',
};

export const TYPOGRAPHY = {
  fontTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  fontSubtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  fontBody: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: COLORS.textDark,
    lineHeight: 26,
  },
  fontLargeButton: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  fontSectionHeader: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  button: {
    shadowColor: '#0D6E66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
};

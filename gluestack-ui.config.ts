import { AgrisaColors } from "@/domains/shared/constants/agrisa-colors";
import { config as defaultConfig } from "@gluestack-ui/config";

// Tạo function để generate config based on theme
export const createAgrisaConfig = (isDark: boolean) => {
  const colors = isDark ? AgrisaColors.dark : AgrisaColors.light;

  return {
    ...defaultConfig,
    tokens: {
      ...defaultConfig.tokens,
      colors: {
        ...defaultConfig.tokens.colors,

        // Map Agrisa colors to Gluestack tokens
        primary50: isDark ? colors.surface : "#f0fdf4",
        primary100: isDark ? colors.card : "#dcfce7",
        primary500: colors.success,
        primary600: colors.success,
        primary700: colors.success,
        primary900: isDark ? colors.text : colors.textSecondary,

        // Background
        background: colors.background,
        backgroundLight: colors.surface,
        backgroundDark: colors.card,

        // Text
        textLight: colors.text,
        textDark: colors.text,
        textSecondary: colors.textSecondary,
        textMuted: colors.textMuted,

        // UI Elements
        border: colors.border,
        borderActive: colors.borderActive,

        // Status
        success500: colors.success,
        warning500: colors.warning,
        error500: colors.error,
        info500: colors.info,

        // Custom Agrisa tokens
        agrisaPrimary: colors.primary,
        agrisaSuccess: colors.success,
        agrisaWarning: colors.warning,
        agrisaError: colors.error,
        agrisaInfo: colors.info,
      },

      space: {
        ...defaultConfig.tokens.space,
        "0.5": 2,
        "1": 4,
        "1.5": 6,
        "2": 8,
        "2.5": 10,
        "3": 12,
        "3.5": 14,
        "4": 16,
        "5": 20,
        "6": 24,
        "7": 28,
        "8": 32,
        "9": 36,
        "10": 40,
        "12": 48,
        "16": 64,
        "20": 80,
        "24": 96,
      },

      fontSizes: {
        ...defaultConfig.tokens.fontSizes,
        "2xs": 10,
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30,
        "4xl": 36,
        "5xl": 48,
      },

      fonts: {
        ...defaultConfig.tokens.fonts,
        heading: "BricolageGrotesque-SemiBold",
        body: "BricolageGrotesque-Regular",
        mono: "BricolageGrotesque-Medium",
      },
    },

    aliases: {
      ...defaultConfig.aliases,
      bg: "backgroundColor",
      p: "padding",
      m: "margin",
      px: "paddingHorizontal",
      py: "paddingVertical",
      mx: "marginHorizontal",
      my: "marginVertical",
      w: "width",
      h: "height",
    },
  };
};

export const config = createAgrisaConfig(false); // false = light mode

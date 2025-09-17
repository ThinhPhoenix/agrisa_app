import { config as defaultConfig } from "@gluestack-ui/config";

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary500: "#4CAF50", // Xanh lá chính cho Agrisa
      secondary500: "#FF9800", // Cam cho alerts
      background: "#F5F5F5", // Nền nhẹ
      emerald600: "#059669", // Màu chủ đạo Agrisa
    },
    space: {
      ...defaultConfig.tokens.space,
      "1": 4,
      "2": 8,
      "3": 12,
      "4": 16,
      "6": 24,
      "8": 32,
    },
   
  },
  aliases: {
    ...defaultConfig.aliases,
    bg: "backgroundColor",
    p: "padding",
    m: "margin",
  },
};

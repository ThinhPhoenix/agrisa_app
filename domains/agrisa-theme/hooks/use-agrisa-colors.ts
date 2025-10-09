import { useThemeStore } from "@/domains/agrisa-theme/stores/theme-store";
import { AgrisaColors, ColorKey } from "@/domains/shared/constants/agrisa-colors";

/**
 * Hook để sử dụng colors của Agrisa một cách dễ dàng
 * Tự động cập nhật theo theme hiện tại
 */
export const useAgrisaColors = () => {
  const { mode } = useThemeStore();

  // Lấy color theo key
  const getColor = (key: ColorKey) => {
    return AgrisaColors[mode][key];
  };

  // Colors của theme hiện tại
  const colors = AgrisaColors[mode];

  return {
    colors, // Tất cả colors của theme hiện tại
    getColor, // Function để lấy color theo key
    mode, // Theme mode hiện tại
    isDark: mode === "dark",
    isLight: mode === "light",
  };
};

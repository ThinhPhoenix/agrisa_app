import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Custom hook để tính toán bottom padding cho Android navigation bar
 * 
 * @returns {number} - Padding bottom cần thêm nếu có navigation bar 3 nút
 * 
 * @example
 * ```tsx
 * const bottomPadding = useBottomInsets();
 * 
 * <ScrollView contentContainerStyle={{ paddingBottom: 20 + bottomPadding }}>
 *   ...
 * </ScrollView>
 * ```
 */
export const useBottomInsets = (): number => {
  const insets = useSafeAreaInsets();
  const hasNavigationBar = Platform.OS === "android" && insets.bottom > 0;
  const additionalPadding = hasNavigationBar ? Math.max(insets.bottom, 0) : 0;

  return additionalPadding;
};

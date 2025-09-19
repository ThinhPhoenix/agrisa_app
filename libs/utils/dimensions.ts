// utils/dimensions.ts - Helper tính toán kích thước responsive dựa trên chiều cao màn hình
import { Dimensions, Platform } from "react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window"); // Lấy kích thước window (không tính status bar)

// Hàm tính padding top động: % chiều cao màn hình, điều chỉnh theo platform (iOS notch cao hơn)
export const getDynamicTopPadding = (percentage: number = 0.12) => {
  // Mặc định 12% để cách đều, dễ đọc
  let adjustedPercentage = percentage;
  if (Platform.OS === "ios") {
    adjustedPercentage += 0.02; // iOS notch thường cần thêm 2% để tránh che
  }
  return SCREEN_HEIGHT * adjustedPercentage;
};

// Export để dùng global
export { SCREEN_HEIGHT, SCREEN_WIDTH };

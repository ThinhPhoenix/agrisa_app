import { useResultStatus } from "@/components/result-status/useResultStatus";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useLocalSearchParams } from "expo-router";

/**
 * Màn hình Payment Cancel
 * 
 * Deep link: agrisa://payment/cancel
 * 
 * Handle khi người dùng hủy thanh toán từ PayOS
 * Hiển thị thông báo warning và tự động redirect về danh sách policy
 */
export default function PaymentCancelScreen() {
  const { colors } = useAgrisaColors();
  const resultStatus = useResultStatus();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log("❌ Payment Cancel Screen - Deep link triggered");
    console.log("📦 Params:", params);

    // Hiển thị màn hình hủy thanh toán
    resultStatus.showWarning({
      title: "Thanh toán đã hủy",
      message: "Bạn đã hủy giao dịch thanh toán",
      subMessage:
        "Hợp đồng vẫn ở trạng thái chờ thanh toán. Bạn có thể thanh toán lại sau.",
      showHomeButton: true,
      lockNavigation: true,
      homeRoute: "/(tabs)/",
      autoRedirectSeconds: 5,
      autoRedirectRoute: "/(tabs)",
    });
  }, []);

  // Hiển thị loading trong khi chuyển hướng
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.warning} />
    </View>
  );
}

import { useResultStatus } from "@/components/result-status/useResultStatus";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Màn hình Payment Success
 *
 * Deep link: agrisa://payment/success
 *
 * Handle khi thanh toán thành công từ PayOS
 * Hiển thị thông báo success và tự động redirect về danh sách policy
 */
export default function PaymentSuccessScreen() {
  const { colors } = useAgrisaColors();
  const resultStatus = useResultStatus();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log("✅ Payment Success Screen - Deep link triggered");
    console.log("📦 Params:", params);

    // Hiển thị màn hình thành công
    resultStatus.showSuccess({
      title: "Thanh toán thành công!",
      message: "Hợp đồng bảo hiểm của bạn đã được kích hoạt",
      subMessage:
        "Bạn có thể xem chi tiết hợp đồng trong mục 'Bảo hiểm của tôi'",
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
      <ActivityIndicator size="large" color={colors.success} />
    </View>
  );
}

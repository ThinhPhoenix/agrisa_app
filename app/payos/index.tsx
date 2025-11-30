import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PayOS() {
  const params = useLocalSearchParams();
  const checkoutUrl = params.checkoutUrl as string;
  const returnUrl = params.returnUrl as string; // agrisa://payment/success
  const cancelUrl = params.cancelUrl as string; // agrisa://payment/cancel
  const { colors } = useAgrisaColors();

  if (!checkoutUrl) {
    router.back();
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: checkoutUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={colors.success} />
          </View>
        )}
        onNavigationStateChange={(navState) => {
          const { url } = navState;
          console.log("🔗 Navigation URL:", url);

          // ✅ Kiểm tra success (hỗ trợ cả dev và prod URLs)
          // Dev: exp://192.168.x.x:8081/--/payment/success
          // Prod: agrisa://payment/success
          if (
            url.includes("/payment/success") ||
            url.includes("agrisa://payment/success")
          ) {
            console.log("✅ Payment successful - Navigate to success screen");
            router.replace("/payment/success");
          }
          // ✅ Kiểm tra cancel (hỗ trợ cả dev và prod URLs)
          // Dev: exp://192.168.x.x:8081/--/payment/cancel
          // Prod: agrisa://payment/cancel
          else if (
            url.includes("/payment/cancel") ||
            url.includes("agrisa://payment/cancel")
          ) {
            console.log("❌ Payment cancelled - Navigate to cancel screen");
            router.replace("/payment/cancel");
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("❌ WebView error:", nativeEvent);
          router.back();
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("❌ WebView HTTP error:", nativeEvent.statusCode);
        }}
      />
    </View>
  );
}

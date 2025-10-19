import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function PayOS() {
  const params = useLocalSearchParams();
  const checkoutUrl = params.checkoutUrl as string;
  const returnUrl = params.returnUrl as string;
  const cancelUrl = params.cancelUrl as string;

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
        onNavigationStateChange={(navState) => {
          const { url } = navState;

          if (url === returnUrl) {
            console.log("Payment successful");
            router.back();
          } else if (url === cancelUrl) {
            console.log("Payment cancelled");
            router.back();
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView HTTP error:", nativeEvent.statusCode);
        }}
      />
    </View>
  );
}

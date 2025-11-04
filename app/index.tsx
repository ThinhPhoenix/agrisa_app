import { logger } from "@/domains/shared/utils/logger";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * 🎯 Root Index - Điểm khởi đầu của app
 * 
 * Flow:
 * 1. Check xem đã có identifier cache chưa
 * 2. Nếu CÓ → redirect tới /auth/sign-in (user đã từng đăng nhập)
 * 3. Nếu KHÔNG → redirect tới /auth/username-sign-in (user mới)
 * 
 * Note: KHÔNG check auth token ở đây, chỉ check identifier
 */
export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasIdentifier, setHasIdentifier] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      logger.info("App", "Checking initial route...");

      // Chỉ check identifier, KHÔNG check token
      const identifier = await secureStorage.getIdentifier();

      if (identifier) {
        logger.info("App", "Found cached identifier, redirect to sign-in");
        setHasIdentifier(true);
      } else {
        logger.info("App", "No cached identifier, redirect to username-sign-in");
        setHasIdentifier(false);
      }
    } catch (error) {
      logger.error("App", "Error checking initial route", error);
      // Nếu có lỗi, mặc định về username-sign-in
      setHasIdentifier(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading khi đang check
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A3142A" />
      </View>
    );
  }

  // // Redirect dựa trên kết quả check
  // if (hasIdentifier) {
  //   return <Redirect href="/auth/sign-in" />;
  // }

  return <Redirect href="/auth/sign-in" />;
}
import { logger } from "@/domains/shared/utils/logger";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";

/**
 * 🔐 Hook quản lý cached authentication data
 * - Load identifier từ SecureStore
 * - Kiểm tra biometric availability
 * - Detect biometric type (Face ID / Fingerprint)
 */
export const useCachedAuth = () => {
  const [cachedIdentifier, setCachedIdentifier] = useState<string | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Vân tay");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      setIsLoading(true);

      // 1. Detect biometric type
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType("Khuôn mặt");
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        setBiometricType("Vân tay");
      }

      // 2. Load cached identifier
      const lastIdentifier = await secureStorage.getIdentifier();

      if (lastIdentifier) {
        setCachedIdentifier(lastIdentifier);

        // 3. Check biometric status
        const biometricEnabled =
          await secureStorage.isBiometricEnabled(lastIdentifier);
        setIsBiometricEnabled(biometricEnabled);

        logger.auth.authSuccess("Cached auth loaded", {
          identifier: lastIdentifier,
          biometricEnabled,
          biometricType,
        });
      } else {
        logger.auth.authSuccess("No cached identifier found");
        // ❌ BỎ auto redirect - Để app/index.tsx xử lý
        // router.replace("/auth/username-sign-in");
      }
    } catch (error) {
      logger.auth.authError("Error loading cached data", error);
      // Don't redirect on error, let user try manual login
    } finally {
      setIsLoading(false);
    }
  };

  const clearCachedIdentifier = async () => {
    try {
      await secureStorage.clearIdentifier();
      setCachedIdentifier(null);
      setIsBiometricEnabled(false);
      logger.auth.authSuccess("Cached identifier cleared");
    } catch (error) {
      logger.auth.authError("Error clearing cached identifier", error);
    }
  };

  const refreshBiometricStatus = async () => {
    if (!cachedIdentifier) return;

    try {
      const enabled = await secureStorage.isBiometricEnabled(cachedIdentifier);
      setIsBiometricEnabled(enabled);
    } catch (error) {
      logger.auth.authError("Error refreshing biometric status", error);
    }
  };

  return {
    cachedIdentifier,
    isBiometricEnabled,
    biometricType,
    isLoading,
    clearCachedIdentifier,
    refreshBiometricStatus,
  };
};
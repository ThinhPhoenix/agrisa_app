import { UserProfile } from "@/domains/auth/models/auth.models";
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ============================================
// 📦 STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "agrisa_access_token",
  USER_DATA: "agrisa_user_data",
  SAVED_IDENTIFIER: "agrisa_saved_identifier",
  DEVICE_ID: "agrisa_device_id",
  BIOMETRIC_PREFIX: "agrisa_biometric",
  USER_PROFILE: "agrisa_user_profile",
  FULL_NAME: "agrisa_full_name",
} as const;

// ============================================
// 🧹 HELPER: SANITIZE IDENTIFIER
// ============================================
/**
 * Sanitize identifier thành format an toàn cho SecureStore key
 * - Thay thế ký tự đặc biệt bằng underscore
 * - Chỉ giữ lại: a-z, 0-9, dot, dash, underscore
 * - Lowercase để consistent
 *
 * @example
 * - "user@email.com" → "user_email_com"
 * - "+84987654321" → "84987654321"
 * - "test.user-123" → "test_user_123"
 */
const sanitizeIdentifier = (identifier: string): string => {
  return (
    identifier
      .trim()
      .toLowerCase()
      // Thay thế tất cả ký tự không hợp lệ bằng underscore
      .replace(/[^a-z0-9._-]/g, "_")
      // Loại bỏ underscore liên tiếp
      .replace(/_+/g, "_")
      // Loại bỏ underscore ở đầu/cuối
      .replace(/^_+|_+$/g, "")
  );
};

// ============================================
// 🔐 HELPER: VALIDATE KEY FORMAT
// ============================================
/**
 * Validate key format cho SecureStore
 * Key phải:
 * - Không rỗng
 * - Chỉ chứa: alphanumeric, dot, dash, underscore
 * - Độ dài từ 1-100 ký tự
 */
const validateKey = (key: string): boolean => {
  if (!key || key.length === 0 || key.length > 100) {
    return false;
  }
  // Chỉ cho phép: a-z, A-Z, 0-9, dot, dash, underscore
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  return validPattern.test(key);
};

// ============================================
// 🔐 HELPER: GET DEVICE ID
// ============================================
/**
 * Lấy Device ID duy nhất cho thiết bị
 * iOS: identifierForVendor
 * Android: androidId
 */
const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      if (Platform.OS === "ios") {
        deviceId = (await Application.getIosIdForVendorAsync()) || "";
      } else if (Platform.OS === "android") {
        deviceId = (await Application.getAndroidId()) || "";
      }

      // Fallback: tạo random ID nếu không lấy được
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }

      // Sanitize device ID trước khi lưu
      deviceId = sanitizeIdentifier(deviceId);

      await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId);
      console.log(`✅ [SecureStorage] Device ID generated: ${deviceId}`);
    }

    return deviceId;
  } catch (error) {
    console.error("❌ [SecureStorage] Error getting device ID:", error);
    // Fallback với timestamp
    return `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
};

/**
 * Tạo key cho biometric theo account và device
 * Format: agrisa_biometric_{sanitized_identifier}_{deviceId}
 *
 * ⚠️ QUAN TRỌNG: Key phải tuân thủ format của SecureStore
 * Chỉ chấp nhận: alphanumeric, dot, dash, underscore
 */
const getBiometricKey = async (identifier: string): Promise<string> => {
  // ✅ Validate identifier trước khi tạo key
  if (!identifier || identifier.trim().length === 0) {
    throw new Error("Identifier không được để trống");
  }

  // ✅ Sanitize identifier để loại bỏ ký tự đặc biệt
  const sanitizedIdentifier = sanitizeIdentifier(identifier);

  // ✅ Validate lại sau khi sanitize
  if (sanitizedIdentifier.length === 0) {
    throw new Error(
      `Identifier không hợp lệ sau khi sanitize: "${identifier}"`
    );
  }

  const deviceId = await getDeviceId();

  // ✅ Sanitize cả deviceId để chắc chắn
  const sanitizedDeviceId = sanitizeIdentifier(deviceId);

  const key = `${STORAGE_KEYS.BIOMETRIC_PREFIX}_${sanitizedIdentifier}_${sanitizedDeviceId}`;

  // ✅ VALIDATE KEY CUỐI CÙNG
  if (!validateKey(key)) {
    throw new Error(`Invalid SecureStore key generated: "${key}"`);
  }

  console.log(`🔑 [SecureStorage] Generated biometric key: ${key}`);
  console.log(`   Original identifier: ${identifier}`);
  console.log(`   Sanitized identifier: ${sanitizedIdentifier}`);

  return key;
};

// ============================================
// 🔐 SECURE STORAGE SERVICE
// ============================================
export const secureStorage = {
  // ============================================
  // 👤 USER TOKEN & DATA
  // ============================================

  /**
   * Lưu access token
   */
  setToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
      console.log("✅ [SecureStorage] Token stored: " + token);
    } catch (error) {
      console.error("❌ [SecureStorage] Error storing token:", error);
      throw error;
    }
  },

  /**
   * Lấy access token
   */
  getToken: async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      return token;
    } catch (error) {
      console.error("❌ [SecureStorage] Error getting token:", error);
      return null;
    }
  },

  /**
   * Lưu user data
   */
  setUser: async (user: any): Promise<void> => {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
      console.log("✅ [SecureStorage] User data stored");
    } catch (error) {
      console.error("❌ [SecureStorage] Error storing user:", error);
      throw error;
    }
  },

  /**
   * Lấy user data
   */
  getUser: async (): Promise<any | null> => {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("❌ [SecureStorage] Error getting user:", error);
      return null;
    }
  },

  /**
   * Xóa token (giữ lại user data)
   */
  clearUserToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      console.log("✅ [SecureStorage] User token cleared");
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing token:", error);
    }
  },

  /**
   * Xóa tất cả auth data (token + user)
   */
  clearAuth: async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
      ]);
      console.log("✅ [SecureStorage] Auth data cleared");
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing auth:", error);
    }
  },

  // ============================================
  // 📧 IDENTIFIER MANAGEMENT (Email/Phone)
  // ============================================

  /**
   * Lưu identifier (email hoặc phone) của account đã đăng nhập
   * Dùng để hiển thị lại khi user mở app
   */
  setIdentifier: async (identifier: string): Promise<void> => {
    try {
      const normalizedIdentifier = identifier.trim();
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SAVED_IDENTIFIER,
        normalizedIdentifier
      );
      console.log(
        `✅ [SecureStorage] Identifier saved: ${normalizedIdentifier}`
      );
    } catch (error) {
      console.error("❌ [SecureStorage] Error saving identifier:", error);
      throw error;
    }
  },

  /**
   * Lấy identifier đã lưu
   */
  getIdentifier: async (): Promise<string | null> => {
    try {
      const identifier = await SecureStore.getItemAsync(
        STORAGE_KEYS.SAVED_IDENTIFIER
      );
      if (identifier) {
        console.log(`✅ [SecureStorage] Identifier retr ieved: ${identifier}`);
      }
      return identifier;
    } catch (error) {
      console.error("❌ [SecureStorage] Error getting identifier:", error);
      return null;
    }
  },

  /**
   * Xóa identifier đã lưu (khi user đăng xuất hoặc đổi tài khoản)
   */
  clearIdentifier: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SAVED_IDENTIFIER);
      console.log("✅ [SecureStorage] Identifier cleared");
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing identifier:", error);
    }
  },

  // ============================================
  // 🔐 BIOMETRIC AUTHENTICATION - SIMPLIFIED
  // ============================================

  /**
   * ✅ MỚI: Set biometric password - SINGLE SOURCE OF TRUTH
   * Function này vừa lưu password, vừa enable biometric
   * Nếu muốn disable → Gọi clearBiometricPassword()
   */
  setBiometricPassword: async (
    identifier: string,
    password: string
  ): Promise<void> => {
    try {
      if (!identifier || identifier.trim().length === 0) {
        throw new Error("Identifier không được để trống");
      }

      if (!password || password.length === 0) {
        throw new Error("Password không được để trống");
      }

      console.log(`🔐 [SecureStorage] Setting biometric for: ${identifier}`);

      const key = await getBiometricKey(identifier);

      // Tạo encryption
      const deviceId = await getDeviceId();
      const encryptionSeed = `${deviceId}_${identifier.trim()}_agrisa_secret`;

      const encryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        encryptionSeed
      );

      const salt = Date.now().toString(36);
      const encryptedPassword = btoa(
        `${salt}:${password}:${encryptionKey.substring(0, 16)}`
      );

      const biometricData = {
        identifier: identifier.trim(),
        encryptedPassword,
        enabledAt: new Date().toISOString(),
        deviceId,
        salt,
        version: "1.0", // Để track version nếu cần migrate
      };

      await SecureStore.setItemAsync(key, JSON.stringify(biometricData));
      console.log(
        `✅ [SecureStorage] Biometric enabled & password saved for ${identifier}`
      );
    } catch (error) {
      console.error(
        "❌ [SecureStorage] Error setting biometric password:",
        error
      );
      throw error;
    }
  },

  /**
   * Kiểm tra biometric có enabled không
   * → Chỉ cần check data có tồn tại hay không
   */
  isBiometricEnabled: async (identifier: string): Promise<boolean> => {
    try {
      if (!identifier || identifier.trim().length === 0) {
        return false;
      }

      const key = await getBiometricKey(identifier);

      if (!validateKey(key)) {
        console.log(`⚠️ [SecureStorage] Invalid key: ${key}`);
        return false;
      }

      const data = await SecureStore.getItemAsync(key);

      if (!data) {
        return false;
      }

      const biometricData = JSON.parse(data);
      const currentDeviceId = await getDeviceId();

      if (biometricData.deviceId !== currentDeviceId) {
        console.log(`⚠️ [SecureStorage] Device mismatch for ${identifier}`);
        return false;
      }

      console.log(`✅ [SecureStorage] Biometric enabled for ${identifier}`);
      return true;
    } catch (error) {
      console.error("❌ [SecureStorage] Error checking biometric:", error);
      return false;
    }
  },

  /**
   * Lấy password đã giải mã
   */
  getBiometricPassword: async (identifier: string): Promise<string | null> => {
    try {
      if (!identifier || identifier.trim().length === 0) {
        return null;
      }

      const key = await getBiometricKey(identifier);
      const data = await SecureStore.getItemAsync(key);

      if (!data) {
        console.log(`ℹ️ [SecureStorage] No biometric data for ${identifier}`);
        return null;
      }

      const biometricData = JSON.parse(data);
      const currentDeviceId = await getDeviceId();

      if (biometricData.deviceId !== currentDeviceId) {
        console.log(`⚠️ [SecureStorage] Device mismatch`);
        return null;
      }

      // Giải mã
      const {
        encryptedPassword,
        salt,
        identifier: originalIdentifier,
      } = biometricData;

      const deviceId = await getDeviceId();
      const encryptionSeed = `${deviceId}_${originalIdentifier}_agrisa_secret`;
      const encryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        encryptionSeed
      );

      const decrypted = atob(encryptedPassword);
      const parts = decrypted.split(":");

      if (parts.length !== 3 || parts[0] !== salt) {
        console.error("❌ [SecureStorage] Invalid encrypted format");
        return null;
      }

      return parts[1];
    } catch (error) {
      console.error("❌ [SecureStorage] Error getting password:", error);
      return null;
    }
  },

  /**
   * ✅ ĐƠN GIẢN: Xóa biometric = Xóa password
   */
  clearBiometricPassword: async (identifier: string): Promise<void> => {
    try {
      if (!identifier || identifier.trim().length === 0) {
        return;
      }

      const key = await getBiometricKey(identifier);

      if (!validateKey(key)) {
        console.log(`⚠️ [SecureStorage] Invalid key, skip delete`);
        return;
      }

      try {
        await SecureStore.deleteItemAsync(key);
        console.log(`✅ [SecureStorage] Biometric cleared for ${identifier}`);
      } catch (deleteError: any) {
        if (!deleteError.message?.includes("not found")) {
          throw deleteError;
        }
        console.log(`ℹ️ [SecureStorage] Key not found (already cleared)`);
      }
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing biometric:", error);
    }
  },

  /**
   * ✅ ALIAS: clearBiometric = clearBiometricPassword
   */
  clearBiometric: async (identifier: string): Promise<void> => {
    return secureStorage.clearBiometricPassword(identifier);
  },

  clearAllBiometricData: async (): Promise<void> => {
    try {
      const savedIdentifier = await secureStorage.getIdentifier();

      if (savedIdentifier) {
        await secureStorage.clearBiometric(savedIdentifier);
      }

      console.log("✅ [SecureStorage] All biometric data cleared");
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing all biometric:", error);
    }
  },

  // ============================================
  // 🔄 DEVICE MANAGEMENT
  // ============================================

  /**
   * Lấy Device ID của thiết bị hiện tại
   */
  getDeviceId: async (): Promise<string> => {
    return await getDeviceId();
  },

  /**
   * Reset Device ID (dùng cho testing hoặc troubleshooting)
   * ⚠️ CẢNH BÁO: Sẽ làm mất tất cả biometric settings
   */
  resetDeviceId: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.DEVICE_ID);
      console.log("⚠️ [SecureStorage] Device ID reset");
    } catch (error) {
      console.error("❌ [SecureStorage] Error resetting device ID:", error);
    }
  },

  // ============================================
  // 🧹 FULL CLEANUP
  // ============================================

  /**
   * Xóa TẤT CẢ dữ liệu (logout hoàn toàn)
   * Bao gồm: token, user, identifier, biometric
   */
  clearAll: async (): Promise<void> => {
    try {
      const savedIdentifier = await secureStorage.getIdentifier();

      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
        SecureStore.deleteItemAsync(STORAGE_KEYS.SAVED_IDENTIFIER),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE),
        // Xóa biometric của account hiện tại
        savedIdentifier
          ? secureStorage.clearBiometric(savedIdentifier)
          : Promise.resolve(),
      ]);

      console.log("✅ [SecureStorage] All data cleared");
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing all data:", error);
    }
  },

  // ============================================
  // 👤 USER PROFILE
  // ============================================

  /**
   * Lưu user profile chi tiết từ /me
   */
  setUserProfile: async (profile: UserProfile): Promise<void> => {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
      console.log("✅ [SecureStorage] User profile stored");
    } catch (error) {
      console.error("❌ [SecureStorage] Error storing user profile:", error);
      throw error;
    }
  },

  /**
   * Lấy user profile đã lưu
   */
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const profileData = await SecureStore.getItemAsync(
        STORAGE_KEYS.USER_PROFILE
      );
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error("❌ [SecureStorage] Error getting user profile:", error);
      return null;
    }
  },

  // ============================================
  // 👤 FULL NAME (để hiển thị ở màn hình đăng nhập)
  // ============================================

  /**
   * Lưu full name từ profile để hiển thị lại khi mở app
   */
  setFullName: async (fullName: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.FULL_NAME, fullName);
      console.log(`✅ [SecureStorage] Full name saved: ${fullName}`);
    } catch (error) {
      console.error("❌ [SecureStorage] Error saving full name:", error);
      throw error;
    }
  },

  /**
   * Lấy full name đã lưu
   */
  getFullName: async (): Promise<string | null> => {
    try {
      const fullName = await SecureStore.getItemAsync(STORAGE_KEYS.FULL_NAME);
      return fullName;
    } catch (error) {
      console.error("❌ [SecureStorage] Error getting full name:", error);
      return null;
    }
  },

  /**
   * Xóa full name đã lưu
   */
  clearFullName: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.FULL_NAME);
      console.log("✅ [SecureStorage] Full name cleared");
    } catch (error) {
      console.error("❌ [SecureStorage] Error clearing full name:", error);
    }
  },
};

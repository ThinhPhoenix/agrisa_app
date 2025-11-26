import useAxios from "@/config/useAxios.config";
import { logger } from "@/domains/shared/utils/logger";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { router } from "expo-router";
import { Alert } from "react-native";
import { create } from "zustand";
import { AuthState, AuthUser } from "../models/auth.models";
import { AuthServices } from "../service/auth.service";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,

  // Set data sau khi login thành công
  setAuth: async (token: string, user: AuthUser) => {
    try {
      await secureStorage.setToken(token);
      await secureStorage.setUser(user);

      // Lưu identifier để nhớ tài khoản
      const identifier = user.email || user.phone_number;
      if (identifier) {
        await secureStorage.setIdentifier(identifier);
      }

      set({
        accessToken: token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log("✅ [Auth] Authentication set successfully");

      // ✅ Thử lấy user profile chi tiết
      try {
        await get().fetchUserProfile();
      } catch (profileError) {
        console.log(
          "⚠️ [Auth] Could not fetch user profile, using basic auth data",
          profileError
        );
      }
    } catch (error) {
      console.error("❌ [Auth] Error setting auth:", error);
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    logger.auth.tokenCheck("Starting token validation");
    const [token, user] = await Promise.all([
      secureStorage.getToken(),
      secureStorage.getUser(),
    ]);

    try {
      const response = await useAxios.get(
        `/auth/protected/api/v2/ekyc-progress/${user.id}`
      );

      if (response.status === 200) {
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.auth.authSuccess("Token verified successfully", {
          userId: user.id,
          ekycStatus: response.data?.data?.status,
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const currentState = get();

        if (currentState.isAuthenticated && currentState.user) {
          logger.auth.tokenExpired("Token expired during active session");

          await secureStorage.clearAuth();
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else {
          logger.auth.tokenCheck(
            "401 error but user already logged out, ignoring"
          );
          set({ isLoading: false });
        }
      } else {
        logger.auth.authError("Error checking auth", error);
        set({ isLoading: false });
        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
          [
            {
              text: "Đăng nhập",
              onPress: () => {
                logger.auth.logout(
                  "User dismissed 401 alert, redirecting to sign-in"
                );
                router.replace("/auth/sign-in");
              },
            },
          ]
        );
      }
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      logger.auth.logout("Starting logout process");

      await secureStorage.clearAuth();

      set({
        accessToken: null,
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });

      logger.auth.logout("Logged out successfully");
      router.replace("/auth/sign-in");
    } catch (error) {
      logger.auth.authError("Error during logout", error);
      set({ isLoading: false });
    }
  },

  refreshAuth: async () => {
    try {
      set({ isLoading: true });
      logger.auth.tokenCheck("Refreshing auth from storage");

      const [token, user, userProfile] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
        secureStorage.getUserProfile(),
      ]);

      if (token && user) {
        set({
          accessToken: token,
          user,
          userProfile,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.auth.authSuccess("Authentication refreshed from storage", {
          userId: user.id,
          hasProfile: !!userProfile,
        });

        // ✅ THÊM: Verify token ngay sau khi refresh
        // Nếu token hết hạn sẽ tự động logout
        await get().checkAuth();
      } else {
        set({
          accessToken: null,
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
        logger.auth.tokenCheck("No stored authentication found");
      }
    } catch (error) {
      logger.auth.authError("Error refreshing auth", error);
      set({
        accessToken: null,
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // ✅ SIMPLIFIED: Enable biometric - CHỈ 1 FUNCTION DUY NHẤT
  enableBiometric: async (password: string) => {
    try {
      const { user } = get();

      if (!user) {
        throw new Error("Chưa đăng nhập");
      }

      const identifier = user.email || user.phone_number;

      if (!identifier || identifier.trim().length === 0) {
        throw new Error("Không tìm thấy thông tin tài khoản");
      }

      if (!password || password.trim().length === 0) {
        throw new Error("Vui lòng nhập mật khẩu");
      }

      console.log(`🔐 [Auth] Enabling biometric for: ${identifier}`);

      // ✅ CHỈ GỌI 1 FUNCTION DUY NHẤT
      // Function này vừa lưu password, vừa enable biometric
      await secureStorage.setBiometricPassword(
        identifier.trim(),
        password.trim()
      );

      console.log(`✅ [Auth] Biometric enabled successfully`);
      return true;
    } catch (error: any) {
      console.error("❌ [Auth] Error enabling biometric:", error);
      throw new Error(error.message || "Không thể kích hoạt Face ID");
    }
  },

  // ✅ SIMPLIFIED: Disable biometric - CHỈ GỌI clearBiometricPassword
  disableBiometric: async () => {
    try {
      const { user } = get();

      if (!user) {
        console.log("⚠️ [Auth] No user to disable biometric");
        return;
      }

      const identifier = user.email || user.phone_number;

      if (!identifier || identifier.trim().length === 0) {
        console.log("⚠️ [Auth] No valid identifier");
        return;
      }

      console.log(`🔐 [Auth] Disabling biometric for: ${identifier}`);

      // ✅ CHỈ GỌI 1 FUNCTION
      await secureStorage.clearBiometricPassword(identifier.trim());

      console.log(`✅ [Auth] Biometric disabled successfully`);
    } catch (error) {
      console.error("❌ [Auth] Error disabling biometric:", error);
      throw error;
    }
  },

  clearAuth: async () => {
    try {
      await secureStorage.clearAuth();

      set({
        accessToken: null,
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("✅ [Auth] Auth cleared");
    } catch (error) {
      console.error("❌ [Auth] Error clearing auth:", error);
    }
  },

  // ✅ MỚI: Fetch user profile chi tiết từ /me
  fetchUserProfile: async () => {
    try {
      const { isAuthenticated } = get();

      if (!isAuthenticated) {
        console.log("⚠️ [Auth] Cannot fetch profile - not authenticated");
        return;
      }

      console.log("🔄 [Auth] Fetching user profile from /me...");

      const response = await AuthServices.getUserProfile();

      // Type guard để kiểm tra response
      if ("data" in response && response.data) {
        const userProfile = response.data;

        // Lưu vào SecureStore
        await secureStorage.setUserProfile(userProfile);

        // Cập nhật state
        set({ userProfile });

        console.log("✅ [Auth] User profile fetched and stored successfully");
      } else {
        console.log("⚠️ [Auth] No profile data in response");
      }
    } catch (error: any) {
      console.error("❌ [Auth] Error fetching user profile:", error);
      // Không throw error, chỉ log vì profile không bắt buộc
      // App vẫn hoạt động được với AuthUser
    }
  },
}));

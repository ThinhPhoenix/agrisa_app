import { logger } from "@/domains/shared/utils/logger";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import axios from "axios";
import { router } from "expo-router";
import { create } from "zustand";
import { AuthState, AuthUser } from "../models/auth.models";
import useAxios from "@/config/useAxios.config";
import { Alert } from "react-native";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Set data sau khi login thành công
  setAuth: async (token: string, user: AuthUser) => {
    try {
      await secureStorage.setToken(token);
      await secureStorage.setUser(user);

      set({
        accessToken: token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      logger.auth.authSuccess("Authentication set successfully", {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.auth.authError("Error setting auth", error);
      set({ isLoading: false });
    }
  },

  // ✅ Cập nhật checkAuth với logger
  checkAuth: async () => {
    set({ isLoading: true });
    logger.auth.tokenCheck("Starting token validation");
    try {
      const [user] = await Promise.all([secureStorage.getUser()]);
      logger.warn("1", "1");
      const response = await useAxios.get(
        `/auth/protected/api/v2/ekyc-progress/${user.id}`
      );

      // Token hợp lệ -> Set auth state
      if (response.status === 200) {
        logger.auth.authSuccess("Token verified successfully", {
          userId: user.id,
          ekycStatus: response.data?.data?.status,
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        logger.auth.tokenExpired("Token expired or invalid (401)");
        await secureStorage.clearAuth();
        logger.info("Auth", "Redirecting to sign-in (silent)");
      } else {
        logger.auth.authError("Error checking auth", error);
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
          ],
          {
            cancelable: false,
          }
        );
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({ isLoading: true });
      logger.auth.logout("Starting logout process");

      // Clear SecureStore
      await secureStorage.clearAuth();

      // Reset state
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      logger.auth.logout("Logged out successfully");
    } catch (error) {
      logger.auth.authError("Error during logout", error);
      set({ isLoading: false });
    }
  },

  // ✅ Refresh auth từ storage
  refreshAuth: async () => {
    try {
      set({ isLoading: true });
      logger.auth.tokenCheck("Refreshing auth from storage");

      const [token, user] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
      ]);

      if (token && user) {
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.auth.authSuccess("Authentication refreshed from storage", {
          userId: user.id,
        });
      } else {
        set({
          accessToken: null,
          user: null,
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
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Clear auth (dùng khi logout hoặc token invalid)
  clearAuth: async () => {
    try {
      logger.auth.logout("Clearing auth data");
      await secureStorage.clearAuth();
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      logger.auth.authSuccess("Auth cleared successfully");
    } catch (error) {
      logger.auth.authError("Error clearing auth", error);
    }
  },
}));

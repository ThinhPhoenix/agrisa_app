import { secureStorage } from "@/domains/shared/utils/secureStorage";
import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";
import { create } from "zustand";
import { AuthState, AuthUser } from "../models/auth.models";

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
      console.log("✅ [Auth] Authentication set successfully");
    } catch (error) {
      console.error("❌ [Auth] Error setting auth:", error);
      set({ isLoading: false });
    }
  },

  // ✅ Cập nhật checkAuth - Sử dụng eKYC progress để verify token
  checkAuth: async () => {
    try {
      set({ isLoading: true });

      // Lấy user và token từ storage
      const [token, user] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
      ]);

      // Nếu không có token hoặc user -> chưa đăng nhập
      if (!token || !user) {
        console.log("⚠️ [Auth] No stored credentials found");
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // ✅ Verify token bằng cách gọi API eKYC progress
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/protected/api/v2/ekyc-progress/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Token hợp lệ -> Set auth state
        if (response.status === 200) {
          set({
            accessToken: token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log("✅ [Auth] Token verified successfully");
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          console.log("❌ [Auth] Token expired or invalid (401)");

          // Clear auth
          await secureStorage.clearAuth();
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // Thông báo và redirect
          Alert.alert(
            "Phiên đăng nhập hết hạn",
            "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
            [
              {
                text: "Đăng nhập",
                onPress: () => router.replace("/auth/sign-in"),
              },
            ]
          );
        } else {
          console.error("⚠️ [Auth] Error checking auth:", error);
          set({
            accessToken: token,
            user,
            isAuthenticated: true, // Vẫn cho phép sử dụng offline
            isLoading: false,
          });
        }
      }
    } catch (error) {
      console.error("❌ [Auth] Fatal error in checkAuth:", error);
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({ isLoading: true });

      // Clear SecureStore
      await secureStorage.clearAuth();

      // Reset state
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      console.log("✅ [Auth] Logged out successfully");
    } catch (error) {
      console.error("❌ [Auth] Error during logout:", error);
      set({ isLoading: false });
    }
  },

  // Refresh auth từ storage (dùng khi app start)
  refreshAuth: async () => {
    try {
      set({ isLoading: true });

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
        console.log("✅ [Auth] Authentication refreshed from storage");
      } else {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        console.log("⚠️ [Auth] No stored authentication found");
        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
          [
            {
              text: "Đăng nhập",
              onPress: () => router.replace("/auth/sign-in"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("❌ [Auth] Error refreshing auth:", error);
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      Alert.alert(
        "Phiên đăng nhập hết hạn",
        "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
        [
          {
            text: "Đăng nhập",
            onPress: () => router.replace("/auth/sign-in"),
          },
        ]
      );
    }
  },

  // Clear auth (dùng khi logout hoặc token invalid)
  clearAuth: async () => {
    try {
      await secureStorage.clearAuth();
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("✅ [Auth] Auth cleared");
    } catch (error) {
      console.error("❌ [Auth] Error clearing auth:", error);
    }
  },
}));

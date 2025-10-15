import { secureStorage } from "@/domains/shared/utils/secureStorage";
import axios from "axios";
import { router } from "expo-router";
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

  // ✅ Cập nhật checkAuth - KHÔNG alert, chỉ clear và log
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
          console.log("❌ [Auth] Token expired or invalid (401) - Detected by checkAuth");

          // ✅ Chỉ clear auth, KHÔNG alert (để Axios interceptor xử lý)
          await secureStorage.clearAuth();
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // ✅ Silent redirect - Axios interceptor sẽ hiển thị alert
          console.log("🔄 [Auth] Redirecting to sign-in (silent)");
          // Không cần router.replace ở đây vì Axios interceptor đã xử lý
        } else {
          console.error("⚠️ [Auth] Error checking auth:", error);
          // Vẫn cho phép sử dụng offline nếu lỗi mạng
          set({
            accessToken: token,
            user,
            isAuthenticated: true,
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

  // ✅ Refresh auth từ storage - CHỈ alert nếu KHÔNG có token trong storage
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
        router.push("/(tabs)");
      } else {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        console.log("⚠️ [Auth] No stored authentication found");
        
        // ✅ KHÔNG alert ở đây - User chưa đăng nhập là bình thường
        // Chỉ redirect về sign-in
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error("❌ [Auth] Error refreshing auth:", error);
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // ✅ KHÔNG alert - redirect silent
      router.replace("/auth/sign-in");
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

import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { create } from "zustand";
import { AuthState, AuthUser } from "../models/auth.models";

export const useAuthStore = create<AuthState>((set, get) => ({

  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  //set data sau khi login thành công của Access Token và User Data
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

  // Dành cho refresh token
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
        console.log("[Auth] No stored authentication found");
      }
    } catch (error) {
      console.error("[Auth] Error refreshing auth:", error);
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  // Dành cho refresh token

  //Dành cho Log Out
  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

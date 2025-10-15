import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { AuthState } from "../models/auth.models";
import { useAuthStore } from "../stores/auth.store";

// Context
const AuthContext = createContext<AuthState | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  const appState = useRef(AppState.currentState);

  // ✅ Initialize auth khi app khởi động
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 [AuthProvider] Initializing authentication...");
      await authStore.refreshAuth();
      await authStore.checkAuth();
    };

    initializeAuth();
  }, []);

  // ✅ Kiểm tra token khi app quay lại foreground (từ background)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        // Khi app chuyển từ background/inactive sang active
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("🔄 [AuthProvider] App returned to foreground");

          // ✅ Chỉ check auth nếu user đã đăng nhập
          if (authStore.isAuthenticated) {
            console.log("🔍 [AuthProvider] Checking token validity...");
            await authStore.checkAuth();
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [authStore.isAuthenticated]);

  // ✅ Kiểm tra token định kỳ mỗi 5 phút (khi app đang active)
  useEffect(() => {
    // Chỉ check khi user đã đăng nhập
    if (!authStore.isAuthenticated) {
      console.log(
        "⏭️ [AuthProvider] Skip periodic check - User not authenticated"
      );
      return;
    }

    console.log(
      "⏰ [AuthProvider] Starting periodic token check (every 5 minutes)"
    );
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 phút

    const interval = setInterval(async () => {
      // Chỉ check khi app đang active (không ở background)
      if (AppState.currentState === "active" && authStore.isAuthenticated) {
        console.log("🔄 [AuthProvider] Periodic token check");
        await authStore.checkAuth();
      }
    }, CHECK_INTERVAL);

    return () => {
      console.log("🛑 [AuthProvider] Stopping periodic token check");
      clearInterval(interval);
    };
  }, [authStore.isAuthenticated]);

  // ✅ Kiểm tra token khi user tương tác với app (optional - aggressive checking)
  useEffect(() => {
    if (!authStore.isAuthenticated) return;

    let lastCheckTime = Date.now();
    const MIN_CHECK_INTERVAL = 60 * 1000; // Tối thiểu 1 phút giữa các lần check

    const handleUserInteraction = async () => {
      const now = Date.now();

      // Chỉ check nếu đã qua MIN_CHECK_INTERVAL từ lần check cuối
      if (
        now - lastCheckTime > MIN_CHECK_INTERVAL &&
        authStore.isAuthenticated
      ) {
        console.log("👆 [AuthProvider] User interaction - Checking token");
        lastCheckTime = now;
        await authStore.checkAuth();
      }
    };

    // Lắng nghe AppState change để detect user interaction
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleUserInteraction();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [authStore.isAuthenticated]);

  return (
    <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Auth guard component
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback;
  }

  return isAuthenticated ? <>{children}</> : fallback;
};

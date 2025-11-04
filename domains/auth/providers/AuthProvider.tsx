import { logger } from "@/domains/shared/utils/logger";
import { AxiosError } from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import useAuthMe from "../hooks/use-auth-me";
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
  const {
    data: userData,
    isLoading: isAuthMeLoading,
    error: authMeError,
    refetch: refetchAuthMe,
  } = useAuthMe();

  // ❌ BỎ useEffect này - Không auto check auth khi app start
  // useEffect(() => {
  //   const initializeAuth = async () => {
  //     logger.info("AuthProvider", "Initializing authentication");
  //     await authStore.refreshAuth();
  //     await authStore.checkAuth();
  //   };
  //   initializeAuth();
  // }, []);

  // ✅ GIỮ NGUYÊN - Check auth khi app quay lại foreground (chỉ khi đã authenticated)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          logger.info("AuthProvider", "App returned to foreground");

          // CHỈ check nếu user đã đăng nhập
          if (authStore.isAuthenticated) {
            logger.auth.tokenCheck("Checking token validity after foreground");
            await authStore.checkAuth();
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [authStore.isAuthenticated, authStore]);

  // ✅ GIỮ NGUYÊN - Periodic token check (chỉ khi đã authenticated)
  useEffect(() => {
    if (!authStore.isAuthenticated) {
      logger.debug(
        "AuthProvider",
        "Skip periodic check - User not authenticated"
      );
      return;
    }

    logger.info(
      "AuthProvider",
      "Starting periodic token check (every 5 minutes)"
    );
    const CHECK_INTERVAL = 5 * 60 * 1000;

    const interval = setInterval(async () => {
      logger.auth.tokenCheck("Running periodic token check");
      await authStore.checkAuth();
    }, CHECK_INTERVAL);

    return () => {
      logger.info("AuthProvider", "Stopping periodic token check");
      clearInterval(interval);
    };
  }, [authStore.isAuthenticated, authStore]);

  // ✅ MỚI: Chạy auth me khi app mở (provider mount)
  useEffect(() => {
    const runAuthMeOnAppOpen = async () => {
      if (authStore.isAuthenticated) {
        // Chỉ chạy nếu đã đăng nhập
        logger.info("AuthProvider", "Running auth me on app open");
        await refetchAuthMe();
      }
    };
    runAuthMeOnAppOpen();
  }, [authStore.isAuthenticated, authStore, refetchAuthMe]); // Chạy 1 lần khi mount

  // ✅ MỚI: Xử lý kết quả từ auth me
  useEffect(() => {
    if (userData && !isAuthMeLoading) {
      logger.auth.authSuccess("Auth me success, updating user data", userData);
      // Cập nhật user trong store (giả sử userData là object user)
      authStore.setAuth(authStore.accessToken!, userData); // Hoặc chỉ update user nếu cần
    }
    if (authMeError) {
      logger.auth.authError("Auth me failed", authMeError);
      // Nếu lỗi 401, trigger logout
      if (
        authMeError instanceof AxiosError &&
        authMeError.response?.status === 401
      ) {
        authStore.logout();
      }
    }
  }, [userData, isAuthMeLoading, authMeError, authStore]);

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

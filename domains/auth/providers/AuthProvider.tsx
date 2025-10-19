import { logger } from "@/domains/shared/utils/logger";
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
      logger.info("AuthProvider", "Initializing authentication");
      await authStore.refreshAuth();
      await authStore.checkAuth();
    };

    initializeAuth();
  }, []);

  // ✅ Kiểm tra token khi app quay lại foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          logger.info("AuthProvider", "App returned to foreground");

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
  }, [authStore.isAuthenticated]);

  // ✅ Kiểm tra token định kỳ mỗi 5 phút
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
      if (AppState.currentState === "active" && authStore.isAuthenticated) {
        logger.auth.tokenCheck("Periodic token check");
        await authStore.checkAuth();
      }
    }, CHECK_INTERVAL);

    return () => {
      logger.info("AuthProvider", "Stopping periodic token check");
      clearInterval(interval);
    };
  }, [authStore.isAuthenticated]);

  // ✅ Kiểm tra token khi user tương tác
  useEffect(() => {
    if (!authStore.isAuthenticated) return;

    let lastCheckTime = Date.now();
    const MIN_CHECK_INTERVAL = 60 * 1000;

    const handleUserInteraction = async () => {
      const now = Date.now();

      if (
        now - lastCheckTime > MIN_CHECK_INTERVAL &&
        authStore.isAuthenticated
      ) {
        logger.auth.tokenCheck("User interaction detected - Checking token");
        lastCheckTime = now;
        await authStore.checkAuth();
      }
    };

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

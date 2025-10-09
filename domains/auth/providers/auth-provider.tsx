import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { AuthState } from "../models/auth-model";
import { useAuthStore } from "../stores/auth-store";

// Context
const AuthContext = createContext<AuthState | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 [AuthProvider] Initializing authentication...");
      await authStore.refreshAuth();
    };

    initializeAuth();
  }, []);

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

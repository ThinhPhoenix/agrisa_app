import { useThemeStore } from "@/domains/agrisa-theme/stores/theme-store";
import { createAgrisaConfig } from "@/gluestack-ui.config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

interface AgrisaThemeProviderProps {
  children: React.ReactNode;
}

export const AgrisaThemeProvider: React.FC<AgrisaThemeProviderProps> = ({
  children,
}) => {
  const { mode, isInitialized, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, []);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#059669",
        }}
      >
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const dynamicConfig = createAgrisaConfig(mode === "dark");

  return (
    <GluestackUIProvider config={dynamicConfig}>{children}</GluestackUIProvider>
  );
};

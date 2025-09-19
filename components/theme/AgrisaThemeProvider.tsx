import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
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

  // Load saved theme khi app khởi động
  useEffect(() => {
    initializeTheme();
  }, []);

  // Hiển thị loading cho đến khi theme được khởi tạo
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

  // Tạo config động dựa trên theme hiện tại
  const dynamicConfig = createAgrisaConfig(mode === "dark");

  console.log(`🎨 [Agrisa] AgrisaThemeProvider rendering với mode: ${mode}`);

  return (
    <GluestackUIProvider config={dynamicConfig}>{children}</GluestackUIProvider>
  );
};

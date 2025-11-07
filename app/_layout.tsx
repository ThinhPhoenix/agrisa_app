import "@/global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
} from "@expo-google-fonts/bricolage-grotesque";
import { DancingScript_400Regular } from "@expo-google-fonts/dancing-script";

import { useEffect } from "react";

import ResponsiveWrapper from "@/components/common/ResponsiveWrapper";
import NetworkWrapper from "@/components/connection/NetworkWrapper";
import { AgrisaThemeProvider } from "@/components/theme/AgrisaThemeProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { AuthProvider } from "@/domains/auth/providers/AuthProvider";
import { ToastProvider } from "@/domains/shared/hooks/useToast";
import { QueryProvider } from "@/libs/query/QueryClientProvider";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar"; // ✅ THÊM import này
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { initializeTheme } = useThemeStore();
  const { colors, isDark } = useAgrisaColors();
  const [loaded, error] = useFonts({
    "BricolageGrotesque-Regular": BricolageGrotesque_400Regular,
    "BricolageGrotesque-Medium": BricolageGrotesque_500Medium,
    "BricolageGrotesque-SemiBold": BricolageGrotesque_600SemiBold,
    "DancingScript-Regular": DancingScript_400Regular,
  });

  // Khởi tạo theme khi app start
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(colors.background);
    NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
  }, [colors.background, isDark]);

  // Hiển thị loading cho đến khi font được tải
  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <NetworkWrapper>
            <AgrisaThemeProvider>
              <ResponsiveWrapper>
                <ToastProvider>
                  {/* ✅ THÊM StatusBar component - Tự động đổi màu theo theme */}
                  <StatusBar
                    style={isDark ? "light" : "dark"}
                    backgroundColor={colors.background}
                    translucent={false}
                  />

                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{
                        headerShown: false,
                        gestureEnabled: false,
                      }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </ToastProvider>
              </ResponsiveWrapper>
            </AgrisaThemeProvider>
          </NetworkWrapper>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

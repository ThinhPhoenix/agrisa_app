import { useFonts } from "expo-font";
import "@/global.css";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
} from "@expo-google-fonts/bricolage-grotesque";

import { useEffect } from "react";

import { AgrisaThemeProvider } from "@/components/theme/AgrisaThemeProvider";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { QueryProvider } from "@/libs/query/QueryClientProvider";
import NetworkWrapper from "@/components/connection/NetworkWrapper";
import ResponsiveWrapper from "@/components/common/ResponsiveWrapper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/domains/shared/hooks/useToast";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { AuthProvider } from "@/domains/auth/providers/AuthProvider";

export default function RootLayout() {
  const { initializeTheme } = useThemeStore();
  const { colors, isDark } = useAgrisaColors();
  const [loaded, error] = useFonts({
    "BricolageGrotesque-Regular": BricolageGrotesque_400Regular,
    "BricolageGrotesque-Medium": BricolageGrotesque_500Medium,
    "BricolageGrotesque-SemiBold": BricolageGrotesque_600SemiBold,
  });

  // Khởi tạo theme khi app start
  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Hiển thị loading cho đến khi font được tải
  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={colors.background}
        style={isDark ? "light" : "dark"}
      />
      <AuthProvider>
        <NetworkWrapper>
          <QueryProvider>
            <AgrisaThemeProvider>
              <ResponsiveWrapper>
                <ToastProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </ToastProvider>
              </ResponsiveWrapper>
            </AgrisaThemeProvider>
          </QueryProvider>
        </NetworkWrapper>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

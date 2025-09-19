import "@/global.css";
import { useFonts } from "expo-font";
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

export default function RootLayout() {
  const { initializeTheme } = useThemeStore();

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
      <NetworkWrapper>
        <QueryProvider>
          <AgrisaThemeProvider>
            <ResponsiveWrapper>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: "transparent",
                  },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ResponsiveWrapper>
          </AgrisaThemeProvider>
        </QueryProvider>
      </NetworkWrapper>
    </SafeAreaProvider>
  );
}

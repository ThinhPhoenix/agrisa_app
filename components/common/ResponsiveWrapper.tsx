import React from "react";
import { View } from "@gluestack-ui/themed";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "@/domains/shared/hooks/useResponsive";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { usePathname } from "expo-router";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string; // Cho phép override màu nền nếu cần
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  backgroundColor,
}) => {
  const { isLandscape } = useResponsive();
  const insets = useSafeAreaInsets();
  const { colors } = useAgrisaColors();
  const pathname = usePathname();

  // Danh sách các route cần full-screen (không padding-top, transparent background)
  const fullScreenRoutes = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/sign-up/forgot-password",
    "/auth/username-sign-in",
    "/auth/sign-up/cccd-input",
    "/auth/sign-up/email-input",
    "/auth/sign-up/otp-verification",
    "/auth/sign-up/phone-verification",
    "/auth/sign-up/index",
    "/",
  ];

  const isFullScreen = fullScreenRoutes.includes(pathname || "");

  return (
    <View
      flex={1}
      w={wp("100%")}
      h={hp("100%")}
      pt={isFullScreen ? 0 : insets.top} // Không padding-top cho full-screen routes
      pl={insets.left}
      pr={insets.right}
      backgroundColor={isFullScreen ? "transparent" : colors.background} // Transparent cho full-screen
    >
      {children}
    </View>
  );
};

export default ResponsiveWrapper;

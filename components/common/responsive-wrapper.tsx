import { useAgrisaColors } from "@/domains/agrisa-theme/hooks/use-agrisa-colors";
import { useResponsive } from "@/domains/shared/hooks/use-responsive";
import { View } from "@gluestack-ui/themed";
import React from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return (
    <View
      flex={1}
      w={wp("100%")}
      h={hp("100%")}
      pt={insets.top}
      pl={insets.left}
      pr={insets.right}
      backgroundColor={colors.background} // Áp dụng màu nền từ theme
    >
      {children}
    </View>
  );
};

export default ResponsiveWrapper;

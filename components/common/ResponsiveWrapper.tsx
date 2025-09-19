import React from "react";
import { View } from "@gluestack-ui/themed";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "@/domains/shared/hooks/useResponsive";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";

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

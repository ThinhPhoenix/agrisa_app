import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import PublicBasePolicyScreen from "@/domains/policy/components/public-base-policy";
import { Box, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Info } from "lucide-react-native";
import { useState } from "react";
import { Animated, ImageBackground } from "react-native";

export default function PolicyHomeScreen() {
  const { colors } = useAgrisaColors();
  const [scrollY] = useState(new Animated.Value(0));

  // Cover Image Component with Parallax Effect
  const CoverImage = () => {
    // Scale tăng khi scroll xuống (từ 1.0 -> 1.3) - CHỈ CHO ẢNH
    const imageScale = scrollY.interpolate({
      inputRange: [-200, 0],
      outputRange: [1.3, 1.0],
      extrapolate: "clamp",
    });

    return (
      <Box overflow="hidden" mb="$4" mx={0} px={0} position="relative">
        {/* Ảnh nền với Parallax Effect */}
        <Animated.View
          style={{
            transform: [{ scale: imageScale }],
            width: "100%",
          }}
        >
          <ImageBackground
            source={require("@/assets/images/Cover/Agrisa-Cover-Policy.png")}
            style={{ width: "100%", aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Overlay Text - KHÔNG BỊ PARALLAX */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          justifyContent="flex-end"
          p="$4"
        >
          <VStack space="xs">
            <Box flexDirection="row" alignItems="center" mb="$1">
              <Box
                bg={colors.primary}
                p="$1.5"
                borderRadius="$sm"
                alignItems="center"
                justifyContent="center"
              >
                <Info
                  size={14}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_white_text}
                ml="$2"
              >
                Chương trình bảo hiểm
              </Text>
            </Box>
            <Text
              fontSize="$xs"
              color={colors.primary_white_text}
              lineHeight="$md"
            >
              Khám phá và đăng ký các chương trình bảo hiểm nông nghiệp phù hợp
              với trang trại của bạn.
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title="Chương trình bảo hiểm"
        showBackButton={true}
        onBack={() => router.back()}
      />

      {/* Main Content with Cover */}
      <PublicBasePolicyScreen
        headerComponent={<CoverImage />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </VStack>
  );
}

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { ClaimEventList } from "@/domains/claim-event-monitor/components";
import { useClaim } from "@/domains/claim-event-monitor/hooks/use-claim";
import { Box, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { AlertTriangle, Info } from "lucide-react-native";
import { useState } from "react";
import { Animated, ImageBackground } from "react-native";

export default function ClaimListScreen() {
  const { colors } = useAgrisaColors();
  const [scrollY] = useState(new Animated.Value(0));

  // Sử dụng hook để lấy danh sách claims
  const { getAllClaimData } = useClaim();
  const { data: claimData, isLoading, refetch, isRefetching } = getAllClaimData();

  // Lấy danh sách claims từ response
  const claims = claimData?.success ? claimData.data?.claims || [] : [];

  /**
   * Cover Image Component với Parallax Effect
   */
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
          {/* Sử dụng ảnh cover cho yêu cầu bồi thường */}
          <ImageBackground
            source={require("@/assets/images/Cover/Agrisa-Cover-Claim.png")}
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
                Yêu cầu bồi thường
              </Text>
            </Box>
            <Text
              fontSize="$xs"
              color={colors.primary_white_text}
              lineHeight="$md"
            >
              Theo dõi và quản lý các yêu cầu bồi thường từ hệ thống giám sát vệ
              tinh tự động phát hiện thiệt hại cây trồng.
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
        title="Yêu cầu bồi thường"
        showBackButton={true}
        onBack={() => router.back()}
      />

      {/* Main Content with Cover */}
      <ClaimEventList
        claims={claims}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refetch}
        headerComponent={<CoverImage />}
        emptyMessage="Chưa có yêu cầu bồi thường nào"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </VStack>
  );
}

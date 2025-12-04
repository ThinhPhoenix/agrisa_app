import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { PublicFarmList } from '@/domains/farm/components/public-farm';
import { useFarm } from '@/domains/farm/hooks/use-farm';
import { Farm } from '@/domains/farm/models/farm.models';
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import { Box, Button, ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Info, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Animated, ImageBackground } from "react-native";

export default function FarmsListScreen() {
  const { colors } = useAgrisaColors();
  const { getListFarm } = useFarm();
  const [scrollY] = useState(new Animated.Value(0));

  // Fetch danh sách farms từ API
  const { data: farmsResponse, isLoading, refetch, isRefetching } = getListFarm();

  // Lấy dữ liệu farms từ response (check success response)
  const farms: Farm[] = farmsResponse?.success ? farmsResponse.data : [];

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  /**
   * Navigate to farm detail
   */
  const handleFarmPress = useCallback((farm: Farm) => {
    router.push({
      pathname: "/(farmer)/farm/[id]",
      params: { id: farm.id },
    });
  }, []);

  /**
   * Navigate to register new farm
   */
  const handleRegisterFarm = useCallback(() => {
    router.push({
      pathname: '/(farmer)/form-farm/[id]',
              params: { id: 'new' }
    });
  }, []);

  // Cover Image Component with Parallax Effect
  const CoverImage = () => {
    // Scale tăng khi scroll xuống (từ 1.0 -> 1.3) - CHỈ CHO ẢNH
    const imageScale = scrollY.interpolate({
      inputRange: [-200, 0],
      outputRange: [1.3, 1.0],
      extrapolate: "clamp",
    });

    return (
      <Box overflow="hidden" mb="$4" mx={-16} position="relative">
        {/* Ảnh nền với Parallax Effect */}
        <Animated.View
          style={{
            transform: [{ scale: imageScale }],
            width: "100%",
          }}
        >
          <ImageBackground
            source={require("@/assets/images/Cover/Agrisa-Cover-Farm.png")}
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
                Quản lý trang trại
              </Text>
            </Box>
            <Text
              fontSize="$xs"
              color={colors.primary_white_text}
              lineHeight="$md"
            >
              Đăng ký và quản lý thông tin các trang trại của bạn để sử dụng 
              dịch vụ bảo hiểm nông nghiệp.
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <Box flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader title="Trang trại của tôi" showBackButton={true} />

      {/* Farm List with Cover Image */}
      <PublicFarmList
        farms={farms}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onFarmPress={handleFarmPress}
        headerComponent={
          <>
            {/* Cover Image với Parallax */}
            <CoverImage />

            {/* Register Button */}
            <Box pb="$4">
              <Button
                onPress={handleRegisterFarm}
                backgroundColor={AgrisaColors.light.primary}
                borderRadius={12}
                $active={{
                  backgroundColor: AgrisaColors.light.success,
                }}
              >
                <HStack space="sm" alignItems="center">
                  <Plus size={20} color={AgrisaColors.light.primary_white_text} />
                  <ButtonText
                    color={AgrisaColors.light.primary_white_text}
                    fontSize={16}
                    fontWeight="600"
                  >
                    Đăng ký trang trại mới
                  </ButtonText>
                </HStack>
              </Button>
            </Box>
          </>
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </Box>
  );
}
import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { PublicFarmList } from '@/domains/farm/components/public-farm';
import { useFarm } from '@/domains/farm/hooks/use-farm';
import { Farm } from '@/domains/farm/models/farm.models';
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import { Box, Button, ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Info, Plus } from "lucide-react-native";
import React, { useCallback } from "react";

export default function FarmsListScreen() {
  const { colors } = useAgrisaColors();
  const { getListFarm } = useFarm();

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

  return (
    <Box flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader title="Trang trại của tôi" showBackButton={true} />

      {/* Mô tả trang */}
      <Box px="$4" pt="$4" pb="$3">
        <HStack 
          space="sm" 
          alignItems="flex-start" 
          bg={AgrisaColors.light.infoSoft}
          borderRadius={12}
          p="$3"
          borderWidth={1}
          borderColor={AgrisaColors.light.info}
        >
          <Box mt="$0.5">
            <Info size={18} color={AgrisaColors.light.info} strokeWidth={2.5} />
          </Box>
          <VStack flex={1} space="xs">
            <Text 
              color={AgrisaColors.light.primary_text} 
              fontSize={14} 
              fontWeight="700"
            >
              Quản lý thông tin trang trại
            </Text>
            <Text 
              color={AgrisaColors.light.secondary_text} 
              fontSize={12} 
              lineHeight={18}
            >
              Đăng ký và quản lý thông tin các trang trại của bạn. Thông tin này sẽ được dùng để đăng ký bảo hiểm và theo dõi tình trạng cây trồng.
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Register Button */}
      <Box px="$4" pb="$2">
        <Button
          onPress={handleRegisterFarm}
          backgroundColor={AgrisaColors.light.primary}
          borderRadius={12}
          $active={{
            backgroundColor: AgrisaColors.light.success,
          }}
        >
          <HStack space="sm" alignItems="center">
            <Plus size={20} color={AgrisaColors.light.white_button_text} />
            <ButtonText
              color={AgrisaColors.light.white_button_text}
              fontSize={16}
              fontWeight="600"
            >
              Đăng ký trang trại mới
            </ButtonText>
          </HStack>
        </Button>
      </Box>

      {/* Farm List */}
      <PublicFarmList
        farms={farms}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onFarmPress={handleFarmPress}
      />
    </Box>
  );
}
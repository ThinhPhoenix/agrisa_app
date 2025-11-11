import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { PublicFarmList } from '@/domains/farm/components/public-farm';
import { Farm } from '@/domains/farm/models/farm.models';
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import { Box, Button, ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Info, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";

export default function FarmsListScreen() {
  const { colors } = useAgrisaColors();

  // TODO: Replace với real API call
  const [farms, setFarms] = useState<Farm[]>([
    {
      id: "60f1ba11-c37d-40d3-97e2-0f2ac2ae20e8",
      farm_name: "Trang trại lúa Đồng Tháp",
      farm_code: "dEA671o57D",
      boundary: {
        type: "Polygon",
        coordinates: [
          [
            [105.6252, 10.4583],
            [105.6352, 10.4583],
            [105.6352, 10.4483],
            [105.6252, 10.4483],
            [105.6252, 10.4583],
          ],
        ],
      },
      center_location: {
        type: "Point",
        coordinates: [105.6302, 10.4533],
      },
      area_sqm: 50000,
      province: "Đồng Tháp",
      district: "Cao Lãnh",
      commune: "Mỹ Hội",
      address: "Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh, tỉnh Đồng Tháp",
      crop_type: "rice",
      planting_date: 1704067200,
      expected_harvest_date: 1714521600,
      crop_type_verified: false,
      land_certificate_number: "SH-2024-001234",
      land_ownership_verified: false,
      has_irrigation: true,
      irrigation_type: "canal",
      soil_type: "alluvial",
      status: "active",
      created_at: "2025-11-06T13:20:58.742857687+07:00",
      updated_at: "2025-11-06T13:20:58.742857846+07:00",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // TODO: Call API to fetch farms
    // await refetch();

    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

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
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onFarmPress={handleFarmPress}
      />
    </Box>
  );
}
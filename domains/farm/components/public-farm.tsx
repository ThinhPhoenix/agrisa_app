import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Farm } from "@/domains/farm/models/farm.models";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  Calendar,
  FileCheck,
  Leaf,
  MapPin,
  Shield,
  Wheat,
} from "lucide-react-native";
import React from "react";
import { FlatList, Image, RefreshControl, StyleSheet } from "react-native";

interface PublicFarmListProps {
  farms: Farm[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onFarmPress?: (farm: Farm) => void;
}

export const PublicFarmList: React.FC<PublicFarmListProps> = ({
  farms,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onFarmPress,
}) => {
  const { colors } = useAgrisaColors();

  const getCropIcon = (cropType: string) => {
    if (cropType === "rice") {
      return {
        icon: Wheat,
        color: AgrisaColors.light.success,
        bgColor: AgrisaColors.light.successSoft,
        isImage: false,
      };
    }
    return { 
      icon: require("@/assets/images/Icon/Coffea-Icon.png"), 
      color: colors.primary, // Coffee brown
      bgColor: "#FFF5E6", // Light cream
      isImage: true,
    };
  };

  const renderFarmCard = ({ item: farm }: { item: Farm }) => {
    const { icon: CropIcon, color, bgColor, isImage } = getCropIcon(farm.crop_type);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(farmer)/form-farm/[id]",
            params: { id: farm.id },
          })
        }
        mb="$3"
      >
        <Box
          bg={AgrisaColors.light.background}
          borderRadius={20}
          borderWidth={1}
          borderColor={AgrisaColors.light.frame_border}
          overflow="hidden"
        >
          <Box bg={bgColor} p="$4" pb="$3">
            <HStack
              justifyContent="space-between"
              alignItems="flex-start"
              mb="$2"
            >
              <VStack flex={1} mr="$3">
                <Text
                  color={AgrisaColors.light.primary_text}
                  fontSize={18}
                  fontWeight="700"
                  numberOfLines={2}
                  mb="$1"
                >
                  {farm.farm_name}
                </Text>
                <HStack space="xs" alignItems="center">
                  <MapPin
                    size={14}
                    color={AgrisaColors.light.secondary_text}
                    strokeWidth={2}
                  />
                  <Text
                    color={AgrisaColors.light.secondary_text}
                    fontSize={13}
                    numberOfLines={1}
                    flex={1}
                  >
                    {farm.district}, {farm.province}
                  </Text>
                </HStack>
              </VStack>
              <Box
                bg={color}
                borderRadius="$full"
                p="$2.5"
                shadowColor={color}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.3}
                shadowRadius={4}
              >
                {isImage ? (
                  <Image 
                    source={CropIcon} 
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                ) : (
                  <CropIcon
                    size={24}
                    color={AgrisaColors.light.primary_white_text}
                    strokeWidth={2.5}
                  />
                )}
              </Box>
            </HStack>
          </Box>
          <Box p="$4" pt="$3">
            {/* Main Info Row */}
            <HStack space="md" justifyContent="space-between" mb="$3">
              <VStack flex={1}>
                <Text
                  color={AgrisaColors.light.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Diện tích
                </Text>
                <Text
                  color={AgrisaColors.light.primary_text}
                  fontSize={16}
                  fontWeight="700"
                >
                  {(farm.area_sqm)} ha
                </Text>
              </VStack>
              <VStack flex={1} alignItems="center">
                <Text
                  color={AgrisaColors.light.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Cây trồng
                </Text>
                <Text color={color} fontSize={16} fontWeight="700">
                  {Utils.getCropLabel(farm.crop_type)}
                </Text>
              </VStack>
              <VStack flex={1} alignItems="flex-end">
                <Text
                  color={AgrisaColors.light.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Loại đất
                </Text>
                <Text
                  color={AgrisaColors.light.primary_text}
                  fontSize={14}
                  fontWeight="600"
                >
                  {farm.soil_type === "alluvial" ? "Phù sa" : farm.soil_type}
                </Text>
              </VStack>
            </HStack>

            {/* Additional Info */}
            <VStack
              space="xs"
              pt="$2"
              borderTopWidth={1}
              borderTopColor={AgrisaColors.light.frame_border}
            >
              {farm.planting_date && (
                <HStack space="xs" alignItems="center" py="$1">
                  <Calendar
                    size={14}
                    color={AgrisaColors.light.muted_text}
                    strokeWidth={2}
                  />
                  <Text
                    color={AgrisaColors.light.secondary_text}
                    fontSize={12}
                    flex={1}
                  >
                    Ngày trồng:{" "}
                    <Text fontWeight="600">
                      {Utils.formatDateForMS(farm.planting_date)}
                    </Text>
                  </Text>
                </HStack>
              )}
              {farm.land_certificate_number && (
                <HStack space="xs" alignItems="center" py="$1">
                  <FileCheck
                    size={14}
                    color={AgrisaColors.light.muted_text}
                    strokeWidth={2}
                  />
                  <Text
                    color={AgrisaColors.light.secondary_text}
                    fontSize={12}
                    numberOfLines={1}
                    flex={1}
                  >
                    Sổ đỏ:{" "}
                    <Text fontWeight="600">{farm.land_certificate_number}</Text>
                  </Text>
                  {farm.land_ownership_verified && (
                    <Shield
                      size={12}
                      color={AgrisaColors.light.success}
                      strokeWidth={2.5}
                    />
                  )}
                </HStack>
              )}
            </VStack>
          </Box>
        </Box>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" px="$6" py="$20">
      <VStack space="lg" alignItems="center">
        <Box bg={AgrisaColors.light.successSoft} borderRadius="$full" p="$8">
          <Leaf size={64} color={AgrisaColors.light.success} />
        </Box>
        <VStack space="sm" alignItems="center">
          <Text
            fontSize={20}
            fontWeight="700"
            color={AgrisaColors.light.primary_text}
            textAlign="center"
          >
            Chưa có trang trại nào
          </Text>
          <Text
            fontSize={14}
            color={AgrisaColors.light.secondary_text}
            textAlign="center"
            px="$4"
          >
            Đăng ký trang trại để bắt đầu sử dụng dịch vụ bảo hiểm nông nghiệp
          </Text>
        </VStack>
       
      </VStack>
    </Box>
  );

  if (isLoading && farms.length === 0) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={AgrisaColors.light.primary} />
        <Text color={AgrisaColors.light.secondary_text} mt="$3">
          Đang tải...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={AgrisaColors.light.background}>
      <FlatList
        data={farms}
        renderItem={renderFarmCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[AgrisaColors.light.primary]}
          />
        }
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
});

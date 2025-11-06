import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { Farm } from '@/domains/farm/models/farm.models';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { Leaf, MapPin, Plus, Sprout } from 'lucide-react-native';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

interface PublicFarmListProps {
  /**
   * Danh sách farms của user
   */
  farms: Farm[];
  
  /**
   * Loading state khi fetch data
   */
  isLoading?: boolean;
  
  /**
   * Refreshing state khi pull-to-refresh
   */
  isRefreshing?: boolean;
  
  /**
   * Callback khi pull-to-refresh
   */
  onRefresh?: () => void;
  
  /**
   * Callback khi click vào farm card
   */
  onFarmPress?: (farm: Farm) => void;
}

/**
 * Component hiển thị danh sách nông trại của nông dân
 * 
 * Features:
 * - Pull-to-refresh để cập nhật danh sách
 * - Empty state với nút đăng ký farm mới
 * - Hiển thị thông tin: tên, địa chỉ, diện tích, loại cây
 * - Support rice và coffee crops
 */
export const PublicFarmList: React.FC<PublicFarmListProps> = ({
  farms,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onFarmPress,
}) => {
  const { colors } = useAgrisaColors();

  /**
   * Format diện tích: m² sang ha
   */
  const formatArea = (areaSqm: number) => {
    const areaHa = (areaSqm / 10000).toFixed(2);
    return `${areaSqm.toLocaleString('vi-VN')} m² / ${areaHa} ha`;
  };

  /**
   * Get crop label tiếng Việt
   */
  const getCropLabel = (cropType: string) => {
    const cropLabels: Record<string, string> = {
      rice: 'Lúa',
      coffee: 'Cà phê',
      corn: 'Ngô',
      pepper: 'Tiêu',
      dragon_fruit: 'Thanh long',
      durian: 'Sầu riêng',
    };
    return cropLabels[cropType] || cropType;
  };

  /**
   * Get crop icon và color
   */
  const getCropIcon = (cropType: string) => {
    if (cropType === 'rice') {
      return {
        icon: Leaf,
        color: colors.success,
        bgColor: colors.primarySoft,
      };
    }
    if (cropType === 'coffee') {
      return {
        icon: Sprout,
        color: '#8B4513', // Brown color for coffee
        bgColor: '#FFF8DC', // Cornsilk color
      };
    }
    // Default
    return {
      icon: Leaf,
      color: colors.success,
      bgColor: colors.primarySoft,
    };
  };

  /**
   * Get status indicator color
   */
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active: colors.success,
      inactive: colors.textMuted,
      pending_verification: colors.warning,
      archived: colors.error,
    };
    return statusColors[status] || colors.textMuted;
  };

  /**
   * Render từng farm card
   */
  const renderFarmCard = ({ item: farm }: { item: Farm }) => {
    const cropConfig = getCropIcon(farm.crop_type);
    const CropIcon = cropConfig.icon;

    return (
      <Pressable
        onPress={() => {
          // ✅ Navigate to edit screen với farm ID thật
          router.push({
            pathname: '/(farmer)/form-farm/[id]',
            params: { id: farm.id } // ID thật của farm
          });
        }}
        mb="$4"
      >
        <Box
          bg={colors.card}
          borderWidth={1}
          borderColor={colors.border}
          borderRadius="$xl"
          overflow="hidden"
          sx={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <VStack space="md" p="$4">
            {/* Header: Farm Name + Status Indicator */}
            <HStack alignItems="center" space="sm">
              {/* Status Indicator */}
              <Box
                w={10}
                h={10}
                borderRadius="$full"
                bg={getStatusColor(farm.status)}
              />
              
              {/* Farm Name */}
              <Text 
                flex={1}
                fontSize="$lg" 
                fontWeight="$bold" 
                color={colors.text}
                numberOfLines={2}
              >
                {farm.farm_name}
              </Text>
            </HStack>

            {/* Address */}
            <HStack space="xs" alignItems="flex-start">
              <MapPin 
                size={16} 
                color={colors.textSecondary} 
                strokeWidth={2}
                style={{ marginTop: 2 }}
              />
              <Text 
                flex={1}
                fontSize="$sm" 
                color={colors.textSecondary}
                lineHeight="$md"
                numberOfLines={2}
              >
                {farm.address}
              </Text>
            </HStack>

            {/* Footer: Area + Crop Type */}
            <HStack 
              justifyContent="space-between" 
              alignItems="center"
              pt="$2"
              borderTopWidth={1}
              borderTopColor={colors.border}
            >
              {/* Area */}
              <VStack flex={1}>
                <Text fontSize="$xs" color={colors.textSecondary}>
                  Diện tích
                </Text>
                <Text 
                  fontSize="$sm" 
                  fontWeight="$semibold" 
                  color={colors.text}
                  numberOfLines={1}
                >
                  {formatArea(farm.area_sqm)}
                </Text>
              </VStack>

              {/* Crop Type */}
              <VStack alignItems="flex-end">
                <Text fontSize="$xs" color={colors.textSecondary}>
                  Cây trồng
                </Text>
                <HStack space="xs" alignItems="center" mt="$1">
                  <Box 
                    bg={cropConfig.bgColor} 
                    borderRadius="$md" 
                    p="$1.5"
                  >
                    <CropIcon 
                      size={14} 
                      color={cropConfig.color} 
                      strokeWidth={2} 
                    />
                  </Box>
                  <Text 
                    fontSize="$sm" 
                    fontWeight="$bold" 
                    color={cropConfig.color}
                  >
                    {getCropLabel(farm.crop_type)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </Box>
      </Pressable>
    );
  };

  /**
   * Empty state - Chưa có farm nào
   */
  const renderEmptyState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" px="$6" py="$12">
      <VStack space="md" alignItems="center">
        {/* Icon */}
        <Box
          bg={colors.primarySoft}
          borderRadius="$full"
          p="$6"
        >
          <Leaf size={48} color={colors.success} strokeWidth={1.5} />
        </Box>

        {/* Title */}
        <Text 
          fontSize="$xl" 
          fontWeight="$bold" 
          color={colors.text}
          textAlign="center"
        >
          Chưa có nông trại nào
        </Text>

        {/* Description */}
        <Text 
          fontSize="$sm" 
          color={colors.textSecondary}
          textAlign="center"
          lineHeight="$md"
        >
          Đăng ký nông trại để bắt đầu sử dụng dịch vụ bảo hiểm nông nghiệp
        </Text>

        {/* CTA Button */}
        <Button
          bg={colors.success}
          size="lg"
          mt="$4"
          onPress={() => {
            // ✅ Navigate with "new" param
            router.push({
              pathname: '/(farmer)/form-farm/[id]',
              params: { id: 'new' } // Keyword "new" để create
            });
          }}
        >
          <HStack space="sm" alignItems="center">
            <Plus size={20} color={colors.textWhiteButton} strokeWidth={2.5} />
            <ButtonText 
              color={colors.textWhiteButton}
              fontWeight="$bold"
              fontSize="$md"
            >
              Đăng ký nông trại đầu tiên
            </ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );

  /**
   * Loading state - Lần đầu tiên
   */
  if (isLoading && farms.length === 0) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={colors.success} />
        <Text color={colors.textSecondary} mt="$3" fontSize="$sm">
          Đang tải danh sách nông trại...
        </Text>
      </Box>
    );
  }

  /**
   * Main list
   */
  return (
    <Box flex={1} bg={colors.background}>
      <FlatList
        data={farms}
        renderItem={renderFarmCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          farms.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.success]}
            tintColor={colors.success}
            title="Đang làm mới..."
            titleColor={colors.textSecondary}
          />
        }
      />

      {/* Floating Add Button - Hiện khi đã có farms */}
      {farms.length > 0 && (
        <Box position="absolute" bottom={20} right={20}>
          <Pressable
            onPress={() => {
              router.push({
                pathname: '/(farmer)/form-farm/[id]',
                params: { id: 'new' }
              });
            }}
          >
            <Box
              bg={colors.success}
              borderRadius="$full"
              w={60}
              h={60}
              alignItems="center"
              justifyContent="center"
              sx={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Plus size={28} color={colors.textWhiteButton} strokeWidth={2.5} />
            </Box>
          </Pressable>
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
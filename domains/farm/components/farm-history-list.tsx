import { AgrisaColors } from '@/domains/shared/constants/AgrisaColors';
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack,
} from '@gluestack-ui/themed';
import { CheckCircle2, Clock, Coffee, Leaf, MapPin, Sprout, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

interface FarmRegistrationHistory {
  id: string;
  farm_name: string;
  registration_date: number;
  status: 'pending' | 'approved' | 'rejected';
  province: string;
  district: string;
  area_sqm: number;
  crop_type: string; // 'rice', 'coffee', etc.
  rejection_reason?: string;
}

interface FarmHistoryListProps {
  historyList: FarmRegistrationHistory[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onItemPress?: (item: FarmRegistrationHistory) => void;
}

type TabType = 'rejected' | 'pending' | 'approved';

export const FarmHistoryList: React.FC<FarmHistoryListProps> = ({
  historyList,
  isRefreshing = false,
  onRefresh,
  onItemPress,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  /**
   * Tabs configuration
   */
  const tabs: { key: TabType; label: string; icon: any; color: string }[] = [
    {
      key: 'rejected',
      label: 'Từ chối',
      icon: XCircle,
      color: AgrisaColors.light.error,
    },
    {
      key: 'pending',
      label: 'Chờ duyệt',
      icon: Clock,
      color: AgrisaColors.light.pending,
    },
    {
      key: 'approved',
      label: 'Xác nhận',
      icon: CheckCircle2,
      color: AgrisaColors.light.success,
    },
  ];

  /**
   * Filter data theo tab
   */
  const filteredData = historyList.filter((item) => item.status === activeTab);

  /**
   * Get count by status
   */
  const getCountByStatus = (status: TabType) => {
    return historyList.filter((item) => item.status === status).length;
  };

  /**
   * Format date
   */
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Format area
   */
  const formatArea = (sqm: number) => {
    const hectares = (sqm / 10000).toFixed(2);
    return `${hectares} ha`;
  };

  /**
   * Get status config for header background color
   */
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Đã duyệt',
          color: AgrisaColors.light.success,
          bgColor: AgrisaColors.light.successSoft,
          Icon: CheckCircle2,
        };
      case 'pending':
        return {
          label: 'Chờ duyệt',
          color: AgrisaColors.light.pending,
          bgColor: AgrisaColors.light.primarySoft,
          Icon: Clock,
        };
      case 'rejected':
        return {
          label: 'Từ chối',
          color: AgrisaColors.light.error,
          bgColor: AgrisaColors.light.errorSoft,
          Icon: XCircle,
        };
      default:
        return {
          label: 'Không xác định',
          color: AgrisaColors.light.muted_text,
          bgColor: AgrisaColors.light.card_surface,
          Icon: Clock,
        };
    }
  };

  /**
   * Get crop icon and color
   */
  const getCropIcon = (cropType: string) => {
    if (cropType === 'rice') {
      return {
        icon: Leaf,
        color: AgrisaColors.light.success,
        bgColor: AgrisaColors.light.successSoft,
      };
    }
    if (cropType === 'coffee') {
      return {
        icon: Coffee,
        color: '#8B4513',
        bgColor: '#FFF8DC',
      };
    }
    // Default
    return {
      icon: Sprout,
      color: '#8B4513',
      bgColor: '#FFF8DC',
    };
  };

  /**
   * Render history item
   */
  const renderHistoryItem = (item: FarmRegistrationHistory) => {
    const statusConfig = getStatusConfig(item.status);
    const { icon: CropIcon, color: cropColor } = getCropIcon(item.crop_type);

    return (
      <Pressable key={item.id} onPress={() => onItemPress?.(item)} mb="$3">
        <Box
          bg={AgrisaColors.light.background}
          borderRadius={20}
          borderWidth={1}
          borderColor={AgrisaColors.light.frame_border}
          overflow="hidden"
        >
          {/* Header với màu theo status */}
          <Box bg={statusConfig.bgColor} p="$4" pb="$3">
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
                  {item.farm_name}
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
                    {item.district}, {item.province}
                  </Text>
                </HStack>
              </VStack>
              <Box
                bg={cropColor}
                borderRadius="$full"
                p="$2.5"
                shadowColor={cropColor}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.3}
                shadowRadius={4}
              >
                <CropIcon
                  size={24}
                  color={AgrisaColors.light.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
            </HStack>
          </Box>

          {/* Body */}
          <Box p="$4" pt="$3">
            {/* Main Info Row - 3 cột */}
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
                  {formatArea(item.area_sqm)}
                </Text>
              </VStack>
              <VStack flex={1} alignItems="center">
                <Text
                  color={AgrisaColors.light.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Trạng thái
                </Text>
                <Text color={statusConfig.color} fontSize={16} fontWeight="700">
                  {statusConfig.label}
                </Text>
              </VStack>
              <VStack flex={1} alignItems="flex-end">
                <Text
                  color={AgrisaColors.light.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Ngày đăng ký
                </Text>
                <Text
                  color={AgrisaColors.light.primary_text}
                  fontSize={13}
                  fontWeight="600"
                  textAlign="right"
                >
                  {formatDate(item.registration_date)}
                </Text>
              </VStack>
            </HStack>

            {/* Rejection reason nếu có */}
            {item.status === "rejected" && item.rejection_reason && (
              <VStack
                space="xs"
                pt="$2"
                borderTopWidth={1}
                borderTopColor={AgrisaColors.light.frame_border}
              >
                <Box
                  p="$3"
                  backgroundColor={AgrisaColors.light.errorSoft}
                  borderRadius={8}
                  borderLeftWidth={3}
                  borderLeftColor={AgrisaColors.light.error}
                >
                  <Text
                    color={AgrisaColors.light.error}
                    fontSize={12}
                    fontWeight="600"
                    mb="$1"
                  >
                    Lý do từ chối:
                  </Text>
                  <Text
                    color={AgrisaColors.light.error}
                    fontSize={12}
                    lineHeight={16}
                  >
                    {item.rejection_reason}
                  </Text>
                </Box>
              </VStack>
            )}
          </Box>
        </Box>
      </Pressable>
    );
  };

  /**
   * Empty state
   */
  const renderEmptyState = () => {
    const currentTabConfig = tabs.find((tab) => tab.key === activeTab);
    const Icon = currentTabConfig?.icon || Clock;
    const color = currentTabConfig?.color || AgrisaColors.light.muted_text;

    return (
      <Box flex={1} alignItems="center" justifyContent="center" py="$20">
        <Icon size={64} color={color} strokeWidth={1.5} />
        <Text
          color={AgrisaColors.light.muted_text}
          fontSize={16}
          mt="$4"
          textAlign="center"
        >
          Chưa có dữ liệu trong mục này
        </Text>
      </Box>
    );
  };

  return (
    <Box flex={1}>
      {/* Tabs Section */}
      <Box
        backgroundColor={AgrisaColors.light.background}
        borderBottomWidth={1}
        borderBottomColor={AgrisaColors.light.frame_border}
        px="$4"
        pt="$3"
        pb="$2"
      >
        <HStack space="sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getCountByStatus(tab.key);
            const Icon = tab.icon;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                flex={1}
              >
                <Box
                  backgroundColor={
                    isActive ? tab.color : AgrisaColors.light.card_surface
                  }
                  borderRadius={12}
                  py="$3"
                  px="$2"
                  alignItems="center"
                  borderWidth={isActive ? 0 : 1}
                  borderColor={AgrisaColors.light.frame_border}
                >
                  <Icon
                    size={20}
                    color={
                      isActive
                        ? AgrisaColors.light.primary_white_text
                        : tab.color
                    }
                    strokeWidth={2}
                  />
                  <Text
                    color={
                      isActive
                        ? AgrisaColors.light.primary_white_text
                        : AgrisaColors.light.primary_text
                    }
                    fontSize={13}
                    fontWeight="600"
                    mt="$1"
                  >
                    {tab.label}
                  </Text>
                  <Text
                    color={
                      isActive
                        ? AgrisaColors.light.primary_white_text
                        : AgrisaColors.light.secondary_text
                    }
                    fontSize={12}
                    fontWeight="500"
                  >
                    ({count})
                  </Text>
                </Box>
              </Pressable>
            );
          })}
        </HStack>
      </Box>

      {/* Content */}
      <ScrollView
        flex={1}
        px="$4"
        pt="$4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={AgrisaColors.light.primary}
            colors={[AgrisaColors.light.primary]}
          />
        }
      >
        {filteredData.length > 0 ? (
          <VStack space="md" pb="$6">
            {filteredData.map(renderHistoryItem)}
          </VStack>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </Box>
  );
};

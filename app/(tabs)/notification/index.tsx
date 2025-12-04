import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { useNotification } from "@/domains/notification/hooks/use-notification";
import {
  getNotificationDisplayType,
  NotificationItem,
} from "@/domains/notification/models/notification.model";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Shield,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { RefreshControl } from "react-native";

export default function NotificationScreen() {
  const { colors } = useAgrisaColors();

  // Sử dụng hook để lấy dữ liệu thông báo từ API
  const { getNotifcationList } = useNotification();
  const {
    data: notificationData,
    isLoading,
    isRefetching,
    refetch,
  } = getNotifcationList();

  // Lấy danh sách notifications từ response (check success trước)
  const notifications: NotificationItem[] = notificationData?.success
    ? (notificationData.data?.notifications ?? [])
    : [];

  // Refresh handler
  const handleRefresh = async () => {
    await refetch();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return {
          Icon: CheckCircle2,
          color: colors.success,
          bg: colors.successSoft,
        };
      case "error":
        return { Icon: XCircle, color: colors.error, bg: colors.errorSoft };
      case "warning":
        return {
          Icon: AlertCircle,
          color: colors.warning,
          bg: colors.warningSoft,
        };
      case "info":
        return { Icon: Shield, color: colors.info, bg: colors.infoSoft };
      default:
        return {
          Icon: Bell,
          color: colors.muted_text,
          bg: colors.card_surface,
        };
    }
  };

  const renderNotificationItem = (item: NotificationItem, index: number) => {
    // Sử dụng helper để map notification type sang display type
    const displayType = getNotificationDisplayType(item.type);
    const { Icon, color, bg } = getNotificationIcon(displayType);

    return (
      <Box key={item.id}>
        <Pressable
          onPress={() => {
            // TODO: Call API để đánh dấu đã đọc
            // Có thể thêm navigation đến chi tiết nếu cần
          }}
          py="$4"
        >
          <HStack space="md" alignItems="flex-start">
            <Box
              bg={color}
              borderRadius="$full"
              p="$2.5"
              w={40}
              h={40}
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                size={20}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
            <VStack flex={1} space="xs">
              <HStack justifyContent="space-between" alignItems="flex-start">
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                  flex={1}
                  mr="$2"
                >
                  {item.title}
                </Text>
                {!item.is_read && (
                  <Box w={8} h={8} borderRadius="$full" bg={colors.primary} />
                )}
              </HStack>
              <Text
                fontSize="$xs"
                color={colors.secondary_text}
                lineHeight="$lg"
              >
                {item.body}
              </Text>
              <Text fontSize="$xs" color={colors.muted_text} mt="$1">
                {Utils.formatDateForMS(
                  new Date(item.created_at).getTime() / 1000
                )}
              </Text>
            </VStack>
          </HStack>
        </Pressable>
        {index < notifications.length - 1 && (
          <Box h={1} bg={colors.frame_border} />
        )}
      </Box>
    );
  };

  // Loading state
  const renderLoadingState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" py="$20">
      <Spinner size="large" color={colors.primary} />
      <Text fontSize="$sm" color={colors.secondary_text} mt="$4">
        Đang tải thông báo...
      </Text>
    </Box>
  );

  const renderEmptyState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" py="$20">
      <Box bg={colors.card_surface} borderRadius="$full" p="$6" mb="$4">
        <Bell size={48} color={colors.muted_text} strokeWidth={1.5} />
      </Box>
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        mb="$2"
      >
        Chưa có thông báo
      </Text>
      <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
        Thông báo mới sẽ hiển thị tại đây
      </Text>
    </Box>
  );

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Thông báo" showBackButton={false} />

      {/* Hiển thị loading khi đang tải lần đầu */}
      {isLoading ? (
        renderLoadingState()
      ) : (
        <ScrollView
          px="$4"
          pt="$4"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {notifications.length > 0 ? (
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              borderWidth={1}
              borderColor={colors.frame_border}
              px="$4"
              mb="$6"
            >
              {notifications.map((notification, index) =>
                renderNotificationItem(notification, index)
              )}
            </Box>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      )}
    </Box>
  );
}

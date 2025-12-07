import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import NotificationList, {
  NotificationEmptyState,
  NotificationLoadingState,
} from "@/domains/notification/components/NotificationList";
import { useNotification } from "@/domains/notification/hooks/use-notification";
import { NotificationItem } from "@/domains/notification/models/notification.model";
import { Box, ScrollView } from "@gluestack-ui/themed";
import React from "react";
import { RefreshControl } from "react-native";

export default function NotificationScreen() {
  const { colors } = useAgrisaColors();

  // Sử dụng hook để lấy dữ liệu thông báo từ API
  const { getNotifcationList } = useNotification();
  const {
    data: response,
    isLoading,
    isRefetching,
    refetch,
  } = getNotifcationList();

  // Debug log
  console.log(
    "🔔 [NotificationScreen] Response:",
    JSON.stringify(response, null, 2)
  );

  // Lấy danh sách notifications từ response
  // API trả về: { success: true, data: { data: [...] } } hoặc { success: true, data: [...] }
  const getNotifications = (): NotificationItem[] => {
    if (!response) return [];

    const res = response as any;

    // Nếu response có success
    if (res.success && res.data) {
      // Nếu data là array
      if (Array.isArray(res.data)) {
        return res.data;
      }
      // Nếu data.data là array (nested)
      if (res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    }

    // Nếu response là array trực tiếp
    if (Array.isArray(res)) {
      return res;
    }

    return [];
  };

  const notifications = getNotifications();

  // Refresh handler
  const handleRefresh = async () => {
    await refetch();
  };

  // Handle item press
  const handleItemPress = (item: NotificationItem) => {
    console.log("🔔 [NotificationScreen] Item pressed:", item.id);
    // TODO: Navigate hoặc xử lý khi tap vào thông báo
    if (item.data?.url) {
      // Navigate to url if available
      console.log("🔔 Navigate to:", item.data.url);
    }
  };

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Thông báo" showBackButton={false} />

      {/* Hiển thị loading khi đang tải lần đầu */}
      {isLoading ? (
        <NotificationLoadingState />
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
            <NotificationList
              notifications={notifications}
              onItemPress={handleItemPress}
            />
          ) : (
            <NotificationEmptyState />
          )}
        </ScrollView>
      )}
    </Box>
  );
}

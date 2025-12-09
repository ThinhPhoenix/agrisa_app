import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useMarkAsRead from "@/domains/noti/hooks/use-mark-as-read";
import useMyNoti from "@/domains/noti/hooks/use-my-noti";
import NotificationList, {
    NotificationEmptyState,
    NotificationLoadingState,
} from "@/domains/notification/components/NotificationList";
import { NotificationItem } from "@/domains/notification/models/notification.model";
import { Box, Button, Text } from "@gluestack-ui/themed";
import React, { useState } from "react";

export default function NotificationScreen() {
    const { colors } = useAgrisaColors();
    const [refreshing, setRefreshing] = useState(false);

    // Sử dụng hook để lấy dữ liệu thông báo từ API
    const {
        data: notifications,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useMyNoti({ limit: 10 });

    // Hook để mark as read
    const markAsReadMutation = useMarkAsRead();

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Handle item press
    const handleReadAll = () => {
        const unreadNotifications = notifications.filter(
            (item) => item.status === "sent"
        );
        if (unreadNotifications.length === 0) return;
        const ids = unreadNotifications.map((item) => item.id);
        markAsReadMutation.mutate(ids, {
            onSuccess: () => {
                console.log("Marked all as read");
                refetch(); // Refresh the list
            },
            onError: (error) => {
                console.error("Failed to mark all as read:", error);
            },
        });
    };

    // Handle item press
    const handleItemPress = (item: NotificationItem) => {
        console.log("🔔 [NotificationScreen] Item pressed:", item.id);
        // Mark as read
        markAsReadMutation.mutate([item.id], {
            onSuccess: () => {
                console.log("Marked as read:", item.id);
                refetch(); // Refresh the list
            },
            onError: (error) => {
                console.error("Failed to mark as read:", error);
            },
        });
        // TODO: Navigate hoặc xử lý khi tap vào thông báo
        if (item.data?.url) {
            // Navigate to url if available
            console.log("🔔 Navigate to:", item.data.url);
        }
    };

    return (
        <Box flex={1} bg={colors.background}>
            <AgrisaHeader
                title="Thông báo"
                showBackButton={false}
                rightComponent={
                    notifications.some((item) => item.status === "sent") ? (
                        <Button
                            variant="solid"
                            size="sm"
                            bg={colors.primary}
                            onPress={handleReadAll}
                            isDisabled={markAsReadMutation.isPending}
                            borderRadius="$lg"
                            px="$3"
                        >
                            <Text
                                fontSize="$xs"
                                color="white"
                                fontWeight="$semibold"
                            >
                                {markAsReadMutation.isPending
                                    ? "..."
                                    : "Đọc tất cả"}
                            </Text>
                        </Button>
                    ) : null
                }
            />

            {/* Hiển thị loading khi đang tải lần đầu */}
            {isLoading ? (
                <NotificationLoadingState />
            ) : (
                <Box px="$4" flex={1}>
                    {notifications.length > 0 ? (
                        <NotificationList
                            notifications={notifications}
                            onItemPress={handleItemPress}
                            onEndReached={() => {
                                if (hasNextPage && !isFetchingNextPage) {
                                    fetchNextPage();
                                }
                            }}
                            isFetchingNextPage={isFetchingNextPage}
                            onRefresh={handleRefresh}
                            refreshing={refreshing}
                        />
                    ) : (
                        <NotificationEmptyState />
                    )}
                </Box>
            )}
        </Box>
    );
}

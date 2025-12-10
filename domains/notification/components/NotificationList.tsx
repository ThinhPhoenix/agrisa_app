/**
 * ============================================
 * 🔔 NOTIFICATION LIST COMPONENT
 * ============================================
 * Component hiển thị danh sách thông báo
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import { Box, HStack, Pressable, Text, VStack } from "@gluestack-ui/themed";
import { Bell } from "lucide-react-native";
import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { NotificationItem } from "../models/notification.model";

// ============================================
// 📦 INTERFACES
// ============================================
interface NotificationListProps {
    notifications: NotificationItem[];
    onItemPress?: (item: NotificationItem) => void;
    onEndReached?: () => void;
    isFetchingNextPage?: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
}

interface NotificationItemCardProps {
    item: NotificationItem;
    isLast: boolean;
    onPress?: (item: NotificationItem) => void;
}

// ============================================
// 🎨 NOTIFICATION ITEM CARD
// ============================================
function NotificationItemCard({
    item,
    isLast,
    onPress,
}: NotificationItemCardProps) {
    const { colors } = useAgrisaColors();

    // Lấy icon và màu cho notification
    const getNotificationIcon = () => {
        return {
            Icon: Bell,
            color: colors.primary,
            bg: colors.primarySoft,
        };
    };

    const { Icon, color } = getNotificationIcon();

    return (
      <Box>
        <Pressable onPress={() => onPress?.(item)} py="$4">
          <HStack space="md" alignItems="flex-start">
            {/* Icon */}
            <Box
              bg={color}
              borderRadius="$full"
              p="$2.5"
              w={40}
              h={40}
              alignItems="center"
              justifyContent="center"
            >
              <Icon size={20} color="#fff" strokeWidth={2.5} />
            </Box>

            {/* Content */}
            <VStack flex={1} space="xs">
              <HStack justifyContent="space-between" alignItems="flex-start">
                <Text
                  fontSize="$sm"
                  fontWeight={item.status === "sent" ? "$bold" : "$normal"}
                  color={
                    item.status === "sent"
                      ? colors.primary_text
                      : colors.secondary_text
                  }
                  flex={1}
                  mr="$2"
                >
                  {item.title}
                </Text>
                {/* Badge cho trạng thái chưa đọc */}
                {item.status === "sent" && (
                  <Box
                    w={8}
                    h={8}
                    borderRadius="$full"
                    bg={colors.primary}
                    borderWidth={2}
                    borderColor={colors.card_surface}
                  />
                )}
              </HStack>

              <Text
                fontSize="$xs"
                color={
                  item.status === "sent"
                    ? colors.secondary_text
                    : colors.muted_text
                }
                lineHeight="$lg"
              >
                {item.body}
              </Text>

              <Text fontSize="$xs" color={colors.muted_text} mt="$1">
                {Utils.formatStringVietnameseDateTimeGMT14(item.createdAt)}
              </Text>
            </VStack>
          </HStack>
        </Pressable>

        {/* Divider */}
        {!isLast && <Box h={1} bg={colors.frame_border} />}
      </Box>
    );
}

// ============================================
// 📋 NOTIFICATION LIST
// ============================================
export default function NotificationList({
    notifications,
    onItemPress,
    onEndReached,
    isFetchingNextPage,
    onRefresh,
    refreshing,
}: NotificationListProps) {
    const { colors } = useAgrisaColors();

    if (!notifications || notifications.length === 0) {
        return null;
    }

    const renderItem = ({
        item,
        index,
    }: {
        item: NotificationItem;
        index: number;
    }) => (
        <NotificationItemCard
            item={item}
            isLast={false} // FlatList handles separators
            onPress={onItemPress}
        />
    );

    const keyExtractor = (item: NotificationItem) => item.id;

    return (
        <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            px="$4"
            mb="$6"
            flex={1}
        >
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing || false}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    ) : undefined
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <Box py="$4" alignItems="center">
                            <Text fontSize="$sm" color={colors.secondary_text}>
                                Đang tải...
                            </Text>
                        </Box>
                    ) : null
                }
            />
        </Box>
    );
}

// ============================================
// 🔔 EMPTY STATE
// ============================================
export function NotificationEmptyState() {
    const { colors } = useAgrisaColors();

    return (
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
            <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
            >
                Thông báo mới sẽ hiển thị tại đây
            </Text>
        </Box>
    );
}

// ============================================
// ⏳ LOADING STATE
// ============================================
export function NotificationLoadingState() {
    const { colors } = useAgrisaColors();

    return (
        <Box flex={1} alignItems="center" justifyContent="center" py="$20">
            <Box bg={colors.card_surface} borderRadius="$full" p="$6" mb="$4">
                <Bell size={48} color={colors.primary} strokeWidth={1.5} />
            </Box>
            <Text fontSize="$sm" color={colors.secondary_text} mt="$4">
                Đang tải thông báo...
            </Text>
        </Box>
    );
}

/**
 * ============================================
 * 🔔 NOTIFICATION LIST COMPONENT
 * ============================================
 * Component hiển thị danh sách thông báo
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import {
    Box,
    HStack,
    Pressable,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import {
    AlertCircle,
    Bell,
    CheckCircle2,
    Megaphone,
    Shield,
    XCircle,
} from "lucide-react-native";
import React from "react";
import {
    getNotificationDisplayType,
    NotificationItem,
} from "../models/notification.model";

// ============================================
// 📦 INTERFACES
// ============================================
interface NotificationListProps {
  notifications: NotificationItem[];
  onItemPress?: (item: NotificationItem) => void;
}

interface NotificationItemCardProps {
  item: NotificationItem;
  isLast: boolean;
  onPress?: (item: NotificationItem) => void;
}

// ============================================
// 🎨 NOTIFICATION ITEM CARD
// ============================================
function NotificationItemCard({ item, isLast, onPress }: NotificationItemCardProps) {
  const { colors } = useAgrisaColors();

  // Lấy icon và màu dựa trên type
  const getNotificationIcon = (type: string) => {
    const displayType = getNotificationDisplayType(type);
    
    switch (displayType) {
      case "success":
        return {
          Icon: CheckCircle2,
          color: colors.success,
          bg: colors.successSoft,
        };
      case "error":
        return { 
          Icon: XCircle, 
          color: colors.error, 
          bg: colors.errorSoft 
        };
      case "warning":
        return {
          Icon: AlertCircle,
          color: colors.warning,
          bg: colors.warningSoft,
        };
      case "info":
      default:
        // Kiểm tra nếu là broadcast thì dùng icon Megaphone
        if (type === "broadcast") {
          return { 
            Icon: Megaphone, 
            color: colors.info, 
            bg: colors.infoSoft 
          };
        }
        return { 
          Icon: Shield, 
          color: colors.info, 
          bg: colors.infoSoft 
        };
    }
  };

  const { Icon, color } = getNotificationIcon(item.type);



  return (
    <Box>
      <Pressable
        onPress={() => onPress?.(item)}
        py="$4"
      >
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
            <Icon
              size={20}
              color="#fff"
              strokeWidth={2.5}
            />
          </Box>

          {/* Content */}
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
              {/* Badge cho status nếu cần */}
              {item.status === "pending" && (
                <Box 
                  w={8} 
                  h={8} 
                  borderRadius="$full" 
                  bg={colors.primary} 
                />
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
              {Utils.formatStringVietnameseDateTimeGMT7(item.created_at)}
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
  onItemPress 
}: NotificationListProps) {
  const { colors } = useAgrisaColors();

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <Box
      bg={colors.card_surface}
      borderRadius="$xl"
      borderWidth={1}
      borderColor={colors.frame_border}
      px="$4"
      mb="$6"
    >
      {notifications.map((notification, index) => (
        <NotificationItemCard
          key={notification.id}
          item={notification}
          isLast={index === notifications.length - 1}
          onPress={onItemPress}
        />
      ))}
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
      <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
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

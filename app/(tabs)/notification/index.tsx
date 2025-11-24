import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { Utils } from '@/libs/utils/utils';
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
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
import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
  isRead: boolean;
}

export default function NotificationScreen() {
  const { colors } = useAgrisaColors();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Thanh toán thành công',
      message: 'Phí bảo hiểm 500.000đ cho gói "Bảo hiểm lúa" đã được thanh toán.',
      type: 'success',
      timestamp: Date.now() / 1000 - 3600,
      isRead: false,
    },
    {
      id: '2',
      title: 'Hợp đồng được duyệt',
      message: 'Hợp đồng bảo hiểm cho trang trại "Lúa Đồng Tháp" đã được phê duyệt.',
      type: 'success',
      timestamp: Date.now() / 1000 - 86400,
      isRead: false,
    },
    {
      id: '3',
      title: 'Cảnh báo thời tiết',
      message: 'Dự báo mưa lớn trong 3 ngày tới tại khu vực của bạn.',
      type: 'warning',
      timestamp: Date.now() / 1000 - 172800,
      isRead: true,
    },
    {
      id: '4',
      title: 'Yêu cầu xác thực',
      message: 'Vui lòng hoàn tất xác thực khuôn mặt để kích hoạt tài khoản.',
      type: 'info',
      timestamp: Date.now() / 1000 - 259200,
      isRead: true,
    },
    {
      id: '5',
      title: 'Nhận bồi thường',
      message: 'Bạn đã nhận khoản bồi thường 2.500.000đ từ gói bảo hiểm.',
      type: 'success',
      timestamp: Date.now() / 1000 - 345600,
      isRead: true,
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { Icon: CheckCircle2, color: colors.success, bg: colors.successSoft };
      case 'error':
        return { Icon: XCircle, color: colors.error, bg: colors.errorSoft };
      case 'warning':
        return { Icon: AlertCircle, color: colors.warning, bg: colors.warningSoft };
      case 'info':
        return { Icon: Shield, color: colors.info, bg: colors.infoSoft };
      default:
        return { Icon: Bell, color: colors.muted_text, bg: colors.card_surface };
    }
  };

  const renderNotificationItem = (item: Notification, index: number) => {
    const { Icon, color, bg } = getNotificationIcon(item.type);

    return (
      <Box key={item.id}>
        <Pressable
          onPress={() => {
            const updatedNotifications = notifications.map(n => 
              n.id === item.id ? { ...n, isRead: true } : n
            );
            setNotifications(updatedNotifications);
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
              <Icon size={20} color={colors.primary_white_text} strokeWidth={2.5} />
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
                {!item.isRead && (
                  <Box w={8} h={8} borderRadius="$full" bg={colors.primary} />
                )}
              </HStack>
              <Text
                fontSize="$xs"
                color={colors.secondary_text}
                lineHeight="$lg"
              >
                {item.message}
              </Text>
              <Text fontSize="$xs" color={colors.muted_text} mt="$1">
                {Utils.formatDateForMS(item.timestamp)}
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

  const renderEmptyState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" py="$20">
      <Box
        bg={colors.card_surface}
        borderRadius="$full"
        p="$6"
        mb="$4"
      >
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

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Thông báo" showBackButton={false} />
      <ScrollView
        px="$4"
        pt="$4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
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
            {notifications.map((notification, index) => renderNotificationItem(notification, index))}
          </Box>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </Box>
  );
}

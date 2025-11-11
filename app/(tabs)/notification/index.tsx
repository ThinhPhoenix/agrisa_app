import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { AgrisaColors } from '@/domains/shared/constants/AgrisaColors';
import { Utils } from '@/libs/utils/utils';
import {
    Badge,
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack
} from '@gluestack-ui/themed';
import { AlertCircle, Bell, CheckCircle2, Info, XCircle } from 'lucide-react-native';
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

  // TODO: Replace với real API call
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Hợp đồng bảo hiểm được duyệt',
      message: 'Hợp đồng bảo hiểm cho trang trại "Lúa Đồng Tháp" đã được phê duyệt thành công.',
      type: 'success',
      timestamp: 1704067200,
      isRead: false,
    },
    {
      id: '2',
      title: 'Cảnh báo thời tiết',
      message: 'Dự báo mưa lớn trong 3 ngày tới. Hãy chuẩn bị biện pháp bảo vệ cây trồng.',
      type: 'warning',
      timestamp: 1703962800,
      isRead: false,
    },
    {
      id: '3',
      title: 'Thông tin cập nhật',
      message: 'Hệ thống đã cập nhật chính sách bảo hiểm mới. Vui lòng xem chi tiết.',
      type: 'info',
      timestamp: 1703858400,
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
        return { Icon: CheckCircle2, color: AgrisaColors.light.success, bg: AgrisaColors.light.successSoft };
      case 'error':
        return { Icon: XCircle, color: AgrisaColors.light.error, bg: AgrisaColors.light.errorSoft };
      case 'warning':
        return { Icon: AlertCircle, color: AgrisaColors.light.warning, bg: AgrisaColors.light.warningSoft };
      case 'info':
        return { Icon: Info, color: AgrisaColors.light.info, bg: AgrisaColors.light.infoSoft };
      default:
        return { Icon: Bell, color: AgrisaColors.light.muted_text, bg: AgrisaColors.light.card_surface };
    }
  };

  const renderNotificationItem = (item: Notification) => {
    const { Icon, color, bg } = getNotificationIcon(item.type);

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          // TODO: Mark as read and navigate to detail
          console.log('Notification pressed:', item.id);
        }}
        mb="$3"
      >
        <Box
          backgroundColor={item.isRead ? AgrisaColors.light.background : AgrisaColors.light.successSoft}
          borderRadius={16}
          borderWidth={1}
          borderColor={item.isRead ? AgrisaColors.light.frame_border : AgrisaColors.light.success}
          p="$4"
          shadowColor={AgrisaColors.light.shadow}
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.05}
          shadowRadius={4}
        >
          <HStack space="md" alignItems="flex-start">
            <Box bg={bg} borderRadius="$full" p="$2.5">
              <Icon size={20} color={color} strokeWidth={2.5} />
            </Box>
            <VStack flex={1} space="xs">
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  color={AgrisaColors.light.primary_text}
                  fontSize={15}
                  fontWeight="700"
                  flex={1}
                  mr="$2"
                >
                  {item.title}
                </Text>
                {!item.isRead && (
                  <Badge bg={AgrisaColors.light.primary} borderRadius="$full" w={8} h={8} />
                )}
              </HStack>
              <Text
                color={AgrisaColors.light.secondary_text}
                fontSize={13}
                lineHeight={18}
              >
                {item.message}
              </Text>
              <Text color={AgrisaColors.light.muted_text} fontSize={11} mt="$1">
                {Utils.formatDateForMS(item.timestamp)}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" py="$20">
      <Bell size={64} color={AgrisaColors.light.muted_text} strokeWidth={1.5} />
      <Text
        color={AgrisaColors.light.muted_text}
        fontSize={16}
        mt="$4"
        textAlign="center"
      >
        Chưa có thông báo nào
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
            tintColor={AgrisaColors.light.primary}
            colors={[AgrisaColors.light.primary]}
          />
        }
      >
        {notifications.length > 0 ? (
          <VStack space="md" pb="$6">
            {notifications.map(renderNotificationItem)}
          </VStack>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </Box>
  );
}

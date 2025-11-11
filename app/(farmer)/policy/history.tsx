import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { CheckCircle2, Clock, Info, XCircle } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl } from "react-native";
import { router } from "expo-router";

type HistoryStatus = "rejected" | "pending" | "approved";

const STATUS_TABS: { key: HistoryStatus; label: string }[] = [
  { key: "rejected", label: "Từ chối" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Chấp thuận" },
];

export default function PolicyHistoryScreen() {
  const { colors } = useAgrisaColors();
  const [activeTab, setActiveTab] = useState<HistoryStatus>("pending");

  // TODO: Implement actual data fetching based on activeTab
  // const { data, isLoading, isFetching, refetch } = usePolicyHistory(activeTab);

  const getStatusIcon = (status: HistoryStatus) => {
    switch (status) {
      case "approved":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
    }
  };

  const getStatusColor = (status: HistoryStatus) => {
    switch (status) {
      case "approved":
        return colors.success;
      case "pending":
        return colors.pending;
      case "rejected":
        return colors.error;
    }
  };

  const getEmptyMessage = (status: HistoryStatus) => {
    switch (status) {
      case "approved":
        return "Chưa có đăng ký bảo hiểm nào được chấp thuận";
      case "pending":
        return "Chưa có đăng ký bảo hiểm nào đang chờ duyệt";
      case "rejected":
        return "Chưa có đăng ký bảo hiểm nào bị từ chối";
    }
  };

  const IconComponent = getStatusIcon(activeTab);
  const statusColor = getStatusColor(activeTab);

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader title="Lịch sử đăng ký" showBackButton={true} onBack={() => router.back()}  />

      {/* Info Description */}
      <Box
        bg={colors.infoSoft}
        borderLeftWidth={3}
        borderLeftColor={colors.info}
        p="$3"
        mx="$4"
        mt="$4"
        borderRadius="$lg"
      >
        <VStack space="xs">
          <HStack alignItems="center" mb="$1">
            <Info size={18} color={colors.info} strokeWidth={2} />
            <Text
              fontSize="$sm"
              fontWeight="$bold"
              color={colors.info}
              ml="$2"
            >
              Lịch sử đăng ký
            </Text>
          </HStack>
          <Text fontSize="$xs" color={colors.primary_text} lineHeight="$md">
            Theo dõi trạng thái các đơn đăng ký bảo hiểm của bạn theo từng giai
            đoạn xử lý.
          </Text>
        </VStack>
      </Box>

      {/* Status Filter Tabs */}
      <HStack
        space="sm"
        p="$4"
        bg={colors.background}
        borderBottomWidth={1}
        borderBottomColor={colors.frame_border}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const TabIcon = getStatusIcon(tab.key);
          const tabColor = getStatusColor(tab.key);

          return (
            <Pressable
              key={tab.key}
              flex={1}
              onPress={() => setActiveTab(tab.key)}
            >
              {({ pressed }) => (
                <Box
                  bg={isActive ? tabColor : colors.card_surface}
                  borderRadius="$lg"
                  p="$3"
                  alignItems="center"
                  opacity={pressed ? 0.7 : 1}
                  borderWidth={isActive ? 0 : 1}
                  borderColor={colors.frame_border}
                >
                  <TabIcon
                    size={20}
                    color={isActive ? colors.white_button_text : tabColor}
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$xs"
                    fontWeight="$semibold"
                    color={isActive ? colors.white_button_text : tabColor}
                    mt="$1"
                  >
                    {tab.label}
                  </Text>
                </Box>
              )}
            </Pressable>
          );
        })}
      </HStack>

      {/* Content Area */}
      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            colors={[colors.success]}
            tintColor={colors.success}
          />
        }
      >
        <VStack space="md" p="$4">
          {/* Empty State - TODO: Replace with actual history list */}
          <Box
            borderWidth={1}
            borderColor={colors.frame_border}
            borderRadius="$xl"
            p="$6"
            bg={colors.card_surface}
            alignItems="center"
          >
            <IconComponent size={48} color={statusColor} strokeWidth={1.5} />
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.primary_text}
              mt="$3"
            >
              Không có dữ liệu
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
              mt="$1"
            >
              {getEmptyMessage(activeTab)}
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

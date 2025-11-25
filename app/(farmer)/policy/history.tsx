import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { RegisteredPolicyCard } from "@/domains/policy/components/registered-policy-card";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { RegisteredPolicy } from "@/domains/policy/models/policy.models";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  CheckCircle2,
  Clock,
  FileText,
  Info,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";

type HistoryStatus = "rejected" | "pending" | "approved" | "all";

const STATUS_TABS: { key: HistoryStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Chấp thuận" },
  { key: "rejected", label: "Từ chối" },
];

export default function PolicyHistoryScreen() {
  const { colors } = useAgrisaColors();
  const [activeTab, setActiveTab] = useState<HistoryStatus>("all");

  const { getRegisteredPolicy } = usePolicy();
  const { data, isLoading, isFetching, refetch } = getRegisteredPolicy();

  // Filter policies theo status
  const filteredPolicies = useMemo(() => {
    if (!data?.data?.policies) return [];

    const policies = data.data.policies;

    switch (activeTab) {
      case "pending":
        return policies.filter(
          (p) =>
            p.status === "pending_review" || p.underwriting_status === "pending"
        );
      case "approved":
        return policies.filter(
          (p) => p.status === "active" || p.underwriting_status === "approved"
        );
      case "rejected":
        return policies.filter(
          (p) =>
            p.status === "rejected" ||
            p.status === "cancelled" ||
            p.underwriting_status === "rejected"
        );
      case "all":
      default:
        return policies;
    }
  }, [data, activeTab]);

  // Count policies for each status
  const statusCounts = useMemo(() => {
    if (!data?.success || !data?.data?.policies) {
      return { all: 0, pending: 0, approved: 0, rejected: 0 };
    }

    const policies = data.data.policies;
    
    return {
      all: policies.length,
      pending: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === "pending_review" || p.underwriting_status === "pending"
      ).length,
      approved: policies.filter(
        (p: RegisteredPolicy) => p.status === "active" || p.underwriting_status === "approved"
      ).length,
      rejected: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === "rejected" ||
          p.status === "cancelled" ||
          p.underwriting_status === "rejected"
      ).length,
    };
  }, [data]);

  const getStatusIcon = (status: HistoryStatus) => {
    switch (status) {
      case "approved":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return FileText;
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
      default:
        return colors.info;
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
      case "all":
        return "Chưa có đăng ký bảo hiểm nào";
    }
  };

  const IconComponent = getStatusIcon(activeTab);
  const statusColor = getStatusColor(activeTab);

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title="Lịch sử đăng ký"
        showBackButton={true}
        onBack={() => router.back()}
      />

      {/* Info Description */}
      <Box
        bg={colors.infoSoft}
        borderWidth={1}
        borderColor={colors.info}
        p="$3"
        mx="$4"
        mt="$4"
        borderRadius="$lg"
      >
        <VStack space="xs">
          <HStack alignItems="center" mb="$1">
            <Box
              bg={colors.info}
              p="$1"
              borderRadius="$sm"
              alignItems="center"
              justifyContent="center"
            >
              <Info
                size={14}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
            <Text fontSize="$sm" fontWeight="$bold" color={colors.info} ml="$2">
              Lịch sử đăng ký
            </Text>
          </HStack>
          <Text fontSize="$xs" color={colors.primary_text} lineHeight="$md">
            Theo dõi trạng thái xử lý của các đơn đăng ký bảo hiểm đã gửi.
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
          const count = statusCounts[tab.key];

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
                  position="relative"
                >
                  {/* Count Badge */}
                  {count > 0 && (
                    <Box
                      position="absolute"
                      top={-6}
                      right={-6}
                      bg={isActive ? colors.primary_white_text : tabColor}
                      borderRadius="$full"
                      minWidth={20}
                      height={20}
                      alignItems="center"
                      justifyContent="center"
                      px="$1"
                      borderWidth={2}
                      borderColor={colors.background}
                    >
                      <Text
                        fontSize="$xs"
                        fontWeight="$bold"
                        color={isActive ? tabColor : colors.primary_white_text}
                      >
                        {count}
                      </Text>
                    </Box>
                  )}

                  <TabIcon
                    size={20}
                    color={isActive ? colors.primary_white_text : tabColor}
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$xs"
                    fontWeight="$semibold"
                    color={isActive ? colors.primary_white_text : tabColor}
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
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            colors={[colors.success]}
            tintColor={colors.success}
          />
        }
      >
        <VStack space="md" p="$4">
          {isLoading ? (
            <Box py="$10" alignItems="center">
              <Spinner size="large" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
                Đang tải dữ liệu...
              </Text>
            </Box>
          ) : filteredPolicies.length === 0 ? (
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
          ) : (
            filteredPolicies.map((policy: RegisteredPolicy) => (
              <RegisteredPolicyCard key={policy.id} policy={policy} />
            ))
          )}
        </VStack>
      </ScrollView>
    </VStack>
  );
}

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

type HistoryStatus = "rejected" | "pending" | "approved" | "all" | "other";

const STATUS_TABS: { key: HistoryStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Chấp thuận" },
  { key: "rejected", label: "Từ chối" },
  { key: "other", label: "Khác" },
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
          (p: RegisteredPolicy) => p.underwriting_status === "pending"
        );
      case "approved":
        return policies.filter(
          (p: RegisteredPolicy) =>
            p.underwriting_status === "approved" &&
            // Loại trừ các status đặc biệt vào nhóm Khác
            p.status !== "pending_cancel" &&
            p.status !== "payout" &&
            p.status !== "dispute" &&
            p.status !== "cancelled" &&
            p.status !== "expired"
        );
      case "rejected":
        return policies.filter(
          (p: RegisteredPolicy) => p.underwriting_status === "rejected"
        );
      case "other":
        // Các status đặc biệt hoặc không thuộc pending/approved/rejected
        return policies.filter(
          (p: RegisteredPolicy) =>
            // Các status đặc biệt luôn vào Khác
            p.status === "pending_cancel" ||
            p.status === "payout" ||
            p.status === "dispute" ||
            p.status === "cancelled" ||
            p.status === "expired" ||
            // Approved nhưng đã paid mà không active (trừ các status đặc biệt đã check ở trên)
            (p.underwriting_status === "approved" &&
              p.premium_paid_by_farmer === true &&
              p.status !== "active") ||
            // Underwriting status không thuộc 3 loại chính
            (p.underwriting_status !== "pending" &&
              p.underwriting_status !== "approved" &&
              p.underwriting_status !== "rejected")
        );
      case "all":
      default:
        return policies;
    }
  }, [data, activeTab]);

  // Count policies for each status
  const statusCounts = useMemo(() => {
    if (!data?.success || !data?.data?.policies) {
      return { all: 0, pending: 0, approved: 0, rejected: 0, other: 0 };
    }

    const policies = data.data.policies;

    return {
      all: policies.length,
      pending: policies.filter(
        (p: RegisteredPolicy) => p.underwriting_status === "pending"
      ).length,
      approved: policies.filter(
        (p: RegisteredPolicy) =>
          p.underwriting_status === "approved" &&
          // Loại trừ các status đặc biệt
          p.status !== "pending_cancel" &&
          p.status !== "payout" &&
          p.status !== "dispute" &&
          p.status !== "cancelled" &&
          p.status !== "expired"
      ).length,
      rejected: policies.filter(
        (p: RegisteredPolicy) => p.underwriting_status === "rejected"
      ).length,
      other: policies.filter(
        (p: RegisteredPolicy) =>
          // Các status đặc biệt
          p.status === "pending_cancel" ||
          p.status === "payout" ||
          p.status === "dispute" ||
          p.status === "cancelled" ||
          p.status === "expired" ||
          // Approved nhưng đã paid mà không active
          (p.underwriting_status === "approved" &&
            p.premium_paid_by_farmer === true &&
            p.status !== "active") ||
          // Underwriting status không thuộc 3 loại chính
          (p.underwriting_status !== "pending" &&
            p.underwriting_status !== "approved" &&
            p.underwriting_status !== "rejected")
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
      case "other":
        return Info;
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
      case "other":
        return colors.muted_text;
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
      case "other":
        return "Chưa có đăng ký bảo hiểm với trạng thái khác";
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
      <Box
        bg={colors.background}
        borderBottomWidth={1}
        borderBottomColor={colors.frame_border}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 24,
          }}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = statusCounts[tab.key];

            return (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}>
                {({ pressed }) => (
                  <Box
                    pb="$2"
                    borderBottomWidth={isActive ? 2 : 0}
                    borderBottomColor={colors.primary}
                    opacity={pressed ? 0.7 : 1}
                  >
                    <Text
                      fontSize="$sm"
                      fontWeight={isActive ? "$bold" : "$normal"}
                      color={isActive ? colors.primary : colors.secondary_text}
                    >
                      {tab.label} {count > 0 && `(${count})`}
                    </Text>
                  </Box>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Box>

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

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { ActivePolicyCard } from "@/domains/policy/components/active-policy-card";
import { RegisteredPolicyStatus } from "@/domains/policy/enums/policy-status.enum";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Info,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView as RNScrollView } from "react-native";

type PolicyTabKey =
  | "waiting"
  | "active"
  | "payout"
  | "pending_cancel"
  | "expired"
  | "cancelled"
  | "dispute";

type TabConfig = {
  key: PolicyTabKey;
  label: string;
  icon: any;
  color: keyof ReturnType<typeof useAgrisaColors>["colors"];
};

export default function MyPoliciesScreen() {
  const { colors } = useAgrisaColors();
  const [selectedTab, setSelectedTab] = useState<PolicyTabKey>("active");

  // Cấu hình tabs
  const TABS_CONFIG: TabConfig[] = [
    {
      key: "waiting",
      label: "Chờ hiệu lực",
      icon: Clock,
      color: "warning",
    },
    {
      key: "active",
      label: "Có hiệu lực",
      icon: CheckCircle2,
      color: "success",
    },
    {
      key: "payout",
      label: "Đang bồi thường",
      icon: DollarSign,
      color: "info",
    },
    {
      key: "pending_cancel",
      label: "Chờ xử lý hủy",
      icon: Clock,
      color: "warning",
    },
    {
      key: "expired",
      label: "Hết hạn",
      icon: XCircle,
      color: "muted_text",
    },
    {
      key: "cancelled",
      label: "Đã hủy",
      icon: XCircle,
      color: "error",
    },
    {
      key: "dispute",
      label: "Tranh chấp",
      icon: AlertCircle,
      color: "error",
    },
  ];

  // Lấy danh sách registered policies
  const { getRegisteredPolicy } = usePolicy();
  const { data, isLoading, isFetching, refetch } = getRegisteredPolicy();

  // Phân loại policies theo trạng thái
  const categorizedPolicies = useMemo(() => {
    if (!data?.success || !data?.data?.policies) {
      return {
        waiting: [],
        active: [],
        payout: [],
        pending_cancel: [],
        expired: [],
        cancelled: [],
        dispute: [],
      };
    }

    const now = Math.floor(Date.now() / 1000);
    // Chỉ lấy policies đã thanh toán phí bảo hiểm
    const policies = data.data.policies.filter(
      (p: RegisteredPolicy) => p.premium_paid_by_farmer === true
    );

    return {
      // Chờ hiệu lực: CHỈ khi status = active, approved và chưa tới ngày bắt đầu
      // Các status khác (payout, pending_cancel, cancelled, dispute, expired) không thể "chờ hiệu lực"
      waiting: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.ACTIVE &&
          p.underwriting_status === "approved" &&
          now < p.coverage_start_date
      ),
      // Có hiệu lực: CHỈ khi status = active, approved và trong khoảng thời gian bảo hiểm
      active: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.ACTIVE &&
          p.underwriting_status === "approved" &&
          now >= p.coverage_start_date &&
          now <= p.coverage_end_date
      ),
      // Đang chi trả: status = payout
      payout: policies.filter(
        (p: RegisteredPolicy) => p.status === RegisteredPolicyStatus.PAYOUT
      ),
      // Chờ xử lý hủy: status = pending_cancel
      pending_cancel: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.PENDING_CANCEL
      ),
      // Hết hạn: CHỈ khi status = expired HOẶC active nhưng đã quá ngày kết thúc
      expired: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.EXPIRED ||
          (p.status === RegisteredPolicyStatus.ACTIVE &&
            now > p.coverage_end_date)
      ),
      // Đã hủy: status = cancelled
      cancelled: policies.filter(
        (p: RegisteredPolicy) => p.status === RegisteredPolicyStatus.CANCELLED
      ),
      // Tranh chấp: status = dispute
      dispute: policies.filter(
        (p: RegisteredPolicy) => p.status === RegisteredPolicyStatus.DISPUTE
      ),
    };
  }, [data]);

  const currentPolicies = categorizedPolicies[selectedTab];

  // Helper để lấy màu và background cho tab
  const getTabColors = (tab: PolicyTabKey) => {
    const config = TABS_CONFIG.find((t) => t.key === tab);
    if (!config) return { color: colors.muted_text, bg: colors.background };
    const color = colors[config.color];
    const bgMap: Record<string, string> = {
      warning: colors.warningSoft,
      success: colors.successSoft,
      info: colors.infoSoft,
      error: colors.errorSoft,
    };
    return {
      color,
      bg: bgMap[config.color] || colors.background,
    };
  };

  // Helper để lấy empty message
  const getEmptyMessage = (tab: PolicyTabKey): { title: string; desc: string } => {
    const messages: Record<PolicyTabKey, { title: string; desc: string }> = {
      waiting: {
        title: "Chưa có hợp đồng chờ hiệu lực",
        desc: "Các hợp đồng được phê duyệt sẽ xuất hiện ở đây khi chưa đến ngày bắt đầu bảo hiểm.",
      },
      active: {
        title: "Chưa có hợp đồng đang hoạt động",
        desc: "Bạn chưa có hợp đồng bảo hiểm nào đang hoạt động. Hãy khám phá các chương trình bảo hiểm tại trang Trang chủ.",
      },
      payout: {
        title: "Chưa có hợp đồng đang chi trả",
        desc: "Các hợp đồng đang trong quá trình chi trả bồi thường sẽ xuất hiện ở đây.",
      },
      pending_cancel: {
        title: "Chưa có yêu cầu hủy nào đang chờ xử lý",
        desc: "Các yêu cầu hủy hợp đồng đang chờ xét duyệt sẽ xuất hiện ở đây.",
      },
      expired: {
        title: "Chưa có hợp đồng hết hạn",
        desc: "Các hợp đồng đã hết hạn sẽ xuất hiện ở đây.",
      },
      cancelled: {
        title: "Chưa có hợp đồng đã hủy",
        desc: "Các hợp đồng đã bị hủy sẽ xuất hiện ở đây.",
      },
      dispute: {
        title: "Chưa có hợp đồng tranh chấp",
        desc: "Các hợp đồng đang trong quá trình giải quyết tranh chấp sẽ xuất hiện ở đây.",
      },
    };
    return messages[tab];
  };

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title="Bảo hiểm của tôi"
        showBackButton={true}
        onBack={() => router.back()}
      />

      <ScrollView
        bg={colors.background}
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
          {/* Info Description */}
          <Box
            bg={colors.infoSoft}
            borderWidth={1}
            borderColor={colors.info}
            p="$3"
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
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.info}
                  ml="$2"
                >
                  Bảo hiểm của tôi
                </Text>
              </HStack>
              <Text fontSize="$xs" color={colors.primary_text} lineHeight="$md">
                Quản lý các hợp đồng bảo hiểm của bạn.
              </Text>
            </VStack>
          </Box>

          {/* Status Filter Tabs - Horizontal Scrollable */}
          <Box
            borderBottomWidth={1}
            borderBottomColor={colors.frame_border}
            pb="$2"
          >
            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 0,
                gap: 12,
              }}
            >
              {TABS_CONFIG.map((tab) => {
                const isActive = selectedTab === tab.key;
                const count = categorizedPolicies[tab.key].length;

                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setSelectedTab(tab.key)}
                  >
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
                          color={
                            isActive ? colors.primary : colors.secondary_text
                          }
                        >
                          {tab.label} {count > 0 && `(${count})`}
                        </Text>
                      </Box>
                    )}
                  </Pressable>
                );
              })}
            </RNScrollView>
          </Box>

          {/* Summary Stats */}
          {!isLoading && currentPolicies.length > 0 && (
            <Box
              bg={getTabColors(selectedTab).bg}
              borderWidth={1}
              borderColor={getTabColors(selectedTab).color}
              p="$3"
              borderRadius="$lg"
            >
              <HStack justifyContent="space-around" alignItems="center">
                <VStack alignItems="center" flex={1}>
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={getTabColors(selectedTab).color}
                  >
                    {currentPolicies.length}
                  </Text>
                  <Text
                    fontSize="$xs"
                    color={colors.secondary_text}
                    textAlign="center"
                  >
                    Hợp đồng
                  </Text>
                </VStack>

                <Box
                  width={1}
                  bg={getTabColors(selectedTab).color}
                  height={40}
                  opacity={0.3}
                />

                <VStack alignItems="center" flex={1}>
                  <Text
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={getTabColors(selectedTab).color}
                  >
                    {currentPolicies
                      .reduce((sum, p) => sum + p.coverage_amount, 0)
                      .toLocaleString("vi-VN")}
                    đ
                  </Text>
                  <Text
                    fontSize="$xs"
                    color={colors.secondary_text}
                    textAlign="center"
                  >
                    Tổng giá trị
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Content */}
          {isLoading ? (
            <Box py="$10" alignItems="center">
              <Spinner size="large" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
                Đang tải danh sách bảo hiểm...
              </Text>
            </Box>
          ) : currentPolicies.length === 0 ? (
            <Box
              borderWidth={1}
              borderColor={colors.frame_border}
              borderRadius="$xl"
              p="$6"
              bg={colors.card_surface}
              alignItems="center"
              mt="$4"
            >
              <FileText
                size={48}
                color={colors.secondary_text}
                strokeWidth={1.5}
              />
              <Text
                fontSize="$lg"
                fontWeight="$semibold"
                color={colors.primary_text}
                mt="$3"
              >
                {getEmptyMessage(selectedTab).title}
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
                mt="$1"
              >
                {getEmptyMessage(selectedTab).desc}
              </Text>
            </Box>
          ) : (
            currentPolicies.map((policy: RegisteredPolicy) => (
              <ActivePolicyCard key={policy.id} policy={policy} />
            ))
          )}
        </VStack>
      </ScrollView>
    </VStack>
  );
}

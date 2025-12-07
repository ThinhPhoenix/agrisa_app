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
  CheckCircle2,
  Clock,
  FileText,
  Info,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";

export default function MyPoliciesScreen() {
  const { colors } = useAgrisaColors();
  const [selectedTab, setSelectedTab] = useState<
    "waiting" | "active" | "expired"
  >("active");

  // Lấy danh sách registered policies
  const { getRegisteredPolicy } = usePolicy();
  const { data, isLoading, isFetching, refetch } = getRegisteredPolicy();

  // Phân loại policies theo trạng thái
  const categorizedPolicies = useMemo(() => {
    if (!data?.success || !data?.data?.policies) {
      return { waiting: [], active: [], expired: [] };
    }

    const now = Math.floor(Date.now() / 1000);
    const policies = data.data.policies;

    return {
      // Chờ hiệu lực: active nhưng chưa tới ngày bắt đầu
      waiting: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.ACTIVE &&
          p.underwriting_status === "approved" &&
          now < p.coverage_start_date
      ),
      // Có hiệu lực: active và đã tới ngày bắt đầu
      active: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.ACTIVE &&
          p.underwriting_status === "approved" &&
          now >= p.coverage_start_date &&
          now <= p.coverage_end_date
      ),
      // Hết hạn: expired
      expired: policies.filter(
        (p: RegisteredPolicy) =>
          p.status === RegisteredPolicyStatus.EXPIRED ||
          (p.status === RegisteredPolicyStatus.ACTIVE &&
            now > p.coverage_end_date)
      ),
    };
  }, [data]);

  const currentPolicies = categorizedPolicies[selectedTab];

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

          {/* Status Filter Tabs */}
          <HStack
            space="sm"
            bg={colors.background}
            borderBottomWidth={1}
            borderBottomColor={colors.frame_border}
            pb="$3"
          >
            <Pressable flex={1} onPress={() => setSelectedTab("waiting")}>
              {({ pressed }) => {
                const isActive = selectedTab === "waiting";
                const count = categorizedPolicies.waiting.length;
                return (
                  <Box
                    bg={isActive ? colors.warning : colors.card_surface}
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
                        bg={
                          isActive ? colors.primary_white_text : colors.warning
                        }
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
                          color={
                            isActive
                              ? colors.warning
                              : colors.primary_white_text
                          }
                        >
                          {count}
                        </Text>
                      </Box>
                    )}

                    <Clock
                      size={20}
                      color={
                        isActive ? colors.primary_white_text : colors.warning
                      }
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$xs"
                      fontWeight="$semibold"
                      color={
                        isActive ? colors.primary_white_text : colors.warning
                      }
                      mt="$1"
                    >
                      Chờ hiệu lực
                    </Text>
                  </Box>
                );
              }}
            </Pressable>

            <Pressable flex={1} onPress={() => setSelectedTab("active")}>
              {({ pressed }) => {
                const isActive = selectedTab === "active";
                const count = categorizedPolicies.active.length;
                return (
                  <Box
                    bg={isActive ? colors.success : colors.card_surface}
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
                        bg={
                          isActive ? colors.primary_white_text : colors.success
                        }
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
                          color={
                            isActive
                              ? colors.success
                              : colors.primary_white_text
                          }
                        >
                          {count}
                        </Text>
                      </Box>
                    )}

                    <CheckCircle2
                      size={20}
                      color={
                        isActive ? colors.primary_white_text : colors.success
                      }
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$xs"
                      fontWeight="$semibold"
                      color={
                        isActive ? colors.primary_white_text : colors.success
                      }
                      mt="$1"
                    >
                      Có hiệu lực
                    </Text>
                  </Box>
                );
              }}
            </Pressable>

            <Pressable flex={1} onPress={() => setSelectedTab("expired")}>
              {({ pressed }) => {
                const isActive = selectedTab === "expired";
                const count = categorizedPolicies.expired.length;
                return (
                  <Box
                    bg={isActive ? colors.muted_text : colors.card_surface}
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
                        bg={
                          isActive
                            ? colors.primary_white_text
                            : colors.muted_text
                        }
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
                          color={
                            isActive
                              ? colors.muted_text
                              : colors.primary_white_text
                          }
                        >
                          {count}
                        </Text>
                      </Box>
                    )}

                    <XCircle
                      size={20}
                      color={
                        isActive ? colors.primary_white_text : colors.muted_text
                      }
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$xs"
                      fontWeight="$semibold"
                      color={
                        isActive ? colors.primary_white_text : colors.muted_text
                      }
                      mt="$1"
                    >
                      Hết hạn
                    </Text>
                  </Box>
                );
              }}
            </Pressable>
          </HStack>

          {/* Summary Stats */}
          {!isLoading && currentPolicies.length > 0 && (
            <Box
              bg={
                selectedTab === "waiting"
                  ? colors.warningSoft
                  : selectedTab === "active"
                    ? colors.successSoft
                    : colors.background
              }
              borderWidth={1}
              borderColor={
                selectedTab === "waiting"
                  ? colors.warning
                  : selectedTab === "active"
                    ? colors.success
                    : colors.frame_border
              }
              p="$3"
              borderRadius="$lg"
            >
              <HStack justifyContent="space-around" alignItems="center">
                <VStack alignItems="center" flex={1}>
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={
                      selectedTab === "waiting"
                        ? colors.warning
                        : selectedTab === "active"
                          ? colors.success
                          : colors.muted_text
                    }
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
                  bg={
                    selectedTab === "waiting"
                      ? colors.warning
                      : selectedTab === "active"
                        ? colors.success
                        : colors.muted_text
                  }
                  height={40}
                  opacity={0.3}
                />

                <VStack alignItems="center" flex={1}>
                  <Text
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={
                      selectedTab === "waiting"
                        ? colors.warning
                        : selectedTab === "active"
                          ? colors.success
                          : colors.muted_text
                    }
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
                {selectedTab === "waiting"
                  ? "Chưa có hợp đồng chờ hiệu lực"
                  : selectedTab === "active"
                    ? "Chưa có hợp đồng đang hoạt động"
                    : "Chưa có hợp đồng hết hạn"}
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
                mt="$1"
              >
                {selectedTab === "waiting"
                  ? "Các hợp đồng được phê duyệt sẽ xuất hiện ở đây khi chưa đến ngày bắt đầu bảo hiểm."
                  : selectedTab === "active"
                    ? "Bạn chưa có hợp đồng bảo hiểm nào đang hoạt động. Hãy khám phá các chương trình bảo hiểm tại trang Trang chủ."
                    : "Các hợp đồng đã hết hạn hoặc bị hủy sẽ xuất hiện ở đây."}
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

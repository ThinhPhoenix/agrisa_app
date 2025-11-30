import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { ActivePolicyCard } from "@/domains/policy/components/active-policy-card";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { RegisteredPolicy } from "@/domains/policy/models/policy.models";
import { Box, HStack, ScrollView, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { FileText, Info } from "lucide-react-native";
import { useMemo } from "react";
import { RefreshControl } from "react-native";

export default function MyPoliciesScreen() {
  const { colors } = useAgrisaColors();

  // Lấy danh sách registered policies
  const { getRegisteredPolicy } = usePolicy();
  const { data, isLoading, isFetching, refetch } = getRegisteredPolicy();

  // Lọc chỉ các policy active & approved
  const activePolicies = useMemo(() => {
    if (!data?.success || !data?.data?.policies) {
      return [];
    }

    return data.data.policies.filter(
      (policy: RegisteredPolicy) =>
        policy.status === "active" && policy.underwriting_status === "approved"
    );
  }, [data]);

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
                Quản lý các hợp đồng bảo hiểm đang hoạt động của bạn.
              </Text>
            </VStack>
          </Box>

          {/* Summary Stats */}
          {!isLoading && activePolicies.length > 0 && (
            <Box
              bg={colors.successSoft}
              borderWidth={1}
              borderColor={colors.success}
              p="$3"
              borderRadius="$lg"
            >
              <HStack justifyContent="space-around" alignItems="center">
                <VStack alignItems="center" flex={1}>
                  <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
                    {activePolicies.length}
                  </Text>
                  <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
                    Hợp đồng đang hoạt động
                  </Text>
                </VStack>
                
                <Box width={1} bg={colors.success} height={40} opacity={0.3} />
                
                <VStack alignItems="center" flex={1}>
                  <Text fontSize="$xl" fontWeight="$bold" color={colors.success}>
                    {activePolicies.reduce(
                      (sum, p) => sum + p.coverage_amount,
                      0
                    ).toLocaleString("vi-VN")}đ
                  </Text>
                  <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
                    Tổng giá trị bảo hiểm
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
          ) : activePolicies.length === 0 ? (
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
                Chưa có bảo hiểm đang hoạt động
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
                mt="$1"
              >
                Bạn chưa có hợp đồng bảo hiểm nào đang hoạt động. Hãy khám phá các chương trình bảo
                hiểm tại trang Trang chủ.
              </Text>
            </Box>
          ) : (
            activePolicies.map((policy: RegisteredPolicy) => (
              <ActivePolicyCard key={policy.id} policy={policy} />
            ))
          )}
        </VStack>
      </ScrollView>
    </VStack>
  );
}

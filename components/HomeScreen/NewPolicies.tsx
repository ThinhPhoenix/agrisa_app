import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { PublicBasePolicyResponse } from "@/domains/policy/models/policy.models";
import { Utils } from "@/libs/utils/utils";
import {
    Box,
    HStack,
    Pressable,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
    AlertCircle,
    Calendar,
    ChevronRight,
    Shield,
} from "lucide-react-native";
import React from "react";

/**
 * Component hiển thị danh sách gói bảo hiểm mới nhất trên Home
 * Sắp xếp theo thời gian tạo (created_at)
 */
interface NewPoliciesProps {
  onRefresh?: () => Promise<void>;
}

export const NewPolicies: React.FC<NewPoliciesProps> = ({ onRefresh }) => {
  const { colors } = useAgrisaColors();
  const { getPublicBasePolicy } = usePolicy();
  const { data, isLoading, error, refetch } = getPublicBasePolicy();

  // Expose refetch to parent if needed
  React.useEffect(() => {
    if (onRefresh) {
      // This allows parent to trigger refresh
    }
  }, [onRefresh]);

  // Lấy danh sách policies và sắp xếp theo created_at mới nhất
  const policies: PublicBasePolicyResponse[] = React.useMemo(() => {
    if (!data?.success || !Array.isArray(data.data)) {
      return [];
    }

    return [...data.data]
      .sort(
        (a: PublicBasePolicyResponse, b: PublicBasePolicyResponse) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 3); // Chỉ lấy 3 gói mới nhất
  }, [data]);

  

  // Helper: Lấy label loại cây trồng
  const getCropLabel = (cropType: string) => {
    return cropType === "rice" ? "Lúa" : "Cà phê";
  };

  if (isLoading) {
    return (
      <Box py="$4" alignItems="center">
        <Spinner size="small" color={colors.primary} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg={colors.errorSoft}
        borderRadius="$lg"
        p="$3"
        mx="$4"
        borderWidth={1}
        borderColor={colors.error}
      >
        <HStack space="xs" alignItems="center">
          <AlertCircle size={16} color={colors.error} />
          <Text fontSize="$xs" color={colors.error} flex={1}>
            Không thể tải dữ liệu
          </Text>
        </HStack>
      </Box>
    );
  }

  if (policies.length === 0) {
    return (
      <Box py="$4" px="$4" alignItems="center">
        <Text fontSize="$sm" color={colors.secondary_text}>
          Chưa có gói bảo hiểm nào
        </Text>
      </Box>
    );
  }

  return (
    <VStack space="sm" px="$2" pt="$3" pb="$4">
      {/* Header */}
      <HStack alignItems="center" justifyContent="space-between" px="$4">
        <HStack alignItems="center" space="xs">
          <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
            Các gói bảo hiểm mới
          </Text>
          <ChevronRight size={18} color={colors.primary_text} />
        </HStack>
        <Pressable onPress={() => router.push("/(farmer)/policy")}>
          <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary}>
            Xem tất cả
          </Text>
        </Pressable>
      </HStack>

      {/* Policy List - Không cần ScrollView ở đây vì đã có ở parent */}
      <VStack space="sm" px="$4">
        {policies.map((policy) => (
          <Pressable
            key={policy.id}
            onPress={() =>
              router.push({
                    pathname: "/(farmer)/form-policy/[id]",
                    params: { policyId: policy.id },
                  })
            }
          >
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
              sx={{
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Body - Main Info */}
              <HStack space="md" alignItems="flex-start">
                {/* Icon */}
                <Box
                  bg={colors.successSoft}
                  p="$3"
                  borderRadius="$lg"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Shield size={24} color={colors.success} strokeWidth={2} />
                </Box>

                {/* Info */}
                <VStack flex={1} space="xs">
                  {/* Tên sản phẩm */}
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                    numberOfLines={2}
                    lineHeight={20}
                  >
                    {policy.product_name}
                  </Text>

                  {/* Mã sản phẩm */}
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Mã: {policy.product_code}
                  </Text>

                  {/* Thông tin chính */}
                  <VStack space="xs" mt="$2">
                    {/* Loại cây trồng */}
                    <HStack space="xs" alignItems="center">
                      <Text
                        fontSize="$xs"
                        color={colors.muted_text}
                        w={100}
                      >
                        Loại cây:
                      </Text>
                      <Box
                        bg={colors.primarySoft}
                        px="$2"
                        py="$0.5"
                        borderRadius="$md"
                      >
                        <Text
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.primary}
                        >
                          {getCropLabel(policy.crop_type)}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Thời hạn bảo hiểm */}
                    <HStack space="xs" alignItems="center">
                      <Text
                        fontSize="$xs"
                        color={colors.muted_text}
                        w={100}
                      >
                        Thời hạn BH:
                      </Text>
                      <HStack space="xs" alignItems="center">
                        <Calendar size={12} color={colors.info} />
                        <Text
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.secondary_text}
                        >
                          {policy.coverage_duration_days} ngày
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </VStack>

                {/* Arrow */}
                <ChevronRight size={20} color={colors.secondary_text} />
              </HStack>

              {/* Divider */}
              <Box h={1} bg={colors.frame_border} my="$3" />

              {/* Footer - Thời hạn đăng ký, Phí BH, Cập nhật */}
              <VStack space="xs">
                {/* Thời hạn đăng ký */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Thời hạn đăng ký:
                  </Text>
                  <Text fontSize="$xs" fontWeight="$semibold" color={colors.secondary_text}>
                    Ngày {Utils.formatDateForMS(policy.enrollment_start_day)} - {Utils.formatDateForMS(policy.enrollment_end_day)}
                  </Text>
                </HStack>

                {/* Phí bảo hiểm */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Phí bảo hiểm:
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.success}
                  >
                    {Utils.formatCurrency(policy.fix_premium_amount)}
                    {policy.is_per_hectare ? "/ha" : ""}
                  </Text>
                </HStack>

                {/* Cập nhật lúc */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Cập nhật:
                  </Text>
                  <Text fontSize="$xs" color={colors.info}>
                    {new Date(policy.updated_at).toLocaleDateString("vi-VN")}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Pressable>
        ))}
      </VStack>
    </VStack>
  );
};

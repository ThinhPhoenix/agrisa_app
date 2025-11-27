import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { RegisteredPolicy } from "@/domains/policy/models/policy.models";
import { Utils } from "@/libs/utils/utils";
import { Box, HStack, Pressable, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  XCircle,
} from "lucide-react-native";
import React from "react";

interface RegisteredPolicyCardProps {
  policy: RegisteredPolicy;
}

/**
 * Card component hiển thị thông tin policy đã đăng ký
 */
export const RegisteredPolicyCard: React.FC<RegisteredPolicyCardProps> = ({
  policy,
}) => {
  const { colors } = useAgrisaColors();

  const getPolicyStatusDisplay = () => {
    // ƯU TIÊN underwriting_status để filter chính xác
    switch (policy.underwriting_status) {
      case "active": // approved
        return {
          label: "Đã duyệt",
          color: colors.success,
          bgColor: colors.successSoft,
          icon: CheckCircle2,
        };
      case "rejected":
        return {
          label: "Từ chối",
          color: colors.error,
          bgColor: colors.errorSoft,
          icon: XCircle,
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          color: colors.warning,
          bgColor: colors.warningSoft,
          icon: Clock,
        };
      default:
        // Fallback sang status nếu underwriting_status không xác định
        switch (policy.status) {
          case "active":
            return {
              label: "Đang hoạt động",
              color: colors.success,
              bgColor: colors.successSoft,
              icon: CheckCircle2,
            };
          case "rejected":
          case "cancelled":
            return {
              label: "Đã hủy",
              color: colors.error,
              bgColor: colors.errorSoft,
              icon: XCircle,
            };
          case "pending_review":
            return {
              label: "Chờ xét duyệt",
              color: colors.warning,
              bgColor: colors.warningSoft,
              icon: Clock,
            };
          case "suspended":
            return {
              label: "Tạm ngưng",
              color: colors.warning,
              bgColor: colors.warningSoft,
              icon: AlertCircle,
            };
          case "expired":
            return {
              label: "Hết hạn",
              color: colors.muted_text,
              bgColor: colors.background,
              icon: XCircle,
            };
          default:
            return {
              label: "Không xác định",
              color: colors.muted_text,
              bgColor: colors.background,
              icon: AlertCircle,
            };
        }
    }
  };

  const statusDisplay = getPolicyStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <Pressable
      onPress={() => router.push(`/(farmer)/registered-policies/${policy.id}`)}
    >
      {({ pressed }) => (
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={2}
          borderColor={statusDisplay.color}
          opacity={pressed ? 0.8 : 1}
          overflow="hidden"
        >
          <VStack space="md" p="$4">
            {/* Header: Số hợp đồng + Trạng thái */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center" flex={1}>
                <Box
                  bg={statusDisplay.color}
                  p="$2"
                  borderRadius="$lg"
                  borderWidth={1.5}
                  borderColor={colors.primary_white_text}
                >
                  <Shield
                    size={18}
                    color={colors.primary_white_text}
                    strokeWidth={2.5}
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$xs" color={colors.secondary_text} mb="$0.5">
                    Số hợp đồng
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                    numberOfLines={1}
                  >
                    {policy.policy_number}
                  </Text>
                </VStack>
              </HStack>

              {/* Status Badge */}
              <Box
                bg={statusDisplay.bgColor}
                px="$3"
                py="$1.5"
                borderRadius="$full"
                borderWidth={1.5}
                borderColor={statusDisplay.color}
              >
                <HStack space="xs" alignItems="center">
                  <StatusIcon
                    size={14}
                    color={statusDisplay.color}
                    strokeWidth={2.5}
                  />
                  <Text
                    fontSize="$xs"
                    fontWeight="$bold"
                    color={statusDisplay.color}
                  >
                    {statusDisplay.label}
                  </Text>
                </HStack>
              </Box>
            </HStack>

            {/* Divider */}
            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Mã nhà bảo hiểm và Số tiền bảo hiểm - 2 cột */}
            <HStack space="md">
              <VStack flex={1} space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Mã nhà bảo hiểm
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  {policy.insurance_provider_id}
                </Text>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="xs" alignItems="flex-end">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Số tiền bảo hiểm
                </Text>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={statusDisplay.color}
                >
                  {Utils.formatCurrency(policy.coverage_amount)}
                </Text>
              </VStack>
            </HStack>

            {/* Divider */}
            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Tổng chi phí thanh toán */}
            <HStack justifyContent="space-between" alignItems="center">
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                fontWeight="$medium"
              >
                Tổng chi phí thanh toán
              </Text>
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {Utils.formatCurrency(
                  policy.total_farmer_premium + policy.total_data_cost
                )}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Pressable>
  );
};

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { RegisteredPolicy } from "@/domains/policy/models/policy.models";
import { Utils } from "@/libs/utils/utils";
import { Box, HStack, Pressable, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  XCircle
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
    // Ưu tiên hiển thị underwriting_status
    if (policy.underwriting_status === "approved") {
      return { label: "Đã duyệt", color: colors.success, icon: CheckCircle2 };
    }
    if (policy.underwriting_status === "rejected") {
      return { label: "Từ chối", color: colors.error, icon: XCircle };
    }
    if (policy.underwriting_status === "pending") {
      return { label: "Chờ duyệt", color: colors.pending, icon: Clock };
    }

    // Fallback sang status
    switch (policy.status) {
      case "active":
        return {
          label: "Đang hoạt động",
          color: colors.success,
          icon: CheckCircle2,
        };
      case "rejected":
      case "cancelled":
        return { label: "Đã hủy", color: colors.error, icon: XCircle };
      case "pending_review":
        return { label: "Chờ xét duyệt", color: colors.pending, icon: Clock };
      case "suspended":
        return {
          label: "Tạm ngưng",
          color: colors.warning,
          icon: AlertCircle,
        };
      case "expired":
        return { label: "Hết hạn", color: colors.muted_text, icon: XCircle };
      default:
        return {
          label: "Không xác định",
          color: colors.muted_text,
          icon: AlertCircle,
        };
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
          bg={colors.background}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          opacity={pressed ? 0.7 : 1}
          overflow="hidden"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
        >
          <VStack>
            {/* Header Section - Green Background with Gradient Effect */}
            <Box bg={colors.primary} p="$5">
              <VStack space="lg">
                {/* Policy Number & Status Row */}
                <HStack
                  justifyContent="space-between"
                  alignItems="flex-start"
                  space="md"
                >
                  <VStack flex={1} space="xs">
                    <HStack space="sm" alignItems="center">
                      <Box
                        bg={colors.primary_white_text}
                        p="$2.5"
                        borderRadius="$lg"
                        shadowColor="$black"
                        shadowOffset={{ width: 0, height: 1 }}
                        shadowOpacity={0.1}
                        shadowRadius={3}
                      >
                        <Shield
                          size={22}
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                      </Box>
                      <VStack flex={1}>
                        <Text
                          fontSize="$xs"
                          color={colors.primary_white_text}
                          opacity={0.8}
                          mb="$0.5"
                        >
                          Mã đăng ký
                        </Text>
                        <Text
                          fontSize="$md"
                          fontWeight="$bold"
                          color={colors.primary_white_text}
                          numberOfLines={1}
                        >
                          {policy.policy_number}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>

                  {/* Status Badge - Floating Style */}
                  <Box
                    bg={statusDisplay.color}
                    px="$3.5"
                    py="$2"
                    borderRadius="$full"
                    shadowColor="$black"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.15}
                    shadowRadius={4}
                  >
                    <HStack space="xs" alignItems="center">
                      <StatusIcon
                        size={15}
                        color={colors.primary_white_text}
                        strokeWidth={2.5}
                      />
                      <Text
                        fontSize="$xs"
                        fontWeight="$bold"
                        color={colors.primary_white_text}
                      >
                        {statusDisplay.label}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>

                {/* Coverage Amount - Hero Display */}
                <Box
                  bg={colors.primary_white_text + "20"}
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.primary_white_text + "40"}
                >
                  <VStack space="xs">
                    <HStack space="xs" alignItems="center">
                      <Shield
                        size={16}
                        color={colors.primary_white_text}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$xs"
                        color={colors.primary_white_text}
                        opacity={0.9}
                        fontWeight="$medium"
                      >
                        Số tiền bảo hiểm
                      </Text>
                    </HStack>
                    <Text
                      fontSize="$2xl"
                      fontWeight="$bold"
                      color={colors.primary_white_text}
                      letterSpacing="$sm"
                    >
                      {Utils.formatCurrency(policy.coverage_amount)}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* Info Section - White Background */}
            <VStack p="$5" space="md">
              {/* Date Information - 2 Columns */}
              <HStack space="md">
                {/* Ngày đăng ký */}
                <VStack flex={1} space="xs">
                  <HStack space="xs" alignItems="center">
                    <Calendar
                      size={14}
                      color={colors.secondary_text}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Ngày đăng ký
                    </Text>
                  </HStack>
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatDateForMS(
                      Math.floor(new Date(policy.created_at).getTime() / 1000)
                    )}
                  </Text>
                </VStack>

                {/* Vertical Divider */}
                <Box width={1} bg={colors.frame_border} />

                {/* Ngày hết hạn */}
                <VStack flex={1} space="xs">
                  <HStack space="xs" alignItems="center">
                    <Calendar
                      size={14}
                      color={colors.secondary_text}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Hết hạn
                    </Text>
                  </HStack>
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatDateForMS(policy.coverage_end_date)}
                  </Text>
                </VStack>
              </HStack>

              {/* Divider */}
              <Box height={1} bg={colors.frame_border} width="100%" />

              {/* Payment Breakdown Section */}
              <VStack space="sm">
                <Text
                  fontSize="$xs"
                  color={colors.secondary_text}
                  fontWeight="$semibold"
                  textTransform="uppercase"
                  letterSpacing="$md"
                  mb="$1"
                >
                  Chi tiết thanh toán
                </Text>

                {/* Premium Fee */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize="$sm"
                    color={colors.primary_text}
                    fontWeight="$medium"
                  >
                    Phí bảo hiểm
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatCurrency(policy.total_farmer_premium)}
                  </Text>
                </HStack>

                {/* Data Cost */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize="$sm"
                    color={colors.primary_text}
                    fontWeight="$medium"
                  >
                    Phí dữ liệu vệ tinh
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatCurrency(policy.total_data_cost)}
                  </Text>
                </HStack>
              </VStack>

              {/* Divider */}
              <Box height={1} bg={colors.frame_border} width="100%" />

              {/* Total Payment - Highlighted */}
              <Box
                bg={colors.primary}
                borderRadius="$xl"
                p="$4"
                shadowColor={colors.primary}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={8}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                    textTransform="uppercase"
                    letterSpacing="$md"
                  >
                    Tổng chi phí
                  </Text>
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                    letterSpacing="$sm"
                  >
                    {Utils.formatCurrency(
                      policy.total_farmer_premium + policy.total_data_cost
                    )}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </VStack>
        </Box>
      )}
    </Pressable>
  );
};

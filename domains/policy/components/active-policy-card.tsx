import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { RegisteredPolicyStatus } from "@/domains/policy/enums/policy-status.enum";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { RegisteredPolicy } from "@/domains/policy/models/policy.models";
import { Utils } from "@/libs/utils/utils";
import { Box, HStack, Pressable, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Sprout,
} from "lucide-react-native";
import React from "react";

interface ActivePolicyCardProps {
  policy: RegisteredPolicy;
}

/**
 * Card component hiển thị thông tin policy đang hoạt động (active & approved)
 * Chuyên dụng cho trang "Bảo hiểm của tôi"
 */
export const ActivePolicyCard: React.FC<ActivePolicyCardProps> = ({
  policy,
}) => {
  const { colors } = useAgrisaColors();

  // Lấy thông tin chi tiết base policy
  const { getDetailBasePolicy } = usePolicy();
  const { data: basePolicyData, isLoading: basePolicyLoading } =
    getDetailBasePolicy(policy.base_policy_id);
  const basePolicy = basePolicyData?.data?.base_policy;

  // Lấy thông tin insurance partner
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const { data: partnerData, isLoading: partnerLoading } =
    getInsurancePartnerDetail(policy.insurance_provider_id);
  const partnerName = partnerData?.data?.partner_display_name || "Đang tải...";

  // Lấy thông tin farm
  const { getDetailFarm } = useFarm();
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(
    policy.farm_id
  );
  const farm = farmData?.data;

  const isLoading = basePolicyLoading || partnerLoading || farmLoading;

  // Tính số ngày còn lại
  const getDaysRemaining = () => {
    const now = Math.floor(Date.now() / 1000);
    const endDate = policy.coverage_end_date;
    const daysLeft = Math.ceil((endDate - now) / 86400);
    return daysLeft > 0 ? daysLeft : 0;
  };

  // Tính số ngày đến khi có hiệu lực
  const getDaysUntilEffective = () => {
    const now = Math.floor(Date.now() / 1000);
    const startDate = policy.coverage_start_date;
    const daysUntil = Math.ceil((startDate - now) / 86400);
    return daysUntil > 0 ? daysUntil : 0;
  };

  // Kiểm tra policy đã có hiệu lực chưa (chỉ dùng cho active status)
  const isPolicyEffective = () => {
    const now = Math.floor(Date.now() / 1000);
    return now >= policy.coverage_start_date;
  };

  // Xác định trạng thái hiển thị dựa trên policy.status
  const getStatusDisplay = () => {
    const now = Math.floor(Date.now() / 1000);

    switch (policy.status) {
      case RegisteredPolicyStatus.PAYOUT:
        return {
          label: "Đang bồi thường",
          color: colors.info,
          icon: CheckCircle2,
          showDays: false,
          message: "Đang trong quá trình chi trả bồi thường",
        };

      case RegisteredPolicyStatus.PENDING_CANCEL:
        return {
          label: "Chờ xử lý hủy",
          color: colors.warning,
          icon: Clock,
          showDays: false,
          message: "Yêu cầu hủy hợp đồng đang được xử lý",
        };

      case RegisteredPolicyStatus.DISPUTE:
        return {
          label: "Tranh chấp",
          color: colors.error,
          icon: Clock,
          showDays: false,
          message: "Hợp đồng đang trong quá trình giải quyết tranh chấp",
        };

      case RegisteredPolicyStatus.CANCELLED:
        return {
          label: "Đã hủy",
          color: colors.error,
          icon: Clock,
          showDays: false,
          message: "Hợp đồng đã bị hủy bỏ",
        };

      case RegisteredPolicyStatus.EXPIRED:
        return {
          label: "Hết hạn",
          color: colors.muted_text,
          icon: Clock,
          showDays: false,
          message: "Bảo hiểm đã hết hạn",
        };

      case RegisteredPolicyStatus.ACTIVE:
        // Kiểm tra xem đã đến ngày bắt đầu chưa
        if (now < policy.coverage_start_date) {
          const daysUntil = Math.ceil(
            (policy.coverage_start_date - now) / 86400
          );
          return {
            label: "Chờ hiệu lực",
            color: colors.warning,
            icon: Clock,
            showDays: true,
            daysCount: daysUntil,
            daysLabel: "ngày đến khi có hiệu lực",
            isWaiting: true,
          };
        }

        // Đã đến ngày bắt đầu
        const daysLeft = Math.ceil((policy.coverage_end_date - now) / 86400);
        return {
          label: "Có hiệu lực",
          color: colors.success,
          icon: CheckCircle2,
          showDays: true,
          daysCount: daysLeft > 0 ? daysLeft : 0,
          daysLabel: "ngày",
          isWaiting: false,
        };

      default:
        // Fallback cho các trạng thái khác
        return {
          label: "Không xác định",
          color: colors.muted_text,
          icon: Clock,
          showDays: false,
          message: "Trạng thái không xác định",
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const cardColor = statusDisplay.color;
  const cardSoftColor = statusDisplay.color + "20";

  return (
    <Pressable
      onPress={() => router.push(`/(farmer)/registered-policies/${policy.id}`)}
    >
      {({ pressed }) => (
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={2}
          borderColor={cardColor}
          opacity={pressed ? 0.8 : 1}
          overflow="hidden"
        >
          {/* Header với gradient */}
          <Box bg={cardColor} p="$4">
            <VStack space="sm">
              {/* Mã hợp đồng + Badge đang hoạt động */}
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="sm" alignItems="center" flex={1}>
                  <Box bg={colors.primary_white_text} p="$2" borderRadius="$lg">
                    <Shield size={20} color={cardColor} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text
                      fontSize="$xs"
                      color={colors.primary_white_text}
                      opacity={0.9}
                      mb="$0.5"
                    >
                      Mã hợp đồng
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

                {/* Status Badge */}
                <Box
                  bg={colors.primary_white_text}
                  px="$3"
                  py="$1.5"
                  borderRadius="$full"
                  borderColor={cardColor}
                >
                  <HStack space="xs" alignItems="center">
                    <statusDisplay.icon
                      size={14}
                      color={cardColor}
                      strokeWidth={2.5}
                    />
                    <Text fontSize="$xs" fontWeight="$bold" color={cardColor}>
                      {statusDisplay.label}
                    </Text>
                  </HStack>
                </Box>
              </HStack>

              {/* Thông tin trạng thái */}
              <Box
                bg={colors.primary_white_text}
                borderRadius="$lg"
                p="$3"
                alignItems="center"
              >
                <HStack space="sm" alignItems="center">
                  <Calendar size={16} color={cardColor} strokeWidth={2} />
                  {statusDisplay.showDays ? (
                    <>
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        {statusDisplay.isWaiting ? "Còn:" : "Còn lại:"}
                      </Text>
                      <Text fontSize="$xl" fontWeight="$bold" color={cardColor}>
                        {statusDisplay.daysCount}
                      </Text>
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        {statusDisplay.daysLabel}
                      </Text>
                    </>
                  ) : (
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.secondary_text}
                    >
                      {statusDisplay.message}
                    </Text>
                  )}
                </HStack>
              </Box>
            </VStack>
          </Box>

          {/* Body Content */}
          <VStack space="md" p="$4">
            {isLoading ? (
              <Box py="$4" alignItems="center">
                <Spinner size="small" color={colors.primary} />
                <Text fontSize="$xs" color={colors.secondary_text} mt="$2">
                  Đang tải thông tin...
                </Text>
              </Box>
            ) : (
              <>
                {/* Nhà bảo hiểm & Chương trình bảo hiểm */}
                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Nhà bảo hiểm
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                      numberOfLines={2}
                    >
                      {partnerName}
                    </Text>
                  </VStack>

                  {basePolicy && (
                    <>
                      <Box width={1} bg={colors.frame_border} />

                      <VStack flex={1} space="xs">
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          Chương trình
                        </Text>
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.primary_text}
                          numberOfLines={2}
                        >
                          {basePolicy.product_name}
                        </Text>
                      </VStack>
                    </>
                  )}
                </HStack>

                <Box height={1} bg={colors.frame_border} width="100%" />
                {/* Thời gian đăng ký */}
                <Box
                  bg={colors.background}
                  borderRadius="$md"
                  p="$3"
                  alignItems="center"
                >
                  <HStack space="sm" alignItems="center">
                    <Calendar
                      size={14}
                      color={colors.primary}
                      strokeWidth={2}
                    />
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Đăng ký vào:
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {Utils.formatStringVietnameseDate(policy.created_at)}
                    </Text>
                  </HStack>
                </Box>

                <Box height={1} bg={colors.frame_border} width="100%" />
                {/* Thời hạn bảo hiểm */}
                <VStack space="sm">
                  <Text
                    fontSize="$xs"
                    color={colors.secondary_text}
                    textAlign="center"
                  >
                    Thời hạn bảo hiểm
                  </Text>
                  <HStack space="md">
                    <VStack flex={1} space="xs" alignItems="center">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Bắt đầu hiệu lực
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                        textAlign="center"
                      >
                        {Utils.formatDateForMS(policy.coverage_start_date)}
                      </Text>
                    </VStack>

                    <Box width={1} bg={colors.frame_border} />

                    <VStack flex={1} space="xs" alignItems="center">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Kết thúc hiệu lực
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                        textAlign="center"
                      >
                        {Utils.formatDateForMS(policy.coverage_end_date)}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                <Box height={1} bg={colors.frame_border} width="100%" />

                {/* Thông tin nông trại */}
                {farm && (
                  <>
                    <VStack space="sm">
                      <Text
                        fontSize="$xs"
                        textAlign="center"
                        color={colors.secondary_text}
                      >
                        Thông tin nông trại
                      </Text>

                      <HStack space="md">
                        <VStack flex={1} space="xs">
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Tên nông trại
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                            numberOfLines={2}
                          >
                            {farm.farm_name}
                          </Text>
                        </VStack>

                        <Box width={1} bg={colors.frame_border} />

                        <VStack flex={1} space="xs" alignItems="flex-end">
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Diện tích
                          </Text>
                          <HStack space="xs" alignItems="baseline">
                            <Text
                              fontSize="$lg"
                              fontWeight="$bold"
                              color={colors.primary}
                            >
                              {farm.area_sqm}
                            </Text>
                            <Text
                              fontSize="$xs"
                              color={colors.secondary_text}
                              fontWeight="$medium"
                            >
                              héc-ta
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Loại cây trồng */}
                      {farm.crop_type && (
                        <HStack
                          space="sm"
                          alignItems="center"
                          bg={colors.background}
                          p="$2"
                          borderRadius="$md"
                        >
                          <Sprout
                            size={14}
                            color={colors.success}
                            strokeWidth={2}
                          />
                          <Text
                            fontSize="$xs"
                            color={colors.secondary_text}
                            flex={1}
                          >
                            Loại cây trồng:
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {Utils.getCropLabel(farm.crop_type)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>

                    <Box height={1} bg={colors.frame_border} width="100%" />
                  </>
                )}

                {/* Số tiền bồi thường tối đa */}
                <HStack space="sm" alignItems="center" justifyContent="center">
                  <Text
                    fontSize="$sm"
                    color={colors.secondary_text}
                    fontWeight="$medium"
                  >
                    Số tiền bồi thường tối đa:
                  </Text>
                  <Text fontSize="$2xl" fontWeight="$bold" color={cardColor}>
                    {Utils.formatCurrency(policy.coverage_amount)}
                  </Text>
                </HStack>
              </>
            )}
          </VStack>
        </Box>
      )}
    </Pressable>
  );
};

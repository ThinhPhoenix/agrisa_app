import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
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
    const { getInsurancePartnerDetail } = useInsurancePartner();

    // Lấy thông tin insurance partner
    const { data: partnerData } = getInsurancePartnerDetail(
        policy.insurance_provider_id
    );
    const partnerName =
        partnerData?.data?.partner_display_name || policy.insurance_provider_id;

    const getPolicyStatusDisplay = () => {
        // ƯU TIÊN kiểm tra policy.status trước (status thực tế của hợp đồng)
        // Nếu có các status đặc biệt, hiển thị ngay không cần xem underwriting_status

        // 1. Kiểm tra các status đặc biệt của policy
        switch (policy.status) {
            case "payout":
                return {
                    label: "Đã chi trả",
                    color: colors.info,
                    bgColor: colors.infoSoft,
                    icon: CheckCircle2,
                };

            case "pending_cancel":
                return {
                    label: "Chờ xử lý hủy",
                    color: colors.warning,
                    bgColor: colors.warningSoft,
                    icon: Clock,
                };

            case "dispute":
                return {
                    label: "Tranh chấp",
                    color: colors.error,
                    bgColor: colors.errorSoft,
                    icon: AlertCircle,
                };

            case "cancelled":
                return {
                    label: "Đã hủy",
                    color: colors.error,
                    bgColor: colors.errorSoft,
                    icon: XCircle,
                };

            case "expired":
                return {
                    label: "Hết hạn",
                    color: colors.muted_text,
                    bgColor: colors.background,
                    icon: XCircle,
                };

            case "pending_payment":
                // Chờ thanh toán (sau khi được duyệt)
                if (policy.underwriting_status === "approved") {
                    return {
                        label: "Chờ thanh toán",
                        color: colors.warning,
                        bgColor: colors.warningSoft,
                        icon: Clock,
                    };
                }
                break;

            case "draft":
                return {
                    label: "Bản nháp",
                    color: colors.muted_text,
                    bgColor: colors.background,
                    icon: AlertCircle,
                };
        }

        // 2. Nếu không có status đặc biệt, xử lý theo underwriting_status
        switch (policy.underwriting_status) {
            case "approved":
                // Nếu approved, xem tiếp status để xác định trạng thái cuối
                if (policy.status === "active") {
                    return {
                        label: "Được bảo hiểm",
                        color: colors.success,
                        bgColor: colors.successSoft,
                        icon: CheckCircle2,
                    };
                }
                return {
                    label: "Đã duyệt",
                    color: colors.success,
                    bgColor: colors.successSoft,
                    icon: CheckCircle2,
                };

            case "rejected":
                return {
                    label: "Bị từ chối",
                    color: colors.error,
                    bgColor: colors.errorSoft,
                    icon: XCircle,
                };

            case "pending":
                // Nếu pending, xem status để phân biệt draft và pending_review
                if (policy.status === "pending_review") {
                    return {
                        label: "Chờ duyệt",
                        color: colors.pending,
                        bgColor: "",
                        icon: Clock,
                    };
                }
                return {
                    label: "Chờ duyệt",
                    color: colors.pending,
                    bgColor: "",
                    icon: Clock,
                };

            default:
                return {
                    label: "Không xác định",
                    color: colors.muted_text,
                    bgColor: colors.background,
                    icon: AlertCircle,
                };
        }
    };

    const statusDisplay = getPolicyStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    return (
        <Pressable
            onPress={() =>
                router.push(`/(farmer)/history-registered-policy/${policy.id}`)
            }
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
                        {/* Header: Mã hợp đồng + Trạng thái */}
                        <HStack
                            justifyContent="space-between"
                            alignItems="center"
                        >
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
                                    <Text
                                        fontSize="$xs"
                                        color={colors.secondary_text}
                                        mb="$0.5"
                                    >
                                        Mã hợp đồng
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
                                <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                >
                                    Nhà bảo hiểm
                                </Text>
                                <Text
                                    fontSize="$sm"
                                    fontWeight="$semibold"
                                    color={colors.primary_text}
                                    numberOfLines={2}
                                >
                                    {partnerName}
                                </Text>
                            </VStack>

                            <Box width={1} bg={colors.frame_border} />

                            <VStack flex={1} space="xs" alignItems="flex-end">
                                <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                >
                                    Số tiền bảo hiểm
                                </Text>
                                <Text
                                    fontSize="$lg"
                                    fontWeight="$bold"
                                    color={statusDisplay.color}
                                >
                                    {Utils.formatCurrency(
                                        policy.coverage_amount
                                    )}
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Divider */}
                        <Box height={1} bg={colors.frame_border} width="100%" />

                        {/* Thời gian tạo đơn và cập nhật - 2 cột */}
                        <HStack space="md">
                            <VStack flex={1} space="xs">
                                <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                >
                                    Ngày tạo đơn
                                </Text>
                                <Text
                                    fontSize="$sm"
                                    fontWeight="$semibold"
                                    color={colors.primary_text}
                                >
                                    {Utils.formatStringVietnameseDate(
                                        policy.created_at
                                    )}
                                </Text>
                            </VStack>

                            <Box width={1} bg={colors.frame_border} />

                            <VStack flex={1} space="xs" alignItems="flex-end">
                                <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                >
                                    Cập nhật lần cuối
                                </Text>
                                <Text
                                    fontSize="$sm"
                                    fontWeight="$semibold"
                                    color={colors.primary_text}
                                >
                                    {Utils.formatStringVietnameseDate(
                                        policy.updated_at
                                    )}
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Divider */}
                        <Box height={1} bg={colors.frame_border} width="100%" />

                        {/* Tổng chi phí thanh toán */}
                        <HStack
                            justifyContent="space-between"
                            alignItems="center"
                        >
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
                                    policy.total_farmer_premium
                                )}
                            </Text>
                        </HStack>
                    </VStack>
                </Box>
            )}
        </Pressable>
    );
};

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import { Box, HStack, Pressable, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileWarning,
  Shield,
  XCircle,
  Zap,
} from "lucide-react-native";
import React from "react";
import { ClaimStatus } from "../enums/claim-status.enum";
import { ClaimEvent } from "../models/claim-event-data.models";

interface ClaimEventCardProps {
  claim: ClaimEvent;
}

/**
 * Card component hiển thị thông tin claim event
 * Sử dụng để hiển thị trong danh sách claims
 */
export const ClaimEventCard: React.FC<ClaimEventCardProps> = ({ claim }) => {
  const { colors } = useAgrisaColors();

  /**
   * Lấy thông tin hiển thị status của claim
   */
  const getClaimStatusDisplay = (status: string) => {
    switch (status) {
      case ClaimStatus.PENDING_PARTNER_REVIEW:
        return {
          label: "Chờ xét duyệt",
          color: colors.pending,
          bgColor: "",
          icon: Clock,
        };
      case ClaimStatus.APPROVED:
        return {
          label: "Đã duyệt",
          color: colors.success,
          bgColor: colors.successSoft,
          icon: CheckCircle2,
        };
      case ClaimStatus.REJECTED:
        return {
          label: "Từ chối",
          color: colors.error,
          bgColor: colors.errorSoft,
          icon: XCircle,
        };
      case ClaimStatus.PAID:
        return {
          label: "Đã chi trả",
          color: colors.info || colors.primary,
          bgColor: colors.infoSoft || colors.primarySoft,
          icon: CheckCircle2,
        };
      case ClaimStatus.REJECTED:
        return {
          label: "Đã hủy",
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
  };

  const statusDisplay = getClaimStatusDisplay(claim.status);
  const StatusIcon = statusDisplay.icon;

  return (
    <Pressable onPress={() => router.push(`/(farmer)/claim/${claim.id}`)}>
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
            {/* Header: Số claim + Trạng thái */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center" flex={1}>
                <Box
                  bg={statusDisplay.color}
                  p="$2"
                  borderRadius="$lg"
                  borderWidth={1.5}
                  borderColor={colors.primary_white_text}
                >
                  <FileWarning
                    size={18}
                    color={colors.primary_white_text}
                    strokeWidth={2.5}
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$xs" color={colors.secondary_text} mb="$0.5">
                    Số yêu cầu chi trả
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                    numberOfLines={1}
                  >
                    {claim.claim_number}
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

            {/* Loại tạo claim và Số tiền yêu cầu - 2 cột */}
            <HStack space="md">
              <VStack flex={1} space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Phương thức tạo
                </Text>
                <HStack space="xs" alignItems="center">
                  {claim.auto_generated ? (
                    <>
                      <Zap size={14} color={colors.warning} strokeWidth={2.5} />
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.warning}
                      >
                        Tự động
                      </Text>
                    </>
                  ) : (
                    <>
                      <Shield
                        size={14}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary}
                      >
                        Thủ công
                      </Text>
                    </>
                  )}
                </HStack>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="xs" alignItems="flex-end">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Số tiền chi trả
                </Text>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={statusDisplay.color}
                >
                  {claim.claim_amount.toLocaleString("vi-VN")} ₫
                </Text>
              </VStack>
            </HStack>

            {/* Divider */}
            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Thời gian kích hoạt và số điều kiện trigger - 2 cột */}
            <HStack space="md">
              <VStack flex={1} space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Thời gian kích hoạt
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  {Utils.formatDateTimeForMS(claim.trigger_timestamp)}
                </Text>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="xs" alignItems="flex-end">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Số điều kiện kích hoạt
                </Text>
                <HStack space="xs" alignItems="center">
                  <AlertTriangle
                    size={14}
                    color={colors.warning}
                    strokeWidth={2.5}
                  />
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {claim.evidence_summary?.conditions_count || 0} điều kiện
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Divider */}
            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Ngày tạo và cập nhật - có giờ */}
            <HStack space="md">
              <VStack flex={1} space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Ngày tạo yêu cầu
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  {Utils.formatStringVietnameseDateTime(claim.created_at)}
                </Text>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="xs" alignItems="flex-end">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Cập nhật lần cuối
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  {Utils.formatStringVietnameseDateTime(claim.updated_at)}
                </Text>
              </VStack>
            </HStack>

            {/* Auto approval deadline nếu còn chờ duyệt */}
            {claim.status === ClaimStatus.PENDING_PARTNER_REVIEW &&
              claim.auto_approval_deadline && (
                <>
                  <Box height={1} bg={colors.frame_border} width="100%" />
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text
                      fontSize="$sm"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Tự động duyệt lúc
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.warning}
                    >
                      {Utils.formatDateTimeForMS(claim.auto_approval_deadline)}
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

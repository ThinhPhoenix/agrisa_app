import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useUserInfo } from "@/domains/auth/hooks/use-user-info";
import { useDataSource } from "@/domains/farm-data-monitor/hooks/use-data-source";
import { getParameterLabel } from "@/domains/farm-data-monitor/utils/parameterUtils";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { TriggerCard } from "@/domains/policy/components/detail-base-policy";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  HStack,
  ScrollView,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack
} from "@gluestack-ui/themed";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Scale,
  Shield,
  Sprout,
  Target,
  User,
  XCircle,
  Zap
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { ClaimStatus } from "../enums/claim-status.enum";
import { usePayout } from "../hooks/use-payout";
import {
  ClaimEvent,
  ClaimEvidenceCondition,
} from "../models/claim-event-data.models";
import { ConfirmPayoutPayload } from "../models/payout.model";

interface ClaimEventDetailProps {
  claim: ClaimEvent;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Component hiển thị chi tiết một claim event
 * Thiết kế tối giản giống như trang chi tiết registered policy
 */
export const ClaimEventDetail: React.FC<ClaimEventDetailProps> = ({
  claim,
  onRefresh,
  isRefreshing = false,
}) => {
  const { colors } = useAgrisaColors();
  const { displayName, fullName } = useUserInfo();

  // State cho xác nhận nhận tiền
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  // Lấy thông tin payout theo claim_id
  const { getPayoutByClaimId, useConfirmPayout } = usePayout();
  const { data: payoutData, isLoading: payoutLoading } = getPayoutByClaimId(
    claim.id
  );
  const payout = payoutData?.success ? payoutData.data : null;

  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(
    new Set()
  );

  const toggleTrigger = (triggerId: string) => {
    setExpandedTriggers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(triggerId)) newSet.delete(triggerId);
      else newSet.add(triggerId);
      return newSet;
    });
  };
  // Mutation xác nhận nhận tiền - sử dụng payout_id
  const confirmPayoutMutation = useConfirmPayout();

  // Fetch thông tin liên quan
  const { getDetailFarm } = useFarm();
  const { getDetailBasePolicy, getRegisteredPolicyDetail } = usePolicy();
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const { getDataSourceByID } = useDataSource();

  // Lấy thông tin farm
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(
    claim.farm_id
  );
  const farm = farmData?.success ? farmData.data : null;

  // Lấy thông tin registered policy
  const { data: registeredPolicyData, isLoading: registeredPolicyLoading } =
    getRegisteredPolicyDetail(claim.registered_policy_id);
  const registeredPolicy = registeredPolicyData?.success
    ? registeredPolicyData.data
    : null;

  // Lấy thông tin base policy
  const { data: basePolicyData, isLoading: basePolicyLoading } =
    getDetailBasePolicy(claim.base_policy_id);
  const basePolicy = basePolicyData?.success
    ? basePolicyData.data?.base_policy
    : null;
  const triggers = basePolicyData?.success ? basePolicyData.data?.triggers : [];

  // Tìm trigger liên quan theo trigger id
  const relatedTrigger = triggers?.find(
    (t: any) => t.id === claim.base_policy_trigger_id
  );

  // So khớp condition giữa claim và base policy trigger:
  // Duyệt mảng condition trong claim.evidence_summary.conditions
  // và tìm điều kiện tương ứng trong relatedTrigger.conditions theo id.
  const relatedCondition = (() => {
    if (
      !relatedTrigger?.conditions ||
      !Array.isArray(relatedTrigger.conditions)
    )
      return undefined;
    const claimConds = claim.evidence_summary?.conditions || [];
    if (Array.isArray(claimConds) && claimConds.length > 0) {
      const claimIds = new Set(
        claimConds.map((c: any) => c.condition_id ?? c.id).filter(Boolean)
      );
      const found = relatedTrigger.conditions.find((bc: any) =>
        claimIds.has(bc.id ?? bc.condition_id)
      );
      if (found) return found;
    }

    // Fallback: nếu không tìm thấy match, trả về condition đầu tiên (như trước)
    return relatedTrigger.conditions[0];
  })();

  // Lấy thông tin data source tương ứng với condition đã tìm được
  const { data: dataSourceData } = getDataSourceByID(
    relatedCondition?.data_source_id || ""
  );
  const dataSource =
    dataSourceData?.success === true ? dataSourceData.data : null;
  const dataSourceUnit = dataSource?.unit || "";

  // Helper để format unit - ẩn với các chỉ số index
  const formatUnit = (unit?: string, paramName?: string) => {
    const indexParams = [
      "ndmi",
      "ndwi",
      "evi",
      "ndvi",
      "savi",
      "lai",
      "gci",
      "msavi",
    ];

    const unitLower = (unit || "").toLowerCase();
    const paramLower = (paramName || "").toLowerCase();

    // Nếu parameter là rainfall mà unit không được cung cấp, hiển thị mm
    if (!unit && paramLower === "rainfall") return " mm";

    // Các chỉ số (index) không hiển thị unit
    if (unitLower === "index") return "";
    if (paramName && indexParams.includes(paramLower)) return "";

    // Hiển thị đúng ký hiệu cho mm và phần trăm
    if (unitLower === "mm") return " mm";
    if (
      unitLower === "%" ||
      unitLower === "percent" ||
      unitLower === "percent%"
    )
      return " %";

    return unit ? ` ${unit}` : "";
  };

  // Lấy thông tin insurance partner
  const { data: partnerData, isLoading: partnerLoading } =
    getInsurancePartnerDetail(registeredPolicy?.insurance_provider_id || "");

  // Lấy thông tin người xét duyệt (convert id -> partner info nếu là partner)
  const { data: reviewerPartnerData, isLoading: reviewerPartnerLoading } =
    getInsurancePartnerDetail(claim.reviewed_by || "");

  const getClaimStatusDisplay = (status: string) => {
    switch (status) {
      case ClaimStatus.PENDING_PARTNER_REVIEW:
        return {
          label: "Chờ đối tác xét duyệt",
          color: colors.pending,
          bgColor: colors.warningSoft || colors.background,
          icon: Clock,
        };
      case ClaimStatus.APPROVED:
        return {
          label: "Đã được duyệt",
          color: colors.success,
          bgColor: colors.successSoft,
          icon: CheckCircle2,
        };
      case ClaimStatus.REJECTED:
        return {
          label: "Đã bị từ chối",
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
  const partnerDecisionNormalized = ((claim.partner_decision || "") as string)
    .toString()
    .toLowerCase();

  const formatAmount = (amount: number): string => {
    return (
      amount.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + " ₫"
    );
  };

  // Xử lý xác nhận nhận tiền
  const handleConfirmPayout = () => {
    // Kiểm tra có payout không
    if (!payout) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin chi trả. Vui lòng thử lại sau.",
        [{ text: "Đóng" }]
      );
      return;
    }

    // Kiểm tra payout status phải là "paid" mới cho phép xác nhận
    if (payout.status !== "completed") {
      Alert.alert(
        "Chưa thể xác nhận",
        "Tiền chi trả đang được xử lý. Vui lòng chờ đến khi đối tác hoàn tất chi trả.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }

    if (rating === 0) {
      Alert.alert(
        "Thiếu đánh giá",
        "Vui lòng chọn số sao đánh giá trước khi xác nhận.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }

    Alert.alert(
      "Xác nhận nhận tiền",
      "Bạn xác nhận đã nhận được tiền chi trả từ đối tác bảo hiểm. Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "default",
          onPress: () => {
            // Payload theo format mới với PascalCase
            const payload: ConfirmPayoutPayload = {
              FarmerConfirmed: true,
              FarmerRating: rating,
              FarmerFeedback: feedback.trim() || undefined,
            };

            // Sử dụng payout.id thay vì claim.id
            confirmPayoutMutation.mutate(
              { payoutId: payout.id, payload },
              {
                onSuccess: () => {
                  Alert.alert(
                    "Thành công",
                    "Xác nhận nhận tiền thành công. Cảm ơn bạn đã sử dụng dịch vụ!",
                    [{ text: "Đóng" }]
                  );
                  // Reset form
                  setRating(0);
                  setFeedback("");
                  // Refresh data
                  onRefresh?.();
                },
                onError: (error: any) => {
                  Alert.alert(
                    "Lỗi",
                    error?.message || "Không thể xác nhận. Vui lòng thử lại.",
                    [{ text: "Đóng" }]
                  );
                },
              }
            );
          },
        },
      ]
    );
  };

  const ConditionCard = ({
    condition,
    index,
  }: {
    condition: ClaimEvidenceCondition;
    index: number;
  }) => {
    const isWarning = condition.is_early_warning;
    const conditionColor = isWarning ? colors.warning : colors.error;
    const unitDisplay = formatUnit(dataSourceUnit, condition.parameter);

    return (
      <Box
        bg={colors.background}
        borderRadius="$lg"
        p="$3"
        mb="$2"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <VStack space="sm">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Box bg={conditionColor} px="$2" py="$1" borderRadius="$md">
                <Text
                  fontSize="$xs"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  #{index + 1}
                </Text>
              </Box>
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {getParameterLabel(condition.parameter)}
              </Text>
            </HStack>
            <Box
              bg={isWarning ? colors.warningSoft : colors.errorSoft}
              px="$2"
              py="$1"
              borderRadius="$full"
            >
              <Text
                fontSize="$2xs"
                fontWeight="$semibold"
                color={conditionColor}
              >
                {isWarning ? "Cảnh báo sớm" : "Đủ điều kiện"}
              </Text>
            </Box>
          </HStack>

          <HStack space="md">
            <VStack flex={1} space="xs">
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Giá trị đo được
              </Text>
              <Text fontSize="$sm" fontWeight="$bold" color={conditionColor}>
                {condition.measured_value}
                {unitDisplay}
              </Text>
            </VStack>
            <VStack flex={1} space="xs" alignItems="flex-end">
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Ngưỡng kích hoạt ({Utils.getOperatorLabel(condition.operator)})
              </Text>
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {condition.threshold_value}
                {unitDisplay}
              </Text>
            </VStack>
          </HStack>

          <HStack space="md">
            <VStack flex={1} space="xs">
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Giá trị cơ sở
              </Text>
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                {condition.baseline_value}
                {unitDisplay}
              </Text>
            </VStack>
            <VStack flex={1} space="xs" alignItems="flex-end">
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Ngưỡng cảnh báo sớm
              </Text>
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.warning}
              >
                {condition.early_warning_threshold}
                {unitDisplay}
              </Text>
            </VStack>
          </HStack>

          <VStack space="xs">
            <HStack space="xs" alignItems="center">
              <Calendar
                size={12}
                color={colors.secondary_text}
                strokeWidth={2}
              />
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Thời điểm đo:
              </Text>
              <Text
                fontSize="$2xs"
                color={colors.primary_text}
                fontWeight="$semibold"
              >
                {Utils.formatDateTimeForMS(condition.timestamp)}
              </Text>
            </HStack>

            <HStack space="xs" alignItems="center">
              <Clock size={12} color={colors.secondary_text} strokeWidth={2} />
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Thời điểm kích hoạt sự kiện bảo hiểm:
              </Text>
              <Text
                fontSize="$2xs"
                color={colors.primary_text}
                fontWeight="$semibold"
              >
                {Utils.formatDateTimeForMS(claim.evidence_summary.triggered_at)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    );
  };

  return (
    <ScrollView
      flex={1}
      bg={colors.background}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      <VStack space="md" p="$4" pb="$20">
        {/* HEADER */}
        <VStack space="sm">
          <Box p="$5">
            <VStack space="sm" alignItems="center">
              <Text
                fontSize="$xl"
                fontWeight="$bold"
                color={colors.primary_text}
                textAlign="center"
              >
                YÊU CẦU BỒI THƯỜNG
              </Text>
            </VStack>
          </Box>

          <HStack space="sm">
            <Box
              flex={1}
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$3"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <FileText size={12} color={colors.primary} strokeWidth={2} />
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Mã yêu cầu
                  </Text>
                </HStack>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {claim.claim_number}
                </Text>
              </VStack>
            </Box>

            <Box
              flex={1}
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$3"
              borderWidth={1}
              borderColor={statusDisplay.color}
            >
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <StatusIcon
                    size={12}
                    color={statusDisplay.color}
                    strokeWidth={2}
                  />
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Trạng thái
                  </Text>
                </HStack>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={statusDisplay.color}
                >
                  {statusDisplay.label}
                </Text>
              </VStack>
            </Box>
          </HStack>
        </VStack>

        {/* CÁC BÊN LIÊN QUAN */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Scale size={16} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Các bên liên quan
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <HStack space="md">
              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <Building2 size={14} color={colors.primary} strokeWidth={2} />
                  <Text
                    fontSize="$xs"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    NHÀ BẢO HIỂM
                  </Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    {partnerLoading ? (
                      <Spinner size="small" color={colors.primary} />
                    ) : (
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                        textAlign="center"
                      >
                        {partnerData?.success &&
                        partnerData.data?.partner_display_name
                          ? partnerData.data.partner_display_name
                          : "Không có"}
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <User size={14} color={colors.success} strokeWidth={2} />
                  <Text
                    fontSize="$xs"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    NÔNG DÂN
                  </Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      {fullName || displayName || "Không có"}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* HỢP ĐỒNG BẢO HIỂM */}
        {registeredPolicyLoading ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Spinner size="small" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>
                Đang tải thông tin hợp đồng...
              </Text>
            </HStack>
          </Box>
        ) : registeredPolicy ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$5"
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm" justifyContent="center">
                <Shield size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Thông tin hợp đồng
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <VStack space="sm">
                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Mã hợp đồng
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {registeredPolicy.policy_number}
                    </Text>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Giá trị bảo hiểm dự kiến
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.success}
                    >
                      {formatAmount(registeredPolicy.coverage_amount)}
                    </Text>
                  </VStack>
                </HStack>

                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Hiệu lực từ
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {Utils.formatDateForMS(
                        registeredPolicy.coverage_start_date
                      )}
                    </Text>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Hiệu lực đến
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {Utils.formatDateForMS(
                        registeredPolicy.coverage_end_date
                      )}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        ) : null}

        {/* CHƯƠNG TRÌNH BẢO HIỂM */}
        {basePolicyLoading ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Spinner size="small" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>
                Đang tải thông tin chương trình bảo hiểm...
              </Text>
            </HStack>
          </Box>
        ) : basePolicy ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$5"
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm" justifyContent="center">
                <FileText size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Gói bảo hiểm
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <VStack space="sm">
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Tên gói bảo hiểm
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {basePolicy.product_name || "Không có"}
                  </Text>
                </VStack>

                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Mô tả
                  </Text>
                  <Text
                    fontSize="$sm"
                    color={colors.primary_text}
                    lineHeight="$lg"
                  >
                    {basePolicy.product_description || "Không có"}
                  </Text>
                </VStack>

                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Loại cây trồng
                    </Text>
                    <HStack space="xs" alignItems="center">
                      <Sprout
                        size={14}
                        color={colors.success}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {Utils.getCropLabel(basePolicy.crop_type)}
                      </Text>
                    </HStack>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Thời gian bảo hiểm
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {basePolicy.coverage_duration_days} ngày
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        ) : null}

        {/* ========== ĐIỀU KIỆN CHI TRẢ TỰ ĐỘNG (từ base policy) ========== */}

        {/* NÔNG TRẠI */}
        {farmLoading ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Spinner size="small" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>
                Đang tải thông tin nông trại...
              </Text>
            </HStack>
          </Box>
        ) : farm ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
          >
            <VStack space="md">
              <Box p="$5" pb="$3">
                <HStack alignItems="center" space="sm" justifyContent="center">
                  <MapPin size={16} color={colors.primary} strokeWidth={2} />
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    Trang trại
                  </Text>
                </HStack>
              </Box>

              <Box px="$5">
                <FarmBoundaryMap
                  boundary={farm.boundary}
                  isVn2000={false}
                  province={farm.province}
                  height={200}
                  showControls={true}
                />
              </Box>

              <Box height={1} bg={colors.frame_border} width="100%" mx="$5" />

              <Box px="$5" pb="$5">
                <VStack space="sm">
                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Tên nông trại
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farm.farm_name || "Không có"}
                      </Text>
                    </VStack>
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Mã nông trại
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farm.farm_code || "Không có"}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Loại cây trồng
                      </Text>
                      <HStack space="xs" alignItems="center">
                        <Sprout
                          size={14}
                          color={colors.success}
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.primary_text}
                        >
                          {Utils.getCropLabel(farm.crop_type)}
                        </Text>
                      </HStack>
                    </VStack>
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Diện tích
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farm.area_sqm} ha
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Địa chỉ
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={colors.primary_text}
                      lineHeight="$md"
                    >
                      {farm.address || "Không có"}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        ) : null}

        {/* SỐ TIỀN BỒI THƯỜNG */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Banknote size={16} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Chi tiết chi trả
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <Box
              bg={statusDisplay.bgColor}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={statusDisplay.color}
            >
              <VStack alignItems="center" space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Số tiền chi trả
                </Text>
                <Text
                  fontSize="$3xl"
                  fontWeight="$bold"
                  color={statusDisplay.color}
                >
                  {formatAmount(claim.claim_amount)}
                </Text>
              </VStack>
            </Box>

            <VStack space="sm">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Mức chi trả cố định
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {formatAmount(claim.calculated_fix_payout)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Giá trị chi trả theo ngưỡng
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {claim.calculated_threshold_payout}
                  {formatUnit(dataSourceUnit, dataSource?.parameter_name)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Mức vượt ngưỡng
                </Text>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.error}>
                  {claim.over_threshold_value}
                  {formatUnit(dataSourceUnit, dataSource?.parameter_name)}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* THỜI GIAN */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Calendar size={16} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Thông tin thời gian
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="sm">
              <HStack space="md">
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Thời điểm phát hiện
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatDateTimeForMS(claim.trigger_timestamp)}
                  </Text>
                </VStack>
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Phương thức phát hiện
                  </Text>
                  <HStack space="xs" alignItems="center">
                    {claim.auto_generated ? (
                      <>
                        <Zap size={14} color={colors.warning} strokeWidth={2} />
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
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
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.primary}
                        >
                          Thủ công
                        </Text>
                      </>
                    )}
                  </HStack>
                </VStack>
              </HStack>

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
                <VStack flex={1} space="xs">
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

              {claim.status === ClaimStatus.PENDING_PARTNER_REVIEW &&
                claim.auto_approval_deadline && (
                  <Box
                    bg={colors.warningSoft}
                    borderRadius="$lg"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.warning}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="sm" alignItems="center">
                        <Clock
                          size={14}
                          color={colors.warning}
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          color={colors.warning}
                          fontWeight="$medium"
                        >
                          Hạn tự động duyệt
                        </Text>
                      </HStack>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.warning}
                      >
                        {Utils.formatDateTimeForMS(
                          claim.auto_approval_deadline
                        )}
                      </Text>
                    </HStack>
                  </Box>
                )}

              {claim.auto_approved && (
                <Box
                  bg={colors.successSoft}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={1}
                  borderColor={colors.success}
                >
                  <HStack space="sm" alignItems="center">
                    <CheckCircle2
                      size={14}
                      color={colors.success}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$sm"
                      color={colors.success}
                      fontWeight="$medium"
                    >
                      Yêu cầu đã được hệ thống tự động phê duyệt
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </VStack>
        </Box>

        {/* BẰNG CHỨNG THIỆT HẠI */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Target size={16} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Bằng chứng thiệt hại (
                {claim.evidence_summary?.conditions_count || 0})
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="sm">
              {relatedTrigger && (
                <TriggerCard
                  trigger={relatedTrigger}
                  index={0}
                  isExpanded={expandedTriggers.has(relatedTrigger.id)}
                  onToggle={() => toggleTrigger(relatedTrigger.id)}
                  colors={colors}
                />
              )}
            </VStack>

            <Box
              bg={
                claim.evidence_summary?.generation_method === "automatic"
                  ? ""
                  : ""
              }
              px="$3"
              py="$2"
              borderRadius="$lg"
            >
              <HStack space="sm" alignItems="center">
                {claim.evidence_summary?.generation_method === "automatic" ? (
                  <Zap size={16} color={colors.warning} strokeWidth={2} />
                ) : (
                  <Shield size={16} color={colors.primary} strokeWidth={2} />
                )}
                <Text
                  fontSize="$sm"
                  color={
                    claim.evidence_summary?.generation_method === "automatic"
                      ? colors.warning
                      : colors.primary
                  }
                  fontWeight="$medium"
                >
                  {claim.evidence_summary?.generation_method === "automatic"
                    ? "Phát hiện tự động từ hệ thống giám sát vệ tinh"
                    : "Ghi nhận thủ công bởi người dùng"}
                </Text>
              </HStack>
            </Box>

            {claim.evidence_summary?.conditions &&
            claim.evidence_summary.conditions.length > 0 ? (
              <VStack>
                {claim.evidence_summary.conditions.map((condition, index) => (
                  <ConditionCard
                    key={condition.condition_id}
                    condition={condition}
                    index={index}
                  />
                ))}
              </VStack>
            ) : (
              <Box
                bg={colors.background}
                borderRadius="$lg"
                p="$4"
                alignItems="center"
              >
                <AlertCircle
                  size={24}
                  color={colors.muted_text}
                  strokeWidth={1.5}
                />
                <Text
                  fontSize="$sm"
                  color={colors.muted_text}
                  textAlign="center"
                  mt="$2"
                >
                  Không có thông tin bằng chứng thiệt hại
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* KẾT QUẢ XÉT DUYỆT TỪ ĐỐI TÁC */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Shield size={16} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Kết quả xét duyệt
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="sm">
              <Box
                bg={
                  claim.status === ClaimStatus.APPROVED ||
                  claim.status === ClaimStatus.PAID
                    ? colors.successSoft
                    : claim.status === ClaimStatus.REJECTED
                      ? colors.errorSoft
                      : colors.background
                }
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor={
                  claim.status === ClaimStatus.APPROVED ||
                  claim.status === ClaimStatus.PAID
                    ? colors.success
                    : claim.status === ClaimStatus.REJECTED
                      ? colors.error
                      : colors.frame_border
                }
              >
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Quyết định
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={
                      claim.status === ClaimStatus.APPROVED ||
                      claim.status === ClaimStatus.PAID
                        ? colors.success
                        : claim.status === ClaimStatus.REJECTED
                          ? colors.error
                          : colors.primary_text
                    }
                  >
                    {partnerDecisionNormalized === "approved" ||
                    partnerDecisionNormalized === "accept"
                      ? "Chấp nhận"
                      : partnerDecisionNormalized === "rejected" ||
                          partnerDecisionNormalized === "reject"
                        ? "Từ chối"
                        : partnerDecisionNormalized.includes("chấp")
                          ? "Chấp nhận"
                          : partnerDecisionNormalized.includes("từ")
                            ? "Từ chối"
                            : "Chưa cập nhật"}
                  </Text>
                </VStack>
              </Box>

              <VStack space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Ghi chú từ đối tác bảo hiểm
                </Text>
                <Box
                  bg={colors.background}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <Text
                    fontSize="$sm"
                    color={colors.primary_text}
                    lineHeight="$lg"
                  >
                    {claim.partner_notes
                      ? claim.partner_notes
                      : "Chưa cập nhật"}
                  </Text>
                </Box>
              </VStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Người xét duyệt
                </Text>
                <HStack space="xs" alignItems="center">
                  <User size={14} color={colors.primary} strokeWidth={2} />
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {reviewerPartnerData?.success &&
                    reviewerPartnerData.data?.partner_display_name
                      ? reviewerPartnerData.data.partner_display_name
                      : claim.reviewed_by
                        ? claim.reviewed_by
                        : "Chưa cập nhật"}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* XÁC NHẬN NHẬN TIỀN - Hiển thị khi approved hoặc paid */}
        {(claim.status === ClaimStatus.APPROVED ||
          claim.status === ClaimStatus.PAID) && (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$5"
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm" justifyContent="center">
                <DollarSign size={16} color={colors.success} strokeWidth={2} />
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Xác nhận nhận chi trả
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              {/* Loading payout data */}
              {payoutLoading ? (
                <HStack
                  space="sm"
                  alignItems="center"
                  justifyContent="center"
                  py="$4"
                >
                  <Spinner size="small" color={colors.primary} />
                  <Text fontSize="$sm" color={colors.secondary_text}>
                    Đang tải thông tin chi trả...
                  </Text>
                </HStack>
              ) : !payout ? (
                /* Không tìm thấy payout */
                <Box
                  bg={colors.warningSoft || colors.background}
                  borderRadius="$lg"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.warning}
                >
                  <HStack
                    space="sm"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AlertCircle
                      size={20}
                      color={colors.warning}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color={colors.warning}
                    >
                      Chưa có thông tin chi trả
                    </Text>
                  </HStack>
                </Box>
              ) : payout.farmer_confirmed ? (
                /* Nếu đã xác nhận - hiển thị trạng thái đã xác nhận */
                <VStack space="md">
                  {/* Thông báo đã xác nhận */}
                  <Box
                    bg={colors.successSoft}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor={colors.success}
                  >
                    <HStack
                      space="sm"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CheckCircle2
                        size={20}
                        color={colors.success}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$md"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        Đã xác nhận nhận tiền thành công!
                      </Text>
                    </HStack>
                  </Box>

                  {/* Thông tin chi trả đã xác nhận */}
                  <VStack space="sm">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Số tiền đã nhận
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        {formatAmount(payout.payout_amount)}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              ) : payout.status === "processing" ? (
                /* Payout đang xử lý - chưa cho phép xác nhận */
                <VStack space="md">
                  {/* Thông báo đang xử lý */}
                  <Box
                    bg={
                      colors.infoSoft || colors.primarySoft || colors.background
                    }
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor={colors.info || colors.primary}
                  >
                    <HStack space="sm" alignItems="flex-start">
                      <Clock
                        size={20}
                        color={colors.info || colors.primary}
                        strokeWidth={2}
                        style={{ marginTop: 2 }}
                      />
                      <VStack flex={1} space="xs">
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.info || colors.primary}
                        >
                          Đang xử lý chi trả
                        </Text>
                        <Text
                          fontSize="$sm"
                          color={colors.primary_text}
                          lineHeight="$lg"
                        >
                          Đối tác bảo hiểm đang tiến hành chuyển tiền bồi
                          thường. Vui lòng chờ đến khi tiền được chuyển vào tài
                          khoản của bạn.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Thông tin chi trả */}
                  <VStack space="sm">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Số tiền chi trả
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        {formatAmount(payout.payout_amount)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Trạng thái
                      </Text>
                      <Box
                        bg={colors.warningSoft}
                        px="$2"
                        py="$1"
                        borderRadius="$full"
                      >
                        <Text
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.warning}
                        >
                          Đang xử lý
                        </Text>
                      </Box>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Thời điểm khởi tạo
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {Utils.formatDateTimeForMS(payout.initiated_at)}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              ) : payout.status === "completed" ? (
                /* Payout đã thanh toán - hiển thị form xác nhận */
                <VStack space="md">
                  {/* Thông báo đã chi trả */}
                  <Box
                    bg={colors.successSoft}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor={colors.success}
                  >
                    <HStack space="sm" alignItems="flex-start">
                      <CheckCircle2
                        size={20}
                        color={colors.success}
                        strokeWidth={2}
                        style={{ marginTop: 2 }}
                      />
                      <VStack flex={1} space="xs">
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.success}
                        >
                          Đã chi trả thành công
                        </Text>
                        <Text
                          fontSize="$sm"
                          color={colors.primary_text}
                          lineHeight="$lg"
                        >
                          Đối tác bảo hiểm đã hoàn tất chi trả. Vui lòng kiểm
                          tra tài khoản và xác nhận đã nhận tiền.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Thông tin chi trả */}
                  <VStack space="sm">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Số tiền chi trả
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        {formatAmount(payout.payout_amount)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Trạng thái
                      </Text>
                      <Box
                        bg={colors.successSoft}
                        px="$2"
                        py="$1"
                        borderRadius="$full"
                      >
                        <Text
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.success}
                        >
                          Đã chi trả
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>

                  {/* Cảnh báo quan trọng */}
                  <Box
                    bg={colors.warningSoft || colors.background}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor={colors.warning}
                  >
                    <HStack space="sm" alignItems="flex-start">
                      <AlertTriangle
                        size={20}
                        color={colors.warning}
                        strokeWidth={2}
                        style={{ marginTop: 2 }}
                      />
                      <VStack flex={1} space="xs">
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.warning}
                        >
                          Lưu ý quan trọng
                        </Text>
                        <Text
                          fontSize="$sm"
                          color={colors.primary_text}
                          lineHeight="$lg"
                        >
                          Chỉ bấm xác nhận khi bạn đã thực sự nhận được tiền bồi
                          thường trong tài khoản. Hành động này không thể hoàn
                          tác.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Textarea phản hồi */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      Phản hồi của bạn (không bắt buộc)
                    </Text>
                    <Textarea
                      size="md"
                      borderRadius="$lg"
                      borderColor={colors.frame_border}
                      bg={colors.background}
                    >
                      <TextareaInput
                        placeholder="Chia sẻ trải nghiệm của bạn với dịch vụ bảo hiểm..."
                        value={feedback}
                        onChangeText={setFeedback}
                        color={colors.primary_text}
                        placeholderTextColor={colors.muted_text}
                      />
                    </Textarea>
                  </VStack>

                  {/* Nút xác nhận */}
                  <Button
                    size="lg"
                    bg={colors.success}
                    borderRadius="$xl"
                    onPress={handleConfirmPayout}
                    disabled={confirmPayoutMutation.isPending}
                    opacity={confirmPayoutMutation.isPending ? 0.7 : 1}
                  >
                    {confirmPayoutMutation.isPending ? (
                      <ButtonSpinner color={colors.primary_white_text} />
                    ) : (
                      <HStack space="sm" alignItems="center">
                        <CheckCircle2
                          size={18}
                          color={colors.primary_white_text}
                          strokeWidth={2}
                        />
                        <ButtonText
                          color={colors.primary_white_text}
                          fontWeight="$bold"
                        >
                          Xác nhận đã nhận tiền chi trả
                        </ButtonText>
                      </HStack>
                    )}
                  </Button>
                </VStack>
              ) : (
                /* Payout status khác (failed, cancelled, etc.) */
                <Box
                  bg={colors.errorSoft || colors.background}
                  borderRadius="$lg"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.error}
                >
                  <HStack
                    space="sm"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <XCircle size={20} color={colors.error} strokeWidth={2} />
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color={colors.error}
                    >
                      {payout.status === "failed"
                        ? "Chi trả thất bại. Vui lòng liên hệ hỗ trợ."
                        : payout.status === "cancelled"
                          ? "Chi trả đã bị hủy."
                          : "Trạng thái chi trả không xác định."}
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        {/* Footer */}
        <Box
          bg={colors.background}
          borderRadius="$lg"
          p="$4"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="sm">
            <Text
              fontSize="$xs"
              color={colors.secondary_text}
              textAlign="center"
            >
              Yêu cầu chi trả được tạo bởi hệ thống Agrisa
            </Text>
            <Text
              fontSize="$xs"
              color={colors.secondary_text}
              textAlign="center"
              fontWeight="$semibold"
            >
              Mọi thắc mắc xin liên hệ bộ phận chăm sóc khách hàng
            </Text>
            <Text
              fontSize="$2xs"
              color={colors.muted_text}
              textAlign="center"
              mt="$2"
            >
              Cập nhật lần cuối:{" "}
              {Utils.formatStringVietnameseDateTime(claim.updated_at)}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { useDataSource } from "@/domains/farm-data-monitor/hooks/use-data-source";
import { getParameterLabel } from "@/domains/farm-data-monitor/utils/parameterUtils";
import { ClaimEvent, ClaimEvidenceCondition } from "../models/claim-event-data.models";
import { ClaimStatus } from "../enums/claim-status.enum";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  HStack,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AlertCircle,
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
  Zap,
} from "lucide-react-native";
import React from "react";
import { RefreshControl } from "react-native";

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

  // Fetch thông tin liên quan
  const { getDetailFarm } = useFarm();
  const { getDetailBasePolicy, getRegisteredPolicyDetail } = usePolicy();
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const { getDataSourceByID } = useDataSource();

  // Lấy thông tin farm
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(claim.farm_id);
  const farm = farmData?.success ? farmData.data : null;

  // Lấy thông tin registered policy
  const { data: registeredPolicyData, isLoading: registeredPolicyLoading } =
    getRegisteredPolicyDetail(claim.registered_policy_id);
  const registeredPolicy = registeredPolicyData?.success
    ? registeredPolicyData.data
    : null;

  // Lấy thông tin base policy
  const { data: basePolicyData, isLoading: basePolicyLoading } = getDetailBasePolicy(
    claim.base_policy_id
  );
  const basePolicy = basePolicyData?.success
    ? basePolicyData.data?.base_policy
    : null;
  const triggers = basePolicyData?.success ? basePolicyData.data?.triggers : [];

  // Tìm trigger condition liên quan
  const relatedTrigger = triggers?.find(
    (t: any) => t.id === claim.base_policy_trigger_id
  );

  // Lấy condition đầu tiên từ trigger để lấy data_source_id và unit
  const relatedCondition = relatedTrigger?.conditions?.[0];
  
  // Lấy thông tin data source để có unit
  const { data: dataSourceData } = getDataSourceByID(relatedCondition?.data_source_id || "");
  const dataSource = dataSourceData?.success === true ? dataSourceData.data : null;
  const dataSourceUnit = dataSource?.unit || "";

  // Helper để format unit - ẩn với các chỉ số index
  const formatUnit = (unit?: string, paramName?: string) => {
    const indexParams = ["ndmi", "ndwi", "evi", "ndvi", "savi", "lai", "gci", "msavi"];
    if (!unit || unit === "index") return "";
    if (paramName && indexParams.includes(paramName.toLowerCase())) return "";
    return ` ${unit}`;
  };

  // Lấy thông tin insurance partner
  const { data: partnerData, isLoading: partnerLoading } = getInsurancePartnerDetail(
    registeredPolicy?.insurance_provider_id || ""
  );

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
      case ClaimStatus.CANCELLED:
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

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + " ₫";
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
                <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_white_text}>
                  #{index + 1}
                </Text>
              </Box>
              <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                {getParameterLabel(condition.parameter)}
              </Text>
            </HStack>
            <Box bg={isWarning ? colors.warningSoft : colors.errorSoft} px="$2" py="$1" borderRadius="$full">
              <Text fontSize="$2xs" fontWeight="$semibold" color={conditionColor}>
                {isWarning ? "Cảnh báo sớm" : "Vượt ngưỡng"}
              </Text>
            </Box>
          </HStack>

          <HStack space="md">
            <VStack flex={1} space="xs">
              <Text fontSize="$2xs" color={colors.secondary_text}>Giá trị đo được</Text>
              <Text fontSize="$sm" fontWeight="$bold" color={conditionColor}>
                {condition.measured_value.toFixed(6)}{unitDisplay}
              </Text>
            </VStack>
            <VStack flex={1} space="xs" alignItems="flex-end">
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Ngưỡng kích hoạt ({Utils.getOperatorLabel(condition.operator)})
              </Text>
              <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                {condition.threshold_value}{unitDisplay}
              </Text>
            </VStack>
          </HStack>

          <HStack space="md">
            <VStack flex={1} space="xs">
              <Text fontSize="$2xs" color={colors.secondary_text}>Giá trị cơ sở</Text>
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                {condition.baseline_value.toFixed(6)}{unitDisplay}
              </Text>
            </VStack>
            <VStack flex={1} space="xs" alignItems="flex-end">
              <Text fontSize="$2xs" color={colors.secondary_text}>Ngưỡng cảnh báo sớm</Text>
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.warning}>
                {condition.early_warning_threshold}{unitDisplay}
              </Text>
            </VStack>
          </HStack>

          <HStack space="xs" alignItems="center">
            <Calendar size={12} color={colors.secondary_text} strokeWidth={2} />
            <Text fontSize="$2xs" color={colors.secondary_text}>
              Thời điểm đo: {Utils.formatDateTimeForMS(condition.timestamp)}
            </Text>
          </HStack>
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
              <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text} textAlign="center">
                YÊU CẦU BỒI THƯỜNG
              </Text>
            </VStack>
          </Box>

          <HStack space="sm">
            <Box flex={1} bg={colors.card_surface} borderRadius="$xl" p="$3" borderWidth={1} borderColor={colors.frame_border}>
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <FileText size={12} color={colors.primary} strokeWidth={2} />
                  <Text fontSize="$xs" color={colors.secondary_text}>Mã yêu cầu</Text>
                </HStack>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                  {claim.claim_number}
                </Text>
              </VStack>
            </Box>

            <Box flex={1} bg={colors.card_surface} borderRadius="$xl" p="$3" borderWidth={1} borderColor={statusDisplay.color}>
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <StatusIcon size={12} color={statusDisplay.color} strokeWidth={2} />
                  <Text fontSize="$xs" color={colors.secondary_text}>Trạng thái</Text>
                </HStack>
                <Text fontSize="$sm" fontWeight="$bold" color={statusDisplay.color}>
                  {statusDisplay.label}
                </Text>
              </VStack>
            </Box>
          </HStack>
        </VStack>

        {/* CÁC BÊN LIÊN QUAN */}
        <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Scale size={16} color={colors.primary} strokeWidth={2} />
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                Các bên liên quan
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <HStack space="md">
              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <Building2 size={14} color={colors.primary} strokeWidth={2} />
                  <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_text}>NHÀ BẢO HIỂM</Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    {partnerLoading ? (
                      <Spinner size="small" color={colors.primary} />
                    ) : (
                      <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text} textAlign="center">
                        {partnerData?.success && partnerData.data?.partner_display_name ? partnerData.data.partner_display_name : "Không có"}
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <User size={14} color={colors.success} strokeWidth={2} />
                  <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_text}>NÔNG DÂN</Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text} textAlign="center">
                      {registeredPolicy?.farmer_id || "Không có"}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* HỢP ĐỒNG BẢO HIỂM */}
        {registeredPolicyLoading ? (
          <Box bg={colors.card_surface} borderRadius="$2xl" p="$5" borderWidth={1} borderColor={colors.frame_border}>
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Spinner size="small" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>Đang tải thông tin hợp đồng...</Text>
            </HStack>
          </Box>
        ) : registeredPolicy ? (
          <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
            <VStack space="md">
              <HStack alignItems="center" space="sm" justifyContent="center">
                <Shield size={16} color={colors.primary} strokeWidth={2} />
                <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>Thông tin hợp đồng</Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <VStack space="sm">
                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Mã hợp đồng</Text>
                    <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                      {registeredPolicy.policy_number}
                    </Text>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Giá trị bảo hiểm</Text>
                    <Text fontSize="$sm" fontWeight="$bold" color={colors.success}>
                      {formatAmount(registeredPolicy.coverage_amount)}
                    </Text>
                  </VStack>
                </HStack>

                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Hiệu lực từ</Text>
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                      {Utils.formatDateForMS(registeredPolicy.coverage_start_date)}
                    </Text>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Hiệu lực đến</Text>
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                      {Utils.formatDateForMS(registeredPolicy.coverage_end_date)}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        ) : null}

        {/* CHƯƠNG TRÌNH BẢO HIỂM */}
        {basePolicyLoading ? (
          <Box bg={colors.card_surface} borderRadius="$2xl" p="$5" borderWidth={1} borderColor={colors.frame_border}>
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Spinner size="small" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>Đang tải thông tin chương trình bảo hiểm...</Text>
            </HStack>
          </Box>
        ) : basePolicy ? (
          <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
            <VStack space="md">
              <HStack alignItems="center" space="sm" justifyContent="center">
                <FileText size={16} color={colors.primary} strokeWidth={2} />
                <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>Gói bảo hiểm</Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <VStack space="sm">
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Tên gói bảo hiểm</Text>
                  <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
                    {basePolicy.product_name || "Không có"}
                  </Text>
                </VStack>

                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Mô tả</Text>
                  <Text fontSize="$sm" color={colors.primary_text} lineHeight="$lg">
                    {basePolicy.product_description || "Không có"}
                  </Text>
                </VStack>

                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Loại cây trồng</Text>
                    <HStack space="xs" alignItems="center">
                      <Sprout size={14} color={colors.success} strokeWidth={2} />
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                        {Utils.getCropLabel(basePolicy.crop_type)}
                      </Text>
                    </HStack>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Thời gian bảo hiểm</Text>
                    <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                      {basePolicy.coverage_duration_days} ngày
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        ) : null}

        {/* NÔNG TRẠI */}
        {farmLoading ? (
          <Box bg={colors.card_surface} borderRadius="$2xl" p="$5" borderWidth={1} borderColor={colors.frame_border}>
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Spinner size="small" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>Đang tải thông tin nông trại...</Text>
            </HStack>
          </Box>
        ) : farm ? (
          <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} overflow="hidden">
            <VStack space="md">
              <Box p="$5" pb="$3">
                <HStack alignItems="center" space="sm" justifyContent="center">
                  <MapPin size={16} color={colors.primary} strokeWidth={2} />
                  <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>Trang trại</Text>
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
                      <Text fontSize="$xs" color={colors.secondary_text}>Tên trang trại</Text>
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>{farm.farm_name || "Không có"}</Text>
                    </VStack>
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>Mã trang trại</Text>
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>{farm.farm_code || "Không có"}</Text>
                    </VStack>
                  </HStack>

                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>Loại cây trồng</Text>
                      <HStack space="xs" alignItems="center">
                        <Sprout size={14} color={colors.success} strokeWidth={2} />
                        <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                          {Utils.getCropLabel(farm.crop_type)}
                        </Text>
                      </HStack>
                    </VStack>
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>Diện tích</Text>
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                        {farm.area_sqm.toFixed(2)} ha
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Địa chỉ</Text>
                    <Text fontSize="$sm" color={colors.primary_text} lineHeight="$md">{farm.address || "Không có"}</Text>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        ) : null}

        {/* SỐ TIỀN BỒI THƯỜNG */}
        <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <DollarSign size={16} color={colors.primary} strokeWidth={2} />
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>Chi tiết bồi thường</Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <Box bg={statusDisplay.bgColor} borderRadius="$xl" p="$4" borderWidth={1} borderColor={statusDisplay.color}>
              <VStack alignItems="center" space="xs">
                <Text fontSize="$xs" color={colors.secondary_text}>Số tiền bồi thường</Text>
                <Text fontSize="$3xl" fontWeight="$bold" color={statusDisplay.color}>
                  {formatAmount(claim.claim_amount)}
                </Text>
              </VStack>
            </Box>

            <VStack space="sm">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>Mức bồi thường cố định</Text>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                  {formatAmount(claim.calculated_fix_payout)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>Tỷ lệ bồi thường theo ngưỡng</Text>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                  {claim.calculated_threshold_payout.toFixed(2)}{formatUnit(dataSourceUnit, dataSource?.parameter_name)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.secondary_text}>Mức vượt ngưỡng</Text>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.error}>
                  {claim.over_threshold_value.toFixed(4)}{formatUnit(dataSourceUnit, dataSource?.parameter_name)}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* THỜI GIAN */}
        <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Calendar size={16} color={colors.primary} strokeWidth={2} />
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>Thông tin thời gian</Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="sm">
              <HStack space="md">
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Thời điểm phát hiện</Text>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                    {Utils.formatDateTimeForMS(claim.trigger_timestamp)}
                  </Text>
                </VStack>
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Phương thức phát hiện</Text>
                  <HStack space="xs" alignItems="center">
                    {claim.auto_generated ? (
                      <>
                        <Zap size={14} color={colors.warning} strokeWidth={2} />
                        <Text fontSize="$sm" fontWeight="$bold" color={colors.warning}>Tự động</Text>
                      </>
                    ) : (
                      <>
                        <Shield size={14} color={colors.primary} strokeWidth={2} />
                        <Text fontSize="$sm" fontWeight="$bold" color={colors.primary}>Thủ công</Text>
                      </>
                    )}
                  </HStack>
                </VStack>
              </HStack>

              <HStack space="md">
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Ngày tạo yêu cầu</Text>
                  <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                    {Utils.formatStringVietnameseDateTime(claim.created_at)}
                  </Text>
                </VStack>
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Cập nhật lần cuối</Text>
                  <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                    {Utils.formatStringVietnameseDateTime(claim.updated_at)}
                  </Text>
                </VStack>
              </HStack>

              {claim.status === ClaimStatus.PENDING_PARTNER_REVIEW && claim.auto_approval_deadline && (
                <Box bg={colors.warningSoft} borderRadius="$lg" p="$3" borderWidth={1} borderColor={colors.warning}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="sm" alignItems="center">
                      <Clock size={14} color={colors.warning} strokeWidth={2} />
                      <Text fontSize="$sm" color={colors.warning} fontWeight="$medium">Hạn tự động duyệt</Text>
                    </HStack>
                    <Text fontSize="$sm" fontWeight="$bold" color={colors.warning}>
                      {Utils.formatDateTimeForMS(claim.auto_approval_deadline)}
                    </Text>
                  </HStack>
                </Box>
              )}

              {claim.auto_approved && (
                <Box bg={colors.successSoft} borderRadius="$lg" p="$3" borderWidth={1} borderColor={colors.success}>
                  <HStack space="sm" alignItems="center">
                    <CheckCircle2 size={14} color={colors.success} strokeWidth={2} />
                    <Text fontSize="$sm" color={colors.success} fontWeight="$medium">
                      Yêu cầu đã được hệ thống tự động phê duyệt
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </VStack>
        </Box>

        {/* KẾT QUẢ XÉT DUYỆT TỪ ĐỐI TÁC */}
        <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Shield size={16} color={colors.primary} strokeWidth={2} />
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>Kết quả xét duyệt</Text>
            </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <VStack space="sm">
                <Box 
                  bg={claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID 
                    ? colors.successSoft 
                    : claim.status === ClaimStatus.REJECTED 
                      ? colors.errorSoft 
                      : colors.background
                  } 
                  borderRadius="$lg" 
                  p="$3"
                  borderWidth={1}
                  borderColor={claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID 
                    ? colors.success 
                    : claim.status === ClaimStatus.REJECTED 
                      ? colors.error 
                      : colors.frame_border
                  }
                >
                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>Quyết định</Text>
                    <Text 
                      fontSize="$md" 
                      fontWeight="$bold" 
                      color={claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID 
                        ? colors.success 
                        : claim.status === ClaimStatus.REJECTED 
                          ? colors.error 
                          : colors.primary_text
                      }
                      textTransform="capitalize"
                    >
                      {claim.partner_decision || "Không có"}
                    </Text>
                  </VStack>
                </Box>

                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>Ghi chú từ đối tác bảo hiểm</Text>
                  <Box bg={colors.background} borderRadius="$lg" p="$3" borderWidth={1} borderColor={colors.frame_border}>
                    <Text fontSize="$sm" color={colors.primary_text} lineHeight="$lg">
                      {claim.partner_notes || "Không có"}
                    </Text>
                  </Box>
                </VStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$sm" color={colors.secondary_text}>Người xét duyệt</Text>
                  <HStack space="xs" alignItems="center">
                    <User size={14} color={colors.primary} strokeWidth={2} />
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                      {claim.reviewed_by || "Không có"}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>

        {/* BẰNG CHỨNG THIỆT HẠI */}
        <Box bg={colors.card_surface} borderRadius="$2xl" borderWidth={1} borderColor={colors.frame_border} p="$5">
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Target size={16} color={colors.primary} strokeWidth={2} />
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                Bằng chứng thiệt hại ({claim.evidence_summary?.conditions_count || 0})
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Điều kiện kích hoạt từ gói bảo hiểm */}
            {relatedTrigger && (
              <Box bg={colors.background} borderRadius="$lg" p="$3" borderWidth={1} borderColor={colors.frame_border} mb="$2">
                <VStack space="sm">
                  <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_text}>
                    Điều kiện kích hoạt từ gói bảo hiểm
                  </Text>
                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$2xs" color={colors.secondary_text}>Giai đoạn sinh trưởng</Text>
                      <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                        {relatedTrigger.growth_stage}
                      </Text>
                    </VStack>
                    <VStack flex={1} space="xs">
                      <Text fontSize="$2xs" color={colors.secondary_text}>Tần suất giám sát</Text>
                      <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                        {relatedTrigger.monitor_interval} {Utils.getFrequencyLabel(relatedTrigger.monitor_frequency_unit)}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack space="xs" alignItems="center">
                    <Text fontSize="$2xs" color={colors.secondary_text}>Điều kiện kết hợp:</Text>
                    <Text fontSize="$sm" fontWeight="$bold" color={colors.primary}>
                      {Utils.getOperatorLabel(relatedTrigger.logical_operator)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            <Box
              bg={claim.evidence_summary?.generation_method === "automatic" ? colors.warningSoft : colors.primarySoft || colors.background}
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
                  color={claim.evidence_summary?.generation_method === "automatic" ? colors.warning : colors.primary}
                  fontWeight="$medium"
                >
                  {claim.evidence_summary?.generation_method === "automatic"
                    ? "Phát hiện tự động từ hệ thống giám sát vệ tinh"
                    : "Ghi nhận thủ công bởi người dùng"}
                </Text>
              </HStack>
            </Box>

            {claim.evidence_summary?.conditions && claim.evidence_summary.conditions.length > 0 ? (
              <VStack>
                {claim.evidence_summary.conditions.map((condition, index) => (
                  <ConditionCard key={condition.condition_id} condition={condition} index={index} />
                ))}
              </VStack>
            ) : (
              <Box bg={colors.background} borderRadius="$lg" p="$4" alignItems="center">
                <AlertCircle size={24} color={colors.muted_text} strokeWidth={1.5} />
                <Text fontSize="$sm" color={colors.muted_text} textAlign="center" mt="$2">
                  Không có thông tin bằng chứng thiệt hại
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Footer */}
        <Box bg={colors.background} borderRadius="$lg" p="$4" borderWidth={1} borderColor={colors.frame_border}>
          <VStack space="sm">
            <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
              Yêu cầu bồi thường được tạo bởi hệ thống Agrisa
            </Text>
            <Text fontSize="$xs" color={colors.secondary_text} textAlign="center" fontWeight="$semibold">
              Mọi thắc mắc xin liên hệ bộ phận chăm sóc khách hàng
            </Text>
            <Text fontSize="$2xs" color={colors.muted_text} textAlign="center" mt="$2">
              Cập nhật lần cuối: {Utils.formatStringVietnameseDateTime(claim.updated_at)}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useDataMonitor } from "@/domains/farm-data-monitor/hooks/use-data-monitor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  Activity,
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  MapPin,
  Scale,
  Shield,
  Sprout,
  User,
  View,
} from "lucide-react-native";
import React, { useState } from "react";
import { Linking, RefreshControl } from "react-native";
import { UnderwritingStatus } from "../enums/policy-status.enum";
import { RegisteredPolicy } from "../models/policy.models";

interface DetailRegisteredPolicyProps {
  policy: RegisteredPolicy;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Component hiển thị chi tiết policy đã đăng ký
 * Thiết kế như một hợp đồng bảo hiểm chuyên nghiệp
 * Bao gồm thông tin policy và farm đầy đủ với map
 */
export const DetailRegisteredPolicy: React.FC<DetailRegisteredPolicyProps> = ({
  policy,
  isRefreshing = false,
  onRefresh,
}) => {
  const { colors } = useAgrisaColors();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataSharing, setAcceptedDataSharing] = useState(false);

  // Fetch thông tin farm dựa trên farm_id
  const { getDetailFarm } = useFarm();
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const { getDetailBasePolicy } = usePolicy();
  const { getPolicyDataMonitor } = useDataMonitor();

  // Lấy thông tin insurance partner
  const { data: partnerData, isLoading: partnerLoading } =
    getInsurancePartnerDetail(policy.insurance_provider_id);
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(
    policy.farm_id
  );

  // Lấy thông tin base policy
  const { data: basePolicyData, isLoading: basePolicyLoading } =
    getDetailBasePolicy(policy.base_policy_id);
  const basePolicy = basePolicyData?.data?.base_policy;

  // Lấy dữ liệu monitoring nếu policy đã active
  const shouldFetchMonitoring = policy.status === "active";
  const { data: monitoringData, isLoading: monitoringLoading } =
    getPolicyDataMonitor(shouldFetchMonitoring ? policy.farm_id : "");

  const farm = farmData?.success ? farmData.data : null;

  /**
   * Xác định trạng thái hiển thị theo ma trận hợp lệ
   * Ma trận hợp lệ:
   * - draft + pending: Bản nháp
   * - pending_review + pending: Chờ thẩm định
   * - pending_payment + approved: Chờ thanh toán (hiển thị payment section)
   * - active + approved: Đang hoạt động
   * - rejected + rejected: Bị từ chối
   * - expired + approved: Hết hạn
   * - cancelled + approved: Đã hủy
   */
  const getPolicyStatusDisplay = () => {
    // Trường hợp đặc biệt: pending_payment (chỜ thanh toán sau khi duyệt)
    if (
      policy.status === "pending_payment" &&
      policy.underwriting_status === UnderwritingStatus.APPROVED
    ) {
      return {
        label: "Chờ thanh toán",
        color: colors.warning,
        icon: AlertCircle,
        bgColor: colors.warningSoft,
      };
    }

    // Xử lý theo underwriting_status
    switch (policy.underwriting_status) {
      case UnderwritingStatus.APPROVED:
        // Nếu approved, xem tiếp status đệ xác định trạng thái cuối
        switch (policy.status) {
          case "active":
            return {
              label: "Đang có hiệu lực",
              color: colors.success,
              icon: CheckCircle2,
              bgColor: colors.successSoft,
            };
          case "expired":
            return {
              label: "Đã hết hạn",
              color: colors.muted_text,
              icon: AlertCircle,
              bgColor: colors.background,
            };
          case "cancelled":
            return {
              label: "Đã hủy bỏ",
              color: colors.error,
              icon: AlertCircle,
              bgColor: colors.errorSoft,
            };
          default:
            return {
              label: "Đã được phê duyệt",
              color: colors.success,
              icon: CheckCircle2,
              bgColor: colors.successSoft,
            };
        }

      case UnderwritingStatus.REJECTED:
        return {
          label: "Đã bị từ chối",
          color: colors.error,
          icon: AlertCircle,
          bgColor: colors.errorSoft,
        };

      case UnderwritingStatus.PENDING:
        // Nếu pending, xem status để phân biệt draft và pending_review
        if (policy.status === "draft") {
          return {
            label: "Bản nháp",
            color: colors.muted_text,
            icon: FileCheck,
            bgColor: colors.background,
          };
        }
        return {
          label: "Chờ phê duyệt",
          color: colors.pending,
          icon: FileCheck,
          bgColor: colors.primary_white_text,
        };

      default:
        return {
          label: "Không xác định",
          color: colors.muted_text,
          icon: AlertCircle,
          bgColor: colors.background,
        };
    }
  };

  const statusDisplay = getPolicyStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  // Kiểm tra xem có cần hiển thị payment section không
  // Chỉ hiển thị khi status = "pending_payment" VÀ underwriting_status = "approved"
  const showPaymentSection =
    policy.status === "pending_payment" &&
    policy.underwriting_status === UnderwritingStatus.APPROVED;

  // Hàm mở PDF trên web
  const openPDF = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
    }
  };

  return (
    <ScrollView
      flex={1}
      bg={colors.background}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.success]}
          tintColor={colors.success}
        />
      }
    >
      <VStack space="md" p="$4" pb="$20">
        {/* ========== HEADER: HỢP ĐỒNG BẢO HIỂM ========== */}
        <VStack space="sm">
          {/* Title Card */}
          <Box p="$5">
            <VStack space="sm" alignItems="center">
              <Text
                fontSize="$xl"
                fontWeight="$bold"
                color={colors.primary_text}
                textAlign="center"
              >
                HỢP ĐỒNG BẢO HIỂM NÔNG NGHIỆP
              </Text>
            </VStack>
          </Box>

          {/* Số hợp đồng và Trạng thái */}
          <HStack space="sm">
            {/* Số hợp đồng */}
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
                    Số hợp đồng
                  </Text>
                </HStack>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {policy.policy_number}
                </Text>
              </VStack>
            </Box>

            {/* Trạng thái */}
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

        {/* ========== BÊN THAM GIA HỢP ĐỒNG ========== */}
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
                Các bên tham gia
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <HStack space="md">
              {/* Bên bảo hiểm */}
              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <Building2 size={14} color={colors.primary} strokeWidth={2} />
                  <Text
                    fontSize="$xs"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    BÊN BẢO HIỂM
                  </Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Nhà bảo hiểm
                    </Text>
                    {partnerLoading ? (
                      <Spinner size="small" color={colors.primary} />
                    ) : (
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                        textAlign="center"
                      >
                        {partnerData?.data?.partner_display_name ||
                          policy.insurance_provider_id}
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>

              {/* Divider giữa */}
              <Box width={1} bg={colors.frame_border} />

              {/* Bên được bảo hiểm */}
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
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Mã nông dân
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      {policy.farmer_id}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* ========== THÔNG TIN NÔNG TRẠI ========== */}
        {farmLoading && (
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
        )}

        {!farmLoading && farm && (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
          >
            <VStack space="md">
              {/* Header */}
              <Box p="$5" pb="$3">
                <HStack alignItems="center" space="sm" justifyContent="center">
                  <MapPin size={16} color={colors.primary} strokeWidth={2} />
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    Thông tin nông trại
                  </Text>
                </HStack>
              </Box>

              {/* Bản đồ */}
              <Box px="$5">
                <VStack space="sm">
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                    textAlign="center"
                  >
                    Bản đồ nông trại
                  </Text>
                  <FarmBoundaryMap
                    boundary={farm.boundary}
                    isVn2000={false}
                    province={farm.province}
                    height={280}
                    showControls={true}
                  />
                </VStack>
              </Box>

              <Box height={1} bg={colors.frame_border} width="100%" mx="$5" />

              {/* Chi tiết nông trại */}
              <Box px="$5" pb="$5">
                <VStack space="sm">
                  {/* Tên và mã */}
                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        fontWeight="$medium"
                      >
                        Tên nông trại
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farm.farm_name}
                      </Text>
                    </VStack>

                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        fontWeight="$medium"
                      >
                        Mã nông trại
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farm.farm_code}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Cây trồng và diện tích */}
                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        fontWeight="$medium"
                      >
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
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        fontWeight="$medium"
                      >
                        Diện tích
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farm.area_sqm.toFixed(2)} ha
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Ngày gieo trồng */}
                  <VStack space="xs">
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Ngày gieo trồng
                    </Text>
                    <HStack space="xs" alignItems="center">
                      <Calendar
                        size={14}
                        color={colors.primary}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {Utils.formatDateForMS(policy.planting_date)}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Địa chỉ */}
                  <VStack space="xs">
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Địa chỉ
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={colors.primary_text}
                      lineHeight="$md"
                    >
                      {farm.address}
                    </Text>
                  </VStack>

                  {/* Giấy chứng nhận */}
                  <VStack space="xs">
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Giấy chứng nhận quyền sử dụng đất
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {farm.land_certificate_number || "Chưa cập nhật"}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* ========== SỐ TIỀN BẢO HIỂM ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="sm" alignItems="center">
            <HStack space="xs" alignItems="center">
              <Shield size={14} color={colors.primary} strokeWidth={2} />
              <Text fontSize="$sm" color={colors.secondary_text}>
                Số tiền bảo hiểm tối đa
              </Text>
            </HStack>
            <Text fontSize="$3xl" fontWeight="$bold" color={colors.success}>
              {Utils.formatCurrency(policy.coverage_amount)}
            </Text>
            <Text
              fontSize="$xs"
              color={colors.secondary_text}
              textAlign="center"
              px="$2"
            >
              Số tiền tối đa được chi trả khi xảy ra thiệt hại
            </Text>
          </VStack>
        </Box>

        {/* ========== THỜI HẠN BẢO HIỂM ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="sm">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Calendar size={14} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Thời hạn bảo hiểm
              </Text>
            </HStack>

            <HStack space="md">
              <VStack flex={1} space="xs" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Ngày đăng ký bảo hiểm
                </Text>
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

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} space="xs" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Ngày bảo hiểm hết hạn
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {Utils.formatDateForMS(policy.coverage_end_date)}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* ========== CHI PHÍ BẢO HIỂM ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Banknote size={14} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Chi phí bảo hiểm
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="sm">
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

              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize="$sm"
                  color={colors.primary_text}
                  fontWeight="$medium"
                >
                  Hệ số diện tích
                </Text>
                <Text
                  fontSize="$md"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  x {policy.area_multiplier.toFixed(2)}
                </Text>
              </HStack>
            </VStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Tổng chi phí */}
            <Box bg={colors.primary} borderRadius="$lg" p="$3">
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  Tổng chi phí
                </Text>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  {Utils.formatCurrency(policy.total_farmer_premium)}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* ========== THÔNG TIN CHƯƠNG TRÌNH BẢO HIỂM ========== */}
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
                <Shield size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Thông tin chương trình bảo hiểm
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <VStack space="sm">
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Tên chương trình
                  </Text>
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {basePolicy.product_name}
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
                    {basePolicy.product_description}
                  </Text>
                </VStack>

                <HStack space="md">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Thời hạn bảo hiểm
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {basePolicy.coverage_duration_days} ngày
                    </Text>
                  </VStack>

                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Tự động gia hạn
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={
                        basePolicy.auto_renewal
                          ? colors.success
                          : colors.muted_text
                      }
                    >
                      {basePolicy.auto_renewal ? "Có" : "Không"}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        ) : null}

        {/* ========== GIÁM SÁT DỮ LIỆU VÀ PHÂN TÍCH RỦI RO ========== */}
        {shouldFetchMonitoring && (
          <>
            {monitoringLoading ? (
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
                    Đang tải dữ liệu giám sát...
                  </Text>
                </HStack>
              </Box>
            ) : monitoringData?.data ? (
              <Box
                bg={colors.card_surface}
                borderRadius="$2xl"
                borderWidth={1}
                borderColor={colors.frame_border}
                p="$5"
              >
                <VStack space="md">
                  <HStack
                    alignItems="center"
                    space="sm"
                    justifyContent="center"
                  >
                    <Activity size={16} color={colors.info} strokeWidth={2} />
                    <Text
                      fontSize="$lg"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Giám sát và Phân tích
                    </Text>
                  </HStack>

                  <Box height={1} bg={colors.frame_border} width="100%" />

                  <VStack space="xs">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color={colors.secondary_text}>
                        Tổng số điểm dữ liệu
                      </Text>
                      <Text
                        fontSize="$md"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {monitoringData.data.count}
                      </Text>
                    </HStack>

                    <Text fontSize="$xs" color={colors.muted_text} mt="$2">
                      Hệ thống đang theo dõi tình trạng nông trại của bạn qua dữ
                      liệu vệ tinh và các cảm biến. Dữ liệu được cập nhật liên
                      tục để phát hiện sớm các rủi ro.
                    </Text>

                    {monitoringData.data.monitoring_data?.length > 0 && (
                      <VStack space="xs" mt="$2">
                        <Text
                          fontSize="$xs"
                          fontWeight="$bold"
                          color={colors.primary_text}
                        >
                          Điểm dữ liệu mới nhất:
                        </Text>
                        {monitoringData.data.monitoring_data
                          .slice(0, 3)
                          .map((item: any, index: number) => (
                            <Box
                              key={item.id || index}
                              bg={colors.background}
                              borderRadius="$lg"
                              p="$3"
                              borderWidth={1}
                              borderColor={
                                item.data_quality === "good"
                                  ? colors.success
                                  : item.data_quality === "poor"
                                    ? colors.error
                                    : colors.warning
                              }
                            >
                              <HStack
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <VStack flex={1}>
                                  <Text
                                    fontSize="$xs"
                                    color={colors.muted_text}
                                  >
                                    {item.parameter_name}
                                  </Text>
                                  <Text
                                    fontSize="$sm"
                                    fontWeight="$bold"
                                    color={colors.primary_text}
                                  >
                                    {item.measured_value} {item.unit}
                                  </Text>
                                  <Text
                                    fontSize="$2xs"
                                    color={colors.muted_text}
                                  >
                                    {Utils.formatVietnameseDate(
                                      new Date(
                                        item.measurement_timestamp * 1000
                                      )
                                    )}
                                  </Text>
                                </VStack>
                                <VStack alignItems="flex-end">
                                  <Text
                                    fontSize="$2xs"
                                    color={colors.muted_text}
                                  >
                                    Chất lượng
                                  </Text>
                                  <Text
                                    fontSize="$xs"
                                    fontWeight="$bold"
                                    color={
                                      item.data_quality === "good"
                                        ? colors.success
                                        : item.data_quality === "poor"
                                          ? colors.error
                                          : colors.warning
                                    }
                                  >
                                    {item.data_quality === "good"
                                      ? "Tốt"
                                      : item.data_quality === "poor"
                                        ? "Kém"
                                        : "Trung bình"}
                                  </Text>
                                  <Text
                                    fontSize="$2xs"
                                    color={colors.muted_text}
                                  >
                                    Độ tin cậy:{" "}
                                    {(item.confidence_score * 100).toFixed(0)}%
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                      </VStack>
                    )}
                  </VStack>
                </VStack>
              </Box>
            ) : null}
          </>
        )}

        {/* ========== LINK TÀI LIỆU HỢP ĐỒNG ========== */}
        {policy.signed_policy_document_url && (
          <Pressable
            onPress={() => openPDF(policy.signed_policy_document_url!)}
          >
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.primary}
            >
              <HStack space="sm" alignItems="center" justifyContent="center">
                <View size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary}
                >
                  Xem hợp đồng đã ký
                </Text>
              </HStack>
            </Box>
          </Pressable>
        )}
        {/* ========== ĐIỀU KHOẢN & THANH TOÁN (Chỉ hiển thị khi approved) ========== */}
        {showPaymentSection && (
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <VStack space="sm">
              {/* Checkbox điều khoản - gộp chung 1 dòng */}
              <Checkbox
                value="terms"
                isChecked={acceptedTerms && acceptedDataSharing}
                onChange={() => {
                  const newValue = !(acceptedTerms && acceptedDataSharing);
                  setAcceptedTerms(newValue);
                  setAcceptedDataSharing(newValue);
                }}
                size="sm"
              >
                <CheckboxIndicator mr="$2" borderColor={colors.frame_border}>
                  <CheckboxIcon as={Check} color={colors.primary_white_text} />
                </CheckboxIndicator>
                <CheckboxLabel flexShrink={1}>
                  <HStack flexWrap="wrap" alignItems="center">
                    <Text fontSize="$xs" color={colors.primary_text}>
                      Tôi đồng ý với{" "}
                    </Text>
                    <Pressable
                      onPress={() => {
                        // TODO: Navigate to policy/terms page
                        console.log("Opening terms and policy page");
                      }}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Text
                        fontSize="$xs"
                        color={colors.primary}
                        fontWeight="$semibold"
                        textDecorationLine="underline"
                      >
                        điều khoản và chính sách bảo hiểm
                      </Text>
                    </Pressable>
                    <Text fontSize="$xs" color={colors.primary_text}>
                      {" "}
                      và chia sẻ dữ liệu với đối tác
                    </Text>
                  </HStack>
                </CheckboxLabel>
              </Checkbox>

              {/* Nút thanh toán */}
              <Pressable
                onPress={() => {
                  if (acceptedTerms && acceptedDataSharing) {
                    console.log("Proceeding to payment...");
                    // TODO: Navigate to payment screen
                  }
                }}
                opacity={acceptedTerms && acceptedDataSharing ? 1 : 0.5}
                disabled={!acceptedTerms || !acceptedDataSharing}
              >
                <Box
                  bg={
                    acceptedTerms && acceptedDataSharing
                      ? colors.success
                      : colors.muted_text
                  }
                  borderRadius="$lg"
                  p="$3"
                >
                  <HStack
                    space="xs"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CreditCard
                      size={16}
                      color={colors.primary_white_text}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_white_text}
                    >
                      Thanh toán
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            </VStack>
          </Box>
        )}

        {/* Footer note */}
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
              Hợp đồng này được tạo bởi hệ thống Agrisa
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
              {Utils.formatVietnameseDate(new Date(policy.updated_at))}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

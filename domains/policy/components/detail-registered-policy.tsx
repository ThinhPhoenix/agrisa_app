import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { RiskAnalysisDisplay } from "@/domains/farm-data-monitor/components/RiskAnalysisDisplay";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import useCreatePayment from "@/domains/payment/hooks/use-create-payment";
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
  const { getDetailBasePolicy, getUnderwritingPolicy } = usePolicy();
  const { mutate: createPayment, isPending: isCreatingPayment } =
    useCreatePayment();

  // Lấy thông tin insurance partner
  const { data: partnerData, isLoading: partnerLoading } =
    getInsurancePartnerDetail(policy.insurance_provider_id);
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(
    policy.farm_id
  );

  // Lấy thông tin base policy
  const { data: basePolicyData, isLoading: basePolicyLoading } =
    getDetailBasePolicy(policy.base_policy_id);
  const basePolicy = basePolicyData?.success
    ? basePolicyData.data?.base_policy
    : null;

  // Lấy thông tin underwriting (thẩm định)
  const { data: underwritingData, isLoading: underwritingLoading } =
    getUnderwritingPolicy(policy.id);
  const underwriting =
    underwritingData?.success && underwritingData.data?.length > 0
      ? underwritingData.data[0]
      : null;

  const farm = farmData?.success ? farmData.data : null;

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

  // Hàm xử lý thanh toán
  const handlePayment = () => {
    if (!acceptedTerms || !acceptedDataSharing) {
      console.warn("⚠️ User chưa đồng ý điều khoản");
      return;
    }

    if (!basePolicy) {
      console.error("❌ Không có thông tin base policy");
      return;
    }

    console.log("💳 Tạo payment request...");

    const paymentRequest = {
      amount: policy.total_farmer_premium,
      description: Utils.generatePaymentDescription(policy.policy_number),
      return_url: "https://agrisa-api.phrimp.io.vn/success",
      cancel_url: "https://agrisa-api.phrimp.io.vn/cancel",
      type: "policy_registration_payment",
      items: [
        {
          item_id: policy.id,
          name: basePolicy.product_name,
          price: policy.total_farmer_premium,
          quantity: 1,
        },
      ],
    };

    console.log("📦 Payment request:", paymentRequest);

    createPayment(paymentRequest, {
      onSuccess: (data) => {
        console.log("✅ Payment created successfully:", data);
        console.log("🔄 Navigating to PayOS WebView...");
        // Hook useCreatePayment sẽ tự động navigate đến /payos
      },
      onError: (error) => {
        console.error("❌ Payment creation failed:", error);
        // TODO: Show error toast/modal
      },
    });
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
                        {partnerData?.success
                          ? partnerData.data?.partner_display_name
                          : policy.insurance_provider_id}
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

        {/* Ngày đăng ký và ký kết hợp đồng */}
        <Box
          bg={colors.card_surface}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="sm" alignItems="center">
            <HStack space="xs" alignItems="center">
              <Calendar size={14} color={colors.success} strokeWidth={2} />
              <Text fontSize="$sm" color={colors.secondary_text}>
                Ngày đăng ký và ký kết hợp đồng
              </Text>
            </HStack>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              {Utils.formatDateForMS(
                Math.floor(new Date(policy.created_at).getTime() / 1000)
              )}
            </Text>
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

        {/* ========== SỐ TIỀN BẢO HIỂM & THỜI HẠN ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            {/* Số tiền bảo hiểm tối đa */}
            <VStack space="sm" alignItems="center">
              <HStack space="xs" alignItems="center">
                <Shield size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
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

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Thời hạn bảo hiểm */}
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
                    Ngày bắt đầu
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatDateForMS(
                      basePolicy?.insurance_valid_from_day
                    )}
                  </Text>
                </VStack>

                <Box width={1} bg={colors.frame_border} />

                <VStack flex={1} space="xs" alignItems="center">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Ngày hết hạn
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
          </VStack>
        </Box>

        {/* ========== PHÂN TÍCH RỦI RO ========== */}
        <RiskAnalysisDisplay
          policyId={policy.id}
          policyStatus={policy.status}
          underwritingStatus={policy.underwriting_status}
        />

        {/* ========== THÔNG TIN THẨM ĐỊNH (UNDERWRITING) ========== */}
        {underwritingLoading && (
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
                Đang tải thông tin thẩm định...
              </Text>
            </HStack>
          </Box>
        )}

        {!underwritingLoading && underwriting && (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={
              underwriting.underwriting_status === "approved"
                ? colors.success
                : underwriting.underwriting_status === "rejected"
                  ? colors.error
                  : colors.warning
            }
            p="$5"
          >
            <VStack space="md">
              {/* Header */}
              <HStack alignItems="center" space="sm" justifyContent="center">
                <FileCheck size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Kết quả kiểm duyệt bảo hiểm
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              {/* Trạng thái thẩm định */}
              <Box
                bg={
                  underwriting.underwriting_status === "approved"
                    ? colors.successSoft
                    : underwriting.underwriting_status === "rejected"
                      ? colors.errorSoft
                      : colors.warningSoft
                }
                borderRadius="$lg"
                p="$3"
              >
                <VStack space="xs" alignItems="center">
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Trạng thái kiểm duyệt
                  </Text>
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={
                      underwriting.underwriting_status === "approved"
                        ? colors.success
                        : underwriting.underwriting_status === "rejected"
                          ? colors.error
                          : colors.warning
                    }
                  >
                    {underwriting.underwriting_status === "approved"
                      ? "ĐÃ PHÊ DUYỆT"
                      : underwriting.underwriting_status === "rejected"
                        ? "TỪ CHỐI"
                        : "ĐANG XỬ LÝ"}
                  </Text>
                </VStack>
              </Box>

              {/* Lý do và ghi chú */}
              <VStack space="sm">
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    Lý do đánh giá
                  </Text>
                  <Text
                    fontSize="$sm"
                    color={colors.secondary_text}
                    lineHeight="$lg"
                  >
                    {underwriting.reason}
                  </Text>
                </VStack>

                {underwriting.validation_notes && (
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      Ghi chú kiểm duyệt
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={colors.secondary_text}
                      lineHeight="$lg"
                    >
                      {underwriting.validation_notes}
                    </Text>
                  </VStack>
                )}
              </VStack>

              {/* Phân tích rủi ro */}
              <Box bg={colors.background} borderRadius="$lg" p="$3">
                <VStack space="sm">
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    Phân tích rủi ro
                  </Text>

                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Mức độ rủi ro
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={
                          underwriting.reason_evidence.risk_level === "low"
                            ? colors.success
                            : underwriting.reason_evidence.risk_level === "high"
                              ? colors.error
                              : colors.warning
                        }
                      >
                        {underwriting.reason_evidence.risk_level === "low"
                          ? "Thấp"
                          : underwriting.reason_evidence.risk_level === "high"
                            ? "Cao"
                            : "Trung bình"}
                      </Text>
                    </VStack>

                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Điểm rủi ro
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {(
                          underwriting.reason_evidence.risk_score * 100
                        ).toFixed(1)}
                        %
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Lịch sử nông trại
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {underwriting.reason_evidence.farm_history === "clean"
                          ? "Tốt"
                          : underwriting.reason_evidence.farm_history ===
                              "minor_issues"
                            ? "Có vấn đề"
                            : "Chưa rõ"}
                      </Text>
                    </VStack>

                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Ngày kiểm duyệt
                      </Text>
                      <Text
                        fontSize="$xs"
                        fontWeight="$medium"
                        color={colors.primary_text}
                      >
                        {Utils.formatDateForMS(
                          underwriting.validation_timestamp
                        )}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Đề xuất */}
              <Box borderRadius="$lg" p="$3">
                <VStack space="sm">
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                  >
                    Đề xuất của công ty bảo hiểm
                  </Text>

                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$xs"
                        color={colors.primary_text}
                        opacity={0.8}
                      >
                        Điều chỉnh phí
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {underwriting.recommendations.premium_adjustment ===
                        "none"
                          ? "Không thay đổi"
                          : underwriting.recommendations.premium_adjustment ===
                              "increase"
                            ? "Tăng phí"
                            : "Giảm phí"}
                      </Text>
                    </VStack>

                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$xs"
                        color={colors.primary_text}
                        opacity={0.8}
                      >
                        Mức bảo hiểm đề xuất
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {underwriting.recommendations.suggested_coverage ===
                        "full"
                          ? "Toàn bộ"
                          : underwriting.recommendations.suggested_coverage ===
                              "partial"
                            ? "Một phần"
                            : "Tối thiểu"}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* ========== CHI PHÍ BẢO HIỂM ========== */}
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
                    handlePayment();
                  }
                }}
                opacity={
                  acceptedTerms && acceptedDataSharing && !isCreatingPayment
                    ? 1
                    : 0.5
                }
                disabled={
                  !acceptedTerms || !acceptedDataSharing || isCreatingPayment
                }
              >
                <Box
                  bg={
                    acceptedTerms && acceptedDataSharing && !isCreatingPayment
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
                      {isCreatingPayment ? "Đang xử lý..." : "Thanh toán"}
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

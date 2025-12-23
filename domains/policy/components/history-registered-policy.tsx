import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { RiskAnalysisDisplay } from "@/domains/farm-data-monitor/components/RiskAnalysisDisplay";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import useCreatePayment from "@/domains/payment/hooks/use-create-payment";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Button,
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
import { router } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Image as ImageIcon,
  MapPin,
  Scale,
  Shield,
  Sprout,
  User,
  View,
  XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import { Linking, RefreshControl } from "react-native";
import { UnderwritingStatus } from "../enums/policy-status.enum";
import { RegisteredPolicy } from "../models/policy.models";
import { ReviewCancelRequestModal } from "./review-cancel-request-modal";

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
export const HistoryDetailRegisteredPolicy: React.FC<
  DetailRegisteredPolicyProps
> = ({ policy, isRefreshing = false, onRefresh }) => {
  const { colors } = useAgrisaColors();
  const { userProfile } = useAuthStore();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataSharing, setAcceptedDataSharing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Fetch thông tin farm dựa trên farm_id
  const { getDetailFarm } = useFarm();
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const {
    getDetailBasePolicy,
    getUnderwritingPolicy,
    getCancelRequestByPolicyId,
    reviewCancelRequestMutation,
  } = usePolicy();
  const { mutate: createPayment, isPending: isCreatingPayment } =
    useCreatePayment();

  // Lấy thông tin insurance partner
  const { data: partnerData, isLoading: partnerLoading } =
    getInsurancePartnerDetail(policy.insurance_provider_id);
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(
    policy.farm_id
  );

  // Lấy thông tin cancel request
  const { data: cancelRequest, isLoading: cancelRequestLoading } =
    getCancelRequestByPolicyId(policy.id);

  // Debug log
  console.log("🔍 [HistoryDetailRegisteredPolicy] policy.id:", policy.id);
  console.log(
    "🔍 [HistoryDetailRegisteredPolicy] cancelRequestLoading:",
    cancelRequestLoading
  );
  console.log(
    "🔍 [HistoryDetailRegisteredPolicy] cancelRequest:",
    cancelRequest
  );
  const { data: requestedByData, isLoading: requestedByLoading } =
    getInsurancePartnerDetail(cancelRequest?.requested_by || "");

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
    // 1. Kiểm tra các status đặc biệt của policy TRƯỚC
    switch (policy.status) {
      case "payout":
        return {
          label: "Đang chi trả bồi thường",
          color: colors.info,
          icon: CheckCircle2,
          bgColor: colors.infoSoft,
        };

      case "pending_cancel":
        return {
          label: "Chờ xử lý hủy hợp đồng",
          color: colors.warning,
          icon: Clock,
          bgColor: colors.warningSoft,
        };

      case "dispute":
        return {
          label: "Tranh chấp - Đang giải quyết",
          color: colors.error,
          icon: AlertCircle,
          bgColor: colors.errorSoft,
        };

      case "cancelled":
        return {
          label: "Hợp đồng đã bị hủy",
          color: colors.error,
          icon: XCircle,
          bgColor: colors.errorSoft,
        };

      case "expired":
        return {
          label: "Hợp đồng hết hạn",
          color: colors.muted_text,
          icon: XCircle,
          bgColor: colors.background,
        };

      case "pending_payment":
        // Chờ thanh toán (sau khi được duyệt)
        if (policy.underwriting_status === UnderwritingStatus.APPROVED) {
          return {
            label: "Chờ thanh toán",
            color: colors.warning,
            icon: AlertCircle,
            bgColor: colors.warningSoft,
          };
        }
        break;

      case "draft":
        return {
          label: "Bản nháp",
          color: colors.muted_text,
          icon: FileCheck,
          bgColor: colors.background,
        };
    }

    // 2. Xử lý theo underwriting_status
    switch (policy.underwriting_status) {
      case UnderwritingStatus.APPROVED:
        // Nếu approved, xem tiếp status để xác định trạng thái cuối
        if (policy.status === "active") {
          return {
            label: "Đã được bảo hiểm",
            color: colors.success,
            icon: CheckCircle2,
            bgColor: colors.successSoft,
          };
        }
        return {
          label: "Đã được phê duyệt",
          color: colors.success,
          icon: CheckCircle2,
          bgColor: colors.successSoft,
        };

      case UnderwritingStatus.REJECTED:
        return {
          label: "Đã bị từ chối",
          color: colors.error,
          icon: AlertCircle,
          bgColor: colors.errorSoft,
        };

      case UnderwritingStatus.PENDING:
        // Nếu pending, xem status để phân biệt draft và pending_review
        if (policy.status === "pending_review") {
          return {
            label: "Chờ phê duyệt",
            color: colors.pending,
            icon: FileCheck,
            bgColor: colors.primary_white_text,
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

  // Handler cho việc review cancel request
  const handleReview = (approved: boolean) => {
    setIsApproving(approved);
    setShowReviewModal(true);
  };

  const handleSubmitReview = (reviewNotes: string, approved: boolean) => {
    if (!cancelRequest?.id) {
      console.error("❌ Không có cancel request ID");
      return;
    }

    reviewCancelRequestMutation.mutate({
      cancel_request_id: cancelRequest.id,
      payload: {
        review_notes: reviewNotes,
        approved: approved,
      },
    });

    setShowReviewModal(false);
  };

  // Kiểm tra xem user có phải là người tạo yêu cầu không
  const isRequestedByUser =
    cancelRequest?.requested_by === userProfile?.user_id;

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

          {/* Mã hợp đồng và Trạng thái */}
          <HStack space="sm">
            {/* Mã hợp đồng */}
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
                    Mã hợp đồng
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
                      Họ và tên
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      {userProfile?.full_name ||
                        userProfile?.display_name ||
                        "Chưa cập nhật"}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* Nút xem hợp đồng đã ký - Hiển thị ngay sau các bên tham gia */}
        {policy.signed_policy_document_url && (
          <Pressable
            onPress={() => openPDF(policy.signed_policy_document_url!)}
          >
            <Box
              bg={colors.primary}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.primary}
            >
              <HStack space="sm" alignItems="center" justifyContent="center">
                <View
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2}
                />
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  Xem hợp đồng đã ký
                </Text>
              </HStack>
            </Box>
          </Pressable>
        )}

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
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                    textAlign="center"
                  >
                    Bản đồ nông trại
                  </Text>
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

                  {/* Ngày dự kiến gieo trồng */}
                  <VStack space="xs">
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Ngày dự kiến gieo trồng
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
                  Số tiền bảo hiểm dự kiến
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
                Số tiền dự kiến được chi trả khi xảy ra thiệt hại (chưa chỉ số
                vượt ngưỡng)
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
                  Thời hạn bảo hiểm hiệu lực
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
                    {Utils.formatDateTimeForMS(
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
                    {Utils.formatDateTimeForMS(policy.coverage_end_date)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* ========== ĐIỀU KIỆN CHI TRẢ TỰ ĐỘNG (từ base policy) ========== */}
        {basePolicyData?.success &&
          basePolicyData.data?.triggers?.length > 0 && (
            <VStack space="md">
              <HStack space="sm" alignItems="center">
                <Box
                  bg={colors.primary}
                  borderRadius="$md"
                  p="$2"
                  alignItems="center"
                  justifyContent="center"
                >
                  <AlertCircle
                    size={20}
                    color={colors.primary_white_text}
                    strokeWidth={2.5}
                  />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Điều kiện chi trả tự động
                </Text>
              </HStack>

              <VStack space="sm">
                {basePolicyData.data.triggers.map(
                  (trigger: any, idx: number) => (
                    <Box
                      key={trigger.id || idx}
                      bg={colors.card_surface}
                      borderRadius="$lg"
                      p="$3"
                      mb="$2"
                      borderWidth={1}
                      borderColor={colors.frame_border}
                    >
                      <VStack space="sm">
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                        >
                          {trigger.name || `Trigger ${idx + 1}`}
                        </Text>

                        {(trigger.conditions || []).map(
                          (cond: any, cidx: number) => {
                            const param =
                              cond.parameter ||
                              cond.parameter_name ||
                              cond.name ||
                              "-";
                            const op =
                              cond.comparator ||
                              cond.operator ||
                              cond.comparison ||
                              cond.logical_operator ||
                              "";
                            const val =
                              cond.threshold || cond.value || cond.target || "";
                            const unit = cond.unit || "";
                            return (
                              <HStack
                                key={cidx}
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Text
                                  fontSize="$sm"
                                  color={colors.secondary_text}
                                >
                                  {param}
                                  {unit ? ` (${unit})` : ""}
                                </Text>
                                <Text
                                  fontSize="$sm"
                                  color={colors.primary_text}
                                  fontWeight="$semibold"
                                >
                                  {op} {val}
                                </Text>
                              </HStack>
                            );
                          }
                        )}
                      </VStack>
                    </Box>
                  )
                )}
              </VStack>
            </VStack>
          )}

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
                  <Text fontSize="$sm" fontWeight="$bold">
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

        {/* ========== THÔNG TIN YÊU CẦU HỦY HỢP ĐỒNG ========== */}
        {cancelRequestLoading && (
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
                Đang tải thông tin yêu cầu hủy...
              </Text>
            </HStack>
          </Box>
        )}

        {!cancelRequestLoading && cancelRequest && (
          <Box
            bg={
              cancelRequest.status === "approved"
                ? colors.successSoft
                : cancelRequest.status === "denied"
                  ? colors.errorSoft
                  : colors.warningSoft
            }
            borderRadius="$2xl"
            borderWidth={2}
            borderColor={
              cancelRequest.status === "approved"
                ? colors.success
                : cancelRequest.status === "denied"
                  ? colors.error
                  : colors.warning
            }
            p="$5"
          >
            <VStack space="lg">
              {/* Header với badge */}
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="sm" alignItems="center" flex={1}>
                  <AlertTriangle
                    size={22}
                    color={
                      cancelRequest.status === "approved"
                        ? colors.success
                        : cancelRequest.status === "denied"
                          ? colors.error
                          : colors.warning
                    }
                    strokeWidth={2.5}
                  />
                  <VStack flex={1}>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Yêu cầu hủy hợp đồng
                    </Text>
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Người tạo:{" "}
                      {requestedByLoading ? (
                        <Spinner size="small" color={colors.primary} />
                      ) : isRequestedByUser ? (
                        "Bạn"
                      ) : requestedByData?.success ? (
                        requestedByData.data?.partner_display_name
                      ) : (
                        "Đối tác bảo hiểm"
                      )}
                    </Text>
                  </VStack>
                </HStack>

                {/* Badge trạng thái */}
                <Box
                  bg={colors.card_surface}
                  px="$3"
                  py="$2"
                  borderRadius="$full"
                  borderWidth={1}
                  borderColor={
                    cancelRequest.status === "approved"
                      ? colors.success
                      : cancelRequest.status === "denied"
                        ? colors.error
                        : colors.warning
                  }
                >
                  <HStack space="xs" alignItems="center">
                    {cancelRequest.status === "approved" ? (
                      <CheckCircle2
                        size={14}
                        color={colors.success}
                        strokeWidth={2}
                      />
                    ) : cancelRequest.status === "denied" ? (
                      <XCircle size={14} color={colors.error} strokeWidth={2} />
                    ) : (
                      <Clock size={14} color={colors.warning} strokeWidth={2} />
                    )}
                    <Text
                      fontSize="$xs"
                      fontWeight="$bold"
                      color={
                        cancelRequest.status === "approved"
                          ? colors.success
                          : cancelRequest.status === "denied"
                            ? colors.error
                            : colors.warning
                      }
                    >
                      {cancelRequest.status === "approved"
                        ? "Đã chấp nhận"
                        : cancelRequest.status === "denied"
                          ? "Đã từ chối"
                          : "Chờ xử lý"}
                    </Text>
                  </HStack>
                </Box>
              </HStack>

              {/* Nội dung chi tiết */}
              <Box bg={colors.card_surface} borderRadius="$xl" p="$4">
                <VStack space="md">
                  {/* Loại yêu cầu */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$sm" color={colors.secondary_text}>
                      Loại yêu cầu
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {cancelRequest.cancel_request_type ===
                      "contract_violation"
                        ? "Vi phạm hợp đồng"
                        : "Lý do khác"}
                    </Text>
                  </HStack>

                  {/* Số tiền dự kiến bồi thường - Chỉ hiển thị khi không phải người tạo */}
                  {!isRequestedByUser && cancelRequest.compensate_amount && (
                    <>
                      <Box height={1} bg={colors.frame_border} width="100%" />
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          fontSize="$sm"
                          color={colors.secondary_text}
                          fontWeight="$medium"
                        >
                          Số tiền dự kiến bồi thường
                        </Text>
                        <Text
                          fontSize="$md"
                          fontWeight="$bold"
                          color={colors.error}
                        >
                          {Utils.formatCurrency(
                            cancelRequest.compensate_amount
                          )}
                        </Text>
                      </HStack>
                    </>
                  )}

                  <Box height={1} bg={colors.frame_border} width="100%" />

                  {/* Lý do hủy */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Lý do hủy
                    </Text>
                    <Text fontSize="$sm" color={colors.primary_text}>
                      {cancelRequest.reason}
                    </Text>
                  </VStack>

                  {/* Bằng chứng */}
                  {cancelRequest.evidence && (
                    <>
                      <Box height={1} bg={colors.frame_border} width="100%" />
                      <VStack space="xs">
                        <Text
                          fontSize="$sm"
                          color={colors.secondary_text}
                          fontWeight="$medium"
                        >
                          Bằng chứng
                        </Text>
                        <Text fontSize="$sm" color={colors.primary_text}>
                          {cancelRequest.evidence.description}
                        </Text>
                        {cancelRequest.evidence.images &&
                          cancelRequest.evidence.images.length > 0 && (
                            <HStack space="xs" alignItems="center">
                              <ImageIcon
                                size={14}
                                color={colors.secondary_text}
                              />
                              <Text
                                fontSize="$xs"
                                color={colors.secondary_text}
                              >
                                {cancelRequest.evidence.images.length} ảnh đính
                                kèm
                              </Text>
                            </HStack>
                          )}
                      </VStack>
                    </>
                  )}

                  <Box height={1} bg={colors.frame_border} width="100%" />

                  {/* Ngày tạo yêu cầu */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$sm" color={colors.secondary_text}>
                      Ngày tạo yêu cầu
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {Utils.formatStringVietnameseDateTime(
                        cancelRequest.requested_at
                      )}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Nút hành động - Chỉ hiển thị khi không phải người tạo và trạng thái pending */}
              {!isRequestedByUser &&
                cancelRequest.status === "pending_review" && (
                  <HStack space="md" width="100%">
                    <Button
                      flex={1}
                      size="md"
                      variant="outline"
                      borderColor={colors.error}
                      onPress={() => handleReview(false)}
                    >
                      <HStack space="xs" alignItems="center">
                        <XCircle
                          size={16}
                          color={colors.error}
                          strokeWidth={2}
                        />
                        <Text color={colors.error} fontWeight="$bold">
                          Từ chối
                        </Text>
                      </HStack>
                    </Button>

                    <Button
                      flex={1}
                      size="md"
                      bg={colors.success}
                      onPress={() => handleReview(true)}
                    >
                      <HStack space="xs" alignItems="center">
                        <CheckCircle2
                          size={16}
                          color={colors.primary_white_text}
                          strokeWidth={2}
                        />
                        <Text
                          color={colors.primary_white_text}
                          fontWeight="$bold"
                        >
                          Chấp nhận
                        </Text>
                      </HStack>
                    </Button>
                  </HStack>
                )}
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
                Các phí cần thanh toán
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
                  Phí mua gói bảo hiểm
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
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Tổng phí thanh toán
              </Text>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary}>
                {Utils.formatCurrency(policy.total_farmer_premium)}
              </Text>
            </HStack>
            {policy.premium_paid_by_farmer && (
              <Box
                bg={colors.successSoft}
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor={colors.success}
              >
                <HStack space="sm" alignItems="center" justifyContent="center">
                  <CheckCircle2
                    size={16}
                    color={colors.success}
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.success}
                  >
                    Đã thanh toán
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>

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

        {/* Nút Hủy - Hiển thị khi pending_payment hoặc pending_review */}
        {(policy.status === "pending_payment" ||
          policy.status === "pending_review") && (
          <Pressable
            onPress={() => {
              router.push(
                `/(farmer)/history-registered-policy/${policy.id}/cancel`
              );
            }}
          >
            <Box
              bg={colors.background}
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor={colors.error}
            >
              <HStack space="sm" alignItems="center" justifyContent="center">
                <AlertCircle size={16} color={colors.error} strokeWidth={2} />
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.error}
                  textAlign="center"
                >
                  Hủy đăng ký
                </Text>
              </HStack>
            </Box>
          </Pressable>
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

      {/* Modal Review Cancel Request */}
      <ReviewCancelRequestModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        isApproving={isApproving}
        isLoading={reviewCancelRequestMutation.isPending}
      />
    </ScrollView>
  );
};

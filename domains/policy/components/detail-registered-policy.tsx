import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
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
    User
} from "lucide-react-native";
import React, { useState } from "react";
import { RefreshControl } from "react-native";
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

  // Fetch thông tin farm dựa trên farm_id
  const { getDetailFarm } = useFarm();
  const { data: farmData, isLoading: farmLoading } = getDetailFarm(
    policy.farm_id
  );

  const farm = farmData?.success ? farmData.data : null;

  /**
   * Xác định trạng thái hiển thị ưu tiên
   * Priority: underwriting_status > status
   */
  const getPolicyStatusDisplay = () => {
    // Ưu tiên hiển thị underwriting_status
    if (policy.underwriting_status === UnderwritingStatus.APPROVED) {
      return { 
        label: "Đã được phê duyệt", 
        color: colors.success, 
        icon: CheckCircle2,
        bgColor: colors.successSoft,
      };
    }
    if (policy.underwriting_status === UnderwritingStatus.REJECTED) {
      return { 
        label: "Đã bị từ chối", 
        color: colors.error, 
        icon: AlertCircle,
        bgColor: colors.errorSoft,
      };
    }
    if (policy.underwriting_status === UnderwritingStatus.PENDING) {
      return { 
        label: "Chờ phê duyệt", 
        color: colors.pending, 
        icon: FileCheck,
        bgColor: colors.pendingSoft,
      };
    }

    // Fallback sang status
    switch (policy.status) {
      case "active":
        return {
          label: "Đang có hiệu lực",
          color: colors.success,
          icon: CheckCircle2,
          bgColor: colors.successSoft,
        };
      case "rejected":
      case "cancelled":
        return { 
          label: "Đã hủy bỏ", 
          color: colors.error, 
          icon: AlertCircle,
          bgColor: colors.errorSoft,
        };
      case "pending_review":
        return { 
          label: "Đang xem xét", 
          color: colors.pending, 
          icon: FileCheck,
          bgColor: colors.pendingSoft,
        };
      case "suspended":
        return {
          label: "Tạm ngưng",
          color: colors.warning,
          icon: AlertCircle,
          bgColor: colors.warningSoft,
        };
      case "expired":
        return { 
          label: "Đã hết hạn", 
          color: colors.muted_text, 
          icon: AlertCircle,
          bgColor: colors.background,
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
  const showPaymentSection = policy.underwriting_status === UnderwritingStatus.APPROVED;

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
          <Box
            p="$5"
          >
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
              borderRadius="$2xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <Box 
                    bg={colors.primary} 
                    p="$1.5" 
                    borderRadius="$md"
                    borderWidth={1.5}
                    borderColor={colors.primary_white_text}
                  >
                    <FileText size={14} color={colors.primary_white_text} strokeWidth={2.5} />
                  </Box>
                  <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                    Số hợp đồng
                  </Text>
                </HStack>
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                  textAlign="center"
                >
                  {policy.policy_number}
                </Text>
              </VStack>
            </Box>

            {/* Trạng thái */}
            <Box
              flex={1}
              bg={statusDisplay.bgColor}
              borderRadius="$2xl"
              p="$4"
              borderWidth={2}
              borderColor={statusDisplay.color}
            >
              <VStack space="xs" alignItems="center">
                <Text fontSize="$xs" color={statusDisplay.color} fontWeight="$medium">
                  Trạng thái
                </Text>
                <HStack space="xs" alignItems="center">
                  <StatusIcon size={16} color={statusDisplay.color} strokeWidth={2.5} />
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={statusDisplay.color}
                    textAlign="center"
                  >
                    {statusDisplay.label}
                  </Text>
                </HStack>
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
              <Box 
                bg={colors.primary} 
                p="$2" 
                borderRadius="$lg"
                borderWidth={2}
                borderColor={colors.primary_white_text}
              >
                <Scale size={20} color={colors.primary_white_text} strokeWidth={2.5} />
              </Box>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                Các bên tham gia
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <HStack space="md">
              {/* Bên bảo hiểm */}
              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <Building2 size={16} color={colors.primary} strokeWidth={2} />
                  <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_text}>
                    BÊN BẢO HIỂM
                  </Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Mã nhà cung cấp
                    </Text>
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text} textAlign="center">
                      {policy.insurance_provider_id}
                    </Text>
                  </VStack>
                </Box>
              </VStack>

              {/* Divider giữa */}
              <Box width={1} bg={colors.frame_border} />

              {/* Bên được bảo hiểm */}
              <VStack flex={1} space="sm">
                <HStack space="xs" alignItems="center" justifyContent="center">
                  <User size={16} color={colors.success} strokeWidth={2} />
                  <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_text}>
                    NÔNG DÂN
                  </Text>
                </HStack>
                <Box bg={colors.background} p="$3" borderRadius="$lg">
                  <VStack space="xs" alignItems="center">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Mã nông dân
                    </Text>
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text} textAlign="center">
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
                  <Box 
                    bg={colors.primary} 
                    p="$2" 
                    borderRadius="$lg"
                    borderWidth={2}
                    borderColor={colors.primary_white_text}
                  >
                    <MapPin size={20} color={colors.primary_white_text} strokeWidth={2.5} />
                  </Box>
                  <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                    Thông tin nông trại
                  </Text>
                </HStack>
              </Box>

              {/* Bản đồ */}
              <Box px="$5">
                <VStack space="sm">
                  <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text} textAlign="center">
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
                      <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                        Tên nông trại
                      </Text>
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                        {farm.farm_name}
                      </Text>
                    </VStack>

                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                        Mã nông trại
                      </Text>
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                        {farm.farm_code}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Cây trồng và diện tích */}
                  <HStack space="md">
                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                        Loại cây trồng
                      </Text>
                      <HStack space="xs" alignItems="center">
                        <Sprout size={14} color={colors.success} strokeWidth={2} />
                        <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                          {Utils.getCropLabel(farm.crop_type)}
                        </Text>
                      </HStack>
                    </VStack>

                    <VStack flex={1} space="xs">
                      <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                        Diện tích
                      </Text>
                      <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                        {farm.area_sqm.toFixed(2)} ha
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Địa chỉ */}
                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Địa chỉ
                    </Text>
                    <Text fontSize="$sm" color={colors.primary_text} lineHeight="$md">
                      {farm.address}
                    </Text>
                  </VStack>

                  {/* Giấy chứng nhận */}
                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Giấy chứng nhận quyền sử dụng đất
                    </Text>
                    <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
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
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Box 
                bg={colors.primary} 
                p="$2" 
                borderRadius="$lg"
                borderWidth={2}
                borderColor={colors.primary_white_text}
              >
                <Shield size={20} color={colors.primary_white_text} strokeWidth={2.5} />
              </Box>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                Số tiền bảo hiểm
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="xs" alignItems="center">
              <Text
                fontSize="$4xl"
                fontWeight="$bold"
                color={colors.success}
              >
                {Utils.formatCurrency(policy.coverage_amount)}
              </Text>
              <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
                Số tiền tối đa được chi trả khi xảy ra thiệt hại
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* ========== THỜI HẠN BẢO HIỂM ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Box 
                bg={colors.primary} 
                p="$2" 
                borderRadius="$lg"
                borderWidth={2}
                borderColor={colors.primary_white_text}
              >
                <Calendar size={20} color={colors.primary_white_text} strokeWidth={2.5} />
              </Box>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                Thời hạn bảo hiểm
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Timeline */}
            <VStack space="sm">
              <HStack space="md">
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium" textAlign="center">
                    {policy.underwriting_status === UnderwritingStatus.PENDING 
                      ? "Dự kiến bắt đầu" 
                      : "Ngày gieo trồng"}
                  </Text>
                  <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text} textAlign="center">
                    {Utils.formatDateForMS(policy.planting_date)}
                  </Text>
                </VStack>

                <Box width={1} bg={colors.frame_border} />

                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium" textAlign="center">
                    {policy.underwriting_status === UnderwritingStatus.PENDING 
                      ? "Dự kiến kết thúc" 
                      : "Ngày hết hạn"}
                  </Text>
                  <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text} textAlign="center">
                    {Utils.formatDateForMS(policy.coverage_end_date)}
                  </Text>
                </VStack>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <HStack space="md">
                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium" textAlign="center">
                    Ngày đăng ký
                  </Text>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text} textAlign="center">
                    {Utils.formatDateForMS(
                      Math.floor(new Date(policy.created_at).getTime() / 1000)
                    )}
                  </Text>
                </VStack>

                <Box width={1} bg={colors.frame_border} />

                <VStack flex={1} space="xs">
                  <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium" textAlign="center">
                    Cập nhật cuối
                  </Text>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text} textAlign="center">
                    {Utils.formatDateForMS(
                      Math.floor(new Date(policy.updated_at).getTime() / 1000)
                    )}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* ========== CHI PHÍ BẢO HIỂM ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Box 
                bg={colors.primary} 
                p="$2" 
                borderRadius="$lg"
                borderWidth={2}
                borderColor={colors.primary_white_text}
              >
                <Banknote size={20} color={colors.primary_white_text} strokeWidth={2.5} />
              </Box>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                Chi phí bảo hiểm
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <VStack space="sm">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.primary_text} fontWeight="$medium">
                  Phí bảo hiểm
                </Text>
                <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
                  {Utils.formatCurrency(policy.total_farmer_premium)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.primary_text} fontWeight="$medium">
                  Hệ số diện tích
                </Text>
                <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                  x {policy.area_multiplier.toFixed(2)}
                </Text>
              </HStack>
            </VStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Tổng chi phí - Đơn giản */}
            <Box
              bg={colors.primary}
              borderRadius="$xl"
              p="$4"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  Tổng chi phí
                </Text>
                <Text
                  fontSize="$2xl"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  {Utils.formatCurrency(
                    policy.total_farmer_premium + policy.total_data_cost
                  )}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* ========== ĐIỀU KHOẢN & THANH TOÁN (Chỉ hiển thị khi approved) ========== */}
        {showPaymentSection && (
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={2}
            borderColor={colors.success}
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm" justifyContent="center">
                <Box 
                  bg={colors.primary} 
                  p="$2" 
                  borderRadius="$lg"
                  borderWidth={2}
                  borderColor={colors.primary_white_text}
                >
                  <FileCheck size={20} color={colors.primary_white_text} strokeWidth={2.5} />
                </Box>
                <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
                  Xác nhận thanh toán
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              {/* Checkbox đồng ý điều khoản */}
              <Checkbox
                value="terms"
                isChecked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                size="md"
              >
                <CheckboxIndicator mr="$2" borderColor={colors.frame_border}>
                  <CheckboxIcon as={Check} color={colors.primary_white_text} />
                </CheckboxIndicator>
                <CheckboxLabel>
                  <Text fontSize="$sm" color={colors.primary_text} lineHeight="$lg">
                    Tôi đã đọc và đồng ý với{" "}
                    <Text fontWeight="$bold" color={colors.primary}>
                      Điều khoản Bảo hiểm
                    </Text>
                    . Tôi cam kết thông tin cung cấp là chính xác.
                  </Text>
                </CheckboxLabel>
              </Checkbox>

              {/* Nút thanh toán */}
              <Pressable
                onPress={() => {
                  if (acceptedTerms) {
                    console.log("Proceeding to payment...");
                    // TODO: Navigate to payment screen
                  }
                }}
                opacity={acceptedTerms ? 1 : 0.5}
                disabled={!acceptedTerms}
              >
                <Box
                  bg={acceptedTerms ? colors.success : colors.muted_text}
                  borderRadius="$xl"
                  p="$4"
                >
                  <HStack space="sm" alignItems="center" justifyContent="center">
                    <CreditCard 
                      size={24} 
                      color={colors.primary_white_text} 
                      strokeWidth={2.5} 
                    />
                    <Text
                      fontSize="$lg"
                      fontWeight="$bold"
                      color={colors.primary_white_text}
                    >
                      THANH TOÁN NGAY
                    </Text>
                  </HStack>
                </Box>
              </Pressable>

              {!acceptedTerms && (
                <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
                  Vui lòng đồng ý điều khoản để tiếp tục
                </Text>
              )}
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
            <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
              Hợp đồng này được tạo bởi hệ thống Agrisa
            </Text>
            <Text fontSize="$xs" color={colors.secondary_text} textAlign="center" fontWeight="$semibold">
              Mọi thắc mắc xin liên hệ bộ phận chăm sóc khách hàng
            </Text>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

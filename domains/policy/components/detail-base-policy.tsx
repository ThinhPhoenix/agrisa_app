import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useDataSource } from "@/domains/farm-data-monitor/hooks/use-data-source";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { InsurancePartnerResponse } from "@/domains/insurance-partner/models/insurance-partner.model";
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";
import { useToast } from "@/domains/shared/hooks/useToast";
import { Utils } from "@/libs/utils/utils";
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Divider,
  HStack,
  Pressable,
  SafeAreaView,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Leaf,
  Shield,
  TrendingUp,
  XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { usePolicy } from "../hooks/use-policy";
import type {
  PolicyDetailResponse,
  PolicyDocument,
  PublicBasePolicyResponse,
} from "../models/policy.models";

// ============= MAIN COMPONENT =============

export default function DetailBasePolicyScreen() {
  const { colors } = useAgrisaColors();
  const toast = useToast();
  const params = useLocalSearchParams();
  const policyId = params.policyId as string;

  const { getDetailBasePolicy } = usePolicy();
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const { data, isLoading, isFetching, isError, refetch, error } =
    getDetailBasePolicy(policyId);

  const policyDetail = data?.data as PolicyDetailResponse | undefined;
  const base_policy = policyDetail?.base_policy;

  // Lấy thông tin insurance partner - phải gọi hook trước khi có điều kiện
  const { data: partnerData, isLoading: partnerLoading } =
    getInsurancePartnerDetail(base_policy?.insurance_provider_id || "");

  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(
    new Set()
  );

  const isRefreshing = isFetching && !isLoading;

  const toggleTrigger = (triggerId: string) => {
    setExpandedTriggers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(triggerId)) {
        newSet.delete(triggerId);
      } else {
        newSet.add(triggerId);
      }
      return newSet;
    });
  };

  const handleEnroll = () => {
    router.push(`/(farmer)/register-policy/${policyId}`);
  };

  // Loading State
  if (isLoading) {
    return (
      <Box
        flex={1}
        bg={colors.background}
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="large" color={colors.primary} />
        <Text color={colors.secondary_text} fontSize="$sm" mt="$3">
          Đang tải chi tiết bảo hiểm...
        </Text>
      </Box>
    );
  }

  // Not Found State
  if (!policyDetail) {
    return (
      <Box
        flex={1}
        bg={colors.background}
        p="$4"
        justifyContent="center"
        alignItems="center"
      >
        <Shield size={64} color={colors.muted_text} strokeWidth={1.5} />
        <Text
          fontSize="$lg"
          fontWeight="$semibold"
          color={colors.primary_text}
          mt="$4"
        >
          Không tìm thấy bảo hiểm
        </Text>
        <Button bg={colors.primary} mt="$4" onPress={() => router.back()}>
          <ButtonText color={colors.primary_white_text}>Quay lại</ButtonText>
        </Button>
      </Box>
    );
  }

  // Destructure các phần còn lại từ policyDetail (base_policy đã được khai báo ở trên)
  const { triggers, metadata, document } = policyDetail;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Box flex={1}>
        {/* Header - Fixed */}
        <AgrisaHeader
          title="Chi tiết gói bảo hiểm"
          onBack={() => router.back()}
        />

        {/* Scrollable Content */}
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{
            paddingBottom: 150,
          }}
        >
          <VStack space="lg" px="$4" py="$4">
            {/* THÔNG TIN CHƯƠNG TRÌNH BẢO HIỂM */}
            <VStack space="md">
              <SectionTitle
                title="Thông tin gói bảo hiểm"
                icon={Shield}
                colors={colors}
              />
              <ProductInfoCard
                policy={base_policy}
                document={document}
                partnerData={partnerData}
                partnerLoading={partnerLoading}
                colors={colors}
              />
            </VStack>

            {/* THỜI GIAN HIỆU LỰC */}
            <VStack space="md">
              <SectionTitle
                title="Thời gian hiệu lực"
                icon={Calendar}
                colors={colors}
              />
              <TimelineCard policy={base_policy} colors={colors} />
            </VStack>

            {/* ĐIỀU KIỆN BỒI THƯỜNG TỰ ĐỘNG */}
            <VStack space="md">
              <SectionTitle
                title="Điều kiện chi trả tự động"
                icon={AlertCircle}
                colors={colors}
              />

              <VStack space="sm">
                {triggers.map((trigger, index) => (
                  <TriggerCard
                    key={trigger.id}
                    trigger={trigger}
                    index={index}
                    isExpanded={expandedTriggers.has(trigger.id)}
                    onToggle={() => toggleTrigger(trigger.id)}
                    colors={colors}
                  />
                ))}
              </VStack>
            </VStack>

            {/* THÔNG TIN KỸ THUẬT */}
            <VStack space="md">
              <SectionTitle
                title="Thông tin kỹ thuật"
                icon={Database}
                colors={colors}
              />
              <TechnicalInfoCard metadata={metadata} colors={colors} />
            </VStack>

            {/* LƯU Ý QUAN TRỌNG */}
            {base_policy.important_additional_information && (
              <VStack space="md">
                <SectionTitle
                  title="Lưu ý quan trọng"
                  icon={AlertTriangle}
                  colors={colors}
                />
                <ImportantNotesCard policy={base_policy} colors={colors} />
              </VStack>
            )}
            {/* CHI PHÍ & QUYỀN LỢI */}
            <VStack space="md">
              <SectionTitle
                title="Chi phí & Quyền lợi"
                icon={TrendingUp}
                colors={colors}
              />
              <CostPayoutGrid policy={base_policy} colors={colors} />
            </VStack>
          </VStack>
        </ScrollView>

        <BottomCTA
          policy={base_policy}
          onEnroll={handleEnroll}
          colors={colors}
        />
      </Box>
    </SafeAreaView>
  );
}

// ============= SUB-COMPONENTS =============

type ColorSet = ReturnType<typeof useAgrisaColors>["colors"];

// Section Title Component - Không có số thứ tự
const SectionTitle = ({
  title,
  icon: Icon,
  colors,
}: {
  title: string;
  icon: any;
  colors: ColorSet;
}) => (
  <HStack space="sm" alignItems="center">
    <Box
      bg={colors.primary}
      borderRadius="$md"
      p="$2"
      alignItems="center"
      justifyContent="center"
    >
      <Icon size={20} color={colors.primary_white_text} strokeWidth={2.5} />
    </Box>
    <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
      {title}
    </Text>
  </HStack>
);

// 1. Product Info Card - Cập nhật để thêm Document Section và Insurance Partner
const ProductInfoCard = ({
  policy,
  document,
  partnerData,
  partnerLoading,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  document: PolicyDocument;
  partnerData: InsurancePartnerResponse;
  partnerLoading: boolean;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card_surface}
    borderWidth={1}
    borderColor={colors.frame_border}
    borderRadius="$xl"
    overflow="hidden"
    sx={{
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    <VStack space="md" p="$4">
      {/* Product Name */}
      <VStack space="xs">
        <Text
          fontSize="$xl"
          fontWeight="$bold"
          color={colors.primary_text}
          lineHeight="$xl"
        >
          {policy.product_name}
        </Text>
        <Text fontSize="$xs" color={colors.secondary_text}>
          Mã sản phẩm: {policy.product_code}
        </Text>
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* Insurance Partner */}
      <VStack space="xs">
        <HStack space="xs" alignItems="center">
          <Building2 size={14} color={colors.primary} strokeWidth={2} />
          <Text
            fontSize="$xs"
            color={colors.secondary_text}
            fontWeight="$medium"
          >
            Nhà bảo hiểm
          </Text>
        </HStack>
        {partnerLoading ? (
          <HStack space="sm" alignItems="center">
            <Spinner size="small" color={colors.primary} />
            <Text fontSize="$sm" color={colors.muted_text}>
              Đang tải thông tin...
            </Text>
          </HStack>
        ) : (
          <Box
            borderWidth={1}
            borderColor={colors.frame_border}
            borderRadius="$lg"
            p="$3"
          >
            <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
              {partnerData?.data?.partner_display_name ||
                policy.insurance_provider_id}
            </Text>
          </Box>
        )}
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* Description */}
      <VStack space="xs">
        <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
          Mô tả chi tiết gói
        </Text>
        <Text fontSize="$sm" color={colors.primary_text} lineHeight="$lg">
          {policy.product_description}
        </Text>
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* 🆕 POLICY DOCUMENT SECTION */}
      <PolicyDocumentSection document={document} colors={colors} />

      <Divider bg={colors.frame_border} />

      {/* Footer: Crop Type & Status */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
            Loại cây bảo hiểm
          </Text>
          <HStack space="xs" alignItems="center">
            <Box bg={colors.successSoft} borderRadius="$md" p="$2">
              <Leaf size={16} color={colors.primary} strokeWidth={2.5} />
            </Box>
            <Text fontSize="$sm" fontWeight="$bold" color={colors.primary}>
              {Utils.getCropLabel(policy.crop_type)}
            </Text>
          </HStack>
        </VStack>

        <VStack alignItems="flex-end">
          <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
            Tình trạng hiện tại
          </Text>
          <StatusBadge status={policy.status} colors={colors} />
        </VStack>
      </HStack>

      {/* Updated At - Moved to bottom */}
      <Box pt="$2" borderTopWidth={1} borderTopColor={colors.frame_border}>
        <Text fontSize="$2xs" color={colors.muted_text} textAlign="center">
          Cập nhật lần cuối:{" "}
          {Utils.formatVietnameseDate(new Date(policy.updated_at))}
        </Text>
      </Box>
    </VStack>
  </Box>
);

// 🆕 POLICY DOCUMENT SECTION COMPONENT
const PolicyDocumentSection = ({
  document,
  colors,
}: {
  document: PolicyDocument;
  colors: ColorSet;
}) => {
  const handleOpenDocument = async () => {
    try {
      if (!document.presigned_url) {
        Alert.alert("Lỗi", "Không tìm thấy đường dẫn tài liệu");
        return;
      }

      // Kiểm tra xem URL có thể mở được không
      const canOpen = await Linking.canOpenURL(document.presigned_url);

      if (canOpen) {
        await Linking.openURL(document.presigned_url);
      } else {
        Alert.alert(
          "Không thể mở tài liệu",
          "Vui lòng kiểm tra ứng dụng đọc PDF trên thiết bị của bạn"
        );
      }
    } catch (error) {
      console.error("Error opening document:", error);
      Alert.alert("Lỗi", "Không thể mở tài liệu. Vui lòng thử lại sau.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatExpiryDate = (expiryString: string) => {
    try {
      const date = new Date(expiryString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return expiryString;
    }
  };

  // Trường hợp KHÔNG CÓ tài liệu
  if (!document.has_document) {
    return (
      <Box
        bg={colors.warningSoft}
        borderWidth={1}
        borderColor={colors.warning}
        borderRadius="$lg"
        p="$3"
      >
        <HStack space="sm" alignItems="center">
          <Box bg={colors.warning} borderRadius="$full" p="$2">
            <FileText
              size={18}
              color={colors.primary_white_text}
              strokeWidth={2.5}
            />
          </Box>
          <VStack flex={1}>
            <Text fontSize="$sm" fontWeight="$bold" color={colors.warning}>
              Chưa có hợp đồng gốc
            </Text>
            <Text fontSize="$xs" color={colors.warning} mt="$0.5">
              Tài liệu hợp đồng đang được cập nhật
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  }

  // Trường hợp CÓ tài liệu
  return (
    <VStack space="xs">
      <HStack space="xs" alignItems="center" mb="$1">
        <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
          Hợp đồng gốc
        </Text>
      </HStack>

      <Pressable onPress={handleOpenDocument}>
        <Box
          bg={colors.primarySoft}
          borderWidth={1}
          borderColor={colors.primary}
          borderRadius="$lg"
          p="$3"
          sx={{
            ":active": {
              opacity: 0.8,
            },
          }}
        >
          <HStack space="sm" alignItems="center" justifyContent="space-between">
            {/* Left: File Icon & Info */}
            <HStack space="sm" alignItems="center" flex={1}>
              <Box bg={colors.primary} borderRadius="$md" p="$2">
                <FileText
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
              <VStack flex={1}>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_text}
                  numberOfLines={1}
                >
                  {document.object_name || "Hợp đồng bảo hiểm.pdf"}
                </Text>
                <HStack space="xs" alignItems="center" mt="$0.5">
                  <Text fontSize="$2xs" color={colors.muted_text}>
                    {formatFileSize(document.file_size_bytes)}
                  </Text>
                  <Text fontSize="$2xs" color={colors.muted_text}>
                    • PDF
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Right: Action Button */}
            <Box bg={colors.primary} borderRadius="$full" p="$2">
              <ExternalLink
                size={18}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
          </HStack>

          {/* Expiry Warning */}
          {document.presigned_url_expiry && (
            <HStack
              space="xs"
              alignItems="center"
              mt="$2"
              pt="$2"
              borderTopWidth={1}
              borderTopColor={colors.frame_border}
            >
              <Clock size={12} color={colors.muted_text} strokeWidth={2} />
              <Text fontSize="$2xs" color={colors.muted_text}>
                Hợp đồng mẫu sẽ hết hạn vào lúc: {formatExpiryDate(document.presigned_url_expiry)}
              </Text>
            </HStack>
          )}
        </Box>
      </Pressable>

      {/* Helper Text */}
      <HStack space="xs" alignItems="flex-start" mt="$1">
        <Text
          fontSize="$2xs"
          color={colors.muted_text}
          flex={1}
          lineHeight="$sm"
        >
          Nhấn vào để xem hợp đồng chi tiết. Tài liệu sẽ được mở trong trình
          duyệt hoặc ứng dụng đọc PDF.
        </Text>
      </HStack>
    </VStack>
  );
};

// 2. Cost & Payout Grid - THIẾT KẾ LABEL TRÁI, VALUE PHẢI
const CostPayoutGrid = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => (
  <VStack space="md">
    {/* 💰 PHÍ BẢO HIỂM */}
    <Box
      bg={colors.card_surface}
      borderWidth={1}
      borderColor={colors.frame_border}
      borderRadius="$xl"
      p="$4"
    >
      <VStack space="sm">
        <Text fontSize="$md" fontWeight="$bold" color={colors.primary}>
          Thanh toán phí bảo hiểm
        </Text>
        <Divider bg={colors.frame_border} />

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Số tiền thanh toán
          </Text>
          <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
            {Utils.formatCurrency(policy.fix_premium_amount)} /{" "}
            {policy.is_per_hectare ? "hecta" : "Phí cố định"}
          </Text>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Tỷ lệ cơ bản
          </Text>
          <Text
            fontSize="$md"
            fontWeight="$semibold"
            color={colors.primary_text}
          >
            {policy.premium_base_rate * 100}%
          </Text>
        </HStack>
      </VStack>
    </Box>

    {/* 💎 QUYỀN LỢI BỒI THƯỜNG */}
    <Box
      bg={colors.card_surface}
      borderWidth={1}
      borderColor={colors.frame_border}
      borderRadius="$xl"
      p="$4"
    >
      <VStack space="sm">
        <Text fontSize="$md" fontWeight="$bold" color={colors.success}>
          Quyền lợi bồi thường
        </Text>
        <Divider bg={colors.frame_border} />

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Bồi thường từ
          </Text>
          <Text fontSize="$md" fontWeight="$bold">
            {Utils.formatCurrency(policy.fix_payout_amount)} -{" "}
            {Utils.formatCurrency(policy.payout_cap)}{" "}
            {policy.is_payout_per_hectare ? "/hecta" : "Tổng cộng"}
          </Text>
        </HStack>

        

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Tỷ lệ bồi thường
          </Text>
          <Text
            fontSize="$md"
            fontWeight="$semibold"
            color={colors.primary_text}
          >
            {(policy.payout_base_rate * 100).toFixed(0)}%
          </Text>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Chỉ số vượt ngưỡng
          </Text>
          <Text fontSize="$md" fontWeight="$semibold" color={colors.warning}>
            ×{policy.over_threshold_multiplier}
          </Text>
        </HStack>
      </VStack>
    </Box>

    {/* 📋 CHÍNH SÁCH */}
    <Box
      bg={colors.card_surface}
      borderWidth={1}
      borderColor={colors.frame_border}
      borderRadius="$xl"
      p="$4"
    >
      <VStack space="sm">
        <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
          Chính sách linh hoạt
        </Text>
        <Divider bg={colors.frame_border} />

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Hoàn phí khi hủy
          </Text>
          <Text
            fontSize="$md"
            fontWeight="$semibold"
            color={colors.primary_text}
          >
            {policy.cancel_premium_rate > 0
              ? `${(policy.cancel_premium_rate * 100).toFixed(0)}%`
              : "Không hoàn phí"}
          </Text>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$sm" color={colors.secondary_text}>
            Giảm giá gia hạn
          </Text>
          <HStack space="xs" alignItems="center">
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              {policy.renewal_discount_rate > 0
                ? `${(policy.renewal_discount_rate * 100).toFixed(0)}%`
                : "Không giảm giá"}
            </Text>
            {policy.auto_renewal && (
              <Badge bg={colors.successSoft} borderRadius="$full" size="sm">
                <BadgeText
                  color={colors.success}
                  fontSize="$2xs"
                  fontWeight="$bold"
                >
                  Tự động
                </BadgeText>
              </Badge>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Box>
  </VStack>
);

// 3. Timeline Card
const TimelineCard = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card_surface}
    borderWidth={1}
    borderColor={colors.frame_border}
    borderRadius="$xl"
    p="$4"
  >
    <VStack space="md">
      {/* Coverage Duration */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="sm" alignItems="center" flex={1}>
          <Box bg={colors.primarySoft} borderRadius="$md" p="$2">
            <Clock size={16} color={colors.success} strokeWidth={2} />
          </Box>
          <VStack flex={1}>
            <Text fontSize="$xs" color={colors.secondary_text}>
              Thời hạn bảo hiểm
            </Text>
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              {Utils.formatDuration(policy.coverage_duration_days)}
            </Text>
          </VStack>
        </HStack>
        <Text fontSize="$xs" color={colors.muted_text}>
          ({policy.coverage_duration_days} ngày)
        </Text>
      </HStack>

      <Divider bg={colors.frame_border} />

      {/* Enrollment Period */}
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Box bg={colors.primarySoft} borderRadius="$md" p="$2">
            <Calendar size={16} color={colors.success} strokeWidth={2} />
          </Box>
          <Text fontSize="$xs" color={colors.secondary_text}>
            Thời gian đăng ký
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center" ml="$10">
          <VStack>
            <Text fontSize="$2xs" color={colors.muted_text}>
              Bắt đầu
            </Text>
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Ngày {Utils.formatDateForMS(policy.enrollment_start_day)}
            </Text>
          </VStack>
          <Text fontSize="$lg" color={colors.muted_text}>
            →
          </Text>
          <VStack alignItems="flex-end">
            <Text fontSize="$2xs" color={colors.muted_text}>
              Kết thúc
            </Text>
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Ngày {Utils.formatDateForMS(policy.enrollment_end_day)}
            </Text>
          </VStack>
        </HStack>
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* Insurance Valid Period */}
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Box bg={colors.successSoft} borderRadius="$md" p="$2">
            <Shield size={16} color={colors.success} strokeWidth={2} />
          </Box>
          <Text fontSize="$xs" color={colors.secondary_text}>
            Thời gian bảo hiểm hiệu lực
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center" ml="$10">
          <VStack>
            <Text fontSize="$2xs" color={colors.muted_text}>
              Có hiệu lực từ
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.success}>
              Ngày {Utils.formatDateForMS(policy.insurance_valid_from_day)}
            </Text>
          </VStack>
          <Text fontSize="$lg" color={colors.muted_text}>
            →
          </Text>
          <VStack alignItems="flex-end">
            <Text fontSize="$2xs" color={colors.muted_text}>
              Hết hiệu lực
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.success}>
              Ngày {Utils.formatDateForMS(policy.insurance_valid_to_day)}
            </Text>
          </VStack>
        </HStack>
       
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* Max Premium Payment Extension */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="sm" alignItems="center" flex={1}>
          <Box bg={colors.warningSoft} borderRadius="$md" p="$2">
            <Clock size={16} color={colors.warning} strokeWidth={2} />
          </Box>
          <VStack flex={1}>
            <Text fontSize="$xs" color={colors.secondary_text}>
              Thời gian gia hạn thanh toán tối đa
            </Text>
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              {policy.max_premium_payment_prolong} ngày
            </Text>
          </VStack>
        </HStack>
      </HStack>
    </VStack>
  </Box>
);

// FAQ Section Component - Thu gọn lại, tập trung vào các câu hỏi quan trọng
const FAQSection = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: "payout-calculation",
      question: "Tôi sẽ nhận được bao nhiêu tiền bồi thường?",
      answer: `Số tiền bồi thường phụ thuộc vào mức độ rủi ro:\n\n📌 MỨC CƠ BẢN (Điều kiện thường):\n${Utils.formatCurrency(policy.fix_payout_amount)}${policy.is_payout_per_hectare ? " / hecta rủi ro" : " (tổng số tiền)"}\n• Áp dụng khi đạt điều kiện kích hoạt bình thường\n• Đây là mức bồi thường tiêu chuẩn\n\n🔥 MỨC TỐI ĐA (Vượt ngưỡng nghiêm trọng):\n${Utils.formatCurrency(policy.payout_cap)}${policy.is_payout_per_hectare ? " / hecta rủi ro" : " (tổng số tiền)"}\n• Áp dụng khi rủi ro VỰA đạt điều kiện bình thường VỪA vượt ngưỡng nghiêm trọng\n• Công thức: ${Utils.formatCurrency(policy.fix_payout_amount)} × ${policy.over_threshold_multiplier} = ${Utils.formatCurrency(policy.payout_cap)}\n\n💡 Ví dụ thực tế:\n• Nếu ruộng lúa của bạn ${policy.is_payout_per_hectare ? "5 hecta" : ""} bị hạn hán nhẹ → Nhận ${policy.is_payout_per_hectare ? Utils.formatCurrency(policy.fix_payout_amount * 5) : Utils.formatCurrency(policy.fix_payout_amount)}\n• Nếu ${policy.is_payout_per_hectare ? "cùng diện tích" : "ruộng"} bị hạn hán nặng (vượt ngưỡng) → Nhận ${policy.is_payout_per_hectare ? Utils.formatCurrency(policy.payout_cap * 5) : Utils.formatCurrency(policy.payout_cap)}\n\n⚡ Lưu ý:\n${policy.is_payout_per_hectare ? "• Số tiền cuối cùng = Mức bồi thường × Diện tích rủi ro thực tế\n" : ""}• Bồi thường được chi trả TỰ ĐỘNG khi hệ thống phát hiện rủi ro qua vệ tinh\n• Không cần nộp đơn yêu cầu hay chờ thẩm định`,
      icon: TrendingUp,
      color: colors.success,
    },
    {
      id: "ndmi",
      question: "NDMI (Chỉ số độ ẩm) là gì?",
      answer:
        "NDMI (Normalized Difference Moisture Index) là chỉ số đo độ ẩm của đất và cây trồng thông qua ảnh vệ tinh.\n\n🌱 Giá trị NDMI:\n• 0.4 - 1.0: Độ ẩm tốt, cây khỏe mạnh\n• 0.2 - 0.4: Độ ẩm trung bình, cần theo dõi\n• < 0.2: Thiếu nước nghiêm trọng, nguy cơ hạn hán\n\n💧 Ứng dụng:\n• Phát hiện sớm hạn hán\n• Theo dõi sức khỏe cây trồng\n• Đánh giá nhu cầu tưới tiêu\n\n⚠️ Lưu ý: NDMI thấp kéo dài có thể dẫn đến rủi ro cây trồng và kích hoạt bảo hiểm.",
      icon: Database,
      color: colors.info,
    },
    {
      id: "ndvi",
      question: "NDVI (Chỉ số thực vật) là gì?",
      answer:
        "NDVI (Normalized Difference Vegetation Index) là chỉ số đo mức độ xanh tươi và sức khỏe của cây trồng.\n\n🌾 Giá trị NDVI:\n• 0.6 - 0.9: Cây rất khỏe, sinh trưởng tốt\n• 0.3 - 0.6: Cây khỏe mạnh bình thường\n• 0.1 - 0.3: Cây yếu, thiếu dinh dưỡng\n• < 0.1: Đất trống hoặc cây chết\n\n📊 Ứng dụng:\n• Đánh giá sinh trưởng cây trồng\n• Phát hiện sâu bệnh\n• Dự đoán năng suất\n• Theo dõi giai đoạn phát triển\n\n✅ NDVI giảm đột ngột cho thấy cây bị stress hoặc rủi ro.",
      icon: Leaf,
      color: colors.success,
    },
    {
      id: "ndwi",
      question: "NDWI (Chỉ số nước) là gì?",
      answer:
        "NDWI (Normalized Difference Water Index) là chỉ số đo lượng nước trong cây và độ ẩm bề mặt.\n\n💦 Giá trị NDWI:\n• > 0.3: Nhiều nước, nguy cơ úng lụt\n• 0.0 - 0.3: Độ ẩm bình thường\n• -0.3 - 0.0: Khô, cần tưới\n• < -0.3: Rất khô, hạn hán\n\n🎯 Sử dụng cho:\n• Phát hiện ngập lụt\n• Giám sát nguồn nước tưới\n• Đánh giá stress do thiếu nước\n• Quản lý tưới tiêu hiệu quả\n\n⚡ Kết hợp NDWI với NDMI cho đánh giá chính xác hơn về tình trạng nước.",
      icon: TrendingUp,
      color: colors.info,
    },
    {
      id: "evi",
      question: "EVI (Chỉ số thực vật nâng cao) là gì?",
      answer:
        "EVI (Enhanced Vegetation Index) là phiên bản cải tiến của NDVI, chính xác hơn ở vùng cây trồng dày đặc.\n\n🌿 Ưu điểm EVI:\n• Giảm nhiễu từ đất và khí quyển\n• Chính xác hơn với cây trồng rậm\n• Phân biệt tốt các mức độ xanh\n• Phù hợp cho vùng nhiệt đới\n\n📈 Giá trị EVI:\n• 0.5 - 0.8: Cây rất tốt\n• 0.3 - 0.5: Sinh trưởng bình thường\n• 0.1 - 0.3: Cây yếu\n• < 0.1: Không có cây hoặc cây chết\n\n🔬 EVI thường dùng cho lúa nước, cà phê, và cây trồng nhiệt đới.",
      icon: Leaf,
      color: colors.success,
    },
    {
      id: "savi",
      question: "SAVI (Chỉ số thực vật điều chỉnh đất) là gì?",
      answer:
        "SAVI (Soil-Adjusted Vegetation Index) là chỉ số NDVI được điều chỉnh để giảm ảnh hưởng của đất.\n\n🏜️ Đặc điểm SAVI:\n• Loại bỏ nhiễu từ màu sắc đất\n• Chính xác ở vùng cây thưa\n• Phù hợp giai đoạn đầu mùa\n• Hữu ích cho đất trống một phần\n\n📊 Khi nào dùng SAVI:\n• Cây non mới trồng\n• Cây trồng cách xa nhau\n• Đất có màu sáng hoặc tối\n• Giai đoạn đầu sinh trưởng\n\n✨ SAVI giúp đánh giá chính xác ngay cả khi diện tích lá còn ít.",
      icon: Database,
      color: colors.info,
    },
    {
      id: "trigger",
      question: "Trigger (Bộ kích hoạt) là gì?",
      answer:
        "Trigger là tập hợp các điều kiện cần thiết để bảo hiểm tự động chi trả. Mỗi gói bảo hiểm có thể có nhiều trigger áp dụng cho các giai đoạn khác nhau của cây trồng. Khi tất cả điều kiện trong trigger được đáp ứng, hệ thống sẽ tự động kích hoạt chi trả bồi thường.",
      icon: Shield,
      color: colors.success,
    },
    {
      id: "condition",
      question: "Điều kiện (Condition) hoạt động như thế nào?",
      answer:
        "Điều kiện là tiêu chí cụ thể cần đạt được để trigger kích hoạt. Ví dụ: 'Lượng mưa trung bình trong 7 ngày < 10mm'. Mỗi điều kiện sẽ được hệ thống giám sát liên tục thông qua dữ liệu vệ tinh và các cảm biến thời tiết.",
      icon: FileCheck,
      color: colors.info,
    },
    {
      id: "aggregation-window",
      question: "Thời gian theo dõi (Aggregation Window) là gì?",
      answer:
        "Thời gian theo dõi là khoảng thời gian hệ thống thu thập và tính toán dữ liệu để đánh giá điều kiện.\n\n⏱️ Ví dụ:\n• 'Trung bình 7 ngày' = Thu thập dữ liệu liên tục 7 ngày rồi tính trung bình\n• 'Tối đa 14 ngày' = Lấy giá trị cao nhất trong 14 ngày\n• 'Tổng 30 ngày' = Cộng tổng các giá trị trong 30 ngày\n\n🎯 Mục đích:\n• Tránh kích hoạt nhầm do biến động ngắn hạn\n• Đảm bảo rủi ro thực sự nghiêm trọng\n• Phản ánh chính xác tình trạng thực tế\n\n📌 Thời gian càng dài, điều kiện càng khắt khe nhưng càng đáng tin cậy.",
      icon: Clock,
      color: colors.primary,
    },
    {
      id: "validation-window",
      question: "Thời gian xác minh (Validation Window) là gì?",
      answer:
        "Thời gian xác minh là khoảng thời gian bổ sung sau khi đạt ngưỡng để kiểm tra lại tình trạng.\n\n🔍 Cách hoạt động:\n1. Điều kiện đạt ngưỡng (VD: NDMI < 0.2 trong 7 ngày)\n2. Hệ thống chờ thêm thời gian xác minh (VD: 3 ngày)\n3. Kiểm tra lại: Tình trạng có duy trì không?\n4. Nếu CÓ → Xác nhận rủi ro, chi trả\n   Nếu KHÔNG → Hủy kích hoạt (do phục hồi)\n\n✅ Lợi ích:\n• Tránh chi trả nhầm do biến động tạm thời\n• Đảm bảo rủi ro thực sự xảy ra\n• Bảo vệ cả nông dân và công ty bảo hiểm\n\n⏳ Thường từ 1-5 ngày tùy loại rủi ro.",
      icon: CheckCircle2,
      color: colors.success,
    },
    {
      id: "baseline-comparison",
      question: "Dữ liệu so sánh (Baseline) là gì?",
      answer:
        "Dữ liệu so sánh là giá trị tham chiếu từ cùng kỳ năm trước để đánh giá mức độ bất thường.\n\n📊 Cách tính:\n• Lấy dữ liệu cùng thời điểm năm trước\n• Tính toán giá trị trung bình/trung vị\n• So sánh với giá trị hiện tại\n• Đánh giá mức độ sai lệch\n\n🎯 Ví dụ thực tế:\n'NDVI năm nay = 0.3, cùng kỳ năm trước = 0.6'\n→ Giảm 50%, cho thấy cây yếu hơn bình thường\n→ Có thể do hạn hán, sâu bệnh\n\n✨ Giúp phát hiện bất thường chính xác hơn so với chỉ dùng ngưỡng cố định.",
      icon: TrendingUp,
      color: colors.info,
    },
    {
      id: "logic-operator",
      question: "AND và OR khác nhau thế nào?",
      answer:
        "AND: Tất cả các điều kiện phải đạt được cùng lúc. VD: Nhiệt độ > 35°C VÀ Độ ẩm < 40%.\n\nOR: Chỉ cần 1 trong các điều kiện đạt là đủ để kích hoạt. VD: Lượng mưa < 10mm HOẶC Không mưa trong 14 ngày liên tiếp.",
      icon: HelpCircle,
      color: colors.warning,
    },
    {
      id: "growth-stage",
      question: "Giai đoạn sinh trưởng ảnh hưởng gì đến bảo hiểm?",
      answer:
        "Mỗi giai đoạn phát triển của cây trồng (nảy mầm, cây con, sinh trưởng, ra hoa, đậu quả, chín, thu hoạch) có các rủi ro khác nhau. Bảo hiểm sẽ áp dụng các điều kiện kích hoạt phù hợp với từng giai đoạn để đảm bảo bảo vệ tối ưu.",
      icon: Leaf,
      color: colors.success,
    },
    {
      id: "early-warning",
      question: "Cảnh báo sớm giúp gì cho tôi?",
      answer:
        "Ngưỡng cảnh báo sớm được đặt trước ngưỡng kích hoạt chính. Khi đạt ngưỡng này, bạn sẽ nhận thông báo để có thời gian chuẩn bị biện pháp ứng phó, giảm thiểu rủi ro trước khi tình huống trở nên nghiêm trọng.",
      icon: AlertTriangle,
      color: colors.warning,
    },
    {
      id: "consecutive",
      question: "Yêu cầu liên tiếp nghĩa là gì?",
      answer:
        "Một số điều kiện yêu cầu hiện tượng xấu phải xảy ra liên tục không gián đoạn. VD: 'Không mưa trong 14 ngày liên tiếp' - nếu có 1 ngày mưa ở giữa thì đếm lại từ đầu. Điều này đảm bảo chỉ chi trả cho rủi ro thực sự nghiêm trọng.",
      icon: TrendingUp,
      color: colors.error,
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <VStack space="xs">
      <HStack space="sm" alignItems="center" mb="$2">
        <HelpCircle size={18} color={colors.info} strokeWidth={2} />
        <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
          Câu hỏi thường gặp
        </Text>
      </HStack>

      {faqs.map((faq) => {
        const isExpanded = expandedFAQ === faq.id;
        const IconComponent = faq.icon;

        return (
          <Box
            key={faq.id}
            bg={colors.card_surface}
            borderWidth={1}
            borderColor={isExpanded ? faq.color : colors.frame_border}
            borderRadius="$lg"
            overflow="hidden"
          >
            <Pressable onPress={() => toggleFAQ(faq.id)}>
              <HStack
                space="sm"
                alignItems="center"
                justifyContent="space-between"
                px="$3"
                py="$3"
              >
                <HStack space="sm" alignItems="center" flex={1}>
                  <Box
                    bg={isExpanded ? faq.color : colors.background}
                    borderRadius="$md"
                    p="$1.5"
                  >
                    <IconComponent
                      size={16}
                      color={isExpanded ? "#fff" : faq.color}
                      strokeWidth={2}
                    />
                  </Box>
                  <Text
                    fontSize="$sm"
                    fontWeight={isExpanded ? "$bold" : "$medium"}
                    color={isExpanded ? faq.color : colors.primary_text}
                    flex={1}
                    lineHeight="$md"
                  >
                    {faq.question}
                  </Text>
                </HStack>
                <Box
                  bg={isExpanded ? `${faq.color}15` : colors.background}
                  borderRadius="$full"
                  p="$1"
                >
                  {isExpanded ? (
                    <ChevronUp size={16} color={faq.color} strokeWidth={2.5} />
                  ) : (
                    <ChevronDown
                      size={16}
                      color={colors.secondary_text}
                      strokeWidth={2.5}
                    />
                  )}
                </Box>
              </HStack>
            </Pressable>

            {isExpanded && (
              <Box
                px="$3"
                pb="$3"
                pt="$2"
                borderTopWidth={1}
                borderTopColor={colors.frame_border}
                bg={`${faq.color}05`}
              >
                <Text
                  fontSize="$xs"
                  color={colors.primary_text}
                  lineHeight="$lg"
                >
                  {faq.answer}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

// Technical Info - Thông tin kỹ thuật đơn giản
const TechnicalInfoCard = ({
  metadata,
  colors,
}: {
  metadata: PolicyDetailResponse["metadata"];
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card_surface}
    borderWidth={1}
    borderColor={colors.frame_border}
    borderRadius="$xl"
    p="$4"
  >
    <VStack space="md">
      {/* Trigger & Condition Count */}
      <HStack justifyContent="space-around" alignItems="center">
        <VStack alignItems="center" flex={1}>
          <Box bg={colors.successSoft} borderRadius="$full" p="$3" mb="$2">
            <Shield size={24} color={colors.success} strokeWidth={2} />
          </Box>
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
            {metadata.total_triggers}
          </Text>
          <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
            Bộ kích hoạt
          </Text>
        </VStack>

        <Box w="$0.5" h="$16" bg={colors.frame_border} />

        <VStack alignItems="center" flex={1}>
          <Box bg={colors.primarySoft} borderRadius="$full" p="$3" mb="$2">
            <FileCheck size={24} color={colors.primary} strokeWidth={2} />
          </Box>
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary}>
            {metadata.total_conditions}
          </Text>
          <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
            Điều kiện giám sát
          </Text>
        </VStack>

        <Box w="$0.5" h="$16" bg={colors.frame_border} />

        <VStack alignItems="center" flex={1}>
          <Box bg={colors.infoSoft} borderRadius="$full" p="$3" mb="$2">
            <Database size={24} color={colors.info} strokeWidth={2} />
          </Box>
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.info}>
            {metadata.data_source_count}
          </Text>
          <Text fontSize="$xs" color={colors.secondary_text} textAlign="center">
            Nguồn dữ liệu
          </Text>
        </VStack>
      </HStack>

      <Divider bg={colors.frame_border} />

      {/* Description */}
      <Box borderRadius="$lg">
        <HStack space="sm" alignItems="flex-start">
          <Text
            fontSize="$xs"
            color={colors.primary_text}
            lineHeight="$lg"
            flex={1}
          >
            Chương trình bảo hiểm này sử dụng {metadata.data_source_count} nguồn
            dữ liệu vệ tinh và cảm biến để giám sát {metadata.total_conditions}{" "}
            điều kiện khác nhau. Hệ thống tự động phát hiện rủi ro và chi trả
            bồi thường.
          </Text>
        </HStack>
      </Box>
    </VStack>
  </Box>
);

// 4. Trigger Card Component - Hiển thị chi tiết trigger và điều kiện
const TriggerCard = ({
  trigger,
  index,
  isExpanded,
  onToggle,
  colors,
}: {
  trigger: PolicyDetailResponse["triggers"][0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colors: ColorSet;
}) => {
  // Lấy màu theo logical operator
  const operatorColor =
    trigger.logical_operator === "AND" ? colors.success : colors.info;

  return (
    <Box
      bg={colors.card_surface}
      borderWidth={1}
      borderColor={isExpanded ? operatorColor : colors.frame_border}
      borderRadius="$xl"
      overflow="hidden"
    >
      {/* Header - Có thể bấm để expand/collapse */}
      <Pressable onPress={onToggle}>
        <Box
          px="$4"
          py="$3"
          bg={isExpanded ? `${operatorColor}10` : "transparent"}
        >
          <HStack space="sm" alignItems="center" justifyContent="space-between">
            {/* Left: Trigger Info */}
            <HStack space="sm" alignItems="center" flex={1}>
              <VStack flex={1}>
                <HStack space="xs" alignItems="center">
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    Giai đoạn: {trigger.growth_stage}
                  </Text>
                </HStack>
                <HStack space="xs" alignItems="center" mt="$0.5">
                  <Badge bg={operatorColor} borderRadius="$full" size="sm">
                    <BadgeText color="#fff" fontSize="$2xs" fontWeight="$bold">
                      {trigger.logical_operator}
                    </BadgeText>
                  </Badge>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    {trigger.conditions.length} điều kiện giám sát
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Right: Expand Icon */}
            <Box
              bg={isExpanded ? operatorColor : colors.background}
              borderRadius="$full"
              p="$1.5"
            >
              {isExpanded ? (
                <ChevronUp size={18} color="#fff" strokeWidth={2.5} />
              ) : (
                <ChevronDown
                  size={18}
                  color={colors.secondary_text}
                  strokeWidth={2.5}
                />
              )}
            </Box>
          </HStack>

          {/* Monitor Info */}
          {!isExpanded && (
            <HStack space="xs" alignItems="center" mt="$2">
              <Clock size={14} color={colors.muted_text} strokeWidth={2} />
              <Text fontSize="$xs" color={colors.muted_text}>
                Giám sát mỗi {trigger.monitor_interval}{" "}
                {Utils.getFrequencyLabel(trigger.monitor_frequency_unit)}
              </Text>
            </HStack>
          )}
        </Box>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <VStack space="sm" px="$4" pb="$4">
          <Divider bg={colors.frame_border} />

          {/* Monitor Info Detail */}
          <VStack space="xs">
            <HStack space="sm" alignItems="center">
              <Clock size={16} color={colors.info} strokeWidth={2} />
              <Text
                fontSize="$xs"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                Tần suất giám sát
              </Text>
            </HStack>
            <Text fontSize="$sm" color={colors.secondary_text} ml="$6">
              Kiểm tra mỗi {trigger.monitor_interval}{" "}
              {Utils.getFrequencyLabel(trigger.monitor_frequency_unit)} trong
              suốt giai đoạn này
            </Text>
          </VStack>

          {/* Blackout Periods */}
          {trigger.blackout_periods &&
            trigger.blackout_periods.periods &&
            trigger.blackout_periods.periods.length > 0 && (
              <>
                <Divider bg={colors.frame_border} />
                <VStack space="xs">
                  <HStack space="sm" alignItems="center">
                    <AlertTriangle
                      size={16}
                      color={colors.warning}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$xs"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      Thời gian tạm ngưng bảo hiểm
                    </Text>
                  </HStack>
                  <VStack space="xs" ml="$6">
                    {trigger.blackout_periods.periods.map((period, index) => (
                      <Box
                        key={index}
                        bg={colors.warningSoft}
                        borderRadius="$md"
                        p="$2"
                      >
                        <Text fontSize="$sm" color={colors.primary_text}>
                          Từ {period.start} đến {period.end}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </>
            )}

          {/* Conditions List */}
          <Divider bg={colors.frame_border} />
          <VStack space="xs">
            <HStack space="sm" alignItems="center">
              <FileCheck size={16} color={colors.success} strokeWidth={2} />
              <Text
                fontSize="$xs"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                Các điều kiện kích hoạt
              </Text>
            </HStack>

            <VStack space="xs" mt="$1">
              {trigger.conditions.map((condition, condIdx) => (
                <ConditionItem
                  key={condition.id}
                  condition={condition}
                  index={condIdx}
                  logicalOperator={trigger.logical_operator}
                  isLast={condIdx === trigger.conditions.length - 1}
                  colors={colors}
                />
              ))}
            </VStack>
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

// 5. Condition Item Component - Gọn gàng, rõ ràng
const ConditionItem = ({
  condition,
  index,
  logicalOperator,
  isLast,
  colors,
}: {
  condition: PolicyDetailResponse["triggers"][0]["conditions"][0];
  index: number;
  logicalOperator: "AND" | "OR";
  isLast: boolean;
  colors: ColorSet;
}) => {
  const { getDataSourceByID } = useDataSource();
  const { data: dataSourceData, isLoading: dataSourceLoading } =
    getDataSourceByID(condition.data_source_id);

  const dataSource = dataSourceData?.data;
  const operatorColor =
    logicalOperator === "AND" ? colors.success : colors.info;

  // Helper để hiển thị đơn vị - ẩn với NDMI, NDWI, EVI và các chỉ số khác
  const formatUnit = (unit?: string, paramName?: string) => {
    // Danh sách các parameter không cần hiển thị đơn vị
    const indexParams = ["ndmi", "ndwi", "evi", "ndvi", "savi"];

    if (!unit || unit === "index") return "";
    if (paramName && indexParams.includes(paramName.toLowerCase())) return "";

    return ` ${unit}`;
  };

  return (
    <Box>
      <HStack space="sm" alignItems="flex-start">
        {/* Number Badge */}
        <Box
          bg={colors.primary}
          borderRadius="$full"
          w="$6"
          h="$6"
          alignItems="center"
          justifyContent="center"
          mt="$0.5"
        >
          <Text
            fontSize="$2xs"
            fontWeight="$bold"
            color={colors.primary_white_text}
          >
            {index + 1}
          </Text>
        </Box>

        {/* Condition Content */}
        <VStack flex={1} space="sm">
          {/* Main Condition Card */}
          <Box
            bg={colors.card_surface}
            borderWidth={1}
            borderColor={colors.frame_border}
            borderRadius="$xl"
            overflow="hidden"
          >
            <VStack space="sm">
              {/* 📊 NGUỒN DỮ LIỆU - Compact Header */}
              <Box bg={colors.frame_border} borderRadius="$lg" p="$3.5">
                {dataSourceLoading ? (
                  <HStack space="sm" alignItems="center">
                    <Spinner size="small" color="#fff" />
                    <Text fontSize="$sm" color="#fff">
                      Đang tải...
                    </Text>
                  </HStack>
                ) : dataSource ? (
                  <VStack space="xs">
                    <HStack space="sm" alignItems="center">
                      <Text
                        fontSize="$lg"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {dataSource.display_name_vi}
                      </Text>
                      {dataSource.parameter_name && (
                        <Badge
                          bg={colors.primary}
                          borderRadius="$md"
                          px="$2"
                          py="$0.5"
                        >
                          <BadgeText
                            color={colors.primary_white_text}
                            fontSize="$xs"
                            fontWeight="$bold"
                          >
                            {dataSource.parameter_name.toUpperCase()}
                          </BadgeText>
                        </Badge>
                      )}
                    </HStack>
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      opacity={0.9}
                      lineHeight="$md"
                    >
                      {dataSource.description_vi}
                    </Text>
                  </VStack>
                ) : null}
              </Box>

              {/* 🎯 ĐIỀU KIỆN KÍCH HOẠT */}
              <VStack space="xs" px="$2">
                <Text
                  fontSize="$2xs"
                  fontWeight="$medium"
                  color={colors.secondary_text}
                >
                  Điều kiện kích hoạt bồi thường
                </Text>
                <Box
                  bg={colors.errorSoft}
                  borderRadius="$lg"
                  p="$4"
                  borderWidth={1.5}
                  borderColor={colors.error}
                >
                  <Text
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={colors.error}
                    textAlign="center"
                    lineHeight="$2xl"
                  >
                    {Utils.formatAggregationLabel(
                      condition.aggregation_function
                    )}{" "}
                    chỉ số trong {condition.aggregation_window_days} ngày{" "}
                    {Utils.formatThresholdOperator(
                      condition.threshold_operator
                    )}{" "}
                    {condition.threshold_value}
                    {formatUnit(dataSource?.unit, dataSource?.parameter_name)}
                  </Text>
                  {condition.consecutive_required && (
                    <HStack
                      space="xs"
                      alignItems="center"
                      justifyContent="center"
                      mt="$3"
                      bg={colors.error}
                      borderRadius="$full"
                      px="$3"
                      py="$1.5"
                    >
                      <AlertCircle size={14} color="#fff" strokeWidth={2.5} />
                      <Text fontSize="$xs" color="#fff" fontWeight="$bold">
                        Liên tiếp không gián đoạn
                      </Text>
                    </HStack>
                  )}
                </Box>
              </VStack>

              <Divider bg={colors.frame_border} mx="$2" my="$1" />

              {/* 📋 CHI TIẾT ĐIỀU KIỆN - Thứ tự {condition.condition_order} */}
              <VStack space="xs" px="$2" pb="$2">
                <HStack space="xs" alignItems="center" mb="$1">
                  <Text
                    fontSize="$xs"
                    fontWeight="$bold"
                    color={colors.primary}
                  >
                    Điều kiện {condition.condition_order}
                  </Text>
                </HStack>

                <VStack space="xs">
                  {/* Ngưỡng kích hoạt */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Điều kiện ngưỡng
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.error}
                    >
                      {Utils.formatThresholdOperator(
                        condition.threshold_operator
                      ).toUpperCase()}
                    </Text>
                  </HStack>

                  {/* Giá trị ngưỡng */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Ngưỡng kích hoạt rủi ro
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {condition.threshold_value}
                      {formatUnit(dataSource?.unit, dataSource?.parameter_name)}
                    </Text>
                  </HStack>

                  {/* Cảnh báo sớm */}
                  {condition.early_warning_threshold &&
                    condition.early_warning_threshold > 0 && (
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                        py="$2"
                        borderBottomWidth={1}
                        borderBottomColor={colors.frame_border}
                        borderRadius="$md"
                      >
                        <VStack flex={1}>
                          <Text fontSize="$xs" fontWeight="$semibold">
                            Ngưỡng cảnh báo sớm
                          </Text>
                          <Text fontSize="$2xs" color={colors.secondary_text}>
                            Nhận thông báo trước khi đạt ngưỡng nguy hiểm
                          </Text>
                        </VStack>
                        <Text fontSize="$sm" fontWeight="$bold">
                          {condition.early_warning_threshold}
                        </Text>
                      </HStack>
                    )}

                  {/* Cách tính dữ liệu */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Cách tính dữ liệu
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {Utils.formatAggregationLabel(
                        condition.aggregation_function
                      )}
                    </Text>
                  </HStack>

                  {/* Thời gian tính toán */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <VStack flex={1}>
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        flex={1}
                      >
                        Thời gian tính toán (theo dõi)
                      </Text>
                      <Text fontSize="$2xs" color={colors.muted_text}>
                        Trong {condition.aggregation_window_days} ngày gần nhất
                        có dữ liệu mới
                      </Text>
                    </VStack>

                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Trong {condition.aggregation_window_days} ngày
                    </Text>
                  </HStack>

                  {/* Yêu cầu liên tục */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Yêu cầu liên tục
                      </Text>
                      <Text fontSize="$2xs" color={colors.muted_text}>
                        Các ngày có giá trị{" "}
                        {condition.consecutive_required ? "phải" : "không cần"}{" "}
                        liên tiếp
                      </Text>
                    </VStack>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={
                        condition.consecutive_required
                          ? colors.error
                          : colors.success
                      }
                    >
                      {condition.consecutive_required ? "CÓ" : "KHÔNG"}
                    </Text>
                  </HStack>

                  {/* Thời gian xác nhận */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        Thời gian xác nhận
                      </Text>
                      <Text fontSize="$2xs" color={colors.muted_text}>
                        Giám sát thêm sau khi đạt điều kiện
                      </Text>
                    </VStack>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {condition.validation_window_days} ngày
                    </Text>
                  </HStack>

                  {/* Dữ liệu so sánh */}
                  {condition.baseline_window_days ? (
                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      py="$2"
                      borderBottomWidth={1}
                      borderBottomColor={colors.frame_border}
                    >
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        flex={1}
                      >
                        So sánh với dữ liệu lịch sử
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {condition.baseline_window_days} ngày trước
                      </Text>
                    </HStack>
                  ) : (
                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      py="$2"
                      borderBottomWidth={1}
                      borderBottomColor={colors.frame_border}
                    >
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        flex={1}
                      >
                        So sánh dữ liệu lịch sử
                      </Text>
                      <Text fontSize="$sm" color={colors.muted_text}>
                        Không có
                      </Text>
                    </HStack>
                  )}

                  {/* Tần suất cập nhật */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Tần suất cập nhật dữ liệu
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {Utils.getFrequencyLabel(dataSource?.update_frequency) ||
                        "—"}
                    </Text>
                  </HStack>

                  {/* Nguồn vệ tinh */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Nguồn dữ liệu vệ tinh
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {dataSource?.data_provider || "—"}
                    </Text>
                  </HStack>

                  {/* Độ phân giải */}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor={colors.frame_border}
                  >
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Độ phân giải ảnh
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {dataSource?.spatial_resolution || "—"}
                    </Text>
                  </HStack>

                  {/* Độ chính xác */}
                  {dataSource?.accuracy_rating && (
                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      py="$2"
                    >
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        flex={1}
                      >
                        Độ chính xác dữ liệu
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        {dataSource.accuracy_rating}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </HStack>

      {/* Logical Operator Connector */}
      {!isLast && (
        <HStack space="xs" alignItems="center" ml="$10" my="$2">
          <Box w="$0.5" h="$4" bg={operatorColor} />
          <Badge bg={operatorColor} borderRadius="$full" size="sm">
            <BadgeText color="#fff" fontSize="$2xs" fontWeight="$bold">
              {logicalOperator}
            </BadgeText>
          </Badge>
          <Box flex={1} h="$0.5" bg={operatorColor} />
        </HStack>
      )}
    </Box>
  );
};

// 6. Important Notes Card - ĐƠN GIẢN HÓA
const ImportantNotesCard = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => {
  const additionalInfo = policy.important_additional_information;

  // Nếu không có thông tin
  if (!additionalInfo || additionalInfo.trim() === "") {
    return (
      <Box
        bg={colors.card_surface}
        borderWidth={1}
        borderColor={colors.frame_border}
        borderRadius="$xl"
        p="$4"
      >
        <HStack space="xs" alignItems="center" justifyContent="center">
          <Info size={16} color={colors.muted_text} strokeWidth={2} />
          <Text fontSize="$sm" color={colors.muted_text}>
            Không có thông tin bổ sung
          </Text>
        </HStack>
      </Box>
    );
  }

  // Có thông tin - hiển thị trực tiếp
  return (
    <Box
      bg={colors.card_surface}
      borderWidth={2}
      borderColor={colors.warning}
      borderRadius="$xl"
      overflow="hidden"
    >
      {/* Header */}
      <Box bg={colors.warningSoft} px="$4" py="$3">
        <HStack space="sm" alignItems="center">
          <AlertCircle size={20} color={colors.warning} strokeWidth={2} />
          <Text fontSize="$md" fontWeight="$bold" color={colors.warning}>
            Vui lòng đọc kỹ trước khi đăng ký
          </Text>
        </HStack>
      </Box>

      {/* Content */}
      <Box p="$4">
        <Text fontSize="$sm" color={colors.primary_text} lineHeight="$lg">
          {additionalInfo}
        </Text>
      </Box>
    </Box>
  );
};

// Info Card Component (reusable)
const InfoCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  colors,
  flex,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  colors: ColorSet;
  flex?: number;
}) => (
  <Box
    flex={flex}
    bg={colors.card_surface}
    borderWidth={1}
    borderColor={colors.frame_border}
    borderRadius="$xl"
    p="$3"
  >
    <HStack space="sm" alignItems="center" mb="$2">
      <Box bg={iconBg} borderRadius="$md" p="$1.5">
        <Icon size={16} color={iconColor} strokeWidth={2} />
      </Box>
      <Text
        fontSize="$2xs"
        color={colors.secondary_text}
        flex={1}
        numberOfLines={2}
      >
        {label}
      </Text>
    </HStack>
    <Text
      fontSize="$lg"
      fontWeight="$bold"
      color={colors.primary_text}
      numberOfLines={1}
    >
      {value}
    </Text>
    <Text fontSize="$2xs" color={colors.muted_text} mt="$1" lineHeight="$xs">
      {subtext}
    </Text>
  </Box>
);

// Bottom CTA - CẬP NHẬT
const BottomCTA = ({
  policy,
  onEnroll,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  onEnroll: () => void;
  colors: ColorSet;
}) => {
  const bottomPadding = useBottomInsets();

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      bg={colors.card_surface}
      borderTopWidth={1}
      borderTopColor={colors.frame_border}
      px="$4"
      py="$4"
      paddingBottom={bottomPadding}
      sx={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <VStack space="sm">
        {/* Premium & Payout Display - CẬP NHẬT */}
        <HStack justifyContent="space-between" mb={5} alignItems="center">
          <VStack>
            <Text fontSize="$md" color={colors.secondary_text}>
              Thanh toán phí
            </Text>
          </VStack>

          <HStack space="xs" alignItems="baseline">
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
              {Utils.formatCurrency(policy.fix_premium_amount)}
            </Text>
            <Text fontSize="$xs" color={colors.muted_text}>
              {policy.is_per_hectare ? "/hecta" : ""}
            </Text>
          </HStack>
        </HStack>

        {/* CTA Button */}
        <Button
          bg={colors.success}
          size="xl"
          onPress={onEnroll}
          isDisabled={policy.status !== "active"}
          sx={{
            ":disabled": {
              opacity: 0.5,
            },
          }}
        >
          <HStack space="sm" alignItems="center">
            <FileCheck
              size={22}
              color={colors.primary_white_text}
              strokeWidth={2}
            />
            <ButtonText
              color={colors.primary_white_text}
              fontWeight="$bold"
              fontSize="$md"
            >
              {policy.status === "active"
                ? "Đăng ký gói bảo hiểm"
                : "Sản phẩm tạm ngưng"}
            </ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

// Status Badge
const StatusBadge = ({
  status,
  colors,
}: {
  status: PublicBasePolicyResponse["status"];
  colors: ColorSet;
}) => {
  const statusConfig = {
    active: {
      icon: CheckCircle2,
      bg: colors.successSoft,
      text: colors.success,
      label: "Đang bán",
    },
    inactive: {
      icon: XCircle,
      bg: colors.errorSoft,
      text: colors.error,
      label: "Ngừng bán",
    },
    pending: {
      icon: Clock,
      bg: colors.warningSoft,
      text: colors.warning,
      label: "Chờ duyệt",
    },
    suspended: {
      icon: XCircle,
      bg: colors.warningSoft,
      text: colors.warning,
      label: "Tạm ngưng",
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge bg={config.bg} borderRadius="$full" px="$3" py="$1.5">
      <HStack space="xs" alignItems="center">
        <IconComponent size={14} color={config.text} strokeWidth={2.5} />
        <BadgeText
          color={config.text}
          fontSize="$xs"
          fontWeight="$bold"
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          {config.label}
        </BadgeText>
      </HStack>
    </Badge>
  );
};


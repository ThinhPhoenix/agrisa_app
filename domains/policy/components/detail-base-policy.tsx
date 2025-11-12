import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useToast } from "@/domains/shared/hooks/useToast";
import { Utils } from "@/libs/utils/utils"; // ✅ THÊM IMPORT
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
  Percent,
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
  const { data, isLoading, isFetching, isError, refetch, error } =
    getDetailBasePolicy(policyId);

  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(
    new Set()
  );

  const policyDetail = data?.data as PolicyDetailResponse | undefined;
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
    toast.toast.success("Chức năng đăng ký đang được phát triển");
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
          Đang tải chi tiết sản phẩm...
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
          Không tìm thấy sản phẩm
        </Text>
        <Button bg={colors.primary} mt="$4" onPress={() => router.back()}>
          <ButtonText color={colors.white_button_text}>Quay lại</ButtonText>
        </Button>
      </Box>
    );
  }

  const { base_policy, triggers, metadata, document } = policyDetail;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Box flex={1}>
        {/* Header - Fixed */}
        <AgrisaHeader
          title="Chi tiết chương trình bảo hiểm"
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
            {/* 1. THÔNG TIN SẢN PHẨM */}
            <VStack space="md">
              <SectionTitle
                number="1"
                title="Thông tin bảo hiểm"
                icon={Shield}
                colors={colors}
              />
              <ProductInfoCard
                policy={base_policy}
                document={document}
                colors={colors}
              />
            </VStack>

            {/* 2. CHI PHÍ & BỒI THƯỞNG */}
            <VStack space="md">
              <SectionTitle
                number="2"
                title="Chi phí & Bồi thường"
                icon={TrendingUp}
                colors={colors}
              />
              <CostPayoutGrid policy={base_policy} colors={colors} />
            </VStack>

            {/* 3. THỜI GIAN HIỆU LỰC */}
            <VStack space="md">
              <SectionTitle
                number="3"
                title="Thời gian hiệu lực"
                icon={Calendar}
                colors={colors}
              />
              <TimelineCard policy={base_policy} colors={colors} />
            </VStack>

            {/* 4. ĐIỀU KIỆN KÍCH HOẠT */}
            <VStack space="md">
              <SectionTitle
                number="4"
                title="Điều kiện kích hoạt bồi thường"
                icon={AlertCircle}
                colors={colors}
              />

              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                lineHeight="$lg"
              >
                Bảo hiểm sẽ tự động kích hoạt chi trả khi các điều kiện sau được
                đáp ứng. Hệ thống sử dụng dữ liệu vệ tinh để giám sát liên tục.
              </Text>

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

            {/* 5. THÔNG TIN KỸ THUẬT */}
            <VStack space="md">
              <SectionTitle
                number="5"
                title="Thông tin kỹ thuật"
                icon={Database}
                colors={colors}
              />
              <TechnicalInfoFAQ metadata={metadata} colors={colors} />
            </VStack>

            {/* 6. LƯU Ý QUAN TRỌNG */}
            {base_policy.important_additional_information && (
              <VStack space="md">
                <SectionTitle
                  number="6"
                  title="Lưu ý quan trọng"
                  icon={Info}
                  colors={colors}
                />
                <ImportantNotesCard policy={base_policy} colors={colors} />
              </VStack>
            )}

            <Box mt="$4">
              <FAQSection policy={base_policy} colors={colors} />{" "}
            </Box>
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

// Section Title Component
const SectionTitle = ({
  number,
  title,
  icon: Icon,
  colors,
}: {
  number: string;
  title: string;
  icon: any;
  colors: ColorSet;
}) => (
  <HStack space="sm" alignItems="center">
    <Box
      bg={colors.primary}
      borderRadius="$full"
      w="$8"
      h="$8"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize="$sm" fontWeight="$bold" color={colors.white_button_text}>
        {number}
      </Text>
    </Box>
    <Icon size={20} color={colors.primary} strokeWidth={2.5} />
    <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
      {title}
    </Text>
  </HStack>
);

// 1. Product Info Card - Cập nhật để thêm Document Section
const ProductInfoCard = ({
  policy,
  document,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  document: PolicyDocument;
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
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* Description */}
      <VStack space="xs">
        <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
          Mô tả bảo hiểm
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
            <Box bg={colors.primarySoft} borderRadius="$md" p="$2">
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
              color={colors.white_button_text}
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
          Hợp đồng bảo hiểm gốc
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
                  color={colors.white_button_text}
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
                color={colors.white_button_text}
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
                Link hết hạn: {formatExpiryDate(document.presigned_url_expiry)}
              </Text>
            </HStack>
          )}
        </Box>
      </Pressable>

      {/* Helper Text */}
      <HStack space="xs" alignItems="flex-start" mt="$1">
        <Info size={12} color={colors.muted_text} strokeWidth={2} />
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

// 2. Cost & Payout Grid - CẬP NHẬT ĐƠN GIẢN HÓA
const CostPayoutGrid = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => (
  <VStack space="sm">
    {/* Row 1: Premium */}
    <InfoCard
      label="Phí bảo hiểm"
      value={Utils.formatCurrency(policy.fix_premium_amount)}
      subtext={
        policy.is_per_hectare
          ? "Tính theo diện tích (mỗi hecta)"
          : "Phí cố định (không phụ thuộc diện tích)"
      }
      icon={Shield}
      iconBg={colors.primarySoft}
      iconColor={colors.primary}
      colors={colors}
    />

    {/* Row 2: Rates - ĐƠN GIẢN HÓA */}
    <HStack space="sm">
      <InfoCard
        label="Tỷ lệ bồi thường cơ bản"
        value={`${(policy.payout_base_rate * 100).toFixed(0)}%`}
        subtext="% giá trị cây trồng được bồi thường"
        icon={Percent}
        iconBg={colors.card_surface}
        iconColor={colors.info}
        colors={colors}
        flex={1}
      />
      <InfoCard
        label="Hệ số vượt ngưỡng"
        value={`×${policy.over_threshold_multiplier}`}
        subtext="Nhân thêm khi thiệt hại nghiêm trọng"
        icon={TrendingUp}
        iconBg={colors.warningSoft}
        iconColor={colors.warning}
        colors={colors}
        flex={1}
      />
    </HStack>

    {/* Row 3: Cancellation & Renewal */}
    <HStack space="sm">
      <InfoCard
        label="Tỷ lệ hoàn phí khi hủy"
        value={`${(policy.cancel_premium_rate * 100).toFixed(0)}%`}
        subtext="Số tiền được hoàn lại nếu hủy hợp đồng"
        icon={XCircle}
        iconBg={colors.card_surface}
        iconColor={colors.error}
        colors={colors}
        flex={1}
      />
      <InfoCard
        label="Giảm giá gia hạn"
        value={`${(policy.renewal_discount_rate * 100).toFixed(0)}%`}
        subtext={policy.auto_renewal ? "Tự động gia hạn" : "Gia hạn thủ công"}
        icon={Calendar}
        iconBg={colors.card_surface}
        iconColor={colors.success}
        colors={colors}
        flex={1}
      />
    </HStack>
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
        <Text fontSize="$xs" color={colors.secondary_text} ml="$10" mt="$1">
          Chỉ có thể đăng ký trong khoảng thời gian này
        </Text>
      </VStack>

      <Divider bg={colors.frame_border} />

      {/* Insurance Valid Period */}
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Box bg={colors.successSoft} borderRadius="$md" p="$2">
            <Shield size={16} color={colors.success} strokeWidth={2} />
          </Box>
          <Text fontSize="$xs" color={colors.secondary_text}>
            Thời gian hiệu lực bảo hiểm
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
        <Text fontSize="$xs" color={colors.secondary_text} ml="$10" mt="$1">
          Bảo hiểm chỉ có hiệu lực trong khoảng thời gian này
        </Text>
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

// 🆕 FAQ SECTION COMPONENT - THÊM CÂU HỎI VỀ BỒI THƯỜNG
const FAQSection = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse; // ✅ THÊM policy prop
  colors: ColorSet;
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    // 🆕 THÊM CÂU HỎI VỀ BỒI THƯỜNG Ở ĐẦU
    {
      id: "payout-calculation",
      question: "Tôi sẽ nhận được bao nhiêu tiền bồi thường?",
      answer: `Số tiền bồi thường phụ thuộc vào mức độ thiệt hại:\n\n📌 MỨC CƠ BẢN (Điều kiện thường):\n${Utils.formatCurrency(policy.fix_payout_amount)}${policy.is_payout_per_hectare ? " / hecta thiệt hại" : " (tổng số tiền)"}\n• Áp dụng khi đạt điều kiện kích hoạt bình thường\n• Đây là mức bồi thường tiêu chuẩn\n\n🔥 MỨC TỐI ĐA (Vượt ngưỡng nghiêm trọng):\n${Utils.formatCurrency(policy.payout_cap)}${policy.is_payout_per_hectare ? " / hecta thiệt hại" : " (tổng số tiền)"}\n• Áp dụng khi thiệt hại VỰA đạt điều kiện bình thường VỪA vượt ngưỡng nghiêm trọng\n• Công thức: ${Utils.formatCurrency(policy.fix_payout_amount)} × ${policy.over_threshold_multiplier} = ${Utils.formatCurrency(policy.payout_cap)}\n\n💡 Ví dụ thực tế:\n• Nếu ruộng lúa của bạn ${policy.is_payout_per_hectare ? "5 hecta" : ""} bị hạn hán nhẹ → Nhận ${policy.is_payout_per_hectare ? Utils.formatCurrency(policy.fix_payout_amount * 5) : Utils.formatCurrency(policy.fix_payout_amount)}\n• Nếu ${policy.is_payout_per_hectare ? "cùng diện tích" : "ruộng"} bị hạn hán nặng (vượt ngưỡng) → Nhận ${policy.is_payout_per_hectare ? Utils.formatCurrency(policy.payout_cap * 5) : Utils.formatCurrency(policy.payout_cap)}\n\n⚡ Lưu ý:\n${policy.is_payout_per_hectare ? "• Số tiền cuối cùng = Mức bồi thường × Diện tích thiệt hại thực tế\n" : ""}• Bồi thường được chi trả TỰ ĐỘNG khi hệ thống phát hiện thiệt hại qua vệ tinh\n• Không cần nộp đơn yêu cầu hay chờ thẩm định`,
      icon: TrendingUp,
      color: colors.success,
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
        "Ngưỡng cảnh báo sớm được đặt trước ngưỡng kích hoạt chính. Khi đạt ngưỡng này, bạn sẽ nhận thông báo để có thời gian chuẩn bị biện pháp ứng phó, giảm thiểu thiệt hại trước khi tình huống trở nên nghiêm trọng.",
      icon: AlertTriangle,
      color: colors.warning,
    },
    {
      id: "consecutive",
      question: "Yêu cầu liên tiếp nghĩa là gì?",
      answer:
        "Một số điều kiện yêu cầu hiện tượng xấu phải xảy ra liên tục không gián đoạn. VD: 'Không mưa trong 14 ngày liên tiếp' - nếu có 1 ngày mưa ở giữa thì đếm lại từ đầu. Điều này đảm bảo chỉ chi trả cho thiệt hại thực sự nghiêm trọng.",
      icon: TrendingUp,
      color: colors.error,
    },
    {
      id: "data-cost",
      question: "Tại sao phải trả chi phí dữ liệu?",
      answer:
        "Chi phí dữ liệu bao gồm: (1) Truy cập dữ liệu vệ tinh độ phân giải cao, (2) Xử lý và phân tích dữ liệu bằng AI, (3) Giám sát liên tục 24/7. Chi phí này được tính vào phí bảo hiểm để đảm bảo bạn nhận được dịch vụ giám sát chính xác nhất.",
      icon: Database,
      color: colors.info,
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

// Cập nhật phần Technical Info thành FAQ style
const TechnicalInfoFAQ = ({
  metadata,
  colors,
}: {
  metadata: PolicyDetailResponse["metadata"];
  colors: ColorSet;
}) => {
  const [expandedTech, setExpandedTech] = useState<string | null>(null);

  const technicalFAQs = [
    {
      id: "triggers-conditions",
      question: `Sản phẩm có ${metadata.total_triggers} bộ kích hoạt và ${metadata.total_conditions} điều kiện?`,
      answer: `Đúng vậy! Sản phẩm này được thiết kế với:\n\n• ${metadata.total_triggers} bộ kích hoạt (Triggers): Mỗi bộ áp dụng cho một giai đoạn sinh trưởng cụ thể hoặc toàn bộ chu kỳ\n\n• ${metadata.total_conditions} điều kiện giám sát: Các tiêu chí cụ thể như nhiệt độ, lượng mưa, độ ẩm đất được theo dõi liên tục\n\nCăn cứ vào số lượng này, bạn có thể thấy sản phẩm bảo hiểm được thiết kế rất chi tiết và toàn diện.`,
      icon: Shield,
      value: `${metadata.total_triggers} / ${metadata.total_conditions}`,
      color: colors.success,
    },
    {
      id: "data-sources",
      question: `${metadata.data_source_count} nguồn dữ liệu được sử dụng là gì?`,
      answer: `Hệ thống sử dụng ${metadata.data_source_count} nguồn dữ liệu khác nhau để đảm bảo độ chính xác:\n\n• Dữ liệu vệ tinh (Satellite Imagery): NDVI, nhiệt độ bề mặt, độ ẩm đất\n• Dữ liệu thời tiết: Lượng mưa, nhiệt độ không khí, độ ẩm\n• Dữ liệu địa hình: Độ cao, độ dốc, loại đất\n• Dữ liệu lịch sử: Xu hướng thời tiết và năng suất cây trồng\n\nNhiều nguồn dữ liệu = Độ chính xác cao hơn trong đánh giá thiệt hại.`,
      icon: Database,
      value: `${metadata.data_source_count} nguồn`,
      color: colors.info,
    },
    {
      id: "data-cost",
      question: `Chi phí dữ liệu ${Utils.formatDataCost(
        metadata.total_data_cost
      )} được tính như thế nào?`,
      answer: `Tổng chi phí dữ liệu ${Utils.formatDataCost(
        metadata.total_data_cost
      )} bao gồm:\n\n1️⃣ Chi phí truy cập dữ liệu vệ tinh:\n   • Dữ liệu độ phân giải cao (10m-30m)\n   • Tần suất cập nhật: Mỗi 3-5 ngày\n\n2️⃣ Chi phí xử lý và phân tích:\n   • Thuật toán AI phân tích ảnh vệ tinh\n   • Tính toán các chỉ số sức khỏe cây trồng\n\n3️⃣ Chi phí lưu trữ và giám sát:\n   • Lưu trữ dữ liệu lịch sử\n   • Giám sát liên tục 24/7\n\nChi phí này đã được tính vào phí bảo hiểm của bạn.`,
      icon: TrendingUp,
      value: Utils.formatDataCost(metadata.total_data_cost),
      color: colors.warning,
    },
  ];

  const toggleTech = (id: string) => {
    setExpandedTech(expandedTech === id ? null : id);
  };

  return (
    <VStack space="xs">
      <HStack space="sm" alignItems="center" mb="$2">
        <Info size={18} color={colors.info} strokeWidth={2} />
        <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
          Thông tin chi tiết
        </Text>
      </HStack>

      {technicalFAQs.map((faq) => {
        const isExpanded = expandedTech === faq.id;
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
            <Pressable onPress={() => toggleTech(faq.id)}>
              <Box px="$3" py="$3">
                <HStack
                  space="sm"
                  alignItems="center"
                  justifyContent="space-between"
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
                    <VStack flex={1}>
                      <Text
                        fontSize="$xs"
                        fontWeight={isExpanded ? "$bold" : "$medium"}
                        color={isExpanded ? faq.color : colors.primary_text}
                        lineHeight="$md"
                      >
                        {faq.question}
                      </Text>
                      {!isExpanded && (
                        <Badge
                          bg={`${faq.color}15`}
                          borderRadius="$full"
                          size="sm"
                          alignSelf="flex-start"
                          mt="$1"
                        >
                          <BadgeText
                            color={faq.color}
                            fontSize="$2xs"
                            fontWeight="$bold"
                          >
                            {faq.value}
                          </BadgeText>
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                  <Box
                    bg={isExpanded ? `${faq.color}15` : colors.background}
                    borderRadius="$full"
                    p="$1"
                  >
                    {isExpanded ? (
                      <ChevronUp
                        size={16}
                        color={faq.color}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        color={colors.secondary_text}
                        strokeWidth={2.5}
                      />
                    )}
                  </Box>
                </HStack>
              </Box>
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
                <VStack space="sm">
                  <Badge
                    bg={faq.color}
                    borderRadius="$full"
                    size="md"
                    alignSelf="flex-start"
                  >
                    <BadgeText color="#fff" fontSize="$sm" fontWeight="$bold">
                      {faq.value}
                    </BadgeText>
                  </Badge>
                  <Text
                    fontSize="$xs"
                    color={colors.primary_text}
                    lineHeight="$lg"
                  >
                    {faq.answer}
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

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
  // Tính tổng chi phí dữ liệu của trigger
  const totalDataCost = trigger.conditions.reduce(
    (sum, condition) => sum + condition.calculated_cost,
    0
  );

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
              <Box
                bg={colors.primary}
                borderRadius="$full"
                w="$8"
                h="$8"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.white_button_text}
                >
                  {index + 1}
                </Text>
              </Box>
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
                    {trigger.conditions.length} điều kiện
                  </Text>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    • {Utils.formatDataCost(totalDataCost)}
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
          {trigger.blackout_periods && (
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
                    Thời gian không kích hoạt
                  </Text>
                </HStack>
                <Box bg={colors.warningSoft} borderRadius="$md" p="$2" ml="$6">
                  <Text fontSize="$sm" color={colors.primary_text}>
                    Từ ngày {trigger.blackout_periods.start_day} đến ngày{" "}
                    {trigger.blackout_periods.end_day}
                  </Text>
                  <Text fontSize="$xs" color={colors.muted_text} mt="$1">
                    Lý do: {trigger.blackout_periods.reason}
                  </Text>
                </Box>
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

          {/* Data Cost Summary */}
          <Divider bg={colors.frame_border} />
          <HStack
            space="sm"
            alignItems="center"
            justifyContent="space-between"
            bg={colors.background}
            borderRadius="$md"
            p="$3"
          >
            <HStack space="xs" alignItems="center">
              <Database size={16} color={colors.info} strokeWidth={2} />
              <Text fontSize="$xs" color={colors.secondary_text}>
                Tổng chi phí dữ liệu
              </Text>
            </HStack>
            <Text fontSize="$sm" fontWeight="$bold" color={colors.success}>
              {Utils.formatDataCost(totalDataCost)}
            </Text>
          </HStack>
        </VStack>
      )}
    </Box>
  );
};

// 5. Condition Item Component - Hiển thị từng điều kiện
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
  const operatorColor =
    logicalOperator === "AND" ? colors.success : colors.info;

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
            color={colors.white_button_text}
          >
            {index + 1}
          </Text>
        </Box>

        {/* Condition Content */}
        <VStack flex={1} space="xs">
          {/* Main Condition */}
          <Box
            bg={colors.background}
            borderWidth={1}
            borderColor={colors.frame_border}
            borderRadius="$lg"
            p="$3"
          >
            <VStack space="xs">
              {/* Condition Summary */}
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {Utils.getAggregationLabel(condition.aggregation_function)}{" "}
                {Utils.getOperatorLabel(condition.threshold_operator)}{" "}
                {condition.threshold_value}
              </Text>

              {/* Details Grid */}
              <VStack space="xs" mt="$1">
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Thời gian tổng hợp:
                  </Text>
                  <Text
                    fontSize="$xs"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {condition.aggregation_window_days} ngày
                  </Text>
                </HStack>

                {condition.consecutive_required && (
                  <HStack space="xs" alignItems="center">
                    <TrendingUp
                      size={12}
                      color={colors.warning}
                      strokeWidth={2}
                    />
                    <Text fontSize="$xs" color={colors.warning}>
                      Yêu cầu liên tiếp không gián đoạn
                    </Text>
                  </HStack>
                )}

                {condition.early_warning_threshold && (
                  <HStack space="xs" alignItems="center">
                    <AlertTriangle
                      size={12}
                      color={colors.warning}
                      strokeWidth={2}
                    />
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Cảnh báo sớm tại: {condition.early_warning_threshold}%
                    </Text>
                  </HStack>
                )}
              </VStack>

              {/* Data Cost */}
              <HStack
                space="xs"
                alignItems="center"
                justifyContent="space-between"
                mt="$1"
                pt="$2"
                borderTopWidth={1}
                borderTopColor={colors.frame_border}
              >
                <HStack space="xs" alignItems="center">
                  <Database
                    size={12}
                    color={colors.muted_text}
                    strokeWidth={2}
                  />
                  <Text fontSize="$2xs" color={colors.muted_text}>
                    Chi phí dữ liệu
                  </Text>
                </HStack>
                <Text fontSize="$xs" fontWeight="$bold" color={colors.success}>
                  {Utils.formatDataCost(condition.calculated_cost)}
                </Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </HStack>

      {/* Logical Operator Connector */}
      {!isLast && (
        <HStack space="xs" alignItems="center" ml="$10" my="$1">
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
}) => (
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
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="$xs" color={colors.secondary_text}>
            Phí bảo hiểm
          </Text>
          <HStack space="xs" alignItems="baseline">
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
              {Utils.formatCurrency(policy.fix_premium_amount)}
            </Text>
            <Text fontSize="$xs" color={colors.muted_text}>
              {policy.is_per_hectare ? "/ hecta" : ""}
            </Text>
          </HStack>
        </VStack>

        <VStack alignItems="flex-end">
          <Text fontSize="$xs" color={colors.secondary_text}>
            Bồi thường
          </Text>
          <VStack alignItems="flex-end" space="xs">
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.success}>
              {Utils.formatCurrency(policy.fix_payout_amount)}
            </Text>
            <HStack space="xs" alignItems="center">
              <Text fontSize="$2xs" color={colors.muted_text}>
                tối đa
              </Text>
              <Text fontSize="$md" fontWeight="$bold" color={colors.warning}>
                {Utils.formatCurrency(policy.payout_cap)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
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
            color={colors.white_button_text}
            strokeWidth={2}
          />
          <ButtonText
            color={colors.white_button_text}
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


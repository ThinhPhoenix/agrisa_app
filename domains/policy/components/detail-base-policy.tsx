import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useToast } from "@/domains/shared/hooks/useToast";
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
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  FileCheck,
  HelpCircle,
  Info,
  Leaf,
  Percent,
  Shield,
  TrendingUp,
  XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import { RefreshControl } from "react-native";
import { usePolicy } from "../hooks/use-policy";
import type {
  GrowthStage,
  PolicyCondition,
  PolicyDetailResponse,
  PolicyTrigger,
  PublicBasePolicyResponse,
} from "../models/policy.models";

// ============= UTILITY FUNCTIONS =============

/**
 * Format số tiền VND
 */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value) + " ₫";

/**
 * Format chi phí data (USD -> VND, giả định 1 unit = 1.000 VND)
 */
const formatDataCost = (usdCost: number) => {
  const vndCost = usdCost * 1000;
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(vndCost) + " ₫"
  );
};

const formatDuration = (days: number) =>
  days >= 30 ? `${Math.floor(days / 30)} tháng` : `${days} ngày`;

const getCropLabel = (cropType: string) => {
  const labels: Record<string, string> = {
    rice: "Lúa",
    coffee: "Cà phê",
  };
  return labels[cropType] || cropType;
};

const getGrowthStageLabel = (stage: GrowthStage) => {
  const labels: Record<GrowthStage, string> = {
    germination: "Nảy mầm",
    seedling: "Cây con",
    vegetative: "Sinh trưởng",
    flowering: "Ra hoa",
    fruiting: "Đậu quả",
    ripening: "Chín",
    harvesting: "Thu hoạch",
  };
  return labels[stage];
};

const getOperatorLabel = (operator: string) => {
  const labels: Record<string, string> = {
    "<": "nhỏ hơn",
    "<=": "nhỏ hơn hoặc bằng",
    ">": "lớn hơn",
    ">=": "lớn hơn hoặc bằng",
    "==": "bằng",
    "!=": "khác",
    AND: "VÀ",
    OR: "HOẶC",
  };
  return labels[operator] || operator;
};

const getAggregationLabel = (func: string) => {
  const labels: Record<string, string> = {
    avg: "Trung bình",
    min: "Tối thiểu",
    max: "Tối đa",
    sum: "Tổng",
    median: "Trung vị",
  };
  return labels[func] || func;
};

const getFrequencyLabel = (unit: string) => {
  const labels: Record<string, string> = {
    hour: "giờ",
    day: "ngày",
    week: "tuần",
    month: "tháng",
  };
  return labels[unit] || unit;
};

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
  const [showExplanation, setShowExplanation] = useState(false);

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
        <Spinner size="large" color={colors.success} />
        <Text color={colors.textSecondary} fontSize="$sm" mt="$3">
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
        <Shield size={64} color={colors.textSecondary} strokeWidth={1.5} />
        <Text fontSize="$lg" fontWeight="$semibold" color={colors.text} mt="$4">
          Không tìm thấy sản phẩm
        </Text>
        <Button bg={colors.success} mt="$4" onPress={() => router.back()}>
          <ButtonText color={colors.textWhiteButton}>Quay lại</ButtonText>
        </Button>
      </Box>
    );
  }

  const { base_policy, triggers, metadata } = policyDetail;

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
              colors={[colors.success]}
              tintColor={colors.success}
            />
          }
          contentContainerStyle={{
            paddingBottom: 200, // Footer height + extra spacing
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
              <ProductInfoCard policy={base_policy} colors={colors} />
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

              {/* Explanation Banner */}
              <ExplanationBanner
                isExpanded={showExplanation}
                onToggle={() => setShowExplanation(!showExplanation)}
                colors={colors}
              />

              <Text
                fontSize="$sm"
                color={colors.textSecondary}
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
              <TechnicalInfoCard metadata={metadata} colors={colors} />
            </VStack>

            {/* 6. LƯU Ý QUAN TRỌNG */}
            {base_policy.important_additional_information?.notes && (
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
          </VStack>
        </ScrollView>

        {/* Fixed Bottom CTA - Full Width Footer */}
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
      bg={colors.primarySoft}
      borderRadius="$full"
      w="$8"
      h="$8"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize="$sm" fontWeight="$bold" color={colors.success}>
        {number}
      </Text>
    </Box>
    <Icon size={20} color={colors.success} strokeWidth={2} />
    <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
      {title}
    </Text>
  </HStack>
);

// 1. Product Info Card
const ProductInfoCard = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card}
    borderWidth={1}
    borderColor={colors.border}
    borderRadius="$xl"
    overflow="hidden"
  >
    <VStack space="md" p="$4">
      {/* Product Name */}
      <VStack space="xs">
        <Text
          fontSize="$xl"
          fontWeight="$bold"
          color={colors.text}
          lineHeight="$xl"
        >
          {policy.product_name}
        </Text>
      </VStack>

      <Divider bg={colors.border} />

      {/* Description */}
      <VStack space="xs">
        <Text fontSize="$xs" color={colors.textSecondary} fontWeight="$medium">
          Mô tả bảo hiểm
        </Text>
        <Text fontSize="$sm" color={colors.text} lineHeight="$lg">
          {policy.product_description}
        </Text>
      </VStack>

      <Divider bg={colors.border} />

      {/* Footer: Crop Type & Status */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="$xs" color={colors.textSecondary} mb="$1">
            Loại cây bảo hiểm
          </Text>
          <HStack space="xs" alignItems="center">
            <Box bg={colors.primarySoft} borderRadius="$md" p="$2">
              <Leaf size={16} color={colors.success} strokeWidth={2} />
            </Box>
            <Text fontSize="$sm" fontWeight="$bold" color={colors.success}>
              {getCropLabel(policy.crop_type)}
            </Text>
          </HStack>
        </VStack>

        <VStack alignItems="flex-end">
          <Text fontSize="$xs" color={colors.textSecondary} mb="$1">
            Tình trạng hiện tại
          </Text>
          <StatusBadge status={policy.status} colors={colors} />
        </VStack>
      </HStack>
    </VStack>
  </Box>
);

// 2. Cost & Payout Grid
const CostPayoutGrid = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => (
  <VStack space="sm">
    {/* Row 1: Premium & Payout */}
    <HStack space="sm">
      <InfoCard
        label="Phí bảo hiểm"
        value={formatCurrency(policy.fix_premium_amount)}
        subtext={
          policy.is_per_hectare
            ? "Tính theo diện tích (mỗi hecta)"
            : "Phí cố định (không phụ thuộc diện tích)"
        }
        icon={Shield}
        iconBg={colors.primarySoft}
        iconColor={colors.success}
        colors={colors}
        flex={1}
      />
      <InfoCard
        label="Bồi thường tối đa"
        value={formatCurrency(policy.payout_cap)}
        subtext={
          policy.is_payout_per_hectare
            ? "Mỗi hecta thiệt hại"
            : "Tổng số tiền tối đa"
        }
        icon={CheckCircle2}
        iconBg={colors.successSoft}
        iconColor={colors.success}
        colors={colors}
        flex={1}
      />
    </HStack>

    {/* Row 2: Rates */}
    <HStack space="sm">
      <InfoCard
        label="Tỷ lệ bồi thường cơ bản"
        value={`${(policy.payout_base_rate * 100).toFixed(0)}%`}
        subtext="Tỷ lệ % giá trị cây trồng được bồi thường"
        icon={Percent}
        iconBg={colors.background}
        iconColor={colors.textSecondary}
        colors={colors}
        flex={1}
      />
      <InfoCard
        label="Hệ số vượt ngưỡng"
        value={`×${policy.over_threshold_multiplier}`}
        subtext="Nhân thêm khi thiệt hại vượt mức nghiêm trọng"
        icon={TrendingUp}
        iconBg={colors.background}
        iconColor={colors.textSecondary}
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
        iconBg={colors.background}
        iconColor={colors.textSecondary}
        colors={colors}
        flex={1}
      />
      <InfoCard
        label="Giảm giá gia hạn"
        value={`${(policy.renewal_discount_rate * 100).toFixed(0)}%`}
        subtext={policy.auto_renewal ? "Tự động gia hạn" : "Gia hạn thủ công"}
        icon={Calendar}
        iconBg={colors.background}
        iconColor={colors.textSecondary}
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
    bg={colors.card}
    borderWidth={1}
    borderColor={colors.border}
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
            <Text fontSize="$xs" color={colors.textSecondary}>
              Thời hạn bảo hiểm
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
              {formatDuration(policy.coverage_duration_days)}
            </Text>
          </VStack>
        </HStack>
        <Text fontSize="$xs" color={colors.textMuted}>
          ({policy.coverage_duration_days} ngày)
        </Text>
      </HStack>

      <Divider bg={colors.border} />

      {/* Enrollment Period */}
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Box bg={colors.primarySoft} borderRadius="$md" p="$2">
            <Calendar size={16} color={colors.success} strokeWidth={2} />
          </Box>
          <Text fontSize="$xs" color={colors.textSecondary}>
            Thời gian đăng ký
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center" ml="$10">
          <VStack>
            <Text fontSize="$2xs" color={colors.textMuted}>
              Bắt đầu
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
              Ngày {policy.enrollment_start_day}
            </Text>
          </VStack>
          <Text fontSize="$lg" color={colors.textMuted}>
            →
          </Text>
          <VStack alignItems="flex-end">
            <Text fontSize="$2xs" color={colors.textMuted}>
              Kết thúc
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
              Ngày {policy.enrollment_end_day}
            </Text>
          </VStack>
        </HStack>
        <Text fontSize="$xs" color={colors.textSecondary} ml="$10" mt="$1">
          Chỉ có thể đăng ký trong khoảng thời gian này
        </Text>
      </VStack>

      <Divider bg={colors.border} />

      {/* Insurance Valid Period */}
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Box bg={colors.successSoft} borderRadius="$md" p="$2">
            <Shield size={16} color={colors.success} strokeWidth={2} />
          </Box>
          <Text fontSize="$xs" color={colors.textSecondary}>
            Thời gian hiệu lực bảo hiểm
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center" ml="$10">
          <VStack>
            <Text fontSize="$2xs" color={colors.textMuted}>
              Có hiệu lực từ
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.success}>
              Ngày {policy.insurance_valid_from_day}
            </Text>
          </VStack>
          <Text fontSize="$lg" color={colors.textMuted}>
            →
          </Text>
          <VStack alignItems="flex-end">
            <Text fontSize="$2xs" color={colors.textMuted}>
              Hết hiệu lực
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.success}>
              Ngày {policy.insurance_valid_to_day}
            </Text>
          </VStack>
        </HStack>
        <Text fontSize="$xs" color={colors.textSecondary} ml="$10" mt="$1">
          Bảo hiểm chỉ có hiệu lực trong khoảng thời gian này
        </Text>
      </VStack>

      <Divider bg={colors.border} />

      {/* Max Premium Payment Extension */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="sm" alignItems="center" flex={1}>
          <Box bg={colors.warningSoft} borderRadius="$md" p="$2">
            <Clock size={16} color={colors.warning} strokeWidth={2} />
          </Box>
          <VStack flex={1}>
            <Text fontSize="$xs" color={colors.textSecondary}>
              Thời gian gia hạn thanh toán tối đa
            </Text>
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
              {Math.floor(policy.max_premium_payment_prolong / 86400)} ngày
            </Text>
          </VStack>
        </HStack>
      </HStack>
    </VStack>
  </Box>
);

// Explanation Banner
const ExplanationBanner = ({
  isExpanded,
  onToggle,
  colors,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.infoSoft}
    borderWidth={1}
    borderColor={colors.info}
    borderRadius="$lg"
    overflow="hidden"
  >
    <Pressable onPress={onToggle}>
      <HStack
        space="sm"
        alignItems="center"
        px="$3"
        py="$2.5"
        justifyContent="space-between"
      >
        <HStack space="sm" alignItems="center" flex={1}>
          <HelpCircle size={18} color={colors.info} strokeWidth={2} />
          <Text fontSize="$sm" fontWeight="$semibold" color={colors.info}>
            Giải thích các thuật ngữ
          </Text>
        </HStack>
        {isExpanded ? (
          <ChevronUp size={18} color={colors.info} strokeWidth={2} />
        ) : (
          <ChevronDown size={18} color={colors.info} strokeWidth={2} />
        )}
      </HStack>
    </Pressable>

    {isExpanded && (
      <VStack
        space="sm"
        px="$3"
        py="$3"
        borderTopWidth={1}
        borderTopColor={colors.info}
      >
        <GlossaryItem
          term="Trigger (Bộ kích hoạt)"
          definition="Tập hợp các điều kiện cần thiết để bảo hiểm tự động chi trả. Mỗi gói bảo hiểm có thể có nhiều trigger áp dụng cho các giai đoạn khác nhau của cây trồng."
          colors={colors}
        />
        <GlossaryItem
          term="Điều kiện (Condition)"
          definition="Tiêu chí cụ thể cần đạt được để trigger kích hoạt. Ví dụ: lượng mưa trung bình trong 7 ngày < 10mm."
          colors={colors}
        />
        <GlossaryItem
          term="AND / OR"
          definition="AND: Tất cả điều kiện phải đạt. OR: Chỉ cần 1 trong các điều kiện đạt là đủ."
          colors={colors}
        />
        <GlossaryItem
          term="Giai đoạn sinh trưởng"
          definition="Các giai đoạn phát triển của cây trồng: nảy mầm, cây con, sinh trưởng, ra hoa, đậu quả, chín, thu hoạch."
          colors={colors}
        />
        <GlossaryItem
          term="Cảnh báo sớm"
          definition="Ngưỡng cảnh báo trước khi đạt ngưỡng kích hoạt, giúp nông dân chuẩn bị ứng phó."
          colors={colors}
        />
        <GlossaryItem
          term="Yêu cầu liên tiếp"
          definition="Điều kiện phải xảy ra liên tục không gián đoạn trong khoảng thời gian quy định."
          colors={colors}
        />
        <GlossaryItem
          term="Chi phí dữ liệu"
          definition="Chi phí để lấy và xử lý dữ liệu vệ tinh cho mỗi điều kiện giám sát."
          colors={colors}
        />
      </VStack>
    )}
  </Box>
);

const GlossaryItem = ({
  term,
  definition,
  colors,
}: {
  term: string;
  definition: string;
  colors: ColorSet;
}) => (
  <VStack space="xs">
    <Text fontSize="$xs" fontWeight="$bold" color={colors.info}>
      • {term}
    </Text>
    <Text fontSize="$xs" color={colors.info} lineHeight="$sm" ml="$3">
      {definition}
    </Text>
  </VStack>
);

// Trigger Card - Improved with better field labels
const TriggerCard = ({
  trigger,
  index,
  isExpanded,
  onToggle,
  colors,
}: {
  trigger: PolicyTrigger;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card}
    borderWidth={1}
    borderColor={isExpanded ? colors.success : colors.border}
    borderRadius="$xl"
    overflow="hidden"
  >
    {/* Trigger Header */}
    <Pressable onPress={onToggle}>
      <Box px="$4" py="$3">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="sm" alignItems="center" flex={1}>
            <Box
              bg={isExpanded ? colors.success : colors.primarySoft}
              borderRadius="$full"
              w="$10"
              h="$10"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={isExpanded ? "#fff" : colors.success}
              >
                {index + 1}
              </Text>
            </Box>
            <VStack flex={1}>
              <Text fontSize="$md" fontWeight="$bold" color={colors.text}>
                {trigger.growth_stage
                  ? `Giai đoạn ${getGrowthStageLabel(trigger.growth_stage)}`
                  : "Áp dụng cho mọi giai đoạn"}
              </Text>
              <HStack space="xs" alignItems="center" mt="$0.5" flexWrap="wrap">
                <Badge bg={colors.primarySoft} borderRadius="$full" size="sm">
                  <BadgeText color={colors.success} fontSize="$2xs">
                    {trigger.conditions.length} điều kiện
                  </BadgeText>
                </Badge>
                <Badge
                  bg={
                    trigger.logical_operator === "AND"
                      ? colors.errorSoft
                      : colors.warningSoft
                  }
                  borderRadius="$full"
                  size="sm"
                >
                  <BadgeText
                    color={
                      trigger.logical_operator === "AND"
                        ? colors.error
                        : colors.warning
                    }
                    fontSize="$2xs"
                  >
                    {getOperatorLabel(trigger.logical_operator)}
                  </BadgeText>
                </Badge>
              </HStack>
            </VStack>
          </HStack>
          <Box
            bg={isExpanded ? colors.primarySoft : colors.background}
            borderRadius="$full"
            p="$2"
          >
            {isExpanded ? (
              <ChevronUp size={20} color={colors.success} strokeWidth={2.5} />
            ) : (
              <ChevronDown
                size={20}
                color={colors.textSecondary}
                strokeWidth={2.5}
              />
            )}
          </Box>
        </HStack>
      </Box>
    </Pressable>

    {/* Trigger Details */}
    {isExpanded && (
      <VStack borderTopWidth={1} borderTopColor={colors.border}>
        <Box bg={colors.background} px="$4" py="$3">
          <VStack space="sm">
            {/* Monitor Info */}
            <HStack justifyContent="space-between" alignItems="center">
              <VStack flex={1}>
                <Text fontSize="$xs" color={colors.textSecondary}>
                  Tần suất giám sát
                </Text>
                <HStack space="xs" alignItems="center" mt="$0.5">
                  <Clock size={14} color={colors.text} strokeWidth={2} />
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.text}
                  >
                    Mỗi {trigger.monitor_interval}{" "}
                    {getFrequencyLabel(trigger.monitor_frequency_unit)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Blackout Period */}
            {trigger.blackout_periods && (
              <Box
                bg={colors.warningSoft}
                borderRadius="$lg"
                px="$3"
                py="$2.5"
                borderLeftWidth={3}
                borderLeftColor={colors.warning}
                mt="$2"
              >
                <HStack space="sm" alignItems="flex-start">
                  <AlertTriangle
                    size={18}
                    color={colors.warning}
                    strokeWidth={2}
                  />
                  <VStack flex={1}>
                    <Text
                      fontSize="$xs"
                      fontWeight="$bold"
                      color={colors.warning}
                    >
                      Thời gian không kích hoạt
                    </Text>
                    <Text
                      fontSize="$xs"
                      color={colors.warning}
                      mt="$0.5"
                      lineHeight="$sm"
                    >
                      Từ ngày {trigger.blackout_periods.start_day} đến ngày{" "}
                      {trigger.blackout_periods.end_day}
                    </Text>
                    <Text
                      fontSize="$xs"
                      color={colors.warning}
                      mt="$0.5"
                      lineHeight="$sm"
                    >
                      Lý do: {trigger.blackout_periods.reason}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Conditions */}
        <VStack space="xs" px="$4" py="$3">
          <Text fontSize="$sm" fontWeight="$bold" color={colors.text} mb="$1">
            Các điều kiện cụ thể
          </Text>
          {trigger.conditions.map((condition, idx) => (
            <ConditionCard
              key={condition.id}
              condition={condition}
              index={idx}
              colors={colors}
            />
          ))}
        </VStack>
      </VStack>
    )}
  </Box>
);

// Condition Card - Detailed field explanation
const ConditionCard = ({
  condition,
  index,
  colors,
}: {
  condition: PolicyCondition;
  index: number;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.background}
    borderWidth={1}
    borderColor={colors.border}
    borderRadius="$lg"
    p="$3"
  >
    {/* Header */}
    <HStack justifyContent="space-between" alignItems="flex-start" mb="$3">
      <HStack space="sm" alignItems="flex-start" flex={1}>
        <Badge bg={colors.success} borderRadius="$full" size="sm">
          <BadgeText color="#fff" fontSize="$2xs" fontWeight="$bold">
            {index + 1}
          </BadgeText>
        </Badge>
        <VStack flex={1}>
          <Text fontSize="$sm" fontWeight="$bold" color={colors.text}>
            Điều kiện #{index + 1}
          </Text>
        </VStack>
      </HStack>
      <Badge bg={colors.infoSoft} borderRadius="$lg" px="$2.5" py="$1">
        <BadgeText color={colors.info} fontSize="$xs" fontWeight="$semibold">
          {formatDataCost(condition.calculated_cost)}
        </BadgeText>
      </Badge>
    </HStack>

    <Divider my="$2" bg={colors.border} />

    {/* Fields */}
    <VStack space="sm">
      {/* Aggregation Method */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$xs" color={colors.textSecondary}>
          Phương pháp tính toán
        </Text>
        <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
          {getAggregationLabel(condition.aggregation_function)}
        </Text>
      </HStack>

      {/* Time Window */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$xs" color={colors.textSecondary}>
          Khung thời gian tính toán
        </Text>
        <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
          {condition.aggregation_window_days} ngày
          {condition.consecutive_required ? " liên tiếp" : ""}
        </Text>
      </HStack>

      <Divider bg={colors.border} />

      {/* Threshold */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$xs" color={colors.textSecondary}>
          Ngưỡng kích hoạt
        </Text>
        <Text fontSize="$md" fontWeight="$bold" color={colors.error}>
          {getOperatorLabel(condition.threshold_operator)}{" "}
          {condition.threshold_value}
        </Text>
      </HStack>

      {/* Early Warning Threshold */}
      {condition.early_warning_threshold !== null && (
        <HStack
          space="xs"
          alignItems="center"
          bg={colors.infoSoft}
          borderRadius="$md"
          px="$2"
          py="$1.5"
        >
          <Info size={14} color={colors.info} strokeWidth={2} />
          <VStack flex={1}>
            <Text fontSize="$2xs" color={colors.info}>
              Ngưỡng cảnh báo sớm
            </Text>
            <Text fontSize="$xs" fontWeight="$semibold" color={colors.info}>
              {condition.early_warning_threshold}
            </Text>
          </VStack>
        </HStack>
      )}

      {/* Baseline Window */}
      {condition.baseline_window_days !== null && (
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$xs" color={colors.textSecondary}>
            Khung thời gian so sánh chuẩn
          </Text>
          <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
            {condition.baseline_window_days} ngày ({condition.baseline_function}
            )
          </Text>
        </HStack>
      )}

      {/* Validation Window */}
      {condition.validation_window_days !== null && (
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$xs" color={colors.textSecondary}>
            Thời gian xác thực
          </Text>
          <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
            {condition.validation_window_days} ngày
          </Text>
        </HStack>
      )}

      <Divider bg={colors.border} />

      {/* Cost Breakdown */}
      <VStack space="xs">
        <Text
          fontSize="$xs"
          color={colors.textSecondary}
          fontWeight="$semibold"
        >
          Chi phí dữ liệu chi tiết
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2xs" color={colors.textMuted}>
            Chi phí cơ bản
          </Text>
          <Text fontSize="$2xs" color={colors.textMuted}>
            {formatDataCost(condition.base_cost)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2xs" color={colors.textMuted}>
            Hệ số danh mục × Hệ số cấp độ
          </Text>
          <Text fontSize="$2xs" color={colors.textMuted}>
            ×{condition.category_multiplier} × ×{condition.tier_multiplier}
          </Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$xs" fontWeight="$semibold" color={colors.text}>
            Tổng chi phí
          </Text>
          <Text fontSize="$xs" fontWeight="$bold" color={colors.info}>
            {formatDataCost(condition.calculated_cost)}
          </Text>
        </HStack>
      </VStack>

      {/* Additional Flags */}
      <VStack space="xs">
        {condition.consecutive_required && (
          <HStack
            space="xs"
            alignItems="center"
            bg={colors.warningSoft}
            borderRadius="$md"
            px="$2"
            py="$1.5"
          >
            <TrendingUp size={14} color={colors.warning} strokeWidth={2} />
            <Text fontSize="$xs" color={colors.warning} fontWeight="$medium">
              Yêu cầu liên tiếp (không gián đoạn)
            </Text>
          </HStack>
        )}
        {condition.include_component && (
          <HStack
            space="xs"
            alignItems="center"
            bg={colors.successSoft}
            borderRadius="$md"
            px="$2"
            py="$1.5"
          >
            <CheckCircle2 size={14} color={colors.success} strokeWidth={2} />
            <Text fontSize="$xs" color={colors.success} fontWeight="$medium">
              Bao gồm trong tính toán tổng
            </Text>
          </HStack>
        )}
      </VStack>
    </VStack>
  </Box>
);

// 5. Technical Info Card
const TechnicalInfoCard = ({
  metadata,
  colors,
}: {
  metadata: PolicyDetailResponse["metadata"];
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card}
    borderWidth={1}
    borderColor={colors.border}
    borderRadius="$xl"
    p="$4"
  >
    <VStack space="md">
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="$xs" color={colors.textSecondary}>
            Tổng số bộ kích hoạt
          </Text>
          <Text fontSize="$xl" fontWeight="$bold" color={colors.text}>
            {metadata.total_triggers}
          </Text>
        </VStack>
        <VStack alignItems="flex-end">
          <Text fontSize="$xs" color={colors.textSecondary}>
            Tổng số điều kiện
          </Text>
          <Text fontSize="$xl" fontWeight="$bold" color={colors.text}>
            {metadata.total_conditions}
          </Text>
        </VStack>
      </HStack>

      <Divider bg={colors.border} />

      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="$xs" color={colors.textSecondary}>
            Số nguồn dữ liệu
          </Text>
          <Text fontSize="$lg" fontWeight="$semibold" color={colors.text}>
            {metadata.data_source_count} nguồn
          </Text>
        </VStack>
        <VStack alignItems="flex-end">
          <Text fontSize="$xs" color={colors.textSecondary}>
            Tổng chi phí dữ liệu
          </Text>
          <Text fontSize="$lg" fontWeight="$bold" color={colors.success}>
            {formatDataCost(metadata.total_data_cost)}
          </Text>
        </VStack>
      </HStack>

      <Box bg={colors.infoSoft} borderRadius="$md" px="$3" py="$2" mt="$2">
        <HStack space="xs" alignItems="flex-start">
          <Info size={14} color={colors.info} strokeWidth={2} />
          <Text fontSize="$xs" color={colors.info} flex={1} lineHeight="$sm">
            Chi phí dữ liệu được tính vào phí bảo hiểm để đảm bảo giám sát liên
            tục và chính xác
          </Text>
        </HStack>
      </Box>
    </VStack>
  </Box>
);

// 6. Important Notes Card
const ImportantNotesCard = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => {
  // Kiểm tra và extract data an toàn
  const additionalInfo = policy.important_additional_information;

  // Log để debug
  console.log("Additional Info:", JSON.stringify(additionalInfo, null, 2));

  const notes = additionalInfo?.notes || "";
  const specialConditions =
    (additionalInfo?.special_conditions as string[]) || [];

  // Fallback: Kiểm tra cả exclusions và requirements (nếu có)
  const exclusions = (additionalInfo?.exclusions as string[]) || [];
  const requirements = (additionalInfo?.requirements as string[]) || [];

  return (
    <Box
      bg={colors.card}
      borderWidth={2}
      borderColor={colors.warning}
      borderRadius="$xl"
      overflow="hidden"
    >
      <Box bg={colors.warningSoft} px="$4" py="$3">
        <HStack space="sm" alignItems="center">
          <AlertCircle size={20} color={colors.warning} strokeWidth={2} />
          <Text fontSize="$md" fontWeight="$bold" color={colors.warning}>
            Vui lòng đọc kỹ trước khi đăng ký
          </Text>
        </HStack>
      </Box>

      <VStack space="sm" p="$4">
        {/* Main Notes */}
        {notes && (
          <VStack space="xs">
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
              Lưu ý chung
            </Text>
            <Text fontSize="$sm" color={colors.text} lineHeight="$lg">
              {notes}
            </Text>
          </VStack>
        )}

        {/* Special Conditions Section */}
        {specialConditions.length > 0 && (
          <>
            {notes && <Divider bg={colors.border} my="$2" />}
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
                Điều kiện đặc biệt
              </Text>
              {specialConditions.map((condition: string, idx: number) => (
                <HStack
                  key={`special-${idx}`}
                  space="xs"
                  alignItems="flex-start"
                >
                  <Box mt="$0.5">
                    <AlertCircle
                      size={14}
                      color={colors.warning}
                      strokeWidth={2}
                    />
                  </Box>
                  <Text
                    fontSize="$sm"
                    color={colors.text}
                    flex={1}
                    lineHeight="$md"
                  >
                    {condition}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </>
        )}

        {/* Exclusions Section (Fallback - nếu có) */}
        {exclusions.length > 0 && (
          <>
            <Divider bg={colors.border} my="$2" />
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
                Các trường hợp loại trừ
              </Text>
              {exclusions.map((exclusion: string, idx: number) => (
                <HStack
                  key={`exclusion-${idx}`}
                  space="xs"
                  alignItems="flex-start"
                >
                  <Text fontSize="$sm" color={colors.error}>
                    ✕
                  </Text>
                  <Text
                    fontSize="$sm"
                    color={colors.textSecondary}
                    flex={1}
                    lineHeight="$md"
                  >
                    {exclusion}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </>
        )}

        {/* Requirements Section (Fallback - nếu có) */}
        {requirements.length > 0 && (
          <>
            <Divider bg={colors.border} my="$2" />
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
                Yêu cầu bắt buộc
              </Text>
              {requirements.map((requirement: string, idx: number) => (
                <HStack
                  key={`requirement-${idx}`}
                  space="xs"
                  alignItems="flex-start"
                >
                  <CheckCircle2
                    size={14}
                    color={colors.success}
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$sm"
                    color={colors.text}
                    flex={1}
                    lineHeight="$md"
                  >
                    {requirement}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </>
        )}

        {/* Empty State - Nếu không có thông tin gì */}
        {!notes &&
          specialConditions.length === 0 &&
          exclusions.length === 0 &&
          requirements.length === 0 && (
            <HStack
              space="xs"
              alignItems="center"
              justifyContent="center"
              py="$2"
            >
              <Info size={16} color={colors.textMuted} strokeWidth={2} />
              <Text fontSize="$sm" color={colors.textMuted}>
                Không có thông tin bổ sung
              </Text>
            </HStack>
          )}
      </VStack>
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
    bg={colors.card}
    borderWidth={1}
    borderColor={colors.border}
    borderRadius="$xl"
    p="$3"
  >
    <HStack space="sm" alignItems="center" mb="$2">
      <Box bg={iconBg} borderRadius="$md" p="$1.5">
        <Icon size={16} color={iconColor} strokeWidth={2} />
      </Box>
      <Text
        fontSize="$2xs"
        color={colors.textSecondary}
        flex={1}
        numberOfLines={2}
      >
        {label}
      </Text>
    </HStack>
    <Text
      fontSize="$lg"
      fontWeight="$bold"
      color={colors.text}
      numberOfLines={1}
    >
      {value}
    </Text>
    <Text fontSize="$2xs" color={colors.textMuted} mt="$1" lineHeight="$xs">
      {subtext}
    </Text>
  </Box>
);

// Bottom CTA
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
    bg={colors.card}
    borderTopWidth={1}
    borderTopColor={colors.border}
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
      {/* Premium Display */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="$xs" color={colors.textSecondary}>
            Phí bảo hiểm
          </Text>
          <HStack space="xs" alignItems="baseline">
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
              {formatCurrency(policy.fix_premium_amount)}
            </Text>
            <Text fontSize="$xs" color={colors.textMuted}>
              {policy.is_per_hectare ? "/ hecta" : ""}
            </Text>
          </HStack>
        </VStack>

        <VStack alignItems="flex-end">
          <Text fontSize="$xs" color={colors.textSecondary}>
            Bồi thường tối đa
          </Text>
          <Text fontSize="$lg" fontWeight="$bold" color={colors.success}>
            {formatCurrency(policy.payout_cap)}
          </Text>
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
          <FileCheck size={22} color={colors.textWhiteButton} strokeWidth={2} />
          <Link href={`/register-policy`}>
            <ButtonText
              color={colors.textWhiteButton}
              fontWeight="$bold"
              fontSize="$md"
            >
              {policy.status === "active"
                ? "Đăng ký gói bảo hiểm"
                : "Sản phẩm tạm ngưng"}
            </ButtonText>
          </Link>
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

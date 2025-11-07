import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useToast } from "@/domains/shared/hooks/useToast";
import {
    Badge,
    BadgeText,
    Box,
    HStack,
    Pressable,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Leaf,
    Shield,
    XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { RefreshControl } from "react-native";
import { usePolicy } from "../hooks/use-policy";
import type { PublicBasePolicyResponse } from "../models/policy.models";

// ============= UTILITY FUNCTIONS =============

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value) + " ₫";

const formatDuration = (days: number) =>
  days >= 30 ? `${Math.floor(days / 30)} tháng` : `${days} ngày`;

const getCropLabel = (cropType: string) => {
  const labels: Record<string, string> = {
    rice: "Lúa",
    coffee: "Cà phê",
  };
  return labels[cropType] || cropType;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ============= MAIN COMPONENT =============

export default function PublicBasePolicyScreen() {
  const { colors } = useAgrisaColors();
  const toast = useToast();
  const { getPublicBasePolicy } = usePolicy();

  const { data, isLoading, isFetching, isError, refetch, error } =
    getPublicBasePolicy();

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as Error)?.message ||
          "Không thể tải danh sách sản phẩm bảo hiểm."
      );
    }
  }, [isError, error, toast]);

  const policies: PublicBasePolicyResponse[] = useMemo(
    () => (data?.data as PublicBasePolicyResponse[]) ?? [],
    [data]
  );

  const isRefreshing = isFetching && !isLoading;

  return (
    <ScrollView
      bg={colors.background}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refetch}
          colors={[colors.success]}
          tintColor={colors.success}
        />
      }
    >
      <VStack space="lg" py="$5">
        {/* Header */}
        <VStack space="xs">
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.text}>
            Sản phẩm bảo hiểm
          </Text>
          <Text fontSize="$sm" color={colors.textSecondary}>
            Khám phá các gói bảo hiểm nông nghiệp được cung cấp
          </Text>
        </VStack>

        {/* Loading State */}
        {isLoading ? (
          <Box alignItems="center" justifyContent="center" py="$10">
            <Spinner size="large" color={colors.success} />
            <Text color={colors.textSecondary} fontSize="$sm" mt="$3">
              Đang tải sản phẩm...
            </Text>
          </Box>
        ) : policies.length === 0 ? (
          /* Empty State */
          <Box
            borderWidth={1}
            borderColor={colors.border}
            borderRadius="$xl"
            p="$6"
            bg={colors.card}
            alignItems="center"
          >
            <Shield size={48} color={colors.textSecondary} strokeWidth={1.5} />
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.text}
              mt="$3"
            >
              Chưa có sản phẩm
            </Text>
            <Text
              fontSize="$sm"
              color={colors.textSecondary}
              textAlign="center"
              mt="$1"
            >
              Hiện tại chưa có sản phẩm bảo hiểm nào được công bố
            </Text>
          </Box>
        ) : (
          /* Policy Cards */
          <VStack space="md">
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} colors={colors} />
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}

// ============= POLICY CARD COMPONENT =============

type ColorSet = ReturnType<typeof useAgrisaColors>["colors"];

const PolicyCard = ({
  policy,
  colors,
}: {
  policy: PublicBasePolicyResponse;
  colors: ColorSet;
}) => {
  const handlePress = () => {
    router.push({
      pathname: "/(farmer)/policy/detail",
      params: { policyId: policy.id },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <Box
          borderWidth={1}
          borderColor={colors.border}
          borderRadius="$xl"
          bg={colors.card}
          overflow="hidden"
          opacity={pressed ? 0.8 : 1}
          sx={{
            _web: {
              transition: "all 0.2s",
            },
          }}
        >
          <VStack space="md" p="$4">
            {/* Header: Product Name & Status */}
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} mr="$3">
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.text}
                  numberOfLines={2}
                  lineHeight="$xl"
                >
                  {policy.product_name}
                </Text>
                
              </VStack>
              <HStack space="xs" alignItems="center">
                <StatusBadge status={policy.status} colors={colors} />
                <ChevronRight size={20} color={colors.textSecondary} />
              </HStack>
            </HStack>

            {/* Premium Amount - Highlighted */}
            <Box
              bg={colors.primarySoft}
              borderRadius="$lg"
              p="$3"
              borderLeftWidth={3}
              borderLeftColor={colors.success}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <HStack space="xs" alignItems="center" mb="$1">
                    <Shield size={16} color={colors.success} strokeWidth={2} />
                    <Text fontSize="$xs" color={colors.success} fontWeight="$semibold">
                      Phí bảo hiểm
                    </Text>
                  </HStack>
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={colors.success}
                    numberOfLines={1}
                  >
                    {formatCurrency(policy.fix_premium_amount)}
                  </Text>
                  <Text fontSize="$xs" color={colors.textSecondary} mt="$0.5">
                    {policy.is_per_hectare ? "/ hecta" : "Phí cố định"}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Timeline Info - Compact */}
            <HStack space="sm">
              <HStack
                flex={1}
                space="xs"
                alignItems="center"
                bg={colors.background}
                borderRadius="$md"
                p="$2.5"
                borderWidth={1}
                borderColor={colors.border}
              >
                <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
                <VStack flex={1}>
                  <Text fontSize="$2xs" color={colors.textMuted}>
                    Thời hạn
                  </Text>
                  <Text fontSize="$xs" color={colors.text} fontWeight="$semibold">
                    {formatDuration(policy.coverage_duration_days)}
                  </Text>
                </VStack>
              </HStack>

              <HStack
                flex={1}
                space="xs"
                alignItems="center"
                bg={colors.background}
                borderRadius="$md"
                p="$2.5"
                borderWidth={1}
                borderColor={colors.border}
              >
                <Calendar size={14} color={colors.textSecondary} strokeWidth={2} />
                <VStack flex={1}>
                  <Text fontSize="$2xs" color={colors.textMuted}>
                    Đăng ký
                  </Text>
                  <Text fontSize="$xs" color={colors.text} fontWeight="$semibold" numberOfLines={1}>
                    Ngày {policy.enrollment_start_day}-{policy.enrollment_end_day}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* Footer: Crop Type & Update Date */}
            <HStack
              justifyContent="space-between"
              alignItems="center"
              pt="$2"
              borderTopWidth={1}
              borderTopColor={colors.border}
            >
              <HStack space="xs" alignItems="center">
                <Leaf size={14} color={colors.success} strokeWidth={2} />
                <Text fontSize="$xs" color={colors.success} fontWeight="$semibold">
                  {getCropLabel(policy.crop_type)}
                </Text>
              </HStack>
              <Text fontSize="$2xs" color={colors.textMuted}>
                Cập nhật: {formatDate(policy.updated_at)}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Pressable>
  );
};

// ============= SUB-COMPONENTS =============

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
    <Badge bg={config.bg} borderRadius="$full" px="$2.5" py="$1">
      <HStack space="xs" alignItems="center">
        <IconComponent size={10} color={config.text} strokeWidth={2.5} />
        <BadgeText
          color={config.text}
          fontSize="$2xs"
          fontWeight="$semibold"
          textTransform="uppercase"
          letterSpacing={0.3}
        >
          {config.label}
        </BadgeText>
      </HStack>
    </Badge>
  );
};
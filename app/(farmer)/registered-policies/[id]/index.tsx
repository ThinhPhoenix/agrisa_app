import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  HStack,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Shield,
  Sprout,
  XCircle
} from "lucide-react-native";
import React from "react";
import { RefreshControl } from "react-native";

export default function RegisteredPolicyDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getRegisteredPolicyDetail } = usePolicy();
  const { data, isLoading, isFetching, refetch } = getRegisteredPolicyDetail(
    id!
  );

  const policy = data?.success ? data.data : null;

  // Fetch farm details nếu có farm_id
  const { getDetailFarm } = useFarm();
  const {
    data: farmData,
    isLoading: farmLoading,
  } = getDetailFarm(policy?.farm_id || "");

  const getPolicyStatusDisplay = () => {
    if (!policy) return null;

    // Ưu tiên hiển thị underwriting_status
    if (policy.underwriting_status === "approved") {
      return { label: "Đã duyệt", color: colors.success, icon: CheckCircle2 };
    }
    if (policy.underwriting_status === "rejected") {
      return { label: "Từ chối", color: colors.error, icon: XCircle };
    }
    if (policy.underwriting_status === "pending") {
      return { label: "Chờ duyệt", color: colors.pending, icon: Clock };
    }

    // Fallback sang status
    switch (policy.status) {
      case "active":
        return {
          label: "Đang hoạt động",
          color: colors.success,
          icon: CheckCircle2,
        };
      case "rejected":
      case "cancelled":
        return { label: "Đã hủy", color: colors.error, icon: XCircle };
      case "pending_review":
        return { label: "Chờ xét duyệt", color: colors.pending, icon: Clock };
      case "suspended":
        return {
          label: "Tạm ngưng",
          color: colors.warning,
          icon: AlertCircle,
        };
      case "expired":
        return { label: "Hết hạn", color: colors.muted_text, icon: XCircle };
      default:
        return {
          label: "Không xác định",
          color: colors.muted_text,
          icon: AlertCircle,
        };
    }
  };

  const statusDisplay = getPolicyStatusDisplay();

  if (isLoading) {
    return (
      <VStack flex={1} bg={colors.background}>
        <AgrisaHeader
          title="Chi tiết đăng ký"
          showBackButton={true}
          onBack={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color={colors.primary} />
          <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
            Đang tải thông tin...
          </Text>
        </Box>
      </VStack>
    );
  }

  if (!policy) {
    return (
      <VStack flex={1} bg={colors.background}>
        <AgrisaHeader
          title="Chi tiết đăng ký"
          showBackButton={true}
          onBack={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center" p="$4">
          <AlertCircle size={48} color={colors.error} strokeWidth={1.5} />
          <Text
            fontSize="$lg"
            fontWeight="$semibold"
            color={colors.primary_text}
            mt="$3"
          >
            Không tìm thấy thông tin
          </Text>
          <Text
            fontSize="$sm"
            color={colors.secondary_text}
            textAlign="center"
            mt="$1"
          >
            Đăng ký bảo hiểm không tồn tại hoặc đã bị xóa
          </Text>
        </Box>
      </VStack>
    );
  }

  const StatusIcon = statusDisplay?.icon || AlertCircle;
  const farm = farmData?.success ? farmData.data : null;

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader
        title="Chi tiết đăng ký"
        showBackButton={true}
        onBack={() => router.back()}
      />

      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            colors={[colors.success]}
            tintColor={colors.success}
          />
        }
      >
        <VStack space="md" p="$4">
          {/* Status & Policy Number Card */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.08}
            shadowRadius={8}
          >
            {/* Status Header */}
            <Box bg={statusDisplay?.color} p="$4">
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="sm" alignItems="center" flex={1}>
                  <StatusIcon
                    size={24}
                    color={colors.primary_white_text}
                    strokeWidth={2.5}
                  />
                  <VStack>
                    <Text
                      fontSize="$xs"
                      color={colors.primary_white_text}
                      opacity={0.9}
                      mb="$0.5"
                    >
                      Trạng thái
                    </Text>
                    <Text
                      fontSize="$xl"
                      fontWeight="$bold"
                      color={colors.primary_white_text}
                    >
                      {statusDisplay?.label}
                    </Text>
                  </VStack>
                </HStack>
              </HStack>
            </Box>

            {/* Policy Number Section */}
            <VStack p="$4" space="sm">
              <HStack space="xs" alignItems="center">
                <Shield size={16} color={colors.secondary_text} strokeWidth={2} />
                <Text
                  fontSize="$xs"
                  color={colors.secondary_text}
                  fontWeight="$medium"
                  textTransform="uppercase"
                  letterSpacing="$md"
                >
                  Mã đăng ký bảo hiểm
                </Text>
              </HStack>
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
                letterSpacing="$sm"
              >
                {policy.policy_number}
              </Text>
            </VStack>
          </Box>

          {/* Coverage Amount - Hero */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={2}
            borderColor={colors.success}
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.08}
            shadowRadius={8}
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm">
                <Box bg={colors.successSoft} p="$2" borderRadius="$lg">
                  <Shield size={20} color={colors.success} strokeWidth={2.5} />
                </Box>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.secondary_text}
                  textTransform="uppercase"
                  letterSpacing="$md"
                >
                  Số tiền được bảo hiểm
                </Text>
              </HStack>
              <Text
                fontSize="$3xl"
                fontWeight="$bold"
                color={colors.success}
                letterSpacing="$sm"
              >
                {Utils.formatCurrency(policy.coverage_amount)}
              </Text>
            </VStack>
          </Box>

          {/* Farm Info Card */}
          {farm && (
            <Box
              bg={colors.card_surface}
              borderRadius="$2xl"
              p="$5"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <VStack space="md">
                <HStack alignItems="center" space="sm">
                  <Box bg={colors.primarySoft} p="$2" borderRadius="$lg">
                    <MapPin size={20} color={colors.primary} strokeWidth={2.5} />
                  </Box>
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    Thông tin nông trại
                  </Text>
                </HStack>

                <Box height={1} bg={colors.frame_border} width="100%" />

                <VStack space="sm">
                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Tên nông trại
                    </Text>
                    <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                      {farm.farm_name}
                    </Text>
                  </VStack>

                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Loại cây trồng
                    </Text>
                    <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                      {Utils.getCropLabel(farm.crop_type)}
                    </Text>
                  </VStack>

                  <VStack space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Diện tích
                    </Text>
                    <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                      {farm.area_sqm} ha
                    </Text>
                  </VStack>
                </VStack>
              </VStack>
            </Box>
          )}

          {/* Timeline - 2 Columns */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm">
                <Box bg={colors.infoSoft} p="$2" borderRadius="$lg">
                  <Calendar size={20} color={colors.info} strokeWidth={2.5} />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Thời gian
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <HStack space="md">
                {/* Ngày gieo trồng */}
                <VStack flex={1} space="xs">
                  <HStack space="xs" alignItems="center">
                    <Sprout size={14} color={colors.secondary_text} strokeWidth={2} />
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Gieo trồng
                    </Text>
                  </HStack>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                    {Utils.formatDateForMS(policy.planting_date)}
                  </Text>
                </VStack>

                {/* Vertical Divider */}
                <Box width={1} bg={colors.frame_border} />

                {/* Ngày hết hạn */}
                <VStack flex={1} space="xs">
                  <HStack space="xs" alignItems="center">
                    <CheckCircle2 size={14} color={colors.secondary_text} strokeWidth={2} />
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Hết hạn
                    </Text>
                  </HStack>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                    {Utils.formatDateForMS(policy.coverage_end_date)}
                  </Text>
                </VStack>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              <HStack space="md">
                {/* Ngày đăng ký */}
                <VStack flex={1} space="xs">
                  <HStack space="xs" alignItems="center">
                    <FileText size={14} color={colors.secondary_text} strokeWidth={2} />
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Đăng ký
                    </Text>
                  </HStack>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                    {Utils.formatDateForMS(
                      Math.floor(new Date(policy.created_at).getTime() / 1000)
                    )}
                  </Text>
                </VStack>

                {/* Vertical Divider */}
                <Box width={1} bg={colors.frame_border} />

                {/* Ngày cập nhật */}
                <VStack flex={1} space="xs">
                  <HStack space="xs" alignItems="center">
                    <Calendar size={14} color={colors.secondary_text} strokeWidth={2} />
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Cập nhật
                    </Text>
                  </HStack>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                    {Utils.formatDateForMS(
                      Math.floor(new Date(policy.updated_at).getTime() / 1000)
                    )}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          {/* Payment Details */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <VStack space="md">
              <HStack alignItems="center" space="sm">
                <Box bg={colors.warningSoft} p="$2" borderRadius="$lg">
                  <Banknote size={20} color={colors.warning} strokeWidth={2.5} />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Chi tiết thanh toán
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
                    Phí dữ liệu vệ tinh
                  </Text>
                  <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
                    {Utils.formatCurrency(policy.total_data_cost)}
                  </Text>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$sm" color={colors.primary_text} fontWeight="$medium">
                    Hệ số diện tích
                  </Text>
                  <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                    {policy.area_multiplier.toFixed(2)} ha
                  </Text>
                </HStack>
              </VStack>

              <Box height={1} bg={colors.frame_border} width="100%" />

              {/* Total */}
              <Box
                bg={colors.primary}
                borderRadius="$xl"
                p="$4"
                shadowColor={colors.primary}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={8}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                    textTransform="uppercase"
                    letterSpacing="$md"
                  >
                    Tổng chi phí
                  </Text>
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                    letterSpacing="$sm"
                  >
                    {Utils.formatCurrency(
                      policy.total_farmer_premium + policy.total_data_cost
                    )}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

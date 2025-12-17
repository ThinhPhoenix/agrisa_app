import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";
import { Farm } from "@/domains/farm/models/farm.models";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Leaf,
  MapPin,
  Plus,
  Shield,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Platform, RefreshControl } from "react-native";
import { usePolicyForm } from "../hooks/use-policy-form";
import { PolicyDetailResponse } from "../models/policy.models";
import { DynamicDocumentTagsForm } from "./dynamic-document-tags-form";

interface RegisterPolicyFormProps {
  policyDetail: PolicyDetailResponse;
  basePolicyId: string;
}

export const RegisterPolicyForm: React.FC<RegisterPolicyFormProps> = ({
  policyDetail,
  basePolicyId,
}) => {
  const { colors } = useAgrisaColors();
  const bottomPadding = useBottomInsets();
  const { base_policy, metadata } = policyDetail;

  const {
    farms,
    isLoadingFarms,
    selectedFarm,
    plantingDate,
    areaMultiplier,
    coverageAmount,
    totalPremium,
    totalDataCost,
    isSubmitting,
    isFormValid,
    documentTagsData,
    setSelectedFarm,
    setPlantingDate,
    setDocumentTagsData,
    submitPolicy,
  } = usePolicyForm({
    basePolicy: base_policy,
    basePolicyId,
    totalDataCost: metadata.total_data_cost,
    documentTags: base_policy.document_tags, // ✅ Lấy từ base_policy
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize callback để tránh re-render liên tục
  const handleDocumentTagsChange = useCallback((values: Record<string, any>) => {
    setDocumentTagsData(values);
  }, [setDocumentTagsData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setPlantingDate(selectedDate);
    }
  };

  const handleRegisterNewFarm = () => {
    router.push({
      pathname: "/(farmer)/form-farm/[id]",
      params: { id: "new" },
    });
  };

  return (
    <Box flex={1} bg={colors.background}>
      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <VStack space="md" p="$4" pb="$4">
          {/* Header thông tin sản phẩm */}
          <Box
            bg={colors.successSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.success}
          >
            <HStack space="sm" alignItems="center" mb="$2">
              <Box bg={colors.success} p="$2" borderRadius="$md">
                <Shield size={20} color={colors.primary_white_text} />
              </Box>
              <VStack flex={1}>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {base_policy.product_name}
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text}>
                  {base_policy.product_code}
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="$sm" color={colors.secondary_text} lineHeight={20}>
              {base_policy.product_description}
            </Text>
          </Box>

          {/* Section 1: Chọn trang trại */}
          <VStack space="sm">
            <HStack space="xs" alignItems="center">
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                1. Chọn trang trại
              </Text>
              <Text fontSize="$xs" color={colors.error}>
                *
              </Text>
            </HStack>

            {isLoadingFarms ? (
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$8"
                alignItems="center"
              >
                <Spinner size="large" color={colors.primary} />
                <Text color={colors.secondary_text} mt="$2" fontSize="$sm">
                  Đang tải danh sách trang trại...
                </Text>
              </Box>
            ) : farms.length === 0 ? (
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$6"
                borderWidth={1}
                borderColor={colors.frame_border}
              >
                <VStack space="md" alignItems="center">
                  <Box bg={colors.warningSoft} p="$4" borderRadius="$full">
                    <Leaf size={32} color={colors.warning} />
                  </Box>
                  <VStack space="xs" alignItems="center">
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Chưa có trang trại
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={colors.secondary_text}
                      textAlign="center"
                    >
                      Hãy đăng ký trang trại để tiếp tục
                    </Text>
                  </VStack>
                  <Button
                    bg={colors.success}
                    borderRadius="$xl"
                    onPress={handleRegisterNewFarm}
                  >
                    <HStack space="xs" alignItems="center">
                      <Plus size={18} color={colors.primary_white_text} />
                      <ButtonText color={colors.primary_white_text}>
                        Đăng ký trang trại
                      </ButtonText>
                    </HStack>
                  </Button>
                </VStack>
              </Box>
            ) : (
              <VStack space="sm">
                {farms.map((farm) => (
                  <FarmSelectionCard
                    key={farm.id}
                    farm={farm}
                    isSelected={selectedFarm?.id === farm.id}
                    onSelect={() => setSelectedFarm(farm)}
                    colors={colors}
                  />
                ))}

                {/* Nút thêm trang trại mới */}
                <Pressable onPress={handleRegisterNewFarm}>
                  <Box
                    bg={colors.card_surface}
                    borderRadius="$xl"
                    p="$4"
                    borderWidth={1}
                    borderColor={colors.success}
                    borderStyle="dashed"
                  >
                    <HStack
                      space="sm"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Plus size={20} color={colors.success} />
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.success}
                      >
                        Thêm trang trại mới
                      </Text>
                    </HStack>
                  </Box>
                </Pressable>
              </VStack>
            )}
          </VStack>

          {/* Section 2: Ngày gieo trồng */}
          <VStack space="sm">
            <HStack space="xs" alignItems="center">
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                2. Ngày gieo trồng
              </Text>
              <Text fontSize="$xs" color={colors.error}>
                *
              </Text>
            </HStack>

            <Pressable onPress={() => setShowDatePicker(true)}>
              <Box
                bg={colors.success}
                borderRadius="$xl"
                p="$4"
                borderWidth={1}
                borderColor={colors.success}
              >
                <HStack
                  space="sm"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack space="sm" alignItems="center" flex={1}>
                    <Box
                      bg={colors.primary_white_text}
                      p="$2.5"
                      borderRadius="$md"
                    >
                      <Calendar size={20} color={colors.success} />
                    </Box>
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.primary_white_text}>
                        Ngày gieo trồng
                      </Text>
                      <Text
                        fontSize="$md"
                        fontWeight="$semibold"
                        color={colors.primary_white_text}
                      >
                        {plantingDate.toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Text>
                    </VStack>
                  </HStack>
                  <ChevronRight size={20} color={colors.primary_white_text} />
                </HStack>
              </Box>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                textColor={colors.primary_text}
                value={plantingDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                minimumDate={new Date()} // Không cho chọn quá khứ
                locale="vi-VN"
              />
            )}
          </VStack>

          {/* Section 3: Thông tin tính toán (Read-only) */}
          {selectedFarm && (
            <VStack space="sm">
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                3. Thông tin đăng ký
              </Text>

              <Box
                bg={colors.infoSoft}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.info}
              >
                <HStack space="xs" alignItems="flex-start">
                  <Info size={16} color={colors.info} />
                  <Text fontSize="$xs" color={colors.info} flex={1}>
                    Các thông tin bên dưới được tính toán tự động dựa trên diện
                    tích trang trại
                  </Text>
                </HStack>
              </Box>

              <VStack space="sm">
                {/* Thông tin gói bảo hiểm */}
                <Box
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <HStack space="sm" alignItems="center" mb="$3">
                    <Box bg={colors.primarySoft} p="$2" borderRadius="$md">
                      <Shield size={18} color={colors.primary} />
                    </Box>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Thông tin gói bảo hiểm
                    </Text>
                  </HStack>

                  <VStack space="sm">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Diện tích trang trại
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {areaMultiplier} ha
                      </Text>
                    </HStack>

                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Thời hạn bảo hiểm
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {base_policy.coverage_duration_days} ngày
                      </Text>
                    </HStack>

                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Số tiền bảo hiểm
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        {Utils.formatCurrency(coverageAmount)}
                      </Text>
                    </HStack>

                    {base_policy.is_payout_per_hectare && (
                      <Text fontSize="$xs" color={colors.secondary_text} italic>
                        • Tính theo diện tích:{" "}
                        {Utils.formatCurrency(base_policy.fix_payout_amount)}/ha
                      </Text>
                    )}
                  </VStack>
                </Box>

                {/* Chi phí thanh toán */}
                <Box
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <HStack space="sm" alignItems="center" mb="$3">
                    <Box bg={colors.warningSoft} p="$2" borderRadius="$md">
                      <Wallet size={18} color={colors.warning} />
                    </Box>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Chi phí cần thanh toán
                    </Text>
                  </HStack>

                  <VStack space="sm">
                    {/* Phí bảo hiểm cơ bản */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack flex={1}>
                        <Text fontSize="$xs" color={colors.muted_text}>
                          Phí BH cơ bản
                        </Text>
                        {base_policy.is_per_hectare ? (
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            {Utils.formatCurrency(
                              base_policy.fix_premium_amount
                            )}
                            /ha × {areaMultiplier} ha
                          </Text>
                        ) : (
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Phí cố định
                          </Text>
                        )}
                      </VStack>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        {Utils.formatCurrency(
                          base_policy.is_per_hectare
                            ? base_policy.fix_premium_amount * areaMultiplier
                            : base_policy.fix_premium_amount
                        )}
                      </Text>
                    </HStack>

                    {/* Hệ số phí bảo hiểm */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack flex={1}>
                        <Text fontSize="$xs" color={colors.muted_text}>
                          Hệ số phí BH
                        </Text>
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          Base rate áp dụng
                        </Text>
                      </VStack>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_text}
                      >
                        ×{base_policy.premium_base_rate}
                      </Text>
                    </HStack>

                    <Box h={1} bg={colors.frame_border} />

                    {/* Tổng phí bảo hiểm */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack flex={1}>
                        <Text
                          fontSize="$xs"
                          fontWeight="$bold"
                          color={colors.primary_text}
                        >
                          Tổng phí bảo hiểm
                        </Text>
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          Số tiền bạn cần thanh toán
                        </Text>
                      </VStack>
                      <Text
                        fontSize="$lg"
                        fontWeight="$bold"
                        color={colors.success}
                      >
                        {Utils.formatCurrency(totalPremium)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </VStack>
          )}

          {/* Section 4: Dynamic Document Tags Form */}
          {selectedFarm &&
            base_policy.document_tags &&
            Object.keys(base_policy.document_tags).length > 0 && (
              <VStack space="sm">
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  4. Thông tin bổ sung
                </Text>

                <DynamicDocumentTagsForm
                  documentTags={base_policy.document_tags}
                  onValuesChange={handleDocumentTagsChange}
                />
              </VStack>
            )}

          {/* Warning */}
          <Box
            bg={colors.warningSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.warning}
          >
            <HStack space="sm" alignItems="flex-start">
              <AlertCircle size={20} color={colors.warning} />
              <VStack flex={1} space="xs">
                <Text fontSize="$sm" fontWeight="$bold" color={colors.warning}>
                  Lưu ý quan trọng
                </Text>
                <Text fontSize="$xs" color={colors.warning} lineHeight={18}>
                  • Vui lòng kiểm tra kỹ thông tin trước khi xác nhận{"\n"}• Sau
                  khi đăng ký, bạn không thể chỉnh sửa thông tin{"\n"}• Hồ sơ sẽ
                  được xét duyệt trong 1-3 ngày làm việc
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Bottom CTA - Fixed Footer */}
      <Box
        bg={colors.background}
        borderTopWidth={1}
        borderTopColor={colors.frame_border}
        sx={{
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Tổng phí bảo hiểm */}
        <Box bg={colors.successSoft} px="$5" py="$4">
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Text
                fontSize="$xs"
                color={colors.muted_text}
                fontWeight="$medium"
              >
                Tổng phí bảo hiểm
              </Text>
              <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
                {Utils.formatCurrency(totalPremium)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              <Text fontSize="$xs" color={colors.secondary_text} mb="$0.5">
                Đã bao gồm hệ số bảo hiểm cơ bản
              </Text>
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                x {base_policy.premium_base_rate}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Button */}
        <Box px="$5" pt="$5" pb={`$${5 + bottomPadding}`} bg={colors.background}>
          <Button
            bg={isFormValid ? colors.success : colors.frame_border}
            borderRadius="$xl"
            size="lg"
            onPress={submitPolicy}
            isDisabled={!isFormValid || isSubmitting}
            sx={{
              shadowColor: isFormValid ? colors.success : "transparent",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isSubmitting ? (
              <HStack space="sm" alignItems="center">
                <Spinner size="small" color={colors.primary_white_text} />
                <ButtonText
                  color={colors.primary_white_text}
                  fontWeight="$bold"
                >
                  Đang xử lý...
                </ButtonText>
              </HStack>
            ) : (
              <HStack space="sm" alignItems="center">
                <CheckCircle2
                  size={20}
                  color={
                    isFormValid ? colors.primary_white_text : colors.muted_text
                  }
                />
                <ButtonText
                  color={
                    isFormValid ? colors.primary_white_text : colors.muted_text
                  }
                  fontSize="$md"
                  fontWeight="$bold"
                >
                  Xác nhận đăng ký
                </ButtonText>
              </HStack>
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// ============= SUB-COMPONENTS =============

type ColorSet = ReturnType<typeof useAgrisaColors>["colors"];

const FarmSelectionCard = ({
  farm,
  isSelected,
  onSelect,
  colors,
}: {
  farm: Farm;
  isSelected: boolean;
  onSelect: () => void;
  colors: ColorSet;
}) => (
  <Pressable onPress={onSelect}>
    <Box
      bg={isSelected ? colors.successSoft : colors.card_surface}
      borderRadius="$xl"
      p="$4"
      borderWidth={2}
      borderColor={isSelected ? colors.success : colors.frame_border}
    >
      <HStack space="md" alignItems="center">
        {/* Selection indicator */}
        <Box
          w={24}
          h={24}
          borderRadius="$full"
          borderWidth={2}
          borderColor={isSelected ? colors.success : colors.frame_border}
          bg={isSelected ? colors.success : "transparent"}
          alignItems="center"
          justifyContent="center"
        >
          {isSelected && (
            <CheckCircle2 size={16} color={colors.primary_white_text} />
          )}
        </Box>

        {/* Farm info */}
        <VStack flex={1}>
          <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
            {farm.farm_name}
          </Text>
          <HStack space="xs" alignItems="center" mt="$1">
            <MapPin size={12} color={colors.secondary_text} />
            <Text fontSize="$xs" color={colors.secondary_text}>
              {farm.district}, {farm.province}
            </Text>
          </HStack>
          <HStack space="md" mt="$2">
            <HStack space="xs" alignItems="center">
              <Leaf size={14} color={colors.muted_text} />
              <Text fontSize="$xs" color={colors.secondary_text}>
                {(farm.area_sqm)} ha
              </Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Text fontSize="$xs" color={colors.secondary_text}>
                {Utils.getCropLabel(farm.crop_type)}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  </Pressable>
);

const InfoReadOnlyCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  colors,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: any;
  iconBg?: string;
  iconColor?: string;
  colors: ColorSet;
}) => (
  <Box
    bg={colors.card_surface}
    borderRadius="$xl"
    p="$4"
    borderWidth={1}
    borderColor={colors.frame_border}
  >
    <HStack space="sm" alignItems="center">
      <Box bg={iconBg || colors.successSoft} p="$2.5" borderRadius="$md">
        <Icon size={20} color={iconColor || colors.success} />
      </Box>
      <VStack flex={1}>
        <Text fontSize="$xs" color={colors.muted_text}>
          {label}
        </Text>
        <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
          {value}
        </Text>
        {subtext && (
          <Text fontSize="$xs" color={colors.secondary_text} mt="$0.5">
            {subtext}
          </Text>
        )}
      </VStack>
    </HStack>
  </Box>
);

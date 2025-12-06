/**
 * ============================================
 * 📄 CONFIRM CARD INFO SCREEN
 * ============================================
 * Màn hình hiển thị thông tin từ CCCD sau khi quét
 * và yêu cầu xác nhận để cập nhật vào profile
 * 
 * Flow:
 * 1. Load thông tin CCCD từ getCardInfo
 * 2. Hiển thị thông tin dạng phiếu thông tin (không có icon)
 * 3. Xác nhận → Update profile → Hoàn tất eKYC (xử lý bởi useEkyc)
 * 4. Không có nút quay lại - block hardware back
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import {
  Box,
  Button,
  ButtonText,
  Center,
  HStack,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  CheckCircle2,
  RefreshCw,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";

export default function ConfirmCardInfoScreen() {
  const { colors } = useAgrisaColors();
  const { getCardInfo, confirmCardInfoMutation, isConfirming } = useEkyc();

  // Fetch card info
  const {
    data: cardInfoData,
    isLoading,
    isError,
    error,
    refetch,
  } = getCardInfo();

  const cardInfo = cardInfoData && "data" in cardInfoData ? cardInfoData.data : null;

  // Block hardware back button - không cho phép quay lại
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true // Return true để block back
    );
    return () => backHandler.remove();
  }, []);

  // Auto-fetch khi component mount
  useEffect(() => {
    console.log("🎴 [Confirm Card Info] Component mounted - Fetching card info...");
    refetch();
  }, []);

  // Handle confirm - không tự động redirect, để useEkyc xử lý với resultStatus
  const handleConfirm = useCallback(async () => {
    if (!cardInfo || isConfirming) return;
    console.log("✅ [Confirm Card Info] Confirming card info...");
    await confirmCardInfoMutation.mutateAsync(cardInfo);
  }, [cardInfo, isConfirming, confirmCardInfoMutation]);

  // Loading state
  if (isLoading) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.secondary_text}>
          Đang tải thông tin CCCD...
        </Text>
      </Center>
    );
  }

  // Error state
  if (isError || !cardInfo) {
    return (
      <Center flex={1} bg={colors.background} px="$6">
        <VStack space="lg" alignItems="center">
          <XCircle size={80} color={colors.error} />
          <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text} textAlign="center">
            Không thể tải thông tin
          </Text>
          <Text color={colors.secondary_text} textAlign="center">
            {error instanceof Error ? error.message : "Vui lòng thử lại sau."}
          </Text>

          <Button
            mt="$4"
            bg={colors.primary}
            onPress={() => refetch()}
          >
            <HStack space="sm" alignItems="center">
              <RefreshCw size={16} color={colors.primary_white_text} />
              <ButtonText color={colors.primary_white_text}>
                Thử lại
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg" p="$5" pb="$8">
          {/* Header - Tiêu đề thụt vào lề trái */}
          <VStack space="sm" pt="$4">
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color={colors.primary_text}
            >
              Xác nhận và tiếp theo
            </Text>

            <Text fontSize="$sm" color={colors.secondary_text}>
              Vui lòng kiểm tra thông tin trước khi xác nhận
            </Text>
          </VStack>

          {/* Phiếu thông tin - Dạng bảng đơn giản không có icon */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
          >
            {/* Tiêu đề phiếu */}
            <Box bg={colors.primary} p="$3">
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_white_text}
                textAlign="center"
              >
                Thông Tin Cá Nhân
              </Text>
            </Box>

            {/* Nội dung phiếu */}
            <VStack>
              <InfoField label="Số CCCD" value={cardInfo.national_id} colors={colors} />
              <InfoField label="Họ và tên" value={cardInfo.name} colors={colors} />
              <InfoField label="Ngày sinh" value={cardInfo.dob} colors={colors} />
              <InfoField label="Giới tính" value={cardInfo.sex} colors={colors} />
              <InfoField label="Quốc tịch" value={cardInfo.nationality} colors={colors} />
              <InfoField label="Quê quán" value={cardInfo.home} colors={colors} />
              <InfoField label="Nơi thường trú" value={cardInfo.address} colors={colors} />
              <InfoField label="Ngày cấp" value={cardInfo.issue_date} colors={colors} />
              <InfoField label="Ngày hết hạn" value={cardInfo.doe} colors={colors} />
              <InfoField label="Nơi cấp" value={cardInfo.issue_loc} colors={colors} isLast />
            </VStack>
          </Box>

          {/* Action Buttons - Chỉ có nút Xác nhận, không có nút quay lại */}
          <VStack space="md" mt="$2">
            {/* Confirm Button */}
            <Button
              bg={colors.success}
              borderRadius="$xl"
              h="$12"
              onPress={handleConfirm}
              isDisabled={isConfirming}
            >
              <HStack space="sm" alignItems="center">
                {isConfirming ? (
                  <Spinner size="small" color={colors.primary_white_text} />
                ) : (
                  <CheckCircle2 size={20} color={colors.primary_white_text} />
                )}
                <ButtonText
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  {isConfirming ? "Đang xử lý..." : "Xác nhận thông tin"}
                </ButtonText>
              </HStack>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

/**
 * Component hiển thị một dòng thông tin trong phiếu
 * Dạng đơn giản: Label - Value, không có icon
 */
interface InfoFieldProps {
  label: string;
  value: string;
  colors: any;
  isLast?: boolean;
}

function InfoField({ label, value, colors, isLast = false }: InfoFieldProps) {
  return (
    <Box
      px="$4"
      py="$3"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor={colors.frame_border}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <Text
          fontSize="$xs"
          color={colors.secondary_text}
          flex={1}
        >
          {label}
        </Text>
        <Text
          fontSize="$sm"
          fontWeight="$medium"
          color={colors.primary_text}
          flex={2}
          textAlign="right"
        >
          {value || "Chưa có"}
        </Text>
      </HStack>
    </Box>
  );
}

/**
 * 💳 Payment Info Screen - Hiển thị thông tin thanh toán
 * 
 * Component hiển thị:
 * - QR Code để quét thanh toán
 * - Thông tin tài khoản ngân hàng
 * - Thông tin đơn hàng
 * - Nút checkout URL dự phòng
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { PaymentResponse } from "@/domains/payment/models/payment.model";
import { Utils } from "@/libs/utils/utils";
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack
} from "@gluestack-ui/themed";
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    ExternalLink,
    Hash,
    User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard, Linking } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface PaymentInfoScreenProps {
  paymentData: PaymentResponse;
  onPaymentSuccess?: () => void;
  onPaymentCancel?: () => void;
}

export const PaymentInfoScreen: React.FC<PaymentInfoScreenProps> = ({
  paymentData,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { colors } = useAgrisaColors();
  const [countdown, setCountdown] = useState(0);

  // Calculate initial countdown
  useEffect(() => {
    const expiry = Utils.formatPaymentExpiry(paymentData.expired_at);
    setCountdown(expiry.remainingMinutes);
  }, [paymentData.expired_at]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const expiry = Utils.formatPaymentExpiry(paymentData.expired_at);
      setCountdown(expiry.remainingMinutes);

      if (expiry.isExpired) {
        clearInterval(timer);
      }
    }, 60000); // Update mỗi phút

    return () => clearInterval(timer);
  }, [paymentData.expired_at]);

  const countdownInfo = Utils.getPaymentCountdown(countdown);
  const expiryInfo = Utils.formatPaymentExpiry(paymentData.expired_at);

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("✅ Đã sao chép", `${label} đã được sao chép vào clipboard`);
  };

  // Open checkout URL
  const openCheckoutUrl = async () => {
    try {
      const canOpen = await Linking.canOpenURL(paymentData.checkout_url);
      if (canOpen) {
        await Linking.openURL(paymentData.checkout_url);
      } else {
        Alert.alert("Lỗi", "Không thể mở link thanh toán");
      }
    } catch (error) {
      console.error("Error opening checkout URL:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi mở link thanh toán");
    }
  };

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack space="md" p="$4" pb="$20">
        {/* ========== HEADER ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="sm" alignItems="center">
            <CreditCard size={32} color={colors.primary} strokeWidth={2} />
            <Text
              fontSize="$xl"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Thông tin thanh toán
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
              Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới
            </Text>
          </VStack>
        </Box>

        {/* ========== COUNTDOWN TIMER ========== */}
        {!expiryInfo.isExpired ? (
          <Box
            bg={
              countdownInfo.color === "error"
                ? colors.errorSoft
                : countdownInfo.color === "warning"
                  ? colors.warningSoft
                  : colors.successSoft
            }
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={
              colors[countdownInfo.color as keyof typeof colors] as string
            }
          >
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Clock
                size={16}
                color={
                  colors[countdownInfo.color as keyof typeof colors] as string
                }
                strokeWidth={2}
              />
              <VStack flex={1}>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={
                    colors[countdownInfo.color as keyof typeof colors] as string
                  }
                >
                  {countdownInfo.message}
                </Text>
                <Text
                  fontSize="$xs"
                  color={
                    colors[countdownInfo.color as keyof typeof colors] as string
                  }
                >
                  Còn lại: {countdownInfo.hours}h {countdownInfo.minutes}m
                </Text>
              </VStack>
            </HStack>
          </Box>
        ) : (
          <Box
            bg={colors.errorSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.error}
          >
            <HStack space="sm" alignItems="center" justifyContent="center">
              <AlertCircle size={16} color={colors.error} strokeWidth={2} />
              <Text fontSize="$sm" fontWeight="$bold" color={colors.error}>
                ⏰ Phiên thanh toán đã hết hạn
              </Text>
            </HStack>
          </Box>
        )}

        {/* ========== QR CODE ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="md" alignItems="center">
            <Text
              fontSize="$lg"
              fontWeight="$bold"
              color={colors.primary_text}
            >
              Quét mã QR để thanh toán
            </Text>

            {/* QR Code */}
            <Box
              bg={colors.background}
              p="$4"
              borderRadius="$xl"
              borderWidth={2}
              borderColor={colors.primary}
            >
              <QRCode
                value={paymentData.qr_code}
                size={220}
                color={colors.primary_text}
                backgroundColor={colors.background}
                logoSize={40}
                logoMargin={4}
                logoBorderRadius={8}
              />
            </Box>

            <VStack space="xs" alignItems="center">
              <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
                Mở app ngân hàng và quét mã QR
              </Text>
              <Text fontSize="$xs" color={colors.muted_text} textAlign="center">
                Hỗ trợ tất cả ngân hàng có tính năng VietQR
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* ========== THÔNG TIN CHUYỂN KHOẢN ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm" justifyContent="center">
              <Building2 size={16} color={colors.primary} strokeWidth={2} />
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Thông tin chuyển khoản
              </Text>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Ngân hàng */}
            <VStack space="xs">
              <Text fontSize="$xs" color={colors.secondary_text}>
                Ngân hàng
              </Text>
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {Utils.getBankName(paymentData.bin)}
                </Text>
                <Text fontSize="$xs" color={colors.muted_text}>
                  BIN: {paymentData.bin}
                </Text>
              </HStack>
            </VStack>

            {/* Số tài khoản */}
            <VStack space="xs">
              <Text fontSize="$xs" color={colors.secondary_text}>
                Số tài khoản
              </Text>
              <Pressable
                onPress={() =>
                  copyToClipboard(paymentData.account_number, "Số tài khoản")
                }
              >
                <HStack
                  space="sm"
                  alignItems="center"
                  bg={colors.background}
                  p="$3"
                  borderRadius="$lg"
                >
                  <Text
                    flex={1}
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {Utils.formatBankAccount(paymentData.account_number)}
                  </Text>
                  <Copy size={16} color={colors.primary} strokeWidth={2} />
                </HStack>
              </Pressable>
            </VStack>

            {/* Tên tài khoản */}
            <VStack space="xs">
              <Text fontSize="$xs" color={colors.secondary_text}>
                Tên tài khoản
              </Text>
              <HStack space="xs" alignItems="center">
                <User size={14} color={colors.primary} strokeWidth={2} />
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {paymentData.account_name}
                </Text>
              </HStack>
            </VStack>

            {/* Số tiền */}
            <VStack space="xs">
              <Text fontSize="$xs" color={colors.secondary_text}>
                Số tiền
              </Text>
              <Pressable
                onPress={() =>
                  copyToClipboard(
                    paymentData.amount.toString(),
                    "Số tiền"
                  )
                }
              >
                <HStack
                  space="sm"
                  alignItems="center"
                  bg={colors.successSoft}
                  p="$3"
                  borderRadius="$lg"
                >
                  <Text
                    flex={1}
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={colors.success}
                  >
                    {Utils.formatCurrency(paymentData.amount)}
                  </Text>
                  <Copy size={16} color={colors.success} strokeWidth={2} />
                </HStack>
              </Pressable>
            </VStack>

            {/* Nội dung chuyển khoản */}
            <VStack space="xs">
              <Text fontSize="$xs" color={colors.secondary_text}>
                Nội dung chuyển khoản
              </Text>
              <Pressable
                onPress={() =>
                  copyToClipboard(paymentData.description, "Nội dung")
                }
              >
                <HStack
                  space="sm"
                  alignItems="center"
                  bg={colors.background}
                  p="$3"
                  borderRadius="$lg"
                >
                  <Text
                    flex={1}
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {paymentData.description}
                  </Text>
                  <Copy size={16} color={colors.primary} strokeWidth={2} />
                </HStack>
              </Pressable>
              <Text fontSize="$2xs" color={colors.error}>
                ⚠️ Vui lòng nhập chính xác nội dung để hệ thống xác nhận tự động
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* ========== THÔNG TIN ĐỐN HÀNG ========== */}
        <Box
          bg={colors.card_surface}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="sm">
            <Text
              fontSize="$md"
              fontWeight="$bold"
              color={colors.primary_text}
            >
              Thông tin đơn hàng
            </Text>

            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <Hash size={12} color={colors.secondary_text} strokeWidth={2} />
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Mã đơn hàng
                </Text>
              </HStack>
              <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                {Utils.formatOrderCode(paymentData.order_code)}
              </Text>
            </HStack>

            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <Calendar
                  size={12}
                  color={colors.secondary_text}
                  strokeWidth={2}
                />
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Hết hạn lúc
                </Text>
              </HStack>
              <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                {expiryInfo.formattedTime}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* ========== BUTTON CHECKOUT URL (DỰ PHÒNG) ========== */}
        <Pressable onPress={openCheckoutUrl}>
          <Box
            bg={colors.primary}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.primary}
          >
            <HStack space="sm" alignItems="center" justifyContent="center">
              <ExternalLink
                size={16}
                color={colors.primary_white_text}
                strokeWidth={2}
              />
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_white_text}
              >
                Thanh toán trên web (dự phòng)
              </Text>
            </HStack>
          </Box>
        </Pressable>

        {/* ========== HƯỚNG DẪN ========== */}
        <Box
          bg={colors.infoSoft}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.info}
        >
          <VStack space="sm">
            <HStack space="xs" alignItems="center">
              <CheckCircle2 size={14} color={colors.info} strokeWidth={2} />
              <Text fontSize="$sm" fontWeight="$bold" color={colors.info}>
                Hướng dẫn thanh toán
              </Text>
            </HStack>

            <VStack space="xs">
              <Text fontSize="$xs" color={colors.info}>
                1. Quét mã QR bằng app ngân hàng (khuyến nghị)
              </Text>
              <Text fontSize="$xs" color={colors.info}>
                2. Hoặc chuyển khoản thủ công theo thông tin trên
              </Text>
              <Text fontSize="$xs" color={colors.info}>
                3. Nhập chính xác nội dung chuyển khoản
              </Text>
              <Text fontSize="$xs" color={colors.info}>
                4. Hệ thống sẽ tự động xác nhận trong 1-2 phút
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* ========== LƯU Ý ========== */}
        <Box
          bg={colors.warningSoft}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.warning}
        >
          <VStack space="sm">
            <HStack space="xs" alignItems="center">
              <AlertCircle size={14} color={colors.warning} strokeWidth={2} />
              <Text fontSize="$sm" fontWeight="$bold" color={colors.warning}>
                Lưu ý quan trọng
              </Text>
            </HStack>

            <VStack space="xs">
              <Text fontSize="$xs" color={colors.warning}>
                • Không tắt ứng dụng trong quá trình thanh toán
              </Text>
              <Text fontSize="$xs" color={colors.warning}>
                • Chuyển đúng số tiền và nội dung như hướng dẫn
              </Text>
              <Text fontSize="$xs" color={colors.warning}>
                • Giao dịch sẽ hết hạn sau {countdownInfo.hours}h{" "}
                {countdownInfo.minutes}m
              </Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

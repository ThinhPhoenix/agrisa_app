import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuth } from "@/domains/auth/hooks/use-auth";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

/**
 * ============================================
 * 📱 PHONE INPUT SCREEN
 * ============================================
 * Màn hình đầu tiên - Chỉ nhập số điện thoại
 */
export default function PhoneVerificationScreen() {
  const notification = useGlobalNotification();
  const { sendPhoneOTPMutation, checkSignUpIdentifierMutation } = useAuth();
  const {
    formData,
    setPhone,
    canSendOtp,
    getTimeUntilNextOtp,
    incrementOtpCount,
    updateLastOtpTime,
    isOtpBlocked,
  } = useSignUpStore();
  const { colors } = useAgrisaColors();

  const [phoneInput, setPhoneInput] = useState(formData.phone || "");

  // ============================================
  // 📤 GỬI OTP VÀ CHUYỂN SANG TRANG OTP
  // ============================================
  const handleSendOTP = async () => {
    // Validate phone number
    if (!phoneInput.trim()) {
      notification.error("Vui lòng nhập số điện thoại");
      return;
    }

    // Check định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneInput.trim())) {
      notification.error(
        "Số điện thoại không hợp lệ."
      );
      return;
    }

    // Check nếu đã block
    if (isOtpBlocked) {
      notification.error(
        "Bạn đã gửi OTP quá 5 lần. Vui lòng liên hệ hỗ trợ để được giúp đỡ."
      );
      return;
    }

    // Check cooldown
    if (!canSendOtp()) {
      const timeLeft = getTimeUntilNextOtp();
      notification.error(`Vui lòng đợi ${timeLeft} giây trước khi gửi lại OTP`);
      return;
    }

    try {
      // Check identifier trước - nếu available = false (đã tồn tại) thì không cho đăng ký
      console.log("🔍 [Phone] Checking if phone exists...");
      await checkSignUpIdentifierMutation.mutateAsync(phoneInput.trim());

      // Nếu available = true => số chưa tồn tại => Có thể đăng ký
      console.log("✅ [Phone] Phone is available for registration");

      // Gửi OTP
      await sendPhoneOTPMutation.mutateAsync(phoneInput.trim());

      // Lưu phone vào store
      setPhone(phoneInput.trim());

      // Cập nhật OTP state
      incrementOtpCount();
      updateLastOtpTime();

      // Chuyển sang màn hình OTP riêng
      router.push("/auth/sign-up/otp-verification");

      console.log("✅ [Phone] OTP sent, redirecting to OTP screen");
    } catch (error: any) {
      // Nếu lỗi từ checkIdentifier (available = false) thì đã được xử lý trong hook
      console.error("❌ [Phone] Error:", error);
    }
  };

  // ============================================
  // 🎨 RENDER UI
  // ============================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form Container */}
          <Box
            style={{
              backgroundColor: colors.card_surface,
              borderRadius: 24,
              padding: 28,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {/* Header với Logo bên trong Box */}
            <VStack space="md" className="mb-8">
              <HStack space="md" className="items-center">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.successSoft,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Phone size={28} color={colors.success} strokeWidth={2.5} />
                </Box>
                <VStack className="flex-1">
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: colors.primary_text,
                    }}
                  >
                    Đăng ký tài khoản
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.secondary_text,
                      marginTop: 2,
                    }}
                  >
                    Nhập số điện thoại để bắt đầu
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Phone Input */}
            <VStack space="sm" className="mb-6">
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.primary_text,
                }}
              >
                Số điện thoại <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                value={phoneInput}
                onChangeText={setPhoneInput}
                placeholder="Số điện thoại"
                placeholderTextColor={colors.muted_text}
                keyboardType="phone-pad"
                maxLength={10}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1.5,
                  borderColor: colors.frame_border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.primary_text,
                  fontWeight: "500",
                }}
              />
            </VStack>

            {/* Blocked Warning */}
            {isOtpBlocked && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.error,
                  fontWeight: "600",
                  marginBottom: 16,
                }}
              >
                Bạn đã gửi OTP quá 5 lần. Vui lòng liên hệ hỗ trợ.
              </Text>
            )}

            {/* Send OTP Button */}
            <TouchableOpacity
              onPress={handleSendOTP}
              disabled={
                checkSignUpIdentifierMutation.isPending ||
                sendPhoneOTPMutation.isPending ||
                isOtpBlocked
              }
              style={{
                backgroundColor:
                  checkSignUpIdentifierMutation.isPending ||
                  sendPhoneOTPMutation.isPending ||
                  isOtpBlocked
                    ? colors.muted_text
                    : colors.success,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {(checkSignUpIdentifierMutation.isPending ||
                sendPhoneOTPMutation.isPending) && (
                <ActivityIndicator
                  color={colors.primary_white_text}
                  size="small"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                style={{
                  color: colors.primary_white_text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {checkSignUpIdentifierMutation.isPending ||
                sendPhoneOTPMutation.isPending
                  ? "Đang xử lý..."
                  : "Tiếp theo"}
              </Text>
              {!checkSignUpIdentifierMutation.isPending &&
                !sendPhoneOTPMutation.isPending && (
                  <ArrowRight
                    size={20}
                    color={colors.primary_white_text}
                    style={{ marginLeft: 8 }}
                  />
                )}
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderColor: colors.frame_border,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <ArrowLeft
                size={20}
                color={colors.secondary_text}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: colors.secondary_text,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

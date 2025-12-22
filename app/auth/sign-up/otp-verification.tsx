import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuth } from "@/domains/auth/hooks/use-auth";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
 * 🔐 OTP VERIFICATION SCREEN
 * ============================================
 * Màn hình xác thực OTP riêng biệt
 */
export default function OTPVerificationScreen() {
  const notification = useGlobalNotification();
  const { sendPhoneOTPMutation, verifyPhoneOTPMutation } = useAuth();
  const {
    formData,
    setPhoneVerified,
    canSendOtp,
    getTimeUntilNextOtp,
    incrementOtpCount,
    updateLastOtpTime,
    isOtpBlocked,
  } = useSignUpStore();
  const { colors } = useAgrisaColors();

  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60); // Start with 60s countdown

  // ============================================
  // ⏱️ COUNTDOWN TIMER
  // ============================================
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ============================================
  // 📤 GỬI LẠI OTP
  // ============================================
  const handleResendOTP = async () => {
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
      await sendPhoneOTPMutation.mutateAsync(formData.phone);
      
      // Cập nhật OTP state
      incrementOtpCount();
      updateLastOtpTime();
      setCountdown(60); // Reset countdown
      setOtpCode(""); // Clear OTP input
      
      console.log("✅ [OTP] Resent successfully");
    } catch (error) {
      console.error("❌ [OTP] Error resending OTP:", error);
    }
  };

  // ============================================
  // ✅ XÁC THỰC OTP
  // ============================================
  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      notification.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    try {
      await verifyPhoneOTPMutation.mutateAsync({
        phone: formData.phone,
        code: otpCode.trim(),
      });
      
      // Đánh dấu phone đã verify
      setPhoneVerified(true);
      
      // Chuyển sang màn hình nhập email
      router.push("/auth/sign-up/email-input");
    } catch (error) {
      console.error("❌ [OTP] Error verifying OTP:", error);
      setOtpCode(""); // Clear OTP input
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
            {/* Header với Icon bên trong Box */}
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
                  <ShieldCheck
                    size={28}
                    color={colors.success}
                    strokeWidth={2.5}
                  />
                </Box>
                <VStack className="flex-1">
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: colors.primary_text,
                    }}
                  >
                    Xác thực OTP
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.secondary_text,
                      marginTop: 2,
                    }}
                  >
                    Nhập mã OTP đã được gửi về
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Phone Number Display - 1 dòng */}
            <Box
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.frame_border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary_text,
                }}
              >
                <Text style={{ color: colors.secondary_text }}>
                  Mã OTP đã được gửi đến:{" "}
                </Text>
                <Text style={{ fontWeight: "700" }}>{formData.phone}</Text>
              </Text>
            </Box>

            {/* OTP Input */}
            <VStack space="sm" className="mb-4">
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.primary_text,
                }}
              >
                Mã OTP <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="Nhập mã OTP (6 ký tự)"
                placeholderTextColor={colors.muted_text}
                keyboardType="default"
                autoCapitalize="characters"
                maxLength={6}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1.5,
                  borderColor:
                    otpCode.length === 6
                      ? colors.success
                      : colors.frame_border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.primary_text,
                  fontWeight: "600",
                  letterSpacing: 2,
                }}
              />
            </VStack>

            {/* Text Gửi lại với countdown */}
            <Box style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.secondary_text,
                }}
              >
                Bạn chưa nhận được mã OTP?{" "}
                {sendPhoneOTPMutation.isPending ? (
                  <Text style={{ color: colors.info }}>Đang gửi...</Text>
                ) : countdown > 0 || !canSendOtp() ? (
                  <Text style={{ color: colors.muted_text }}>
                    Gửi lại {countdown > 0 ? `(${countdown}s)` : ""}
                  </Text>
                ) : (
                  <Text
                    style={{ 
                      color: colors.info, 
                      fontWeight: "700",
                      textDecorationLine: "underline"
                    }}
                    onPress={handleResendOTP}
                  >
                    Gửi lại
                  </Text>
                )}
              </Text>
            </Box>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyOTP}
              disabled={
                verifyPhoneOTPMutation.isPending || otpCode.length !== 6
              }
              style={{
                backgroundColor:
                  verifyPhoneOTPMutation.isPending || otpCode.length !== 6
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
              {verifyPhoneOTPMutation.isPending && (
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
                {verifyPhoneOTPMutation.isPending
                  ? "Đang xác thực..."
                  : "Xác nhận"}
              </Text>
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
                Đổi số điện thoại
              </Text>
            </TouchableOpacity>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

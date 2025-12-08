import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuth } from "@/domains/auth/hooks/use-auth";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
    <ImageBackground
      source={require("@/assets/images/Cover/Agrisa_Cover.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
            {/* Logo */}
            <VStack space="xl" className="items-center mb-10">
              <Image
                source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
              <VStack space="xs" className="items-center">
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: colors.primary_white_text,
                    textAlign: "center",
                  }}
                >
                  Xác thực OTP
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.primary_white_text,
                    opacity: 0.9,
                    textAlign: "center",
                  }}
                >
                  Nhập mã OTP đã được gửi về
                </Text>
              </VStack>
            </VStack>

            {/* Form Container */}
            <Box
              style={{
                backgroundColor: colors.background,
                borderRadius: 24,
                padding: 28,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {/* Progress Indicator */}
              <HStack space="sm" className="mb-6">
                <Box
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: colors.success,
                    borderRadius: 2,
                  }}
                />
                <Box
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: colors.frame_border,
                    borderRadius: 2,
                  }}
                />
                <Box
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: colors.frame_border,
                    borderRadius: 2,
                  }}
                />
                <Box
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: colors.frame_border,
                    borderRadius: 2,
                  }}
                />
              </HStack>

              {/* Step Indicator */}
              <Text
                style={{
                  fontSize: 13,
                  color: colors.muted_text,
                  textAlign: "center",
                  marginBottom: 24,
                  fontWeight: "600",
                }}
              >
                Bước 1/4 - Xác thực OTP
              </Text>

              {/* Shield Icon */}
              <VStack space="md" className="items-center mb-6">
                <Box
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.successSoft,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ShieldCheck size={32} color={colors.success} strokeWidth={2.5} />
                </Box>
              </VStack>

              {/* Phone Number Display */}
              <Box
                style={{
                  backgroundColor: colors.card_surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.success,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.secondary_text,
                    marginBottom: 4,
                  }}
                >
                  Mã OTP đã được gửi đến:
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    color: colors.primary_text,
                    fontWeight: "700",
                  }}
                >
                  {formData.phone}
                </Text>
              </Box>

              {/* OTP Input */}
              <VStack space="sm" className="mb-6">
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
                  placeholder="● ● ● ● ● ●"
                  placeholderTextColor={colors.muted_text}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    backgroundColor: colors.card_surface,
                    borderWidth: 2,
                    borderColor: otpCode.length === 6 ? colors.success : colors.frame_border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 24,
                    letterSpacing: 12,
                    textAlign: "center",
                    color: colors.primary_text,
                    fontWeight: "700",
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.muted_text,
                    textAlign: "center",
                  }}
                >
                  Nhập 6 số OTP từ tin nhắn
                </Text>
              </VStack>

              {/* Countdown Timer */}
              {countdown > 0 && (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.secondary_text,
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  Mã OTP còn hiệu lực trong{" "}
                  <Text style={{ fontWeight: "700", color: colors.warning }}>
                    {countdown}s
                  </Text>
                </Text>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerifyOTP}
                disabled={verifyPhoneOTPMutation.isPending || otpCode.length !== 6}
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
                  {verifyPhoneOTPMutation.isPending ? "Đang xác thực..." : "Xác nhận"}
                </Text>
              </TouchableOpacity>

              {/* Resend OTP Button */}
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={sendPhoneOTPMutation.isPending || countdown > 0 || !canSendOtp()}
                style={{
                  backgroundColor: "transparent",
                  borderWidth: 2,
                  borderColor: countdown > 0 ? colors.frame_border : colors.info,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {sendPhoneOTPMutation.isPending ? (
                  <ActivityIndicator
                    color={colors.info}
                    size="small"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <RefreshCw
                    size={20}
                    color={countdown > 0 ? colors.muted_text : colors.info}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text
                  style={{
                    color: countdown > 0 ? colors.muted_text : colors.info,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {sendPhoneOTPMutation.isPending
                    ? "Đang gửi..."
                    : countdown > 0
                    ? `Gửi lại sau ${countdown}s`
                    : "Gửi lại mã OTP"}
                </Text>
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  backgroundColor: "transparent",
                  borderWidth: 2,
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
    </ImageBackground>
  );
}

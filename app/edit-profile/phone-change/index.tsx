/**
 * ============================================
 * 📱 THAY ĐỔI SỐ ĐIỆN THOẠI
 * ============================================
 * Trang thay đổi số điện thoại đăng nhập
 * Flow: Nhập số mới -> Gửi OTP -> Xác thực OTP -> Cập nhật
 * Copy logic từ sign-up flow
 */

import { AgrisaHeader } from "@/components/Header";
import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuth } from "@/domains/auth/hooks/use-auth";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { UserProfile } from "@/domains/auth/models/auth.models";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";

export default function PhoneChangeScreen() {
  const notification = useGlobalNotification();
  const { colors } = useAgrisaColors();
  const { sendPhoneOTPMutation, verifyPhoneOTPMutation, checkSignUpIdentifierMutation } = useAuth();
  const { updateProfile } = useAuthMe();

  // States - không load current phone, để user tự điền số mới
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // OTP cooldown management
  const [otpSentCount, setOtpSentCount] = useState(0);
  const [lastOtpTime, setLastOtpTime] = useState<number | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (step === "verify" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          setCanResend(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  // Check OTP cooldown
  const canSendOtp = (): boolean => {
    if (otpSentCount >= 5) {
      notification.error("Bạn đã gửi OTP quá 5 lần. Vui lòng liên hệ hỗ trợ!");
      return false;
    }

    if (lastOtpTime) {
      const timeSince = Date.now() - lastOtpTime;
      const cooldown = 60 * 1000; // 1 phút
      if (timeSince < cooldown) {
        const timeLeft = Math.ceil((cooldown - timeSince) / 1000);
        notification.error(`Vui lòng đợi ${timeLeft} giây trước khi gửi lại OTP`);
        return false;
      }
    }

    return true;
  };

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone.trim());
  };

  // Handle send OTP
  const handleSendOTP = async () => {
    if (!newPhoneInput.trim()) {
      notification.error("Vui lòng nhập số điện thoại mới");
      return;
    }

    if (!validatePhone(newPhoneInput)) {
      notification.error("Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0");
      return;
    }

    if (!canSendOtp()) return;

    try {
      // Kiểm tra số điện thoại đã tồn tại chưa
      console.log("🔍 [Phone Change] Checking if phone exists...");
      await checkSignUpIdentifierMutation.mutateAsync(newPhoneInput.trim());
      
      // Nếu đến đây tức là số đã tồn tại (available = true trong sign up context)
      // Trong context phone change, available = true nghĩa là số đã tồn tại => Không cho đổi
      notification.error("Số điện thoại này đã được sử dụng bởi tài khoản khác");
      return;
    } catch (checkError: any) {
      // Nếu lỗi "Identifier already exists" => Số đã tồn tại => Không cho đổi
      if (checkError.message === "Identifier already exists") {
        // Lỗi này đã được handle trong mutation
        return;
      }
      
      // Nếu là lỗi khác => Log và tiếp tục gửi OTP
      console.log("✅ [Phone Change] Phone is available, proceeding to send OTP");
    }

    try {
      // Gửi OTP
      await sendPhoneOTPMutation.mutateAsync(newPhoneInput.trim());
      setOtpSentCount(otpSentCount + 1);
      setLastOtpTime(Date.now());
      setStep("verify");
      setCountdown(60);
      setCanResend(false);
      notification.success("Đã gửi mã OTP đến số điện thoại mới");
    } catch (error: any) {
      console.error("❌ Error sending OTP:", error);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canSendOtp()) return;

    try {
      await sendPhoneOTPMutation.mutateAsync(newPhoneInput.trim());
      setOtpSentCount(otpSentCount + 1);
      setLastOtpTime(Date.now());
      setCountdown(60);
      setCanResend(false);
      setOtpCode("");
      notification.success("Đã gửi lại mã OTP");
    } catch (error: any) {
      console.error("❌ Error resending OTP:", error);
    }
  };

  // Handle verify OTP and update phone
  const handleVerifyAndUpdate = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      notification.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    try {
      // Verify OTP
      await verifyPhoneOTPMutation.mutateAsync({
        phone: newPhoneInput.trim(),
        code: otpCode.trim(),
      });

      // Update phone in profile
      const updateData: Partial<UserProfile> = {
        primary_phone: newPhoneInput.trim(),
      };

      await updateProfile(updateData);

      Alert.alert("Thành công", "Đổi số điện thoại thành công!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("❌ Error verifying OTP or updating phone:", error);
      setOtpCode("");
    }
  };

  // Render Step 1: Input new phone
  if (step === "input") {
    return (
      <>
        <AgrisaHeader title="Thay đổi số điện thoại" />
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
                <VStack space="md" className="mb-8">
                  <HStack space="md" className="items-center">
                    <Box
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: `${colors.primary}15`,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Phone size={28} color={colors.primary} strokeWidth={2.5} />
                    </Box>
                    <VStack flex={1}>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "700",
                          color: colors.primary_text,
                          marginBottom: 4,
                        }}
                      >
                        Thay đổi số điện thoại
                      </Text>
                      
                    </VStack>
                  </HStack>
                </VStack>

                {/* New Phone Input */}
                <VStack space="sm" mb="$6">
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary_text }}>
                    Số điện thoại mới <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    value={newPhoneInput}
                    onChangeText={setNewPhoneInput}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={{
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: colors.frame_border,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: colors.primary_text,
                      backgroundColor: colors.background,
                    }}
                    placeholderTextColor={colors.muted_text}
                  />
                  
                </VStack>

                {/* Send OTP Button */}
                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={sendPhoneOTPMutation.isPending}
                  style={{
                    backgroundColor: sendPhoneOTPMutation.isPending ? colors.frame_border : colors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {sendPhoneOTPMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", marginRight: 8 }}>
                        Gửi mã OTP
                      </Text>
                      <ArrowRight size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.frame_border,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.primary_text, fontSize: 16, fontWeight: "600" }}>Hủy</Text>
                </TouchableOpacity>
              </Box>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </>
    );
  }

  // Render Step 2: Verify OTP
  return (
    <>
      <AgrisaHeader title="Xác thực OTP" />
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
              <VStack space="md" className="mb-8">
                <HStack space="md" className="items-center">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: `${colors.primary}15`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ShieldCheck size={28} color={colors.primary} strokeWidth={2.5} />
                  </Box>
                    <VStack flex={1}>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "700",
                          color: colors.primary_text,
                          marginBottom: 4,
                        }}
                      >
                        Xác thực OTP
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.secondary_text }}>
                        Nhập mã 6 số đã gửi tới {newPhoneInput}
                      </Text>
                    </VStack>
                </HStack>
              </VStack>

              {/* OTP Input */}
              <VStack space="sm" mb="$6">
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary_text }}>
                  Mã OTP (6 số) <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Nhập 6 số OTP"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: colors.frame_border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 20,
                    letterSpacing: 8,
                    textAlign: "center",
                    color: colors.primary_text,
                    backgroundColor: colors.background,
                    fontWeight: "600",
                  }}
                  placeholderTextColor={colors.muted_text}
                />
                <Text style={{ fontSize: 12, color: colors.secondary_text, textAlign: "center", marginTop: 4 }}>
                  Kiểm tra tin nhắn SMS trên điện thoại của bạn
                </Text>
              </VStack>

              {/* Countdown / Resend */}
              <Box style={{ alignItems: "center", marginBottom: 20 }}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOTP} disabled={verifyPhoneOTPMutation.isPending}>
                    <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
                      Gửi lại mã OTP
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: colors.secondary_text, fontSize: 14 }}>
                    Gửi lại sau {countdown}s
                  </Text>
                )}
              </Box>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerifyAndUpdate}
                disabled={verifyPhoneOTPMutation.isPending}
                style={{
                  backgroundColor: verifyPhoneOTPMutation.isPending ? colors.frame_border : colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                {verifyPhoneOTPMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                    Xác nhận và cập nhật
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => setStep("input")}
                style={{
                  borderWidth: 2,
                  borderColor: colors.frame_border,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.primary_text, fontSize: 16, fontWeight: "600" }}>
                  Quay lại
                </Text>
              </TouchableOpacity>
            </Box>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

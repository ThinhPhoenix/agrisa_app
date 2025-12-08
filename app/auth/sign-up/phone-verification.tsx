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
 * 📱 PHONE INPUT SCREEN
 * ============================================
 * Màn hình đầu tiên - Chỉ nhập số điện thoại
 */
export default function PhoneVerificationScreen() {
  const notification = useGlobalNotification();
  const { sendPhoneOTPMutation } = useAuth();
  const { formData, setPhone, canSendOtp, getTimeUntilNextOtp, incrementOtpCount, updateLastOtpTime, isOtpBlocked } = useSignUpStore();
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
      notification.error("Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0");
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
      await sendPhoneOTPMutation.mutateAsync(phoneInput.trim());
      
      // Lưu phone vào store
      setPhone(phoneInput.trim());
      
      // Cập nhật OTP state
      incrementOtpCount();
      updateLastOtpTime();
      
      // Chuyển sang màn hình OTP riêng
      router.push("/auth/sign-up/otp-verification");
      
      console.log("✅ [Phone] OTP sent, redirecting to OTP screen");
    } catch (error) {
      console.error("❌ [Phone] Error sending OTP:", error);
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
                  Đăng ký tài khoản
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.primary_white_text,
                    opacity: 0.9,
                    textAlign: "center",
                  }}
                >
                  Nhập số điện thoại để bắt đầu
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
                Bước 1/4
              </Text>

              {/* Phone Icon */}
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
                  <Phone size={32} color={colors.success} strokeWidth={2.5} />
                </Box>
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
                  placeholder="Nhập số điện thoại (VD: 0901234567)"
                  placeholderTextColor={colors.muted_text}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={{
                    backgroundColor: colors.card_surface,
                    borderWidth: 2,
                    borderColor: colors.frame_border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.primary_text,
                    fontWeight: "500",
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.muted_text,
                  }}
                >
                  Số điện thoại sẽ được dùng để xác thực tài khoản
                </Text>
              </VStack>

              {/* Info Card */}
              <Box
                style={{
                  backgroundColor: colors.infoSoft,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.info,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.primary_text,
                    lineHeight: 22,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Lưu ý:</Text>{"\n"}
                  • Nhập số điện thoại 10 số bắt đầu bằng 0{"\n"}
                  • Mã OTP sẽ được gửi qua tin nhắn{"\n"}
                  • Bạn có tối đa 5 lần gửi OTP
                </Text>
              </Box>

              {/* Blocked Warning */}
              {isOtpBlocked && (
                <Box
                  style={{
                    backgroundColor: colors.errorSoft,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.error,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.error,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Bạn đã gửi OTP quá 5 lần.{"\n"}
                    Vui lòng liên hệ hỗ trợ để được giúp đỡ.
                  </Text>
                </Box>
              )}

              {/* Send OTP Button */}
              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={sendPhoneOTPMutation.isPending || isOtpBlocked}
                style={{
                  backgroundColor:
                    sendPhoneOTPMutation.isPending || isOtpBlocked
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
                {sendPhoneOTPMutation.isPending && (
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
                  {sendPhoneOTPMutation.isPending ? "Đang gửi..." : "Tiếp theo"}
                </Text>
                {!sendPhoneOTPMutation.isPending && (
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
                  Quay lại đăng nhập
                </Text>
              </TouchableOpacity>
            </Box>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

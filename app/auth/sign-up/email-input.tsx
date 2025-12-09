import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
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
 * 📧 EMAIL INPUT SCREEN
 * ============================================
 * Màn hình thứ 2 - Nhập email
 */
export default function EmailInputScreen() {
  const notification = useGlobalNotification();
  const { formData, setEmail } = useSignUpStore();
  const { colors } = useAgrisaColors();

  const [emailInput, setEmailInput] = useState(formData.email || "");

  // ============================================
  // ✅ VALIDATE & CONTINUE
  // ============================================
  const handleContinue = () => {
    // Validate email
    if (!emailInput.trim()) {
      notification.error("Vui lòng nhập địa chỉ email");
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      notification.error("Địa chỉ email không hợp lệ");
      return;
    }

    // Lưu email vào store
    setEmail(emailInput.trim());

    // Chuyển sang màn hình nhập CCCD
    router.push("/auth/sign-up/cccd-input");
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
                  Thông tin email
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.primary_white_text,
                    opacity: 0.9,
                    textAlign: "center",
                  }}
                >
                  Để nhận thông báo quan trọng
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
                Bước 2/4
              </Text>

              {/* Mail Icon */}
              <VStack space="md" className="items-center mb-6">
                <Box
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.infoSoft,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Mail size={32} color={colors.info} strokeWidth={2.5} />
                </Box>
              </VStack>

              {/* Email Input */}
              <VStack space="sm" className="mb-6">
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.primary_text,
                  }}
                >
                  Địa chỉ Email <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.muted_text}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
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
                  Email sẽ được sử dụng để nhận thông báo quan trọng
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
                  <Text style={{ fontWeight: "700" }}>
                    Email sẽ được dùng để:
                  </Text>
                  {"\n"}• Nhận thông báo về hợp đồng bảo hiểm{"\n"}• Khôi phục
                  mật khẩu khi cần{"\n"}• Nhận thông tin quan trọng từ Agrisa
                </Text>
              </Box>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                style={{
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.primary_white_text,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Tiếp theo
                </Text>
                <ArrowRight
                  size={20}
                  color={colors.primary_white_text}
                  style={{ marginLeft: 8 }}
                />
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
                  Quay lại
                </Text>
              </TouchableOpacity>
            </Box>

            {/* Verified Phone Info */}
            <Box
              style={{
                marginTop: 24,
                backgroundColor: `${colors.success}20`,
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 2,
                borderColor: `${colors.success}40`,
              }}
            >
              <CheckCircle2
                size={24}
                color={colors.success}
                style={{ marginRight: 12 }}
              />
              <VStack className="flex-1">
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.primary_white_text,
                    fontWeight: "700",
                  }}
                >
                  Số điện thoại đã xác thực
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.primary_white_text,
                    marginTop: 4,
                    opacity: 0.9,
                  }}
                >
                  {formData.phone}
                </Text>
              </VStack>
            </Box>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

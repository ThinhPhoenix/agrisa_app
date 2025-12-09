import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
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
                    backgroundColor: colors.infoSoft,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Mail size={28} color={colors.info} strokeWidth={2.5} />
                </Box>
                <VStack className="flex-1">
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: colors.primary_text,
                    }}
                  >
                    Thông tin email
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.secondary_text,
                      marginTop: 2,
                    }}
                  >
                    Để nhận thông báo quan trọng
                  </Text>
                </VStack>
              </HStack>
            </VStack>
            <Box
              style={{
                flex: 1,
                height: 4,
                backgroundColor: colors.frame_border,
                borderRadius: 2,
              }}
            />
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
                Quay lại
              </Text>
            </TouchableOpacity>

            {/* Verified Phone Info */}
            <Box
              style={{
                marginTop: 20,
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 14,
                borderLeftWidth: 3,
                borderLeftColor: colors.success,
              }}
            >
              <HStack space="sm" className="items-center">
                <CheckCircle2 size={20} color={colors.success} />
                <VStack className="flex-1">
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.secondary_text,
                    }}
                  >
                    Số điện thoại đã xác thực
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.primary_text,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {formData.phone}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

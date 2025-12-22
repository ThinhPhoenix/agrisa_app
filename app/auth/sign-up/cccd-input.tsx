import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
} from "lucide-react-native";
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
 * 🆔 CCCD INPUT SCREEN
 * ============================================
 * Màn hình thứ 3 - Nhập CCCD/CMND
 */
export default function CCCDInputScreen() {
  const notification = useGlobalNotification();
  const { formData, setNationalId } = useSignUpStore();
  const { colors } = useAgrisaColors();

  const [cccdInput, setCccdInput] = useState(formData.national_id || "");

  // ============================================
  // ✅ VALIDATE & CONTINUE
  // ============================================
  const handleContinue = () => {
    // Validate CCCD
    if (!cccdInput.trim()) {
      notification.error("Vui lòng nhập số CCCD/CMND");
      return;
    }

    // Check CCCD format (9 hoặc 12 số)
    const cccdRegex = /^(\d{9}|\d{12})$/;
    if (!cccdRegex.test(cccdInput.trim())) {
      notification.error(
        "Số CCCD/CMND không hợp lệ. Vui lòng nhập 9 hoặc 12 số"
      );
      return;
    }

    // Lưu CCCD vào store
    setNationalId(cccdInput.trim());

    // Chuyển sang màn hình nhập password
    router.push("/auth/sign-up/password-input");
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
            {/* Header */}
            <VStack space="md" className="mb-8">
              <HStack space="md" className="items-center">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.frame_border,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CreditCard
                    size={28}
                    
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
                    Thông tin CCCD
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.secondary_text,
                      marginTop: 2,
                    }}
                  >
                    Xác thực danh tính
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* CCCD Input */}
            <VStack space="sm" className="mb-6">
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.primary_text,
                }}
              >
                CCCD <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                value={cccdInput}
                onChangeText={setCccdInput}
                placeholder=""
                placeholderTextColor={colors.muted_text}
                keyboardType="number-pad"
                maxLength={12}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1.5,
                  borderColor: colors.frame_border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 18,
                  letterSpacing: 2,
                  color: colors.primary_text,
                  fontWeight: "600",
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

            
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

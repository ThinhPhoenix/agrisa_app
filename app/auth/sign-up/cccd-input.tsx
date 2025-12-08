import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { router } from "expo-router";
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
import { VStack, HStack, Box } from "@gluestack-ui/themed";
import { CreditCard, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react-native";

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
      notification.error("Số CCCD/CMND không hợp lệ. Vui lòng nhập 9 hoặc 12 số");
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
                  Thông tin CCCD
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.primary_white_text,
                    opacity: 0.9,
                    textAlign: "center",
                  }}
                >
                  Để xác thực danh tính
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
                Bước 3/4
              </Text>

              {/* Card Icon */}
              <VStack space="md" className="items-center mb-6">
                <Box
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.warningSoft,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CreditCard size={32} color={colors.warning} strokeWidth={2.5} />
                </Box>
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
                  Số CCCD/CMND <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  value={cccdInput}
                  onChangeText={setCccdInput}
                  placeholder="Nhập 9 hoặc 12 số"
                  placeholderTextColor={colors.muted_text}
                  keyboardType="number-pad"
                  maxLength={12}
                  style={{
                    backgroundColor: colors.card_surface,
                    borderWidth: 2,
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
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.muted_text,
                  }}
                >
                  Số CCCD sẽ được dùng để xác thực danh tính khi đăng ký bảo hiểm
                </Text>
              </VStack>

              {/* Info Cards */}
              <VStack space="md" className="mb-6">
                <Box
                  style={{
                    backgroundColor: colors.successSoft,
                    borderRadius: 12,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.success,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.primary_text,
                      lineHeight: 22,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>Định dạng hợp lệ:</Text>{"\n"}
                    • CMND cũ: 9 số (VD: 123456789){"\n"}
                    • CCCD mới: 12 số (VD: 001234567890)
                  </Text>
                </Box>

                <Box
                  style={{
                    backgroundColor: colors.infoSoft,
                    borderRadius: 12,
                    padding: 16,
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
                    <Text style={{ fontWeight: "700" }}>Bảo mật thông tin:</Text>{"\n"}
                    • Thông tin CCCD được mã hóa an toàn{"\n"}
                    • Chỉ dùng để xác thực danh tính{"\n"}
                    • Tuân thủ quy định bảo vệ dữ liệu cá nhân
                  </Text>
                </Box>
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

            {/* Completed Steps */}
            <VStack space="sm" className="mt-6">
              <Box
                style={{
                  backgroundColor: `${colors.success}20`,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: `${colors.success}40`,
                }}
              >
                <CheckCircle2 size={20} color={colors.success} style={{ marginRight: 12 }} />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.primary_white_text,
                    fontWeight: "600",
                  }}
                >
                  Số điện thoại: {formData.phone}
                </Text>
              </Box>
              <Box
                style={{
                  backgroundColor: `${colors.success}20`,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: `${colors.success}40`,
                }}
              >
                <CheckCircle2 size={20} color={colors.success} style={{ marginRight: 12 }} />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.primary_white_text,
                    fontWeight: "600",
                  }}
                >
                  Email: {formData.email}
                </Text>
              </Box>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

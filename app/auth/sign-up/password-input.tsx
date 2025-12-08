import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuth } from "@/domains/auth/hooks/use-auth";
import { useSignUpStore } from "@/domains/auth/stores/signup.store";
import { Box, HStack, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  XCircle,
} from "lucide-react-native";
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
 * 🔐 PASSWORD INPUT SCREEN
 * ============================================
 * Màn hình cuối cùng - Tạo mật khẩu
 */
export default function PasswordInputScreen() {
  const notification = useGlobalNotification();
  const { signUpMutation } = useAuth();
  const { formData, setPassword, resetForm } = useSignUpStore();
  const { colors } = useAgrisaColors();

  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================
  // 🔍 PASSWORD VALIDATION
  // ============================================
  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Ít nhất 8 ký tự");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Có ít nhất 1 chữ hoa");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Có ít nhất 1 chữ thường");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Có ít nhất 1 số");
    }

    return errors;
  };

  const passwordErrors = validatePassword(passwordInput);
  const isPasswordValid = passwordErrors.length === 0 && passwordInput.length > 0;
  const isPasswordMatch = passwordInput === confirmPasswordInput && confirmPasswordInput.length > 0;

  // ============================================
  // ✅ SUBMIT REGISTRATION
  // ============================================
  const handleSubmit = async () => {
    // Final validation
    if (!passwordInput.trim()) {
      notification.error("Vui lòng nhập mật khẩu");
      return;
    }

    if (!isPasswordValid) {
      notification.error("Mật khẩu không đáp ứng yêu cầu bảo mật");
      return;
    }

    if (!confirmPasswordInput.trim()) {
      notification.error("Vui lòng xác nhận mật khẩu");
      return;
    }

    if (!isPasswordMatch) {
      notification.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Lưu password vào store
    setPassword(passwordInput.trim(), confirmPasswordInput.trim());

    // Prepare payload
    const payload = {
      phone: formData.phone,
      email: formData.email,
      national_id: formData.national_id,
      password: passwordInput.trim(),
    };

    console.log("📤 [Sign Up] Submitting registration:", {
      ...payload,
      password: "***HIDDEN***",
    });

    try {
      // Submit registration
      await signUpMutation.mutateAsync(payload);

      // Reset form sau khi đăng ký thành công
      resetForm();

      // Navigate sẽ được handle bởi mutation onSuccess
    } catch (error) {
      console.error("❌ [Sign Up] Registration error:", error);
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
                  Tạo mật khẩu
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.primary_white_text,
                    opacity: 0.9,
                    textAlign: "center",
                  }}
                >
                  Bước cuối cùng - Hoàn tất đăng ký
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
                {[1, 2, 3, 4].map((step) => (
                  <Box
                    key={step}
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: colors.success,
                      borderRadius: 2,
                    }}
                  />
                ))}
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
                Bước 4/4 - Hoàn tất
              </Text>

              {/* Lock Icon */}
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
                  <Lock size={32} color={colors.success} strokeWidth={2.5} />
                </Box>
              </VStack>

              {/* Password Input */}
              <VStack space="sm" className="mb-4">
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.primary_text,
                  }}
                >
                  Mật khẩu <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <Box style={{ position: "relative" }}>
                  <TextInput
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={colors.muted_text}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      backgroundColor: colors.card_surface,
                      borderWidth: 2,
                      borderColor: passwordInput.length > 0
                        ? isPasswordValid
                          ? colors.success
                          : colors.error
                        : colors.frame_border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      paddingRight: 50,
                      fontSize: 16,
                      color: colors.primary_text,
                      fontWeight: "500",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 14,
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={24} color={colors.muted_text} />
                    ) : (
                      <Eye size={24} color={colors.muted_text} />
                    )}
                  </TouchableOpacity>
                </Box>

                {/* Password Requirements */}
                {passwordInput.length > 0 && (
                  <VStack space="xs" className="mt-2">
                    {passwordErrors.length > 0 ? (
                      passwordErrors.map((error, index) => (
                        <HStack key={index} space="xs" className="items-center">
                          <XCircle size={16} color={colors.error} />
                          <Text style={{ fontSize: 12, color: colors.error }}>
                            {error}
                          </Text>
                        </HStack>
                      ))
                    ) : (
                      <HStack space="xs" className="items-center">
                        <CheckCircle2 size={16} color={colors.success} />
                        <Text style={{ fontSize: 12, color: colors.success, fontWeight: "600" }}>
                          Mật khẩu hợp lệ
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                )}
              </VStack>

              {/* Confirm Password Input */}
              <VStack space="sm" className="mb-6">
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.primary_text,
                  }}
                >
                  Xác nhận mật khẩu <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <Box style={{ position: "relative" }}>
                  <TextInput
                    value={confirmPasswordInput}
                    onChangeText={setConfirmPasswordInput}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={colors.muted_text}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      backgroundColor: colors.card_surface,
                      borderWidth: 2,
                      borderColor: confirmPasswordInput.length > 0
                        ? isPasswordMatch
                          ? colors.success
                          : colors.error
                        : colors.frame_border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      paddingRight: 50,
                      fontSize: 16,
                      color: colors.primary_text,
                      fontWeight: "500",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 14,
                    }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={24} color={colors.muted_text} />
                    ) : (
                      <Eye size={24} color={colors.muted_text} />
                    )}
                  </TouchableOpacity>
                </Box>

                {/* Match Indicator */}
                {confirmPasswordInput.length > 0 && (
                  <HStack space="xs" className="items-center mt-2">
                    {isPasswordMatch ? (
                      <>
                        <CheckCircle2 size={16} color={colors.success} />
                        <Text style={{ fontSize: 12, color: colors.success, fontWeight: "600" }}>
                          Mật khẩu khớp
                        </Text>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} color={colors.error} />
                        <Text style={{ fontSize: 12, color: colors.error }}>
                          Mật khẩu không khớp
                        </Text>
                      </>
                    )}
                  </HStack>
                )}
              </VStack>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isPasswordValid || !isPasswordMatch || signUpMutation.isPending}
                style={{
                  backgroundColor:
                    !isPasswordValid || !isPasswordMatch || signUpMutation.isPending
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
                {signUpMutation.isPending && (
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
                  {signUpMutation.isPending ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                </Text>
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={signUpMutation.isPending}
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

            {/* Completed Steps Summary */}
            <Box
              style={{
                marginTop: 24,
                backgroundColor: `${colors.success}20`,
                borderRadius: 16,
                padding: 16,
                borderWidth: 2,
                borderColor: `${colors.success}40`,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary_white_text,
                  fontWeight: "700",
                  marginBottom: 12,
                }}
              >
                Thông tin đã nhập:
              </Text>
              <VStack space="xs">
                <HStack space="xs" className="items-center">
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={{ fontSize: 13, color: colors.primary_white_text }}>
                    Số điện thoại: {formData.phone}
                  </Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={{ fontSize: 13, color: colors.primary_white_text }}>
                    Email: {formData.email}
                  </Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={{ fontSize: 13, color: colors.primary_white_text }}>
                    CCCD: {formData.national_id}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

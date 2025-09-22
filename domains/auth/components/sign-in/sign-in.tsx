import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  Text,
  View,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, User, Phone, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Controller, Control } from "react-hook-form";
import { useAuthForm } from "../../hooks/use-auth-form";
import { SignInPayloadSchema } from "../../schemas/auth.schema";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignInComponentUI = () => {
  const { colors } = useAgrisaColors();
  const [showPassword, setShowPassword] = useState(false);

  // Sử dụng hook auth form đã được chuẩn hóa cho đăng nhập Agrisa
  const { form, onSubmit, isLoading, error, reset, clearErrors } = useAuthForm({
    type: "sign-in",
  });

  // Type assertion an toàn cho sign-in form (fix lỗi TypeScript)
  const signInFormControl = form.control as Control<SignInPayloadSchema>;

  // Helper để detect loại identifier và hiển thị icon phù hợp cho nông dân
  const getIdentifierIcon = (value: string) => {
    if (!value) return <User size={20} color={colors.textMuted} />;

    // Kiểm tra email pattern
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return <Mail size={20} color={colors.success} />;
    }

    // Kiểm tra phone pattern Việt Nam
    if (/^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/.test(value.replace(/\s+/g, ""))) {
      return <Phone size={20} color={colors.success} />;
    }

    return <User size={20} color={colors.textMuted} />;
  };

  // Helper để format phone number tự động cho nông dân Việt Nam
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, "").replace(/\D/g, "");

    // Chuyển từ 0xxx sang +84xxx (phổ biến ở nông thôn)
    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }

    // Chuyển từ 84xxx sang +84xxx
    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }

    return phone;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
            paddingHorizontal: 16,
          }}
        >
          {/* Container chính - responsive design cho mọi thiết bị nông thôn */}
          <Box
            style={{
              width: "100%",
              maxWidth: 420, // Tối ưu cho tablet và điện thoại lớn
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Card form đăng nhập Agrisa */}
            <Box
              style={{
                width: "100%",
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 28,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* Header với branding Agrisa */}
              <Box
                style={{
                  alignItems: "center",
                  marginBottom: 32,
                  width: "100%",
                }}
              >
                {/* Logo Agrisa */}
                <Box
                  style={{
                    backgroundColor: colors.success, // Màu xanh lá nông nghiệp
                    padding: 16,
                    borderRadius: 20,
                    marginBottom: 16,
                  }}
                >
                  <Lock size={32} color="white" />
                </Box>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Đăng Nhập Agrisa
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Nền tảng bảo hiểm nông nghiệp thông minh
                </Text>
              </Box>

              {/* Hiển thị lỗi từ server (API errors) */}
              {error && (
                <Box
                  style={{
                    width: "100%",
                    backgroundColor: "#fee2e2",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.error,
                  }}
                >
                  <Text style={{ color: colors.error, fontSize: 14 }}>
                    {error.message || "Thông tin đăng nhập không chính xác"}
                  </Text>
                </Box>
              )}

              {/* Form inputs với React Hook Form - tối ưu cho nông dân */}
              <Box style={{ width: "100%" }}>
                {/* Trường identifier (số điện thoại hoặc email) */}
                <Controller
                  control={signInFormControl}
                  name="identifier"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 20 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 16,
                            marginBottom: 8,
                          }}
                        >
                          Số điện thoại hoặc Email
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Box style={{ position: "relative" }}>
                        <Input
                          variant="outline"
                          size="md"
                          style={{
                            borderColor: fieldState.error
                              ? colors.error
                              : colors.border,
                            borderRadius: 12,
                            borderWidth: 2,
                            backgroundColor: colors.surface,
                          }}
                        >
                          <InputField
                            value={field.value}
                            onChangeText={(text) => {
                              // Auto-format phone number cho nông dân Việt Nam
                              const isPhone = /^[0-9+]/.test(text);
                              if (isPhone && !text.includes("@")) {
                                const formatted = formatPhoneNumber(text);
                                field.onChange(formatted);
                              } else {
                                field.onChange(text);
                              }
                            }}
                            placeholder="0987654321 hoặc email@example.com"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                            style={{
                              fontSize: 16,
                              color: colors.text,
                              paddingHorizontal: 16,
                              paddingRight: 50, // Chỗ cho icon
                            }}
                          />
                        </Input>

                        {/* Icon động theo loại input */}
                        <Box
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: [{ translateY: -10 }],
                            padding: 4,
                          }}
                        >
                          {getIdentifierIcon(field.value)}
                        </Box>
                      </Box>

                      {/* Hint text hướng dẫn cho nông dân */}
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        Ví dụ: 0987654321 hoặc nongdan@email.com
                      </Text>

                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 6,
                              fontWeight: "500",
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* Trường mật khẩu */}
                <Controller
                  control={signInFormControl}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 28 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 16,
                            marginBottom: 8,
                          }}
                        >
                          Mật khẩu
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Box style={{ position: "relative" }}>
                        <Input
                          variant="outline"
                          size="md"
                          style={{
                            borderColor: fieldState.error
                              ? colors.error
                              : colors.border,
                            borderRadius: 12,
                            borderWidth: 2,
                            backgroundColor: colors.surface,
                          }}
                        >
                          <InputField
                            value={field.value}
                            onChangeText={field.onChange}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={{
                              fontSize: 16,
                              color: colors.text,
                              paddingHorizontal: 16,
                              paddingRight: 50, // Chỗ cho icon
                            }}
                          />
                        </Input>

                        {/* Toggle hiển thị mật khẩu */}
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: [{ translateY: -12 }],
                            padding: 4,
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={colors.textMuted} />
                          ) : (
                            <Eye size={20} color={colors.textMuted} />
                          )}
                        </TouchableOpacity>
                      </Box>

                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 6,
                              fontWeight: "500",
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* Nút đăng nhập với loading state */}
                <Button
                  onPress={onSubmit}
                  isDisabled={isLoading}
                  size="md"
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 12,
                    width: "100%",
                    opacity: isLoading ? 0.8 : 1,
                    shadowColor: colors.success,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <ButtonText
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng Nhập Agrisa"}
                  </ButtonText>
                </Button>

                {/* Nút reset form khi có lỗi hoặc form đã thay đổi */}
                {(form.formState.isDirty || error) && (
                  <Button
                    onPress={() => {
                      reset();
                      clearErrors();
                    }}
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: colors.border,
                      borderRadius: 8,
                      width: "100%",
                      marginTop: 12,
                    }}
                  >
                    <ButtonText
                      style={{
                        color: colors.textSecondary,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Làm mới form
                    </ButtonText>
                  </Button>
                )}
              </Box>

              {/* Navigation và hỗ trợ */}
              <Box
                style={{
                  marginTop: 24,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* Link đăng ký */}
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  Chưa có tài khoản Agrisa?{" "}
                  <Text
                    onPress={() => {
                      router.push("/auth/signup");
                    }}
                    style={{
                      color: colors.success,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    Đăng ký ngay
                  </Text>
                </Text>

                {/* Link quên mật khẩu */}
                <Text
                  onPress={() => {
                    router.push("/auth/forgot-password");
                  }}
                  style={{
                    color: colors.success,
                    fontSize: 14,
                    fontWeight: "600",
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  Quên mật khẩu?
                </Text>

                {/* Thông tin hỗ trợ cho nông dân */}
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 16,
                    fontStyle: "italic",
                    lineHeight: 16,
                  }}
                >
                  Hỗ trợ 24/7: 1900-AGRISA (1900-247472)
                  {"\n"}
                  Chăm sóc nông dân mọi lúc mọi nơi
                </Text>
              </Box>
            </Box>
          </Box>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInComponentUI;

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
import { Eye, EyeOff, UserPlus, IdCard } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { create } from "zustand";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Store cho đăng ký với CCCD
interface SignUpState {
  fullName: string;
  cccd: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  errors: {
    fullName?: string;
    cccd?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  };
  setFullName: (value: string) => void;
  setCCCD: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  validateForm: () => boolean;
  signUp: () => Promise<void>;
}

export const useSignUpStore = create<SignUpState>((set, get) => ({
  fullName: "",
  cccd: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  isLoading: false,
  errors: {},

  setFullName: (value) => {
    set({
      fullName: value,
      errors: { ...get().errors, fullName: undefined },
    });
  },

  setCCCD: (value) => {
    // Chỉ cho phép số và giới hạn 12 ký tự
    const cleanValue = value.replace(/\D/g, "").slice(0, 12);
    set({
      cccd: cleanValue,
      errors: { ...get().errors, cccd: undefined },
    });
  },

  setPhoneNumber: (value) => {
    // Format số điện thoại Việt Nam
    const cleanValue = value.replace(/\D/g, "").slice(0, 10);
    set({
      phoneNumber: cleanValue,
      errors: { ...get().errors, phoneNumber: undefined },
    });
  },

  setPassword: (value) => {
    set({
      password: value,
      errors: { ...get().errors, password: undefined },
    });
  },

  setConfirmPassword: (value) => {
    set({
      confirmPassword: value,
      errors: { ...get().errors, confirmPassword: undefined },
    });
  },

  validateForm: () => {
    const { fullName, cccd, phoneNumber, password, confirmPassword } = get();
    const errors: any = {};

    // Validate họ tên
    if (!fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Validate CCCD
    if (!cccd.trim()) {
      errors.cccd = "Vui lòng nhập số CCCD";
    } else if (cccd.length !== 12) {
      errors.cccd = "CCCD phải có đúng 12 số";
    }

    // Validate số điện thoại
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneNumber)) {
      errors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    // Validate mật khẩu
    if (!password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate xác nhận mật khẩu
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  signUp: async () => {
    const { validateForm, fullName, cccd, phoneNumber, password } = get();

    if (!validateForm()) return;

    set({ isLoading: true });
    try {
      console.log("Đăng ký tài khoản Agrisa:", {
        fullName,
        cccd,
        phoneNumber,
        password,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Tích hợp API đăng ký thật
      console.log("✅ Đăng ký thành công!");
    } catch (error) {
      console.error("❌ Lỗi đăng ký:", error);
      set({
        errors: {
          cccd: "CCCD đã được đăng ký hoặc không hợp lệ",
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

const SignUpComponentUI = () => {
  const {
    fullName,
    cccd,
    phoneNumber,
    password,
    confirmPassword,
    setFullName,
    setCCCD,
    setPhoneNumber,
    setPassword,
    setConfirmPassword,
    signUp,
    isLoading,
    errors,
  } = useSignUpStore();

  const { colors } = useAgrisaColors();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingVertical: 20,
        }}
      >
        <Box
          style={{
            width: "100%",
            maxWidth: 400,
            paddingHorizontal: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Form đăng ký */}
          <Box
            style={{
              width: "100%",
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 32,
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
            {/* Header */}
            <Box
              style={{
                alignItems: "center",
                marginBottom: 28,
                width: "100%",
              }}
            >
              <Box
                style={{
                  backgroundColor: colors.success,
                  padding: 16,
                  borderRadius: 20,
                  marginBottom: 16,
                }}
              >
                <UserPlus size={32} color="white" />
              </Box>

              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "bold",
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Đăng Ký Agrisa
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Tham gia nền tảng bảo hiểm nông nghiệp hàng đầu
              </Text>
            </Box>

            {/* Form fields */}
            <Box style={{ width: "100%" }}>
              {/* Họ và tên */}
              <FormControl
                isInvalid={!!errors.fullName}
                style={{ marginBottom: 18 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                      marginBottom: 6,
                    }}
                  >
                    Họ và tên
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  variant="outline"
                  size="md"
                  style={{
                    borderColor: errors.fullName ? colors.error : colors.border,
                    borderRadius: 12,
                    borderWidth: 2,
                    backgroundColor: colors.surface,
                  }}
                >
                  <InputField
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      paddingHorizontal: 16,
                    }}
                  />
                </Input>
                {errors.fullName && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {errors.fullName}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* CCCD */}
              <FormControl
                isInvalid={!!errors.cccd}
                style={{ marginBottom: 18 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                      marginBottom: 6,
                    }}
                  >
                    Số CCCD/CMND
                  </FormControlLabelText>
                </FormControlLabel>
                <Box style={{ position: "relative" }}>
                  <Input
                    variant="outline"
                    size="md"
                    style={{
                      borderColor: errors.cccd ? colors.error : colors.border,
                      borderRadius: 12,
                      borderWidth: 2,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <InputField
                      value={cccd}
                      onChangeText={setCCCD}
                      placeholder="012345678901"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      maxLength={12}
                      style={{
                        fontSize: 16,
                        color: colors.text,
                        paddingHorizontal: 16,
                        paddingRight: 50,
                      }}
                    />
                  </Input>
                  <Box
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: [{ translateY: -10 }],
                    }}
                  >
                    <IdCard size={20} color={colors.textMuted} />
                  </Box>
                </Box>
                {errors.cccd && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {errors.cccd}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Số điện thoại */}
              <FormControl
                isInvalid={!!errors.phoneNumber}
                style={{ marginBottom: 18 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                      marginBottom: 6,
                    }}
                  >
                    Số điện thoại
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  variant="outline"
                  size="md"
                  style={{
                    borderColor: errors.phoneNumber
                      ? colors.error
                      : colors.border,
                    borderRadius: 12,
                    borderWidth: 2,
                    backgroundColor: colors.surface,
                  }}
                >
                  <InputField
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="0987654321"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      paddingHorizontal: 16,
                    }}
                  />
                </Input>
                {errors.phoneNumber && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {errors.phoneNumber}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Mật khẩu */}
              <FormControl
                isInvalid={!!errors.password}
                style={{ marginBottom: 18 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                      marginBottom: 6,
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
                      borderColor: errors.password
                        ? colors.error
                        : colors.border,
                      borderRadius: 12,
                      borderWidth: 2,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <InputField
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      style={{
                        fontSize: 16,
                        color: colors.text,
                        paddingHorizontal: 16,
                        paddingRight: 50,
                      }}
                    />
                  </Input>
                  <Box
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <Box
                      onTouchEnd={() => setShowPassword(!showPassword)}
                      style={{ padding: 4 }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textMuted} />
                      ) : (
                        <Eye size={20} color={colors.textMuted} />
                      )}
                    </Box>
                  </Box>
                </Box>
                {errors.password && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {errors.password}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Xác nhận mật khẩu */}
              <FormControl
                isInvalid={!!errors.confirmPassword}
                style={{ marginBottom: 24 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                      marginBottom: 6,
                    }}
                  >
                    Xác nhận mật khẩu
                  </FormControlLabelText>
                </FormControlLabel>
                <Box style={{ position: "relative" }}>
                  <Input
                    variant="outline"
                    size="md"
                    style={{
                      borderColor: errors.confirmPassword
                        ? colors.error
                        : colors.border,
                      borderRadius: 12,
                      borderWidth: 2,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <InputField
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showConfirmPassword}
                      style={{
                        fontSize: 16,
                        color: colors.text,
                        paddingHorizontal: 16,
                        paddingRight: 50,
                      }}
                    />
                  </Input>
                  <Box
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <Box
                      onTouchEnd={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{ padding: 4 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={colors.textMuted} />
                      ) : (
                        <Eye size={20} color={colors.textMuted} />
                      )}
                    </Box>
                  </Box>
                </Box>
                {errors.confirmPassword && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {errors.confirmPassword}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Nút đăng ký */}
              <Button
                onPress={signUp}
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
                    fontSize: 17,
                  }}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng Ký"}
                </ButtonText>
              </Button>
            </Box>

            {/* Footer */}
            <Box
              style={{
                marginTop: 20,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Đã có tài khoản?{" "}
                <Text
                  style={{
                    color: colors.success,
                    fontWeight: "600",
                  }}
                >
                  Đăng nhập ngay
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUpComponentUI;

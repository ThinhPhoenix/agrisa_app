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
import { Eye, EyeOff, Lock } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { create } from "zustand";

// Lấy dimensions màn hình để responsive
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Định nghĩa type cho store
interface AuthState {
  username: string;
  password: string;
  isLoading: boolean;
  errors: {
    username?: string;
    password?: string;
  };
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  validateForm: () => boolean;
  login: () => Promise<void>;
}

// Store với validation logic
export const useAuthStore = create<AuthState>((set, get) => ({
  username: "",
  password: "",
  isLoading: false,
  errors: {},

  setUsername: (value) => {
    set({
      username: value,
      errors: { ...get().errors, username: undefined },
    });
  },

  setPassword: (value) => {
    set({
      password: value,
      errors: { ...get().errors, password: undefined },
    });
  },

  validateForm: () => {
    const { username, password } = get();
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = "Vui lòng nhập tên đăng nhập";
    }
    if (!password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    }
    if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  login: async () => {
    const { validateForm, username, password } = get();

    if (!validateForm()) return;

    set({ isLoading: true });
    try {
      // TODO: Tích hợp API thật cho Agrisa
      console.log("Đăng nhập Agrisa với:", { username, password });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Lưu JWT token
      // await AsyncStorage.setItem('agrisa_token', response.token);
      // NavigationService.navigate('Dashboard');
    } catch (error) {
      console.error("Lỗi đăng nhập Agrisa:", error);
      set({
        errors: {
          username: "Tên đăng nhập hoặc mật khẩu không đúng",
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

const SignInComponentUI = () => {
  const {
    username,
    password,
    setUsername,
    setPassword,
    login,
    isLoading,
    errors,
  } = useAuthStore();

  // Sử dụng theme colors
  const { colors, isDark } = useAgrisaColors();

  // State cho show/hide password
  const [showPassword, setShowPassword] = useState(false);

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
          backgroundColor: colors.background, // 🎨 Theme background
        }}
      >
        {/* Container chính - căn giữa hoàn toàn */}
        <Box
          style={{
            width: "100%",
            maxWidth: 400, // Giới hạn chiều rộng trên tablet
            paddingHorizontal: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Form đăng nhập - căn giữa */}
          <Box
            style={{
              width: "100%",
              backgroundColor: colors.card, // 🎨 Theme card background
              borderRadius: 20,
              padding: 32,
              shadowColor: colors.shadow, // 🎨 Theme shadow
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8, // Android shadow
              alignItems: "center", // Căn giữa nội dung bên trong
              borderWidth: 1,
              borderColor: colors.border, // 🎨 Theme border
            }}
          >
            {/* Header với icon - căn giữa */}
            <Box
              style={{
                alignItems: "center",
                marginBottom: 32,
                width: "100%",
              }}
            >
              <Box
                style={{
                  backgroundColor: colors.primary, // 🎨 Theme primary color
                  padding: 16,
                  borderRadius: 20,
                  marginBottom: 16,
                }}
              >
                <Lock size={32} color={colors.text} />
              </Box>

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: colors.text, // 🎨 Theme text color
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Đăng Nhập Agrisa
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary, // 🎨 Theme secondary text
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Nền tảng bảo hiểm nông nghiệp thông minh
              </Text>
            </Box>

            {/* Form inputs - full width nhưng căn giữa trong container */}
            <Box style={{ width: "100%" }}>
              {/* Username field */}
              <FormControl
                isInvalid={!!errors.username}
                style={{ marginBottom: 20 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text, // 🎨 Theme text
                      fontWeight: "600",
                      fontSize: 16,
                      marginBottom: 8,
                    }}
                  >
                    Tên đăng nhập
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  variant="outline"
                  size="md"
                  style={{
                    borderColor: errors.username ? colors.error : colors.border, // 🎨 Theme colors
                    borderRadius: 12,
                    borderWidth: 2,
                    backgroundColor: colors.surface, // 🎨 Theme surface
                  }}
                >
                  <InputField
                    value={username}
                    onChangeText={setUsername}
                    placeholder="farmer@agrisa.vn"
                    placeholderTextColor={colors.textMuted} // 🎨 Theme muted text
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      fontSize: 16,
                      color: colors.text, // 🎨 Theme text
                      paddingHorizontal: 16,
                      paddingVertical: 0,
                    }}
                  />
                </Input>
                {errors.username && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error, // 🎨 Theme error color
                        fontSize: 13,
                        marginTop: 6,
                        fontWeight: "500",
                      }}
                    >
                      {errors.username}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Password field */}
              <FormControl
                isInvalid={!!errors.password}
                style={{ marginBottom: 28 }}
              >
                <FormControlLabel>
                  <FormControlLabelText
                    style={{
                      color: colors.text, // 🎨 Theme text
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
                      borderColor: errors.password
                        ? colors.error
                        : colors.border, // 🎨 Theme colors
                      borderRadius: 12,
                      borderWidth: 2,
                      backgroundColor: colors.surface, // 🎨 Theme surface
                    }}
                  >
                    <InputField
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textMuted} // 🎨 Theme muted text
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        fontSize: 16,
                        color: colors.text, // 🎨 Theme text
                        paddingHorizontal: 16,
                        paddingVertical: 0,
                        paddingRight: 50, // Để chỗ cho icon
                      }}
                    />
                  </Input>

                  {/* Eye icon */}
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
                        color: colors.error, // 🎨 Theme error color
                        fontSize: 13,
                        marginTop: 6,
                        fontWeight: "500",
                      }}
                    >
                      {errors.password}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Nút đăng nhập - căn giữa */}
              <Button
                onPress={login}
                isDisabled={isLoading}
                size="md"
                style={{
                  backgroundColor: colors.success, // 🎨 Theme success color
                  borderRadius: 12,
                  paddingVertical: 0,
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
                    color: colors.textWhiteButton,
                    fontWeight: "700",
                    fontSize: 18,
                    textAlign: "center",
                  }}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                </ButtonText>
              </Button>
            </Box>

            {/* Links bổ sung - căn giữa */}
            <Box
              style={{
                marginTop: 24,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary, // 🎨 Theme secondary text
                  fontSize: 14,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Chưa có tài khoản?{" "}
                <Text
                  style={{
                    color: colors.success, // 🎨 Theme success color
                    fontWeight: "600",
                  }}
                >
                  Đăng ký ngay
                </Text>
              </Text>
              <Text
                style={{
                  color: colors.success, // 🎨 Theme success color
                  fontSize: 14,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Quên mật khẩu?
              </Text>
            </Box>
          </Box>
        </Box>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignInComponentUI;
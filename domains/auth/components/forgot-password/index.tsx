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
import { KeyRound, IdCard, Phone, ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { create } from "zustand";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Store cho forgot password với CCCD
interface ForgotPasswordState {
  cccd: string;
  phoneNumber: string;
  isLoading: boolean;
  step: "input" | "verification" | "success";
  errors: {
    cccd?: string;
    phoneNumber?: string;
  };
  setCCCD: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  validateForm: () => boolean;
  sendResetRequest: () => Promise<void>;
  resetState: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>(
  (set, get) => ({
    cccd: "",
    phoneNumber: "",
    isLoading: false,
    step: "input",
    errors: {},

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

    validateForm: () => {
      const { cccd, phoneNumber } = get();
      const errors: any = {};

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

      set({ errors });
      return Object.keys(errors).length === 0;
    },

    sendResetRequest: async () => {
      const { validateForm, cccd, phoneNumber } = get();

      if (!validateForm()) return;

      set({ isLoading: true });
      try {
        console.log("Gửi yêu cầu đặt lại mật khẩu:", { cccd, phoneNumber });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        set({ step: "success" });
        console.log("✅ Gửi yêu cầu thành công!");
      } catch (error) {
        console.error("❌ Lỗi gửi yêu cầu:", error);
        set({
          errors: {
            cccd: "Không tìm thấy thông tin tài khoản với CCCD và số điện thoại này",
          },
        });
      } finally {
        set({ isLoading: false });
      }
    },

    resetState: () => {
      set({
        cccd: "",
        phoneNumber: "",
        isLoading: false,
        step: "input",
        errors: {},
      });
    },
  })
);

const ForgotPasswordComponentUI = () => {
  const {
    cccd,
    phoneNumber,
    setCCCD,
    setPhoneNumber,
    sendResetRequest,
    isLoading,
    step,
    errors,
    resetState,
  } = useForgotPasswordStore();

  const { colors } = useAgrisaColors();

  // Render success screen
  if (step === "success") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 24,
        }}
      >
        <Box
          style={{
            width: "100%",
            maxWidth: 400,
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
          <Box
            style={{
              backgroundColor: colors.success,
              padding: 20,
              borderRadius: 50,
              marginBottom: 24,
            }}
          >
            <KeyRound size={40} color="white" />
          </Box>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Yêu cầu đã được gửi!
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến số điện thoại{" "}
            <Text style={{ fontWeight: "600", color: colors.text }}>
              {phoneNumber}
            </Text>
            {"\n\n"}
            Vui lòng kiểm tra tin nhắn và làm theo hướng dẫn.
          </Text>

          <Button
            onPress={() => {
              resetState();
              // TODO: Navigate back to login
            }}
            size="md"
            style={{
              backgroundColor: colors.success,
              borderRadius: 12,
              width: "100%",
            }}
          >
            <ButtonText
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Về trang đăng nhập
            </ButtonText>
          </Button>
        </Box>
      </View>
    );
  }

  // Render input form
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
          {/* Form quên mật khẩu */}
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
                marginBottom: 32,
                width: "100%",
              }}
            >
              <Box
                style={{
                  backgroundColor: colors.warning,
                  padding: 16,
                  borderRadius: 20,
                  marginBottom: 16,
                }}
              >
                <KeyRound size={32} color="white" />
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
                Quên Mật Khẩu
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Nhập CCCD và số điện thoại để nhận hướng dẫn đặt lại mật khẩu
              </Text>
            </Box>

            {/* Form fields */}
            <Box style={{ width: "100%" }}>
              {/* CCCD */}
              <FormControl
                isInvalid={!!errors.cccd}
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
                        marginTop: 6,
                        fontWeight: "500",
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
                    Số điện thoại đã đăng ký
                  </FormControlLabelText>
                </FormControlLabel>
                <Box style={{ position: "relative" }}>
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
                    <Phone size={20} color={colors.textMuted} />
                  </Box>
                </Box>
                {errors.phoneNumber && (
                  <FormControlError>
                    <FormControlErrorText
                      style={{
                        color: colors.error,
                        fontSize: 13,
                        marginTop: 6,
                        fontWeight: "500",
                      }}
                    >
                      {errors.phoneNumber}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Nút gửi yêu cầu */}
              <Button
                onPress={sendResetRequest}
                isDisabled={isLoading}
                size="md"
                style={{
                  backgroundColor: colors.warning,
                  borderRadius: 12,
                  width: "100%",
                  opacity: isLoading ? 0.8 : 1,
                  shadowColor: colors.warning,
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
                  {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                </ButtonText>
              </Button>
            </Box>

            {/* Footer */}
            <Box
              style={{
                marginTop: 24,
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
                Nhớ lại mật khẩu?{" "}
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

export default ForgotPasswordComponentUI;

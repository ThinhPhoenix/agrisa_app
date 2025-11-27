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
  Image,
  Input,
  InputField,
  InputSlot,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { IdCard, KeyRound, Phone } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { create } from "zustand";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.45)";
const CARD_GRADIENT = [
  "rgba(255,255,255,0.7)",
  "rgba(255,237,237,0.7)",
] as const;

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground
            source={require("@/assets/images/Login/Agrisa-Auth.png")}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(89, 172, 119, 0.3)", "rgba(89, 172, 119, 0.6)"]}
              style={{ flex: 1 }}
            >
              <VStack flex={1} justifyContent="center" px="$5" space="lg">
                {/* Logo */}
                <Box alignItems="center">
                  <Image
                    source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                    alt="Agrisa Logo"
                    style={{
                      width: 100,
                      height: 100,
                    }}
                    resizeMode="contain"
                  />
                </Box>

                {/* Success Card */}
                <LinearGradient
                  colors={CARD_GRADIENT}
                  style={{
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: CARD_BORDER_COLOR,
                    overflow: "hidden",
                  }}
                >
                  <Box p="$5">
                    <VStack space="md" alignItems="center">
                      {/* Success Icon */}
                      <Box
                        bg={colors.success}
                        p="$4"
                        borderRadius="$full"
                        mb="$2"
                      >
                        <KeyRound size={40} color="white" strokeWidth={2} />
                      </Box>

                      {/* Title */}
                      <Text
                        fontSize="$xl"
                        fontWeight="$bold"
                        color={colors.primary_text}
                        textAlign="center"
                      >
                        Yêu cầu đã được gửi!
                      </Text>

                      {/* Message */}
                      <Text
                        fontSize="$sm"
                        color={colors.secondary_text}
                        textAlign="center"
                        lineHeight="$lg"
                        px="$2"
                      >
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến số điện thoại{" "}
                        <Text fontWeight="$semibold" color={colors.primary_text}>
                          {phoneNumber}
                        </Text>
                        {"\n\n"}
                        Vui lòng kiểm tra tin nhắn và làm theo hướng dẫn.
                      </Text>

                      {/* Back to Login Button */}
                      <Button
                        onPress={() => {
                          resetState();
                          router.replace("/auth/sign-in");
                        }}
                        size="md"
                        bg={colors.success}
                        borderRadius="$lg"
                        mt="$4"
                        width="100%"
                        $active-opacity={0.8}
                      >
                        <ButtonText
                          color={colors.primary_white_text}
                          fontWeight="$bold"
                          fontSize="$sm"
                        >
                          Về trang đăng nhập
                        </ButtonText>
                      </Button>
                    </VStack>
                  </Box>
                </LinearGradient>
              </VStack>
            </LinearGradient>
          </ImageBackground>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  // Render input form
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("@/assets/images/Login/Agrisa-Auth.png")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(89, 172, 119, 0.3)", "rgba(89, 172, 119, 0.6)"]}
            style={{ flex: 1 }}
          >
            <VStack flex={1} justifyContent="center" px="$5" space="lg">
              {/* Logo */}
              <Box alignItems="center">
                <Image
                  source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                  alt="Agrisa Logo"
                  style={{
                    width: 100,
                    height: 100,
                  }}
                  resizeMode="contain"
                />
              </Box>

              {/* Forgot Password Card */}
              <LinearGradient
                colors={CARD_GRADIENT}
                style={{
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: CARD_BORDER_COLOR,
                  overflow: "hidden",
                }}
              >
                <Box p="$5">
                  {/* Header */}
                  <VStack space="xs" alignItems="center" mb="$4">
                    <Text
                      fontSize="$xl"
                      fontWeight="$bold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      Quên mật khẩu
                    </Text>
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      textAlign="center"
                      lineHeight="$sm"
                      px="$2"
                    >
                      Nhập CCCD và số điện thoại để nhận hướng dẫn đặt lại mật khẩu
                    </Text>
                  </VStack>

                  {/* Form Fields */}
                  <VStack space="sm">
                    {/* CCCD Field */}
                    <FormControl isInvalid={!!errors.cccd}>
                      <FormControlLabel mb="$1">
                        <FormControlLabelText
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                        >
                          Số CCCD/CMND
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        borderWidth={1.5}
                        borderColor={
                          errors.cccd
                            ? colors.error
                            : colors.frame_border
                        }
                        borderRadius="$lg"
                        bg={colors.card_surface}
                      >
                        <InputSlot pl="$2.5">
                          <IdCard
                            size={18}
                            color={colors.secondary_text}
                            strokeWidth={2}
                          />
                        </InputSlot>
                        <InputField
                          value={cccd}
                          onChangeText={setCCCD}
                          placeholder="012345678901"
                          placeholderTextColor={colors.muted_text}
                          keyboardType="numeric"
                          maxLength={12}
                          returnKeyType="next"
                          fontSize="$sm"
                          color={colors.primary_text}
                        />
                      </Input>
                      {errors.cccd && (
                        <FormControlError mt="$0.5">
                          <FormControlErrorText
                            fontSize="$2xs"
                            color={colors.error}
                          >
                            {errors.cccd}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>

                    {/* Phone Number Field */}
                    <FormControl isInvalid={!!errors.phoneNumber}>
                      <FormControlLabel mb="$1">
                        <FormControlLabelText
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                        >
                          Số điện thoại đã đăng ký
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        borderWidth={1.5}
                        borderColor={
                          errors.phoneNumber
                            ? colors.error
                            : colors.frame_border
                        }
                        borderRadius="$lg"
                        bg={colors.card_surface}
                      >
                        <InputSlot pl="$2.5">
                          <Phone
                            size={18}
                            color={colors.secondary_text}
                            strokeWidth={2}
                          />
                        </InputSlot>
                        <InputField
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          placeholder="0987654321"
                          placeholderTextColor={colors.muted_text}
                          keyboardType="phone-pad"
                          returnKeyType="done"
                          onSubmitEditing={sendResetRequest}
                          fontSize="$sm"
                          color={colors.primary_text}
                        />
                      </Input>
                      {errors.phoneNumber && (
                        <FormControlError mt="$0.5">
                          <FormControlErrorText
                            fontSize="$2xs"
                            color={colors.error}
                          >
                            {errors.phoneNumber}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>

                    {/* Submit Button */}
                    <Button
                      onPress={sendResetRequest}
                      isDisabled={isLoading}
                      size="md"
                      bg={colors.primary}
                      borderRadius="$lg"
                      mt="$5"
                      $active-opacity={0.8}
                    >
                      <ButtonText
                        color={colors.primary_white_text}
                        fontWeight="$bold"
                        fontSize="$sm"
                      >
                        {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                      </ButtonText>
                    </Button>
                  </VStack>

                  {/* Footer */}
                  <VStack space="md" alignItems="center" mt="$6">
                    <Box
                      borderTopWidth={1}
                      borderTopColor={colors.primary}
                      width="100%"
                      pt="$3"
                    >
                      <Text
                        fontSize="$sm"
                        color={colors.secondary_text}
                        textAlign="center"
                      >
                        Nhớ lại mật khẩu?{" "}
                        <Text
                          fontSize="$sm"
                          color={colors.success}
                          fontWeight="$bold"
                          onPress={() => router.replace("/auth/sign-in")}
                        >
                          Đăng nhập ngay
                        </Text>
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </LinearGradient>
            </VStack>
          </LinearGradient>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordComponentUI;

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
  Pressable,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff, IdCard, Lock, Mail, Phone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useAuthForm } from "../../hooks/use-auth-form";
import { SignUpPayloadSchema } from "../../schemas/auth.schema";
import { useAuthStore } from "../../stores/auth.store";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.45)";
const CARD_GRADIENT = [
  "rgba(255,255,255,0.7)",
  "rgba(255,237,237,0.7)",
] as const;

const SignUpComponentUI = () => {
  const { colors } = useAgrisaColors();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const { form, onSubmit, isLoading } = useAuthForm({
    type: "sign-up",
  });

  const signUpFormControl = form.control as Control<SignUpPayloadSchema>;

  // ============================================
  // 🚫 REDIRECT IF ALREADY AUTHENTICATED
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  // Helper format phone number
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, "").replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }

    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }

    if (cleaned.startsWith("+84")) {
      return cleaned;
    }

    if (cleaned.length >= 9 && cleaned.length <= 10) {
      return "+84" + cleaned;
    }

    return phone;
  };

  // Helper format CCCD
  const formatCCCD = (value: string): string => {
    return value.replace(/\D/g, "").slice(0, 12);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <ImageBackground
        source={require("@/assets/images/Login/Agrisa-Auth.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(89, 172, 119, 0.3)", "rgba(89, 172, 119, 0.6)"]}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <VStack flex={1} justifyContent="center" px="$5" space="lg">
              {/* Logo - Compact */}
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

              {/* Sign Up Card */}
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
                  {/* Header - Compact */}
                  <VStack space="xs" alignItems="center" mb="$4">
                    <Text
                      fontSize="$xl"
                      fontWeight="$bold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      Đăng ký tài khoản
                    </Text>
                  </VStack>

                  {/* Form Fields - Compact */}
                  <VStack space="sm">
                    {/* Phone Number */}
                    <Controller
                      control={signUpFormControl}
                      name="phone"
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <FormControlLabel mb="$1">
                            <FormControlLabelText
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              Số điện thoại
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input
                            variant="outline"
                            size="md"
                            borderWidth={1.5}
                            borderColor={
                              fieldState.error
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
                              value={field.value}
                              onChangeText={(text) => {
                                const formatted = formatPhoneNumber(text);
                                field.onChange(formatted);
                              }}
                              placeholder="+84987654321"
                              placeholderTextColor={colors.muted_text}
                              keyboardType="phone-pad"
                              fontSize="$sm"
                            />
                          </Input>
                          {fieldState.error && (
                            <FormControlError mt="$0.5">
                              <FormControlErrorText
                                fontSize="$2xs"
                                color={colors.error}
                              >
                                {fieldState.error.message}
                              </FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />

                    {/* Email (Optional) */}
                    <Controller
                      control={signUpFormControl}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <FormControlLabel mb="$1">
                            <FormControlLabelText
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              Email (không bắt buộc)
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input
                            variant="outline"
                            size="md"
                            borderWidth={1.5}
                            borderColor={
                              fieldState.error
                                ? colors.error
                                : colors.frame_border
                            }
                            borderRadius="$lg"
                            bg={colors.card_surface}
                          >
                            <InputSlot pl="$2.5">
                              <Mail
                                size={18}
                                color={colors.secondary_text}
                                strokeWidth={2}
                              />
                            </InputSlot>
                            <InputField
                              value={field.value}
                              onChangeText={field.onChange}
                              placeholder="email@example.com"
                              placeholderTextColor={colors.muted_text}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              fontSize="$sm"
                              color={colors.primary_text}
                            />
                          </Input>
                          {fieldState.error && (
                            <FormControlError mt="$0.5">
                              <FormControlErrorText
                                fontSize="$2xs"
                                color={colors.error}
                              >
                                {fieldState.error.message}
                              </FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />

                    {/* CCCD */}
                    <Controller
                      control={signUpFormControl}
                      name="national_id"
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <FormControlLabel mb="$1">
                            <FormControlLabelText
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              Số CCCD
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input
                            variant="outline"
                            size="md"
                            borderWidth={1.5}
                            borderColor={
                              fieldState.error
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
                              value={field.value}
                              onChangeText={(text) => {
                                const formatted = formatCCCD(text);
                                field.onChange(formatted);
                              }}
                              placeholder="012345678901"
                              placeholderTextColor={colors.muted_text}
                              keyboardType="numeric"
                              maxLength={12}
                              fontSize="$sm"
                              color={colors.primary_text}
                            />
                          </Input>
                          {fieldState.error && (
                            <FormControlError mt="$0.5">
                              <FormControlErrorText
                                fontSize="$2xs"
                                color={colors.error}
                              >
                                {fieldState.error.message}
                              </FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />

                    {/* Password */}
                    <Controller
                      control={signUpFormControl}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <FormControlLabel mb="$1">
                            <FormControlLabelText
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              Mật khẩu
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input
                            variant="outline"
                            size="md"
                            borderWidth={1.5}
                            borderColor={
                              fieldState.error
                                ? colors.error
                                : colors.frame_border
                            }
                            borderRadius="$lg"
                            bg={colors.card_surface}
                          >
                            <InputSlot pl="$2.5">
                              <Lock
                                size={18}
                                color={colors.secondary_text}
                                strokeWidth={2}
                              />
                            </InputSlot>
                            <InputField
                              value={field.value}
                              onChangeText={field.onChange}
                              placeholder="••••••••"
                              placeholderTextColor={colors.muted_text}
                              secureTextEntry={!showPassword}
                              fontSize="$sm"
                              color={colors.primary_text}
                            />
                            <InputSlot pr="$2.5">
                              <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff
                                    size={18}
                                    color={colors.secondary_text}
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <Eye
                                    size={18}
                                    color={colors.secondary_text}
                                    strokeWidth={2}
                                  />
                                )}
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {fieldState.error && (
                            <FormControlError mt="$0.5">
                              <FormControlErrorText
                                fontSize="$2xs"
                                color={colors.error}
                              >
                                {fieldState.error.message}
                              </FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />

                    {/* Confirm Password */}
                    <Controller
                      control={signUpFormControl}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <FormControlLabel mb="$1">
                            <FormControlLabelText
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              Nhập lại mật khẩu
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input
                            variant="outline"
                            size="md"
                            borderWidth={1.5}
                            borderColor={
                              fieldState.error
                                ? colors.error
                                : colors.frame_border
                            }
                            borderRadius="$lg"
                            bg={colors.card_surface}
                          >
                            <InputSlot pl="$2.5">
                              <Lock
                                size={18}
                                color={colors.secondary_text}
                                strokeWidth={2}
                              />
                            </InputSlot>
                            <InputField
                              value={field.value}
                              onChangeText={field.onChange}
                              placeholder="••••••••"
                              placeholderTextColor={colors.muted_text}
                              secureTextEntry={!showConfirmPassword}
                              returnKeyType="done"
                              onSubmitEditing={onSubmit}
                              fontSize="$sm"
                              color={colors.primary_text}
                            />
                            <InputSlot pr="$2.5">
                              <Pressable
                                onPress={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff
                                    size={18}
                                    color={colors.secondary_text}
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <Eye
                                    size={18}
                                    color={colors.secondary_text}
                                    strokeWidth={2}
                                  />
                                )}
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {fieldState.error && (
                            <FormControlError mt="$0.5">
                              <FormControlErrorText
                                fontSize="$2xs"
                                color={colors.error}
                              >
                                {fieldState.error.message}
                              </FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />

                    {/* Sign Up Button */}
                    <Button
                      onPress={onSubmit}
                      isDisabled={isLoading}
                      size="md"
                      bg={colors.success}
                      borderRadius="$lg"
                      mt="$5"
                      $active-opacity={0.8}
                    >
                      <ButtonText
                        color={colors.primary_white_text}
                        fontWeight="$bold"
                        fontSize="$sm"
                      >
                        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                      </ButtonText>
                    </Button>
                  </VStack>

                  {/* Footer - Separated */}
                  <VStack space="md" alignItems="center" mt="$6">
                    <Text
                      fontSize="$2xs"
                      color={colors.muted_text}
                      textAlign="center"
                      fontStyle="italic"
                      px="$2"
                      lineHeight="$xs"
                    >
                      Bằng việc đăng ký, bạn đồng ý với{" "}
                      <Text color={colors.success} fontWeight="$semibold">
                        Điều khoản dịch vụ
                      </Text>{" "}
                      và{" "}
                      <Text color={colors.success} fontWeight="$semibold">
                        Chính sách bảo mật
                      </Text>{" "}
                      của Agrisa
                    </Text>

                    <Box
                      borderTopWidth={1}
                      borderTopColor={colors.frame_border}
                      width="100%"
                      pt="$3"
                    >
                      <Text
                        fontSize="$sm"
                        color={colors.secondary_text}
                        textAlign="center"
                      >
                        Đã có tài khoản?{" "}
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
          </TouchableWithoutFeedback>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  </KeyboardAvoidingView>
);
};

export default SignUpComponentUI;
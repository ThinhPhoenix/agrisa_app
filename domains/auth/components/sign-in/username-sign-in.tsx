import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  HStack,
  Image,
  Input,
  InputField,
  InputSlot,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowRight,
  Mail,
  Newspaper,
  Phone,
  PhoneIcon,
  ShieldCheck,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { secureStorage } from "../../../shared/utils/secureStorage";
import { useAuthForm } from "../../hooks/use-auth-form";
import { useAuthStore } from "../../stores/auth.store";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface UsernameFormData {
  identifier: string;
}
const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.45)";
const CARD_GRADIENT = [
  "rgba(255,255,255,0.7)",
  "rgba(255,237,237,0.7)",
] as const;

const UsernameSignInComponent = () => {
  const { colors } = useAgrisaColors();
  const { isAuthenticated } = useAuthStore();
  const { handleCheckIdentifier, isCheckingIdentifier } = useAuthForm({
    type: "sign-in",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<UsernameFormData>({
    defaultValues: {
      identifier: "",
    },
  });

  const watchIdentifier = watch("identifier");

  // ============================================
  // 🚫 REDIRECT IF ALREADY AUTHENTICATED
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  // ============================================
  // 🔄 HELPERS
  // ============================================
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, "").replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }

    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }

    return phone;
  };

  const detectIdentifierType = (
    value: string
  ): "email" | "phone" | "unknown" => {
    const trimmed = value.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "email";
    }

    if (
      /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/.test(trimmed.replace(/\s+/g, ""))
    ) {
      return "phone";
    }

    return "unknown";
  };

  const validateIdentifier = (value: string): string | true => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Vui lòng nhập email hoặc số điện thoại";
    }

    const type = detectIdentifierType(trimmed);

    if (type === "email" || type === "phone") {
      return true;
    }

    return "Email hoặc số điện thoại không hợp lệ";
  };

  const onSubmit = async (data: UsernameFormData) => {
    try {
      const trimmedIdentifier = data.identifier.trim();

      const isPhone = detectIdentifierType(trimmedIdentifier) === "phone";

      const finalIdentifier = isPhone
        ? formatPhoneNumber(trimmedIdentifier)
        : trimmedIdentifier;

      console.log("✅ [Username Sign-In] Identifier:", finalIdentifier);

      // Kiểm tra identifier có tồn tại trong hệ thống không
      const isValid = await handleCheckIdentifier(finalIdentifier, {
        onSuccess: async () => {
          // Nếu tồn tại, lưu vào SecureStore và chuyển trang
          await secureStorage.setIdentifier(finalIdentifier);
          console.log("✅ [Username Sign-In] Saved to SecureStore");
          router.replace("/auth/sign-in");
        },
        onError: () => {
          console.log("❌ [Username Sign-In] Identifier not found");
        },
      });

      if (!isValid) {
        console.error("❌ [Username Sign-In] Invalid identifier");
      }
    } catch (error) {
      console.error("❌ [Username Sign-In] Error:", error);
    }
  };

  const identifierType = detectIdentifierType(watchIdentifier);

  const shortcuts = [
    { label: "Điều khoản sử dụng", icon: Newspaper },
    { label: "Liên hệ hỗ trợ", icon: PhoneIcon },
  ];

  return (
    <Box flex={1}>
      <ImageBackground
        source={require("@/assets/images/Login/Agrisa-Auth.png")}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: "absolute",
          top: 0,
          left: 0,
        }}
        imageStyle={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          resizeMode: "cover",
        }}
      />
      <LinearGradient
        colors={["rgba(89, 172, 119, 0.3)", "rgba(89, 172, 119, 0.6)"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
        }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: Platform.OS === "ios" ? 60 : 50,
            paddingBottom: Platform.OS === "ios" ? 40 : 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <VStack flex={1} px="$5" space="lg">
            {/* Logo & Title */}
            <HStack alignItems="center" space="sm">
              <Image
                source={require("@/assets/images/Logo/Agrisa.png")}
                alt="Agrisa Logo"
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </HStack>

            {/* Spacer để đẩy content xuống */}
            <Box flex={1} minHeight={20} />

            {/* Login Box & Footer */}
            <VStack space="lg">
              <Box
                borderRadius={32}
                overflow="hidden"
                borderWidth={1}
                borderColor={CARD_BORDER_COLOR}
                shadowColor="#63101B"
                shadowOffset={{ width: 0, height: 20 }}
                shadowOpacity={0.18}
                shadowRadius={30}
                elevation={18}
              >
                <LinearGradient
                  colors={CARD_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1 }}
                >
                  <Box px="$6" py="$7">
                    <HStack alignItems="center" space="md" mb="$5">
                      <Box bg={colors.primary} borderRadius="$full" p="$2.5">
                        <ShieldCheck
                          size={22}
                          color={colors.primary_white_text}
                          strokeWidth={2.6}
                        />
                      </Box>
                      <VStack>
                        <Text
                          style={{
                            fontFamily: "DancingScript-Regular",
                          }}
                          fontSize="$md"
                          color={colors.primary}
                        >
                          Xin chào,
                        </Text>
                        <Text
                          fontSize="$xl"
                          fontWeight="$bold"
                          color={colors.primary_text}
                        >
                          Người dùng Agrisa
                        </Text>
                      </VStack>
                    </HStack>

                    <Box
                      h={1}
                      bg={colors.primary_text}
                      mb="$5"
                      borderRadius={999}
                    />

                    <VStack space="md">
                      <Controller
                        control={control}
                        name="identifier"
                        rules={{ validate: validateIdentifier }}
                        render={({ field, fieldState }) => (
                          <FormControl isInvalid={!!fieldState.error}>
                            <VStack space="xs">
                              <Input
                                variant="outline"
                                size="lg"
                                borderWidth={1.5}
                                borderRadius="$3xl"
                                borderColor={
                                  fieldState.error
                                    ? colors.error
                                    : identifierType === "unknown"
                                      ? colors.frame_border
                                      : colors.primary
                                }
                                bg="rgba(255,255,255,0.96)"
                                h="$12"
                                shadowColor={colors.shadow}
                                shadowOffset={{ width: 0, height: 8 }}
                                shadowOpacity={0.18}
                                shadowRadius={16}
                                elevation={8}
                                $focus={{
                                  borderColor: colors.primary,
                                  borderWidth: 2,
                                }}
                              >
                                <InputSlot pl="$4">
                                  {identifierType === "email" ? (
                                    <Mail
                                      size={20}
                                      color={
                                        fieldState.error
                                          ? colors.error
                                          : identifierType !== "unknown"
                                            ? colors.primary
                                            : colors.muted_text
                                      }
                                      strokeWidth={2.5}
                                    />
                                  ) : (
                                    <Phone
                                      size={20}
                                      color={
                                        fieldState.error
                                          ? colors.error
                                          : identifierType !== "unknown"
                                            ? colors.primary
                                            : colors.muted_text
                                      }
                                      strokeWidth={2.5}
                                    />
                                  )}
                                </InputSlot>
                                <InputField
                                  value={field.value}
                                  onChangeText={(text) => {
                                    const isPhone = /^[0-9+]/.test(text);
                                    if (isPhone && !text.includes("@")) {
                                      field.onChange(formatPhoneNumber(text));
                                    } else {
                                      field.onChange(text);
                                    }
                                  }}
                                  placeholder="Email hoặc Số điện thoại"
                                  placeholderTextColor={colors.muted_text}
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                  keyboardType="default"
                                  pr="$4"
                                  fontSize="$sm"
                                  fontWeight="$medium"
                                  color={colors.primary_text}
                                />
                              </Input>

                              {fieldState.error && (
                                <FormControlError>
                                  <FormControlErrorText
                                    fontSize="$xs"
                                    color={colors.error}
                                  >
                                    {fieldState.error.message}
                                  </FormControlErrorText>
                                </FormControlError>
                              )}
                            </VStack>
                          </FormControl>
                        )}
                      />

                      <Button
                        onPress={handleSubmit(onSubmit)}
                        isDisabled={isSubmitting || isCheckingIdentifier}
                        size="lg"
                        bg={colors.primary}
                        borderRadius="$full"
                        h="$12"
                        shadowColor={colors.shadow}
                        shadowOffset={{ width: 0, height: 12 }}
                        shadowOpacity={0.24}
                        shadowRadius={16}
                        elevation={12}
                        $active={{
                          bg: colors.primary,
                          opacity: 0.95,
                        }}
                        mt="$5"
                      >
                        <ButtonText
                          fontSize="$md"
                          fontWeight="$bold"
                          color="$white"
                        >
                          {isSubmitting || isCheckingIdentifier
                            ? "Đang kiểm tra..."
                            : "Tiếp theo"}
                        </ButtonText>
                        <ButtonIcon as={ArrowRight} ml="$2" color="$white" />
                      </Button>

                      <VStack space="sm" alignItems="center" mt="$4">
                        <HStack space="xs" alignItems="center">
                          <Text fontSize="$md" color={colors.secondary_text}>
                            Chưa có tài khoản?
                          </Text>
                          <Pressable
                            onPress={() => router.push("/auth/sign-up")}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <Text
                              fontSize="$md"
                              fontWeight="$bold"
                              color={colors.primary}
                            >
                              Đăng ký ngay
                            </Text>
                          </Pressable>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                </LinearGradient>
              </Box>

              {/* Footer */}
              <HStack
                alignItems="center"
                justifyContent="space-between"
                px="$1"
                mt="$5"
              >
                {shortcuts.map(({ label, icon: Icon }) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    style={{ flex: 1 }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() => {}}
                  >
                    <VStack alignItems="center" space="xs">
                      <Box
                        bg="rgba(255,255,255,0.85)"
                        borderRadius="$full"
                        w="$12"
                        h="$12"
                        alignItems="center"
                        justifyContent="center"
                        borderWidth={1}
                        borderColor={colors.frame_border}
                        shadowColor={colors.shadow}
                        shadowOffset={{ width: 0, height: 4 }}
                        shadowOpacity={0.12}
                        shadowRadius={8}
                        elevation={4}
                      >
                        <Icon
                          size={20}
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                      </Box>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary_white_text}
                        numberOfLines={2}
                        textAlign="center"
                        style={{
                          textShadowColor: "rgba(0, 0, 0, 0.3)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        {label}
                      </Text>
                    </VStack>
                  </Pressable>
                ))}
              </HStack>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
};

export default UsernameSignInComponent;
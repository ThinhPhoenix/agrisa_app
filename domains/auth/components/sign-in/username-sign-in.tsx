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
    CreditCard,
    Mail,
    Newspaper,
    Phone,
    PhoneIcon,
    QrCode,
    ShieldCheck,
} from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
} from "react-native";
import { secureStorage } from "../../../shared/utils/secureStorage";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface UsernameFormData {
  identifier: string;
}

const PRIMARY_RED = "#A3142A";
const PRIMARY_RED_DARK = "#7E1021";
const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.45)";
const CARD_BACKGROUND = ["rgba(255,255,255,0.7)", "rgba(255,237,237,0.7)"];

const UsernameSignInComponent = () => {
  const { colors } = useAgrisaColors();

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

      await secureStorage.setIdentifier(finalIdentifier);

      console.log("✅ [Username Sign-In] Saved to SecureStore");

      router.push("/auth/sign-in");
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
        source={require("@/assets/images/Login/Login-BG.png")}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: "absolute",
          top: 0,
          left: 0,
        }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(163,20,42,0.45)"]}
          style={{ flex: 1 }}
        >
          <HStack
            alignItems="center"
            space="sm"
            position="absolute"
            top={Platform.OS === "ios" ? 60 : 50}
            left={24}
            zIndex={10}
          >
            <Image
              source={require("@/assets/images/Logo/Agrisa_Logo.png")}
              alt="Agrisa Logo"
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
            <Text
              fontSize="$2xl"
              fontWeight="$black"
              color="$white"
              letterSpacing={1.2}
            >
              AGRISA
            </Text>
          </HStack>
        </LinearGradient>
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <VStack px="$5" pb="$10" space="lg">
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
                colors={CARD_BACKGROUND}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1 }}
              >
                <Box px="$6" py="$7">
                  <HStack alignItems="center" space="md" mb="$5">
                    <Box
                      bg="rgba(163, 20, 42, 0.12)"
                      borderRadius="$full"
                      p="$2.5"
                    >
                      <ShieldCheck
                        size={22}
                        color={PRIMARY_RED}
                        strokeWidth={2.6}
                      />
                    </Box>
                    <VStack>
                      <Text fontSize="$xs" color={colors.textMuted}>
                        Xin chào,
                      </Text>
                      <Text
                        fontSize="$xl"
                        fontWeight="$bold"
                        color={colors.text}
                      >
                        Nông dân Agrisa
                      </Text>
                    </VStack>
                  </HStack>

                  <Box
                    h={1}
                    bg="rgba(163, 20, 42, 0.1)"
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
                            <Text
                              fontSize="$sm"
                              fontWeight="$semibold"
                              color={colors.text}
                              pb={10}
                            >
                              Email hoặc Số điện thoại
                            </Text>

                            <Input
                              variant="outline"
                              size="lg"
                              borderWidth={1.5}
                              borderRadius="$3xl"
                              borderColor={
                                fieldState.error
                                  ? colors.error
                                  : identifierType === "unknown"
                                    ? "rgba(163, 20, 42, 0.25)"
                                    : PRIMARY_RED
                              }
                              bg="rgba(255,255,255,0.96)"
                              h="$12"
                              shadowColor="rgba(99,16,27,0.12)"
                              shadowOffset={{ width: 0, height: 8 }}
                              shadowOpacity={0.18}
                              shadowRadius={16}
                              elevation={8}
                              $focus={{
                                borderColor: PRIMARY_RED,
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
                                          ? PRIMARY_RED
                                          : colors.textMuted
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
                                          ? PRIMARY_RED
                                          : colors.textMuted
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
                                placeholder="0987654321 hoặc email@agrisa.vn"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="default"
                                pr="$4"
                                fontSize="$sm"
                                fontWeight="$medium"
                                color={colors.text}
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
                      isDisabled={isSubmitting}
                      size="lg"
                      bg={PRIMARY_RED}
                      borderRadius="$full"
                      h="$12"
                      shadowColor="rgba(99,16,27,0.35)"
                      shadowOffset={{ width: 0, height: 12 }}
                      shadowOpacity={0.24}
                      shadowRadius={16}
                      elevation={10}
                      $active={{
                        bg: PRIMARY_RED_DARK,
                        opacity: 0.95,
                      }}
                      mt="$6"
                    >
                      <ButtonText
                        fontSize="$md"
                        fontWeight="$bold"
                        color="$white"
                      >
                        {isSubmitting ? "Đang xử lý..." : "Tiếp theo"}
                      </ButtonText>
                      <ButtonIcon as={ArrowRight} ml="$2" color="$white" />
                    </Button>

                    <VStack space="sm" alignItems="center" mt="$4">
                      <HStack space="xs" alignItems="center">
                        <Text fontSize="$md" color={colors.textSecondary}>
                          Chưa có tài khoản?
                        </Text>
                        <Pressable
                          onPress={() => router.push("/auth/sign-up")}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text
                            fontSize="$md"
                            fontWeight="$bold"
                            color={PRIMARY_RED}
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

            <HStack
              mt="$3"
              alignItems="center"
              justifyContent="space-between"
              px="$1"
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
                      bg="rgba(255,255,255,0.75)"
                      borderRadius="$full"
                      w="$12"
                      h="$12"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={1}
                      borderColor="rgba(163, 20, 42, 0.2)"
                    >
                      <Icon size={20} color={PRIMARY_RED} strokeWidth={2.5} />
                    </Box>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.textWhiteButton}
                      numberOfLines={2}
                      textAlign="center"
                    >
                      {label}
                    </Text>
                  </VStack>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
};

export default UsernameSignInComponent;
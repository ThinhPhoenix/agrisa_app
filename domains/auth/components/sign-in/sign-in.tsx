import useAxios from "@/config/useAxios.config";
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
  Pressable,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import {
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  LogIn,
  Mail,
  Newspaper,
  Phone,
  PhoneIcon,
  ScanFace,
  ShieldCheck,
  User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import {
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { secureStorage } from "../../../shared/utils/secureStorage";
import { useAuthForm } from "../../hooks/use-auth-form";
import { SignInPayload } from "../../models/auth.models";
import { SignInPayloadSchema } from "../../schemas/auth.schema";
import { useAuthStore } from "../../stores/auth.store";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const PRIMARY_RED = "#A3142A";
const PRIMARY_RED_DARK = "#7E1021";
const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.45)";
const CARD_GRADIENT = ["rgba(255,255,255,0.7)", "rgba(255,237,237,0.7)"];

const SignInComponentUI = () => {
  const { colors } = useAgrisaColors();
  const [showPassword, setShowPassword] = useState(false);
  const [cachedIdentifier, setCachedIdentifier] = useState<string | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLoadingBiometric, setIsLoadingBiometric] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Vân tay");

  const { setAuth } = useAuthStore();

  const { form, onSubmit, isLoading } = useAuthForm({
    type: "sign-in",
  });

  const signInFormControl = form.control as Control<SignInPayloadSchema>;

  // ============================================
  // 🔧 TRANSFORM IDENTIFIER TO PAYLOAD
  // ============================================
  const transformIdentifierToPayload = (
    identifier: string,
    password: string
  ): SignInPayload => {
    const trimmedIdentifier = identifier.trim();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
    if (isEmail) {
      return { email: trimmedIdentifier, password };
    }

    const isPhoneVN = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/.test(
      trimmedIdentifier.replace(/\s+/g, "")
    );

    if (isPhoneVN) {
      let normalizedPhone = trimmedIdentifier.replace(/\s+/g, "");

      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "+84" + normalizedPhone.substring(1);
      } else if (normalizedPhone.startsWith("84")) {
        normalizedPhone = "+" + normalizedPhone;
      }

      return { phone: normalizedPhone, password };
    }

    throw new Error("Định dạng không hợp lệ");
  };

  // ============================================
  // 🔄 LOAD CACHED DATA
  // ============================================
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("Khuôn mặt");
        } else if (
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT
          )
        ) {
          setBiometricType("Vân tay");
        }

        const lastIdentifier = await secureStorage.getIdentifier();

        if (!lastIdentifier) {
          router.replace("/auth/username-sign-in");
          return;
        }

        setCachedIdentifier(lastIdentifier);

        const biometricEnabled =
          await secureStorage.isBiometricEnabled(lastIdentifier);
        setIsBiometricEnabled(biometricEnabled);
      } catch (error) {
        console.error("❌ [Sign-in] Error loading cached data:", error);
      }
    };

    loadCachedData();
  }, []);

  // ============================================
  // 🔄 CHANGE ACCOUNT
  // ============================================
  const handleChangeAccount = () => {
    Alert.alert("Đổi tài khoản", "Bạn muốn đăng nhập bằng tài khoản khác?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đổi tài khoản",
        onPress: async () => {
          await secureStorage.clearIdentifier();
          router.replace("/auth/username-sign-in");
        },
      },
    ]);
  };

  // ============================================
  // 🔐 BIOMETRIC AUTHENTICATION
  // ============================================
  const authenticateWithBiometrics = async () => {
    try {
      setIsLoadingBiometric(true);

      if (!cachedIdentifier) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin tài khoản");
        return;
      }

      const enabled = await secureStorage.isBiometricEnabled(cachedIdentifier);

      if (!enabled) {
        Alert.alert(
          "Tính năng chưa bật",
          `Vui lòng bật xác thực ${biometricType} trong cài đặt sau khi đăng nhập.`
        );
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Không hỗ trợ",
          `Thiết bị không hỗ trợ ${biometricType} hoặc chưa thiết lập.`
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Đăng nhập Agrisa bằng ${biometricType}`,
        disableDeviceFallback: false,
        fallbackLabel: "Dùng mật khẩu",
        cancelLabel: "Hủy",
      });

      if (result.success) {
        const password =
          await secureStorage.getBiometricPassword(cachedIdentifier);

        if (!password) {
          Alert.alert(
            "Lỗi",
            "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập bằng mật khẩu."
          );
          return;
        }

        const loginPayload = transformIdentifierToPayload(
          cachedIdentifier,
          password
        );

        const response = await useAxios.post(
          "/auth/public/login",
          loginPayload
        );

        const { access_token, user } = response.data;

        await setAuth(access_token, user);

        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("❌ [Biometric] Error:", error);

      if (error?.response?.status === 401) {
        Alert.alert(
          "Đăng nhập thất bại",
          "Thông tin đăng nhập không đúng. Vui lòng đăng nhập lại bằng mật khẩu."
        );

        if (cachedIdentifier) {
          await secureStorage.clearBiometricPassword(cachedIdentifier);
          setIsBiometricEnabled(false);
        }
      } else {
        Alert.alert(
          "Lỗi",
          error.message || `Có lỗi xảy ra khi đăng nhập bằng ${biometricType}.`
        );
      }
    } finally {
      setIsLoadingBiometric(false);
    }
  };

  // ============================================
  // 🎨 UI HELPERS
  // ============================================
  const getIdentifierIcon = () => {
    if (!cachedIdentifier)
      return <User size={20} color={PRIMARY_RED} strokeWidth={2.5} />;

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cachedIdentifier.trim())) {
      return <Mail size={20} color={PRIMARY_RED} strokeWidth={2.5} />;
    }

    return <Phone size={20} color={PRIMARY_RED} strokeWidth={2.5} />;
  };

  // Lấy tên hiển thị từ identifier
  const getDisplayName = () => {
    if (!cachedIdentifier) return "Nông dân";
    // Nếu là email, lấy phần trước @
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cachedIdentifier)) {
      const name = cachedIdentifier.split("@")[0];
      // Capitalize first letter of each word
      return name
        .split(/[._-]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Nếu là số điện thoại, format lại
    const phone = cachedIdentifier.replace("+84", "0");
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  };

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
        imageStyle={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          resizeMode: "cover",
        }}
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
            zIndex={10}
          >
            <Image
              source={require("@/assets/images/Logo/Agrisa_Logo.png")}
              alt="Agrisa Logo"
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Text
              fontSize="$2xl"
              fontWeight="$black"
              color="$white"
              letterSpacing={1.2}
            >
              Agrisa
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
                colors={CARD_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1 }}
              >
            
                <Box px="$6" py="$7">
                  {cachedIdentifier && (
                    <VStack space="md" mb="$5">
                      <HStack space="md" alignItems="center">
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
                        <VStack flex={1}>
                          <Text fontSize="$md" color={colors.textMuted}>
                            Xin chào,
                          </Text>
                          <Text
                            fontSize="$xl"
                            fontWeight="$bold"
                            color={colors.text}
                            numberOfLines={1}
                          >
                            {getDisplayName()}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  )}

                  <Box
                    h={1}
                    bg="rgba(163, 20, 42, 0.1)"
                    mb="$5"
                    borderRadius={999}
                  />

                  <VStack space="md">
                    <Controller
                      control={signInFormControl}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <VStack space="xs">
                            <Text
                              fontSize="$xl"
                              fontWeight="$semibold"
                              pb={10}
                              color={colors.text}
                            >
                              Mật khẩu
                            </Text>

                            <HStack space="sm" alignItems="flex-start" pb={5}>
                              <Box flex={1}>
                                <Input
                                  variant="outline"
                                  size="lg"
                                  borderWidth={1.5}
                                  borderRadius="$3xl"
                                  borderColor={
                                    fieldState.error
                                      ? colors.error
                                      : "rgba(163, 20, 42, 0.25)"
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
                                    <Lock
                                      size={20}
                                      color={
                                        fieldState.error
                                          ? colors.error
                                          : colors.textMuted
                                      }
                                      strokeWidth={2.5}
                                    />
                                  </InputSlot>
                                  <InputField
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    pr="$10"
                                    fontSize="$sm"
                                    fontWeight="$medium"
                                    color={colors.text}
                                  />
                                  <InputSlot pr="$4">
                                    <Pressable
                                      onPress={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      hitSlop={{
                                        top: 10,
                                        bottom: 10,
                                        left: 10,
                                        right: 10,
                                      }}
                                    >
                                      {showPassword ? (
                                        <EyeOff
                                          size={18}
                                          color={colors.textMuted}
                                          strokeWidth={2.5}
                                        />
                                      ) : (
                                        <Eye
                                          size={18}
                                          color={colors.textMuted}
                                          strokeWidth={2.5}
                                        />
                                      )}
                                    </Pressable>
                                  </InputSlot>
                                </Input>

                                {fieldState.error && (
                                  <FormControlError mt="$1">
                                    <FormControlErrorText
                                      fontSize="$xs"
                                      color={colors.error}
                                    >
                                      {fieldState.error.message}
                                    </FormControlErrorText>
                                  </FormControlError>
                                )}
                              </Box>

                              {isBiometricEnabled && (
                                <Pressable
                                  onPress={authenticateWithBiometrics}
                                  disabled={isLoadingBiometric || isLoading}
                                  style={{
                                    opacity:
                                      isLoadingBiometric || isLoading ? 0.5 : 1,
                                  }}
                                >
                                  <Box
                                    bg={PRIMARY_RED}
                                    borderRadius="$full"
                                    w="$12"
                                    h="$12"
                                    alignItems="center"
                                    justifyContent="center"
                                    shadowColor="rgba(99,16,27,0.35)"
                                    shadowOffset={{ width: 0, height: 6 }}
                                    shadowOpacity={0.24}
                                    shadowRadius={8}
                                    elevation={10}
                                  >
                                    {Platform.OS === "ios" ? (
                                      <ScanFace
                                        size={26}
                                        color="#FFFFFF"
                                        strokeWidth={2.5}
                                      />
                                    ) : (
                                      <Fingerprint
                                        size={26}
                                        color="#FFFFFF"
                                        strokeWidth={2.5}
                                      />
                                    )}
                                  </Box>
                                </Pressable>
                              )}
                            </HStack>
                          </VStack>
                        </FormControl>
                      )}
                    />

                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      mt="$2"
                    >
                      <Pressable
                        onPress={handleChangeAccount}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color={colors.error}
                        >
                          Tài khoản khác
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => router.push("/auth/forgot-password")}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color={PRIMARY_RED}
                        >
                          Quên mật khẩu?
                        </Text>
                      </Pressable>
                    </HStack>

                    <Button
                      onPress={onSubmit}
                      isDisabled={isLoading}
                      size="lg"
                      bg={PRIMARY_RED}
                      borderRadius="$full"
                      h="$12"
                      shadowColor="rgba(99,16,27,0.35)"
                      shadowOffset={{ width: 0, height: 12 }}
                      shadowOpacity={0.24}
                      shadowRadius={16}
                      elevation={12}
                      $active={{
                        bg: PRIMARY_RED_DARK,
                        opacity: 0.95,
                      }}
                      mt="$5"
                    >
                      <ButtonText
                        fontSize="$md"
                        fontWeight="$bold"
                        color="$white"
                      >
                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                      </ButtonText>
                      <ButtonIcon as={LogIn} ml="$2" color="$white" />
                    </Button>
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

export default SignInComponentUI;

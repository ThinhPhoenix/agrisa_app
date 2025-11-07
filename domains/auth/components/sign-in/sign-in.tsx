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
  ScrollView
} from "react-native";
import { secureStorage } from "../../../shared/utils/secureStorage";
import { useAuthForm } from "../../hooks/use-auth-form";
import { SignInPayload } from "../../models/auth.models";
import { SignInPayloadSchema } from "../../schemas/auth.schema";
import { useAuthStore } from "../../stores/auth.store";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

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
      return <User size={20} color={colors.primary} strokeWidth={2.5} />;

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cachedIdentifier.trim())) {
      return <Mail size={20} color={colors.primary} strokeWidth={2.5} />;
    }

    return <Phone size={20} color={colors.primary} strokeWidth={2.5} />;
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

  // ============================================
  // 🔧 CUSTOM SUBMIT HANDLER - Xử lý submit với identifier cached
  // ============================================
  const handleLoginPress = async () => {
    try {
      if (!cachedIdentifier) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin tài khoản");
        return;
      }

      // Trigger validation cho password field
      const isValid = await form.trigger("password");
      if (!isValid) {
        return;
      }

      // Lấy password từ form
      const password = form.getValues("password");
      
      if (!password) {
        Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
        return;
      }

      // Set identifier vào form (để onSubmit có đủ data)
      form.setValue("identifier", cachedIdentifier);
      
      // Gọi onSubmit từ useAuthForm (đã có handleSubmit bên trong)
      await onSubmit();

    } catch (error: any) {
      console.error("❌ [Sign-in] Error:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra. Vui lòng thử lại."
      );
    }
  };

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
        colors={["rgba(255,255,255,0)", "rgba(163,20,42,0.45)"]}
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
                    {cachedIdentifier && (
                      <VStack space="md" mb="$5">
                        <HStack space="md" alignItems="center">
                          <Box borderRadius="$full" p="$2.5">
                            <ShieldCheck
                              size={22}
                              color={colors.primary}
                              strokeWidth={2.6}
                            />
                          </Box>
                          <VStack flex={1}>
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
                              color={colors.text}
                              numberOfLines={1}
                            >
                              {getDisplayName()}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    )}

                    <Box h={1} bg={colors.border} mb="$5" borderRadius={999} />

                    <VStack space="md">
                      <Controller
                        control={signInFormControl}
                        name="password"
                        render={({ field, fieldState }) => (
                          <FormControl isInvalid={!!fieldState.error}>
                            <VStack space="xs">
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
                                        : colors.border
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
                                      placeholder="Mật khẩu"
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
                                        isLoadingBiometric || isLoading
                                          ? 0.5
                                          : 1,
                                    }}
                                  >
                                    <Box
                                      bg={colors.primary}
                                      borderRadius="$full"
                                      w="$12"
                                      h="$12"
                                      alignItems="center"
                                      justifyContent="center"
                                      shadowColor={colors.shadow}
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
                            color={colors.primary}
                          >
                            Quên mật khẩu?
                          </Text>
                        </Pressable>
                      </HStack>

                      <Button
                        onPress={handleLoginPress}  // ✅ FIX: Dùng custom handler
                        isDisabled={isLoading || isLoadingBiometric}
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
                          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                        </ButtonText>
                        <ButtonIcon as={LogIn} ml="$2" color="$white" />
                      </Button>
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
                        borderColor={colors.border}
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
                        color={colors.textWhiteButton}
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

export default SignInComponentUI;

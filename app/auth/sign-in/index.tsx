import { useAuthForm } from "@/domains/auth/hooks/use-auth-form";
import { useCachedAuth } from "@/domains/auth/hooks/use-cached-auth";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { colors } from "@/domains/shared/constants/colors";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { DancingScript_400Regular } from "@expo-google-fonts/dancing-script";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  InputSlot,
  VStack
} from "@gluestack-ui/themed";
import { BlurView } from "expo-blur";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  FingerprintIcon,
  ScanFaceIcon,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function SignInScreen() {
  const [biometric] = useState(true);
  const [enterPassword, setEnterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({ DancingScript_400Regular });
  const insets = useSafeAreaInsets();

  // auth form and helpers
  const { form, onSubmit, handleBiometricSignIn, isLoading } = useAuthForm({
    type: "sign-in",
  });
  const { control, trigger } = form;

  const {
    cachedIdentifier,
    isBiometricEnabled,
    biometricType,
    isLoading: isCachedLoading,
    clearCachedIdentifier,
  } = useCachedAuth();

  const { setAuth } = useAuthStore();

  // Prefill identifier and password into form when cached
  React.useEffect(() => {
    if (cachedIdentifier) {
      (form as any).setValue("identifier", cachedIdentifier);

      // If biometric is enabled, try to get stored password and go to password step
      if (isBiometricEnabled) {
        const getStoredPassword = async () => {
          try {
            const storedPassword =
              await secureStorage.getBiometricPassword(cachedIdentifier);
            if (storedPassword) {
              (form as any).setValue("password", storedPassword);
              setEnterPassword(true);
            }
          } catch (error) {
            console.error("Error getting stored password:", error);
          }
        };
        getStoredPassword();
      }
    }
  }, [cachedIdentifier, isBiometricEnabled, form]);

  if (!fontsLoaded) return null;
  if (isCachedLoading) return null;

  const getDisplayName = () => {
    if (!cachedIdentifier) return "Nông dân";

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cachedIdentifier)) {
      const name = cachedIdentifier.split("@")[0];
      return name
        .split(/[._-]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const phone = cachedIdentifier.replace("+84", "0");
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  };

  const handleChangeAccount = () => {
    Alert.alert("Đổi tài khoản", "Bạn muốn đăng nhập bằng tài khoản khác?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đổi tài khoản",
        onPress: async () => {
          await clearCachedIdentifier();
          router.replace("/auth/sign-in");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-transparent">
      {/* Status bar - translucent để background tràn lên */}
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Background Image - Absolute positioning để tràn toàn màn hình */}
      <ImageBackground
        source={require("@/assets/images/Login/Agrisa-Auth.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />

      {/* Content overlay */}
      <View className="flex-1">
        {/* Greeting positioned absolute - Top Left */}
        <View
          pointerEvents="box-none"
          className="absolute z-20 flex-row items-center"
          style={{
            top: insets.top + 8,
            left: 16,
            right: 0,
          }}
        >
          <HStack className="flex-row items-center justify-center">
            {/* Account Change Button */}
            <Pressable
              onPress={handleChangeAccount}
              android_ripple={{
                color: "rgba(255,255,255,0.2)",
                borderless: false,
              }}
              className="w-11 h-11 rounded-lg overflow-hidden mr-2"
            >
              <BlurView
                intensity={20}
                className="flex-1 justify-center items-center rounded-lg bg-white/10"
              >
                <Users size={20} color={colors.primary800} />
              </BlurView>
            </Pressable>

            {/* Greeting Text */}
            <Text
              style={{
                fontFamily: "DancingScript_400Regular",
              }}
              className="text-primary-500 text-[22px] mr-2"
            >
              Xin chào,
            </Text>
            <Text className="text-black text-lg mt-1">{getDisplayName()}</Text>
          </HStack>
        </View>

        {/* Logo Top-Right */}
        <View
          pointerEvents="none"
          className="absolute z-[999]"
          style={{
            top: insets.top + 8,
            right: 16,
          }}
        >
          <Image
            source={require("@/assets/images/agrisa.png")}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <SafeAreaView
          className="flex-1 justify-center items-center"
          edges={["bottom"]}
        >
          {/* Sign up link */}
          {!enterPassword && (
            <Pressable
              onPress={() => router.push("/auth/sign-up")}
              className="self-center mb-4"
            >
              <Text className="text-primary-500 text-sm underline">
                Bạn không có tài khoản? Đăng ký ngay
              </Text>
            </Pressable>
          )}

          {/* Card Container */}
          <VStack className="w-[90%] max-w-[360px]">
            {/* Input Section */}
            {!enterPassword && (
              <Box className="h-14 mb-3">
                <Controller
                  control={control as any}
                  name={"identifier" as any}
                  render={({ field }) => (
                    <Input
                      size="lg"
                      className="flex-1 bg-gray-200/90 rounded-lg"
                    >
                      <InputField
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Email hoặc Số điện thoại"
                        className="text-gray-900"
                        placeholderTextColor="#666"
                        autoCapitalize="none"
                      />
                    </Input>
                  )}
                />
              </Box>
            )}

            {/* Password Section */}
            {enterPassword && (
              <VStack>
                {/* Back Button */}
                <Pressable
                  onPress={() => setEnterPassword(false)}
                  android_ripple={{
                    color: "rgba(0,0,0,0.05)",
                    borderless: false,
                  }}
                  className="flex-row items-center mb-2"
                >
                  <ChevronLeft color="#000000" size={15} />
                  <Text className="text-black ml-1.5 text-[15px]">
                    Quay lại
                  </Text>
                </Pressable>

                {/* Password Input */}
                <Box className="h-14 mb-4">
                  <Controller
                    control={control as any}
                    name={"password" as any}
                    render={({ field }) => (
                      <Input
                        size="lg"
                        className="flex-1 bg-gray-200/90 rounded-lg"
                      >
                        <InputField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="Mật khẩu"
                          className="text-gray-900"
                          placeholderTextColor="#666"
                          secureTextEntry={!showPassword}
                        />
                        <InputSlot
                          pr="$3"
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff color="#666" size={20} />
                          ) : (
                            <Eye color="#666" size={20} />
                          )}
                        </InputSlot>
                      </Input>
                    )}
                  />
                </Box>
              </VStack>
            )}

            {/* Buttons Row */}
            <HStack className="flex-row items-center">
              {/* Login Button */}
              <Pressable
                android_ripple={{
                  color: "rgba(255,255,255,0.3)",
                  borderless: false,
                }}
                className="flex-1"
              >
                <LinearGradient
                  colors={[colors.primary500, colors.primary700]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-14 rounded-lg justify-center items-center shadow-lg"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 6,
                  }}
                >
                  <Button
                    className="w-full h-full bg-transparent"
                    onPress={async () => {
                      if (!enterPassword) {
                        // validate identifier first
                        const ok = await (trigger as any)("identifier");
                        if (ok) setEnterPassword(true);
                        return;
                      }

                      // submit form
                      onSubmit();
                    }}
                    isDisabled={isLoading}
                  >
                    <ButtonText className="text-white text-base font-semibold">
                      {enterPassword ? "Đăng nhập" : "Tiếp tục"}
                    </ButtonText>
                  </Button>
                </LinearGradient>
              </Pressable>

              {/* Biometric Button */}
              {biometric && isBiometricEnabled && (
                <Pressable
                  onPress={async () => {
                    if (!cachedIdentifier) return;
                    await handleBiometricSignIn(
                      cachedIdentifier,
                      biometricType,
                      setAuth
                    );
                  }}
                  android_ripple={{
                    color: "rgba(255,255,255,0.3)",
                    borderless: false,
                  }}
                  className="w-14 h-14 ml-2.5 rounded-lg border border-primary-500 overflow-hidden"
                >
                  <BlurView
                    intensity={20}
                    className="flex-1 justify-center items-center rounded-lg bg-white/10"
                  >
                    {Platform.OS === "ios" ? (
                      <ScanFaceIcon color={colors.primary800} />
                    ) : (
                      <FingerprintIcon color={colors.primary800} />
                    )}
                  </BlurView>
                </Pressable>
              )}
            </HStack>
          </VStack>
        </SafeAreaView>
      </View>
    </View>
  );
}

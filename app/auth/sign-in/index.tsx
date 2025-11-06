import { router } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  FingerprintIcon,
  ScanFaceIcon,
  Users,
} from "lucide-react-native";
// SignInV2.tsx
import { useAuthForm } from "@/domains/auth/hooks/use-auth-form";
import { useCachedAuth } from "@/domains/auth/hooks/use-cached-auth";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { colors } from "@/domains/shared/constants/colors";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { DancingScript_400Regular } from "@expo-google-fonts/dancing-script";
import {
  Button,
  ButtonText,
  Input,
  InputField,
  InputSlot,
  VStack,
} from "@gluestack-ui/themed";
import { BlurView } from "expo-blur";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
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
    <VStack style={styles.root}>
      {/* 1. Status bar trong suốt */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* 2. Container root để đảm bảo bao phủ toàn màn hình */}
      <View style={{ flex: 1 }}>
        {/* 3. SafeArea chỉ bao phần UI, edges=['bottom'] để KHÔNG cắn thêm top */}
        {/* Greeting positioned absolute using safe-area inset; includes an account-change blur button */}
        <View
          pointerEvents="box-none"
          style={[
            styles.greetingContainer,
            { top: insets.top + 8, left: 16, right: 0, alignItems: "center" },
          ]}
        >
          <View style={styles.greetingTextWrap}>
            <Pressable
              onPress={handleChangeAccount}
              android_ripple={{
                color: "rgba(255,255,255,0.2)",
                borderless: false,
              }}
              style={styles.accountPressable}
            >
              <BlurView intensity={20} style={styles.bioBlur}>
                <Users size={20} color={colors.primary800} />
              </BlurView>
            </Pressable>
            <Text
              style={{
                fontFamily: "DancingScript_400Regular",
                color: colors.primary500,
                fontSize: 22,
                textShadowRadius: 2,
                marginRight: 8,
              }}
            >
              Xin chào,
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: 18,
                marginTop: 4,
                textShadowRadius: 2,
              }}
            >
              {getDisplayName()}
            </Text>
          </View>
        </View>
        {/* Logo top-right */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: insets.top + 8,
            right: 16,
            zIndex: 999,
          }}
        >
          <Image
            source={require("@/assets/images/agrisa.png")}
            style={{ width: 48, height: 48, resizeMode: "contain" }}
          />
        </View>

        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          {/* Link to sign up */}
          {!enterPassword && (
            <Pressable
              onPress={() => router.push("/auth/sign-up")}
              style={styles.signUpLink}
            >
              <Text style={styles.signUpText}>
                Bạn không có tài khoản? Đăng ký ngay
              </Text>
            </Pressable>
          )}

          <View style={styles.card}>
            {/* ---------- Input ---------- */}
            {!enterPassword && (
              <View style={styles.inputWrapper}>
                <Controller
                  control={control as any}
                  name={"identifier" as any}
                  render={({ field }) => (
                    <Input size="lg" style={styles.input}>
                      <InputField
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Email hoặc Số điện thoại"
                        style={styles.inputField}
                        placeholderTextColor="#666"
                        autoCapitalize="none"
                      />
                    </Input>
                  )}
                />
              </View>
            )}

            {enterPassword && (
              <>
                <Pressable
                  onPress={() => setEnterPassword(false)}
                  android_ripple={{
                    color: "rgba(0,0,0,0.05)",
                    borderless: false,
                  }}
                  style={styles.backRow}
                >
                  <ChevronLeft color="#000000" size={15} />
                  <Text style={styles.backText}>Quay lại</Text>
                </Pressable>
                <View style={[styles.inputWrapper, { marginBottom: 16 }]}>
                  <Controller
                    control={control as any}
                    name={"password" as any}
                    render={({ field }) => (
                      <Input size="lg" style={styles.input}>
                        <InputField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="Mật khẩu"
                          style={styles.inputField}
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
                </View>
              </>
            )}

            {/* ---------- Buttons ---------- */}
            <View style={styles.btnRow}>
              <Pressable
                android_ripple={{
                  color: "rgba(255,255,255,0.3)",
                  borderless: false,
                }}
                style={styles.loginPressable}
              >
                <LinearGradient
                  colors={[colors.primary500, colors.primary700]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Button
                    style={styles.btn}
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
                    <ButtonText style={styles.btnText}>
                      {enterPassword ? "Đăng nhập" : "Tiếp tục"}
                    </ButtonText>
                  </Button>
                </LinearGradient>
              </Pressable>

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
                  style={styles.bioPressable}
                >
                  <BlurView intensity={20} style={styles.bioBlur}>
                    {Platform.OS === "ios" ? (
                      <ScanFaceIcon color={colors.primary800} />
                    ) : (
                      <FingerprintIcon color={colors.primary800} />
                    )}
                  </BlurView>
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </VStack>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "90%", maxWidth: 360 },
  inputWrapper: { height: 56, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "rgba(222,222,222)",
    borderRadius: 8,
  },
  inputField: { color: "#111827" },
  btnRow: { flexDirection: "row", alignItems: "center" },
  loginPressable: { flex: 1 },
  gradientBtn: {
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  btn: { width: "100%", height: "100%", backgroundColor: "transparent" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  bioPressable: {
    width: 56,
    height: 56,
    marginLeft: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary500,
    overflow: "hidden",
  },
  bioBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  greeting: {
    position: "absolute",
    zIndex: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backText: {
    color: "#000000",
    marginLeft: 6,
    fontSize: 15,
  },
  cachedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 8,
    borderRadius: 8,
  },
  cachedIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cachedHello: { color: "#fff", fontSize: 12, opacity: 0.9 },
  cachedName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  changeAccount: { color: colors.primary500, fontSize: 13 },
  greetingContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  greetingTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountPressable: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 8,
  },
  signUpLink: {
    alignSelf: "center",
    marginBottom: 16,
  },
  signUpText: {
    color: colors.primary500,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

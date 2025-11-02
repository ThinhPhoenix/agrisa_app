import { router } from "expo-router";
import {
  ChevronLeft,
  FingerprintIcon,
  ScanFaceIcon,
  Users,
} from "lucide-react-native";
// SignInV2.tsx
import { colors } from "@/domains/shared/constants/colors";
import { DancingScript_400Regular } from "@expo-google-fonts/dancing-script";
import { Button, ButtonText, Input, InputField } from "@gluestack-ui/themed";
import { BlurView } from "expo-blur";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
// (icons imported above)
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Alert,
  Image,
  ImageBackground,
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
import { useAuthForm } from "../../hooks/use-auth-form";
import { useCachedAuth } from "../../hooks/use-cached-auth";
import { useAuthStore } from "../../stores/auth.store";

export default function SignInV2() {
  const [biometric] = useState(true);
  const [enterPassword, setEnterPassword] = useState(false);
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

  // Prefill identifier into form when cached
  React.useEffect(() => {
    if (cachedIdentifier) {
      (form as any).setValue("identifier", cachedIdentifier);
    }
  }, [cachedIdentifier, form]);

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
          router.replace("/auth/username-sign-in");
        },
      },
    ]);
  };

  return (
    <>
      {/* 1. Status bar trong suốt */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* 2. ImageBackground ở ngoài cùng -> vẽ dưới status-bar */}
      <ImageBackground
        source={require("../../../../assets/images/auth-bg.jpg")}
        style={styles.root}
        resizeMode="cover"
      >
        {/* 3. SafeArea chỉ bao phần UI, edges=['bottom'] để KHÔNG cắn thêm top */}
        {/* Greeting positioned absolute using safe-area inset; includes an account-change blur button */}
        <View
          pointerEvents="box-none"
          style={[styles.greetingContainer, { top: insets.top + 8, left: 20 }]}
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
                textShadowColor: "rgba(0,0,0,0.2)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Xin chào,
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                marginTop: 2,
                textShadowColor: "rgba(0,0,0,0.2)",
                textShadowOffset: { width: 0, height: 1 },
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
            source={require("../../../../assets/images/agrisa.png")}
            style={{ width: 48, height: 48, resizeMode: "contain" }}
          />
        </View>

        <SafeAreaView style={styles.safe} edges={["bottom"]}>
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
                  <ChevronLeft color="#fff" size={15} />
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
                          secureTextEntry
                        />
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

            {/* Add sign-up link for users without account */}
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Không có tài khoản? </Text>
              <Pressable onPress={() => router.push("/auth/sign-up")}>
                <Text style={styles.signUpLink}>Đăng ký</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
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
    color: "#fff",
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
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  greetingTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 8,
  },
  accountPressable: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: colors.primary800,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signUpText: {
    color: "#fff",
    fontSize: 14,
  },
  signUpLink: {
    color: colors.primary200,
    fontSize: 14,
    fontWeight: "600",
  },
});

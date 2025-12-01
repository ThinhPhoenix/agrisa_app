import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useSettingsStore } from "@/domains/shared/stores/settingsStore";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import {
    Box,
    Divider,
    HStack,
    Pressable,
    ScrollView,
    Switch,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import * as Linking from "expo-linking";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect, useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    CloudRain,
    FileText,
    Fingerprint,
    Key,
    Lock,
    ScanFace,
    Settings as SettingsIcon,
    Shield,
    Sprout,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { BiometricPasswordModal } from "./BiometricPasswordModal";

export default function SettingsScreen() {
    const { colors } = useAgrisaColors();
    const router = useRouter();
    const { notifications, toggleNotification } = useSettingsStore();

    const {
      user,
      userProfile,
      refreshAuth,
      enableBiometric,
      disableBiometric,
    } = useAuthStore();

    const [biometricType, setBiometricType] = useState<string>("Face ID");
    const [hasBiometric, setHasBiometric] = useState(false);
    const [isBiometricEnabledForAccount, setIsBiometricEnabledForAccount] =
      useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // ✅ State cho custom modal (Android)
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // ============================================
    // 🔄 REFRESH USER DATA KHI VÀO SCREEN
    // ============================================
    useFocusEffect(
      useCallback(() => {
        console.log("🔄 [Settings] Screen focused, refreshing user data...");
        loadUserData();
      }, [])
    );

    const loadUserData = async () => {
      try {
        setIsLoadingUser(true);
        console.log("📱 [Settings] Loading user data...");

        // ✅ Refresh auth từ SecureStore
        await refreshAuth();

        // ✅ Lấy user mới nhất từ store
        const currentUser = useAuthStore.getState().user;
        console.log("👤 [Settings] Current user after refresh:", currentUser);

        if (currentUser) {
          console.log("✅ [Settings] User found:", {
            id: currentUser.id,
            email: currentUser.email,
            phone: currentUser.phone_number,
          });
        } else {
          console.log("⚠️ [Settings] No user found after refresh");
        }
      } catch (error) {
        console.error("❌ [Settings] Error loading user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    // ============================================
    // 🔍 CHECK BIOMETRIC AVAILABILITY & STATUS
    // ============================================
    useEffect(() => {
      checkBiometricAvailability();
    }, []);

    useEffect(() => {
      if (user && !isLoadingUser) {
        console.log("✅ [Settings] User available, checking biometric status");
        checkBiometricStatus();
      }
    }, [user, isLoadingUser]);

    const checkBiometricAvailability = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometric(compatible && enrolled);

        console.log("📱 [Settings] Biometric hardware check:", {
          compatible,
          enrolled,
          available: compatible && enrolled,
        });

        if (compatible) {
          const types =
            await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (
            types.includes(
              LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
            )
          ) {
            setBiometricType("Face ID");
          } else if (
            types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
          ) {
            setBiometricType("Vân tay");
          } else {
            setBiometricType("Sinh trắc học");
          }
        }
      } catch (error) {
        console.error("❌ [Settings] Lỗi check biometric:", error);
      }
    };

    const checkBiometricStatus = async () => {
      try {
        if (!user) {
          console.log("⚠️ [Settings] No user found in checkBiometricStatus");
          return;
        }

        const identifier = user.email || user.phone_number;
        if (!identifier) {
          console.log("⚠️ [Settings] No identifier found");
          return;
        }

        // ✅ Lấy device ID để debug
        const deviceId = await secureStorage.getDeviceId();
        console.log("📱 [Settings] Device ID:", deviceId);
        console.log(
          "👤 [Settings] Checking biometric for identifier:",
          identifier
        );

        const enabled = await secureStorage.isBiometricEnabled(identifier);
        setIsBiometricEnabledForAccount(enabled);

        console.log(
          `✅ [Settings] Biometric status for ${identifier}:`,
          enabled
        );

        // ✅ Kiểm tra password có tồn tại không
        const hasPassword =
          await secureStorage.getBiometricPassword(identifier);
        console.log(`🔑 [Settings] Has saved password:`, !!hasPassword);
      } catch (error) {
        console.error("❌ [Settings] Error checking biometric status:", error);
      }
    };

    // ============================================
    // 🎯 HANDLERS
    // ============================================

    /**
     * ✅ Xử lý enable biometric sau khi nhập password
     */
    const handleEnableBiometricWithPassword = async (password?: string) => {
      console.log("🔑 [Settings] Password received, length:", password?.length);

      if (!password || password.trim().length === 0) {
        console.log("⚠️ [Settings] Empty password");
        Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
        return;
      }

      try {
        console.log("👆 [Settings] Requesting biometric authentication...");

        // Xác thực biometric trước
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Đăng nhập bằng ${biometricType}`,
          fallbackLabel: "Hủy",
        });

        console.log("👆 [Settings] Biometric auth result:", result.success);

        if (result.success) {
          console.log("✅ [Settings] Calling enableBiometric...");

          // Enable biometric trong auth store
          await enableBiometric(password);

          // Cập nhật UI state
          setIsBiometricEnabledForAccount(true);

          const identifier = user!.email || user!.phone_number;
          const verified = await secureStorage.isBiometricEnabled(identifier!);
          console.log(
            "✅ [Settings] Biometric enabled successfully, verified:",
            verified
          );

          Alert.alert("Thành công", `Đã bật xác thực ${biometricType}`);
        } else {
          console.log("❌ [Settings] Biometric authentication failed");
          Alert.alert("Thất bại", "Xác thực không thành công");
        }
      } catch (error: any) {
        console.error("❌ [Settings] Error enabling biometric:", error);
        console.error("❌ [Settings] Error details:", {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });

        Alert.alert(
          "Lỗi",
          error.message || "Không thể kích hoạt " + biometricType
        );
      }
    };

    const handleToggleBiometric = async () => {
        console.log("🔄 [Settings] Toggle biometric called");
        console.log("👤 [Settings] Current user state:", user);

        if (!hasBiometric) {
            console.log("⚠️ [Settings] No biometric hardware available");
            Alert.alert(
                "Chưa thiết lập",
                `Vui lòng thiết lập ${biometricType} trên thiết bị của bạn trước.`,
                [{ text: "OK" }]
            );
            return;
        }

        if (!user) {
            console.log("⚠️ [Settings] No user logged in");
            console.log("🔄 [Settings] Attempting to refresh user data...");

            // ✅ Thử refresh lại user
            await loadUserData();

            const currentUser = useAuthStore.getState().user;
            if (!currentUser) {
                Alert.alert(
                    "Lỗi",
                    "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
                    [
                        {
                            text: "Đăng nhập",
                            onPress: () => router.push("/auth/sign-in"),
                        },
                    ]
                );
                return;
            }
        }

        const identifier = user!.email || user!.phone_number;
        console.log("👤 [Settings] User identifier:", identifier);
        console.log(
            "📱 [Settings] Current biometric status:",
            isBiometricEnabledForAccount
        );

        if (!isBiometricEnabledForAccount) {
            // ✅ BẬT BIOMETRIC
            console.log("🔓 [Settings] Enabling biometric...");

            // ✅ Phân biệt iOS vs Android
            if (Platform.OS === "ios") {
                // iOS: Dùng Alert.prompt
                Alert.prompt(
                    "Kích hoạt " + biometricType,
                    "Nhập mật khẩu của bạn để kích hoạt đăng nhập bằng " +
                        biometricType,
                    [
                        {
                            text: "Hủy",
                            style: "cancel",
                            onPress: () =>
                                console.log("❌ [Settings] User cancelled"),
                        },
                        {
                            text: "Xác nhận",
                            onPress: handleEnableBiometricWithPassword,
                        },
                    ],
                    "secure-text"
                );
            } else {
                // Android: Dùng custom modal
                console.log("📱 [Settings] Opening password modal for Android");
                setShowPasswordModal(true);
            }
        } else {
            // ✅ TẮT BIOMETRIC
            console.log("🔒 [Settings] Disabling biometric...");
            Alert.alert(
                "Tắt " + biometricType,
                `Bạn có chắc muốn tắt đăng nhập bằng ${biometricType}?`,
                [
                    {
                        text: "Hủy",
                        style: "cancel",
                        onPress: () =>
                            console.log("❌ [Settings] User cancelled disable"),
                    },
                    {
                        text: "Tắt",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                console.log(
                                    "🔒 [Settings] Calling disableBiometric..."
                                );

                                // Disable biometric trong auth store
                                await disableBiometric();

                                // Cập nhật UI state
                                setIsBiometricEnabledForAccount(false);

                                // Verify ngay
                                const verified =
                                    await secureStorage.isBiometricEnabled(
                                        identifier!
                                    );
                                console.log(
                                    "✅ [Settings] Biometric disabled successfully, verified:",
                                    verified
                                );

                                Alert.alert(
                                    "Đã tắt",
                                    `${biometricType} đã được tắt`
                                );
                            } catch (error) {
                                console.error(
                                    "❌ [Settings] Error disabling biometric:",
                                    error
                                );
                                Alert.alert(
                                    "Lỗi",
                                    "Không thể tắt " + biometricType
                                );
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleChangePassword = () => {
        router.push("/settings/change-password");
    };

    const handleVerifyIdentity = () => {
        router.push("/settings/verify/identity-result");
    };

    const handleToggleNotifications = async () => {
        const newValue = !notifications.enabled;

        // Toggle the notification setting
        toggleNotification("enabled");

        // If turning on notifications, open browser with user_id
        if (newValue && user?.id) {
            const url = `https://agrisa-noti.phrimp.io.vn?user_id=${user.id}`;
          try {
                console.log(url);
            
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                    await Linking.openURL(url);
                } else {
                    Alert.alert("Lỗi", "Không thể mở trình duyệt");
                }
            } catch (error) {
                console.error("Error opening URL:", error);
                Alert.alert("Lỗi", "Không thể mở trình duyệt");
            }
        }
    };

    // ============================================
    // 🎨 RENDER HELPERS
    // ============================================
    const renderSectionHeader = (title: string, icon: any) => {
        const IconComponent = icon;
        return (
          <HStack space="sm" alignItems="center" mb="$3" mt="$2">
            <IconComponent size={20} color={colors.primary_text} />
            <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
              {title}
            </Text>
          </HStack>
        );
    };

    const renderSwitchItem = (
        label: string,
        value: boolean,
        onToggle: () => void,
        icon: any,
        disabled?: boolean
    ) => {
        const IconComponent = icon;
        return (
          <Pressable
            onPress={disabled ? undefined : onToggle}
            disabled={disabled}
          >
            <HStack
              p="$4"
              bg={colors.card_surface}
              borderRadius="$lg"
              justifyContent="space-between"
              alignItems="center"
              mb="$2"
              opacity={disabled ? 0.5 : 1}
            >
              <HStack space="md" alignItems="center" flex={1}>
                <Box bg={colors.card_surface} p="$2" borderRadius="$md">
                  <IconComponent size={20} color={colors.secondary_text} />
                </Box>
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color={colors.primary_text}
                  flex={1}
                >
                  {label}
                </Text>
              </HStack>
              <Box>
                <Switch
                  value={value}
                  onValueChange={onToggle}
                  size="sm"
                  disabled={disabled}
                />
              </Box>
            </HStack>
          </Pressable>
        );
    };

    const renderNavigationItem = (
        label: string,
        onPress: () => void,
        icon: any
    ) => {
        const IconComponent = icon;
        return (
            <Pressable onPress={onPress}>
                <HStack
                    p="$4"
                    bg={colors.card_surface}
                    borderRadius="$lg"
                    justifyContent="space-between"
                    alignItems="center"
                    mb="$2"
                >
                    <HStack space="md" alignItems="center" flex={1}>
                        <Box bg={colors.card_surface} p="$2" borderRadius="$md">
                            <IconComponent size={20} color={colors.primary_text} />
                        </Box>
                        <Text
                            fontSize="$sm"
                            fontWeight="$medium"
                            color={colors.primary_text}
                            flex={1}
                        >
                            {label}
                        </Text>
                    </HStack>
                    <ChevronRight size={20} color={colors.secondary_text} />
                </HStack>
            </Pressable>
        );
    };

    // ============================================
    // 🎬 RENDER
    // ============================================

    // ✅ Show loading state
    if (isLoadingUser) {
        return (
            <Box
                flex={1}
                justifyContent="center"
                alignItems="center"
                bg={colors.background}
            >
                <Text fontSize="$lg" color={colors.muted_text}>
                    Đang tải thông tin...
                </Text>
            </Box>
        );
    }

    return (
        <>
            <ScrollView
                bg={colors.background}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <VStack p="$5" pb="$8" space="lg">
                    {/* ============================================ */}
                    {/* 🔐 BẢO MẬT */}
                    {/* ============================================ */}
                    <Box>
                        {renderSectionHeader("Bảo mật", Shield)}

                        <VStack space="xs">
                            {/* Đổi mật khẩu */}
                            {renderNavigationItem(
                                "Đổi mật khẩu",
                                handleChangePassword,
                                Key
                            )}

                            {/* Xác thực sinh trắc học */}
                            {renderSwitchItem(
                                `Đăng nhập bằng ${biometricType}`,
                                isBiometricEnabledForAccount,
                                handleToggleBiometric,
                                biometricType === "Face ID"
                                    ? ScanFace
                                    : Fingerprint,
                                !hasBiometric
                            )}

                            {/* Xác thực danh tính (eKYC) */}
                            {renderNavigationItem(
                                "Xác thực danh tính",
                                handleVerifyIdentity,
                                Lock
                            )}
                        </VStack>
                    </Box>

                    <Divider bg={colors.frame_border} />

                    {/* ============================================ */}
                    {/* 🔔 THÔNG BÁO */}
                    {/* ============================================ */}
                    <Box>
                        {renderSectionHeader("Thông báo chung", Bell)}

                        <VStack space="xs">
                            {/* Nhận thông báo */}
                            {renderSwitchItem(
                                "Nhận thông báo từ Agrisa",
                                notifications.enabled,
                                handleToggleNotifications,
                                Bell
                            )}

                            
                        </VStack>
                    </Box>
                </VStack>
            </ScrollView>

            {/* ✅ Custom Password Modal cho Android */}
            <BiometricPasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onConfirm={(password) => {
                    setShowPasswordModal(false);
                    handleEnableBiometricWithPassword(password);
                }}
                biometricType={biometricType}
            />
        </>
    );
}

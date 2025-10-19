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
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  CloudRain,
  FileText,
  Key,
  Lock,
  ScanFace,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  Sprout
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

/**
 * 🌾 Settings Screen - Màn hình cài đặt Agrisa
 * 
 * Sections:
 * 1. 🔐 BẢO MẬT: Đổi mật khẩu, Face ID, Xác thực danh tính
 * 2. 🔔 THÔNG BÁO: Thời tiết, thửa ruộng, claims...
 * 3. ⚙️ KHÁC: Ngôn ngữ, phiên bản...
 */
export default function SettingsScreen() {
  const { colors } = useAgrisaColors();
  const router = useRouter();
  const { notifications, security, toggleNotification, toggleBiometric } = useSettingsStore();
  
  // ✅ Lấy user từ auth store
  const { user, enableBiometric, disableBiometric } = useAuthStore();
  
  const [biometricType, setBiometricType] = useState<string>("Face ID");
  const [hasBiometric, setHasBiometric] = useState(false);
  const [isBiometricEnabledForAccount, setIsBiometricEnabledForAccount] = useState(false);

  // ============================================
  // 🔍 CHECK BIOMETRIC AVAILABILITY & STATUS
  // ============================================
  useEffect(() => {
    checkBiometricAvailability();
    checkBiometricStatus();
  }, [user]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometric(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("Face ID");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
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
      if (!user) return;
      
      const identifier = user.email || user.phone_number;
      if (!identifier) return;

      const enabled = await secureStorage.isBiometricEnabled(identifier);
      setIsBiometricEnabledForAccount(enabled);
      
      console.log(`✅ [Settings] Biometric status for ${identifier}:`, enabled);
    } catch (error) {
      console.error("❌ [Settings] Error checking biometric status:", error);
    }
  };

  // ============================================
  // 🎯 HANDLERS
  // ============================================
  const handleToggleBiometric = async () => {
    if (!hasBiometric) {
      Alert.alert(
        "Chưa thiết lập",
        `Vui lòng thiết lập ${biometricType} trên thiết bị của bạn trước.`,
        [{ text: "OK" }]
      );
      return;
    }

    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập trước khi bật tính năng này.");
      return;
    }

    if (!isBiometricEnabledForAccount) {
      // ✅ BẬT BIOMETRIC - Yêu cầu nhập password
      Alert.prompt(
        "Kích hoạt " + biometricType,
        "Nhập mật khẩu của bạn để kích hoạt đăng nhập bằng " + biometricType,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xác nhận",
            onPress: async (password: any) => {
              if (!password) {
                Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
                return;
              }

              try {
                // Xác thực biometric trước
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: `Xác thực bằng ${biometricType}`,
                  fallbackLabel: "Hủy",
                });

                if (result.success) {
                  // Enable biometric trong auth store
                  await enableBiometric(password);
                  
                  // Toggle trong settings store
                  toggleBiometric();
                  
                  // Cập nhật UI state
                  setIsBiometricEnabledForAccount(true);
                  
                  Alert.alert("Thành công", `Đã bật xác thực ${biometricType}`);
                } else {
                  Alert.alert("Thất bại", "Xác thực không thành công");
                }
              } catch (error: any) {
                console.error("❌ [Settings] Error enabling biometric:", error);
                Alert.alert(
                  "Lỗi",
                  error.message || "Không thể kích hoạt " + biometricType
                );
              }
            },
          },
        ],
        "secure-text"
      );
    } else {
      // ✅ TẮT BIOMETRIC
      Alert.alert(
        "Tắt " + biometricType,
        `Bạn có chắc muốn tắt đăng nhập bằng ${biometricType}?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Tắt",
            style: "destructive",
            onPress: async () => {
              try {
                // Disable biometric trong auth store
                await disableBiometric();
                
                // Toggle trong settings store
                toggleBiometric();
                
                // Cập nhật UI state
                setIsBiometricEnabledForAccount(false);
                
                Alert.alert("Đã tắt", `${biometricType} đã được tắt`);
              } catch (error) {
                console.error("❌ [Settings] Error disabling biometric:", error);
                Alert.alert("Lỗi", "Không thể tắt " + biometricType);
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
    router.push("/settings/verify-identity");
  };

  // ============================================
  // 🎨 RENDER HELPERS
  // ============================================
  const renderSectionHeader = (title: string, icon: any) => {
    const IconComponent = icon;
    return (
      <HStack space="sm" alignItems="center" mb="$3" mt="$2">
        <IconComponent size={20} color={colors.text} />
        <Text fontSize="$md" fontWeight="$bold" color={colors.text}>
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
      <Pressable onPress={disabled ? undefined : onToggle} disabled={disabled}>
        <HStack
          p="$4"
          bg={colors.card}
          borderRadius="$lg"
          justifyContent="space-between"
          alignItems="center"
          mb="$2"
          opacity={disabled ? 0.5 : 1}
        >
          <HStack space="md" alignItems="center" flex={1}>
            <Box
              bg={colors.surface}
              p="$2"
              borderRadius="$md"
            >
              <IconComponent
                size={20}
                color={colors.textSecondary}
              />
            </Box>
            <Text fontSize="$sm" fontWeight="$medium" color={colors.text} flex={1}>
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
          bg={colors.card}
          borderRadius="$lg"
          justifyContent="space-between"
          alignItems="center"
          mb="$2"
        >
          <HStack space="md" alignItems="center" flex={1}>
            <Box bg={colors.surface} p="$2" borderRadius="$md">
              <IconComponent size={20} color={colors.text} />
            </Box>
            <Text fontSize="$sm" fontWeight="$medium" color={colors.text} flex={1}>
              {label}
            </Text>
          </HStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Pressable>
    );
  };

  // ============================================
  // 🎬 RENDER
  // ============================================
  return (
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
            {renderNavigationItem("Đổi mật khẩu", handleChangePassword, Key)}

            {/* Xác thực sinh trắc học */}
            {renderSwitchItem(
              `Xác thực bằng ${biometricType}`,
              isBiometricEnabledForAccount,
              handleToggleBiometric,
              biometricType === "Face ID" ? ScanFace : Smartphone,
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

        <Divider bg={colors.border} />

        {/* ============================================ */}
        {/* 🔔 THÔNG BÁO */}
        {/* ============================================ */}
        <Box>
          {renderSectionHeader("Thông báo chung", Bell)}

          <VStack space="xs">
            {/* Thông báo thời tiết */}
            {renderSwitchItem(
              "Dự báo thời tiết",
              notifications.weather,
              () => toggleNotification("weather"),
              CloudRain
            )}

            {/* Thông báo tình trạng thửa ruộng */}
            {renderSwitchItem(
              "Tình trạng thửa ruộng",
              notifications.farmStatus,
              () => toggleNotification("farmStatus"),
              Sprout
            )}

            {/* Thông báo yêu cầu bồi thường */}
            {renderSwitchItem(
              "Yêu cầu bồi thường",
              notifications.claims,
              () => toggleNotification("claims"),
              FileText
            )}

            {/* Thông báo hệ thống */}
            {renderSwitchItem(
              "Thông báo hệ thống",
              notifications.system,
              () => toggleNotification("system"),
              SettingsIcon
            )}
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
}

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { AuthUser } from "@/domains/auth/models/auth.models";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { useToast } from "@/domains/shared/hooks/useToast";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import {
  Avatar,
  AvatarFallbackText,
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Divider,
  HStack,
  Pressable,
  Spinner,
  Switch,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  ChevronRight,
  CogIcon,
  Edit3,
  HelpCircle,
  LogOut,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  RefreshCw,
  Shield,
  Smartphone,
  User as UserIcon,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, Share } from "react-native";

/**
 * 🌾 ProfileScreen - Màn hình hồ sơ người dùng Agrisa
 *
 * Features:
 * - Hiển thị thông tin cá nhân đầy đủ
 * - Menu cài đặt (trợ giúp, thông báo, góp ý, theme)
 * - KYC verification status
 * - Đăng xuất / Đổi tài khoản
 * - Auto-refresh data khi focus
 * - Pull-to-refresh
 */
export default function ProfileScreen() {
  const { user: storeUser, logout } = useAuthStore();
  const { toast } = useToast();
  const { colors, isDark } = useAgrisaColors();
  const { toggleTheme } = useThemeStore();
  const { geteKYCStatusQuery } = useEkyc();

  const [user, setUser] = useState<AuthUser | null>(storeUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Fetch eKYC status
  const {
    data: ekycResponse,
    isLoading: isEkycLoading,
    refetch: refetchEkyc,
  } = user?.id
    ? geteKYCStatusQuery(user.id)
    : { data: null, isLoading: false, refetch: () => {} };

  const ekycStatus =
    ekycResponse && "data" in ekycResponse ? ekycResponse.data : null;

  // ============================================
  // 📦 DATA LOADING
  // ============================================

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await secureStorage.getUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("❌ [Profile] Lỗi load user:", error);
      toast.error("Có lỗi khi tải thông tin. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUserData();
      if (user?.id) {
        await refetchEkyc();
      }
      console.log("✅ [Profile] Refresh thành công");
    } catch (error) {
      console.error("❌ [Profile] Lỗi refresh:", error);
      toast.error("Có lỗi khi tải thông tin. Vui lòng thử lại!");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log("👁️ [Profile] Screen focused - Refreshing...");
      const refreshOnFocus = async () => {
        try {
          await loadUserData();
          if (user?.id) {
            await refetchEkyc();
          }
        } catch (error) {
          console.error("❌ [Profile] Lỗi auto-refresh:", error);
        }
      };
      refreshOnFocus();

      return () => {
        console.log("👋 [Profile] Screen unfocused");
      };
    }, [user?.id])
  );

  // ============================================
  // 🎨 UI COMPONENTS
  // ============================================

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending_verification: {
        color: "warning",
        text: "Chờ xác minh",
        icon: AlertCircle,
      },
      verified: {
        color: "success",
        text: "Đã xác minh",
        icon: CheckCircle,
      },
      suspended: {
        color: "error",
        text: "Tạm khóa",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.pending_verification;
    const IconComponent = config.icon;

    return (
      <Badge variant="solid" bg={`$${config.color}500`}>
        <HStack alignItems="center" space="xs">
          <IconComponent size={12} color="white" />
          <BadgeText color="white" fontSize="$xs">
            {config.text}
          </BadgeText>
        </HStack>
      </Badge>
    );
  };

  const getKycButton = () => {
    if (!ekycStatus) {
      return {
        text: "Bắt đầu KYC",
        route: "/settings/verify/id-scan",
        disabled: false,
        icon: Shield,
      };
    }

    if (ekycStatus.is_face_verified && ekycStatus.is_ocr_done) {
      return {
        text: "Đã xác minh KYC",
        route: null,
        disabled: true,
        icon: CheckCircle,
      };
    }

    if (ekycStatus.is_ocr_done && !ekycStatus.is_face_verified) {
      return {
        text: "Tiếp tục xác thực mặt",
        route: "/settings/verify/face-scan",
        disabled: false,
        icon: Shield,
      };
    }

    return {
      text: "Bắt đầu KYC",
      route: "/settings/verify/id-scan",
      disabled: false,
      icon: Shield,
    };
  };

  // ============================================
  // 🔧 ACTIONS
  // ============================================

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("❌ [Profile] Lỗi logout:", error);
      toast.error("Có lỗi khi đăng xuất. Vui lòng thử lại!");
    }
  };

  

  const handleHelpCenter = () => {
    router.push("/settings/help-center");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleFeedback = async () => {
    try {
      const result = await Share.share({
        message: `Xin chào đội ngũ Agrisa,\n\nTôi muốn chia sẻ góp ý về ứng dụng:\n\n[Viết góp ý của bạn tại đây]\n\nThông tin tài khoản:\n- Email: ${user?.email}\n- ID: ${user?.id}\n\nCảm ơn!`,
        title: "Góp ý cho Agrisa",
      });

      if (result.action === Share.sharedAction) {
        console.log("✅ [Profile] Đã share feedback");
      }
    } catch (error) {
      console.error("❌ [Profile] Lỗi share:", error);
      toast.error("Có lỗi khi chia sẻ góp ý");
    }
  };

  const handleAbout = () => {
    router.push("/settings/about");
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // ============================================
  // 🎬 RENDER
  // ============================================

  if (isLoading && !user) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg={colors.background}
      >
        <VStack alignItems="center" space="md">
          <Spinner size="large" color={colors.text} />
          <Text color={colors.textSecondary}>
            Đang tải thông tin profile...
          </Text>
        </VStack>
      </Box>
    );
  }

  

  const kycButton = getKycButton();
  const IconComponent = kycButton.icon;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.success]}
          tintColor={colors.success}
        />
      }
    >
      <VStack bg={colors.background} flex={1}>
        <VStack space="lg" p="$4" pb="$8">
          {/* ============================================ */}
          {/* 👤 HEADER: Avatar + Info + Actions */}
          {/* ============================================ */}
          <Box
            bg={colors.card}
            p="$6"
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.border}
          >
            <VStack alignItems="center" space="md">
              {/* Avatar */}
              <Avatar size="xl" bg={colors.text}>
                <AvatarFallbackText color="white" fontSize="$2xl">
                  {user?.email.charAt(0).toUpperCase()}
                </AvatarFallbackText>
              </Avatar>

              {/* User Info */}
              <VStack alignItems="center" space="xs">
                <Text fontSize="$xl" fontWeight="$bold" color={colors.text}>
                  {user?.email.split("@")[0]}
                </Text>
                {renderStatusBadge(user?.status)}
              </VStack>

              {/* Actions: KYC + Edit */}
              <HStack space="sm" w="100%">
                <Button
                  flex={1}
                  variant={kycButton.disabled ? "solid" : "outline"}
                  size="sm"
                  bg={kycButton.disabled ? colors.success : "transparent"}
                  borderColor={
                    kycButton.disabled ? "transparent" : colors.border
                  }
                  isDisabled={kycButton.disabled}
                  onPress={() => {
                    if (kycButton.route) {
                      router.push(kycButton.route as any);
                    }
                  }}
                >
                  <HStack alignItems="center" space="xs">
                    <IconComponent
                      size={16}
                      color={kycButton.disabled ? "white" : colors.text}
                    />
                    <ButtonText
                      color={kycButton.disabled ? "white" : colors.text}
                      fontSize="$sm"
                    >
                      {kycButton.text}
                    </ButtonText>
                  </HStack>
                </Button>

                <Button
                  flex={1}
                  variant="outline"
                  size="sm"
                  borderColor={colors.border}
                  onPress={() => router.push("/settings/profile/edit")}
                >
                  <HStack alignItems="center" space="xs">
                    <Edit3 size={16} color={colors.text} />
                    <ButtonText color={colors.text} fontSize="$sm">
                      Chỉnh sửa
                    </ButtonText>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* ============================================ */}
          {/* 📞 THÔNG TIN CÁ NHÂN */}
          {/* ============================================ */}
          <VStack space="sm">
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.text}
              ml="$1"
            >
              Thông tin cá nhân
            </Text>

            <Box
              bg={colors.card}
              p="$4"
              borderRadius="$lg"
              borderWidth={1}
              borderColor={colors.border}
            >
              <VStack space="md">
                {/* Email */}
                <HStack alignItems="center" space="md">
                  <Box p="$2" borderRadius="$md">
                    <Mail size={20} color={colors.text} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.textSecondary}>
                      Email
                    </Text>
                    <Text
                      fontWeight="$medium"
                      color={colors.text}
                      fontSize="$sm"
                    >
                      {user?.email}
                    </Text>
                  </VStack>
                </HStack>

                <Divider bg={colors.border} />

                {/* Phone */}
                <HStack alignItems="center" space="md">
                  <Box p="$2" borderRadius="$md">
                    <Phone size={20} color={colors.text} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.textSecondary}>
                      Số điện thoại
                    </Text>
                    <Text
                      fontWeight="$medium"
                      color={colors.text}
                      fontSize="$sm"
                    >
                      {user?.phone_number || "Chưa cập nhật"}
                    </Text>
                  </VStack>
                  {!user?.phone_verified && (
                    <Badge variant="solid" bg="$warning500">
                      <BadgeText color="white" fontSize="$xs">
                        Chưa xác minh
                      </BadgeText>
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </Box>
          </VStack>

          {/* ============================================ */}
          {/* ⚙️ CÀI ĐẶT (Giống format thông tin cá nhân) */}
          {/* ============================================ */}
          <VStack space="sm">
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.text}
              ml="$1"
            >
              Cài đặt
            </Text>

            <Box
              bg={colors.card}
              p="$4"
              borderRadius="$lg"
              borderWidth={1}
              borderColor={colors.border}
            >
              <VStack space="md">
                {/* 🛟 Trung tâm trợ giúp */}

                {/* 🔔 Cài đặt thông báo */}
                <Pressable onPress={handleSettings}>
                  <HStack alignItems="center" space="md">
                    <Box p="$2" borderRadius="$md">
                      <CogIcon size={20} color={colors.text} />
                    </Box>
                    <Text
                      flex={1}
                      fontWeight="$medium"
                      color={colors.text}
                      fontSize="$sm"
                    >
                      Cài đặt chung
                    </Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </HStack>
                </Pressable>

                <Divider bg={colors.border} />

                {/* 📱 Thông tin chung */}
                <Pressable onPress={handleAbout}>
                  <HStack alignItems="center" space="md">
                    <Box p="$2" borderRadius="$md">
                      <Smartphone size={20} color={colors.text} />
                    </Box>
                    <Text
                      flex={1}
                      fontWeight="$medium"
                      color={colors.text}
                      fontSize="$sm"
                    >
                      Thông tin chung
                    </Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </HStack>
                </Pressable>

                <Divider bg={colors.border} />

                {/* 🎨 Đổi hình nền */}
                <HStack alignItems="center" space="md">
                  <Box p="$2" borderRadius="$md">
                    <Palette size={20} color={colors.text} />
                  </Box>
                  <Text
                    flex={1}
                    fontWeight="$medium"
                    color={colors.text}
                    fontSize="$sm"
                  >
                    Đổi màu nền
                  </Text>
                  <Switch
                    value={isDark}
                    onValueChange={handleThemeToggle}
                    size="sm"
                  />
                </HStack>
                <Divider bg={colors.border} />

                <Pressable onPress={handleHelpCenter}>
                  <HStack alignItems="center" space="md">
                    <Box p="$2" borderRadius="$md">
                      <HelpCircle size={20} color={colors.text} />
                    </Box>
                    <Text
                      flex={1}
                      fontWeight="$medium"
                      color={colors.text}
                      fontSize="$sm"
                    >
                      Trung tâm trợ giúp
                    </Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </HStack>
                </Pressable>

                <Divider bg={colors.border} />

                {/* 📱 Thông tin chung */}
                <Pressable onPress={handleFeedback}>
                  <HStack alignItems="center" space="md">
                    <Box p="$2" borderRadius="$md">
                      <MessageCircle size={20} color={colors.text} />
                    </Box>
                    <Text
                      flex={1}
                      fontWeight="$medium"
                      color={colors.text}
                      fontSize="$sm"
                    >
                      Đóng góp ý kiến
                    </Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </HStack>
                </Pressable>
              </VStack>
            </Box>
          </VStack>

          {/* ============================================ */}
          {/* 🚪 ĐĂNG XUẤT / ĐỔI TÀI KHOẢN */}
          {/* ============================================ */}
          <VStack space="xs">
            <HStack space="sm">
              <Button
                flex={1}
                bg={colors.error}
                variant="outline"
                borderColor={colors.error}
                onPress={handleLogout}
              >
                <HStack alignItems="center" space="xs">
                  <LogOut size={18} color={colors.textWhiteButton} />
                  <ButtonText color={colors.textWhiteButton} fontSize="$sm">
                    Đăng xuất
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </VStack>

          {/* ============================================ */}
          {/* 🐛 DEBUG INFO (chỉ hiện ở dev mode) */}
          {/* ============================================ */}
          {__DEV__ && (
            <Box bg="$coolGray100" p="$3" borderRadius="$md">
              <Text fontSize="$xs" color="$coolGray600" fontFamily="$mono">
                🐛 Debug Info
                {"\n"}• User ID: {user?.id}
                {"\n"}• Status: {user?.status}
                {"\n"}• KYC Verified: {user?.kyc_verified ? "✅" : "❌"}
                {"\n"}• Phone Verified: {user?.phone_verified ? "✅" : "❌"}
                {"\n"}• OCR Done: {ekycStatus?.is_ocr_done ? "✅" : "❌"}
                {"\n"}• Face Verified:{" "}
                {ekycStatus?.is_face_verified ? "✅" : "❌"}
                {"\n"}• CIC No: {ekycStatus?.cic_no || "N/A"}
                {"\n"}• Theme: {isDark ? "Dark 🌙" : "Light ☀️"}
              </Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
}

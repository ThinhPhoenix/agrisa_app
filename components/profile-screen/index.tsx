import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { AuthUser } from "@/domains/auth/models/auth.models";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { useToast } from "@/domains/shared/hooks/useToast";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import {
  Box,
  Heading,
  Pressable,
  Spinner,
  Switch,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { CheckCircle, LogOut, Shield } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, Share, View } from "react-native";

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
  const { isDark } = useAgrisaColors();
  const { toggleTheme } = useThemeStore();
  const { geteKYCStatusQuery } = useEkyc();

  const [user, setUser] = useState<AuthUser | null>(storeUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(storeUser?.id || null);

  // ✅ Fetch eKYC status
  const { data: ekycResponse, refetch: refetchEkyc } = user?.id
    ? geteKYCStatusQuery(user.id)
    : { data: null, refetch: () => {} };

  const ekycStatus =
    ekycResponse && "data" in ekycResponse ? ekycResponse.data : null;

  // ============================================
  // 📦 DATA LOADING
  // ============================================

  const loadUserData = useCallback(async () => {
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
  }, [toast]);

  // Refs for stable function references
  const loadUserDataRef = useRef(loadUserData);
  const refetchEkycRef = useRef(refetchEkyc);
  const userRef = useRef(user);

  // Update refs when dependencies change
  loadUserDataRef.current = loadUserData;
  refetchEkycRef.current = refetchEkyc;
  userRef.current = user;

  const handleRefresh = async () => {
    if (isRefreshingRef.current) {
      console.log("⏭️ [Profile] Refresh already in progress, skipping...");
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await loadUserDataRef.current();
      if (userRef.current?.id) {
        await refetchEkycRef.current();
      }
      console.log("✅ [Profile] Refresh thành công");
    } catch (error) {
      console.error("❌ [Profile] Lỗi refresh:", error);
      toast.error("Có lỗi khi tải thông tin. Vui lòng thử lại!");
    } finally {
      setIsRefreshing(false);
      isRefreshingRef.current = false;
    }
  };

  // Auto-refresh khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log("👁️ [Profile] Screen focused - Refreshing...");
      const refreshOnFocus = async () => {
        const currentUser = userRef.current;
        // Only refresh if user ID changed or this is the first time
        if (
          lastUserIdRef.current === currentUser?.id &&
          lastUserIdRef.current !== null
        ) {
          console.log("⏭️ [Profile] User ID unchanged, skipping refresh...");
          return;
        }

        if (isRefreshingRef.current) {
          console.log("⏭️ [Profile] Refresh already in progress, skipping...");
          return;
        }

        lastUserIdRef.current = currentUser?.id || null;
        isRefreshingRef.current = true;
        try {
          await loadUserDataRef.current();
          if (currentUser?.id) {
            await refetchEkycRef.current();
          }
        } catch (error) {
          console.error("❌ [Profile] Lỗi auto-refresh:", error);
        } finally {
          isRefreshingRef.current = false;
        }
      };
      refreshOnFocus();

      return () => {
        console.log("👋 [Profile] Screen unfocused");
      };
    }, []) // Empty dependency array to prevent re-running
  );

  // ============================================
  // 🎨 UI COMPONENTS
  // ============================================

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
      <VStack
        className="flex-1 bg-white"
        justifyContent="center"
        alignItems="center"
      >
        <VStack alignItems="center" space="md">
          <Spinner size="large" />
          <Text>Đang tải thông tin profile...</Text>
        </VStack>
      </VStack>
    );
  }

  const kycButton = getKycButton();

  return (
    <VStack className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#59AC77"]}
            tintColor="#59AC77"
          />
        }
      >
        <VStack space="lg" p="$4" pb="$8">
          {/* ============================================ */}
          {/* 👤 HEADER: Avatar + Info + Actions */}
          {/* ============================================ */}
          <View className="bg-white p-4 rounded-xl border border-gray-300 relative">
            <View className="flex-row gap-1 absolute top-2 right-2 z-10 bg-green-200 border border-green-500 px-1 py-0.5 rounded-md">
              <Text className="text-green-600 font-semibold text-xs capitalize">
                {user?.status || "active"}
              </Text>
            </View>
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-gray-300 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-white">
                  {user?.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-black font-bold text-xl mb-2">
                {user?.email.split("@")[0]}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  if (kycButton.route) {
                    router.push(kycButton.route as any);
                  }
                }}
                disabled={kycButton.disabled}
                className={`flex-1 p-3 rounded-lg border ${kycButton.disabled ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}`}
              >
                <Text
                  className={`text-center font-semibold ${kycButton.disabled ? "text-white" : "text-black"}`}
                >
                  {kycButton.text}
                </Text>
              </Pressable>
              <Link
                href={`/edit-profile`}
                className="flex-1 p-3 rounded-lg border border-gray-300 bg-white"
              >
                <Text className="text-center font-semibold text-black">
                  Chỉnh sửa
                </Text>
              </Link>
            </View>
          </View>

          {/* ============================================ */}
          {/* 📞 THÔNG TIN CÁ NHÂN */}
          {/* ============================================ */}
          <View className="bg-white p-4 rounded-xl border border-gray-300 mb-4">
            <Heading className="text-black text-lg mb-4">
              Thông tin cá nhân
            </Heading>

            <View className="mb-3">
              <Text className="text-gray-600 text-sm">Email</Text>
              <Text className="text-black font-medium">{user?.email}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-600 text-sm">Số điện thoại</Text>
              <Text className="text-black font-medium">
                {user?.phone_number || "Chưa cập nhật"}
              </Text>
            </View>
          </View>

          {/* ============================================ */}
          {/* ⚙️ CÀI ĐẶT */}
          {/* ============================================ */}
          <View className="bg-white p-4 rounded-xl border border-gray-300 mb-4">
            <Heading className="text-black text-lg mb-4">Cài đặt</Heading>

            <Pressable
              onPress={handleSettings}
              className="flex-row items-center py-3"
            >
              <Text className="text-black font-medium flex-1">
                Cài đặt chung
              </Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>

            <View className="h-px bg-gray-200 my-2" />

            <Pressable
              onPress={handleAbout}
              className="flex-row items-center py-3"
            >
              <Text className="text-black font-medium flex-1">
                Thông tin chung
              </Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>

            {/* <View className="h-px bg-gray-200 my-2" /> */}

            {/* <View className="flex-row items-center justify-between py-3">
              <Text className="text-black font-medium">Đổi màu nền</Text>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                size="sm"
              />
            </View> */}

            <View className="h-px bg-gray-200 my-2" />

            <Pressable
              onPress={handleHelpCenter}
              className="flex-row items-center py-3"
            >
              <Text className="text-black font-medium flex-1">
                Trung tâm trợ giúp
              </Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>

            <View className="h-px bg-gray-200 my-2" />

            <Pressable
              onPress={handleFeedback}
              className="flex-row items-center py-3"
            >
              <Text className="text-black font-medium flex-1">
                Đóng góp ý kiến
              </Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>

          {/* ============================================ */}
          {/* 🚪 ĐĂNG XUẤT */}
          {/* ============================================ */}
          <Pressable
            onPress={handleLogout}
            className="bg-white p-4 rounded-xl border border-gray-300"
          >
            <View className="flex-row items-center justify-center">
              <LogOut size={20} color="#dc2626" />
              <Text className="text-red-600 font-semibold ml-2">Đăng xuất</Text>
            </View>
          </Pressable>

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
      </ScrollView>
    </VStack>
  );
}

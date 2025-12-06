import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { AuthUser, UserProfile } from "@/domains/auth/models/auth.models";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { useToast } from "@/domains/shared/hooks/useToast";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import {
  Box,
  Heading,
  HStack,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  BadgeAlert,
  BadgeCheck,
  BadgeX,
  CheckCircle,
  LogOut,
  Shield,
  User,
  UserCircle,
} from "lucide-react-native";
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
  const {
    user: storeUser,
    userProfile: storeUserProfile,
    logout,
    fetchUserProfile,
  } = useAuthStore();
  const { toast } = useToast();
  const { colors, isDark } = useAgrisaColors();
  const { toggleTheme } = useThemeStore();
  const { geteKYCStatusQuery } = useEkyc();

  const [user, setUser] = useState<AuthUser | null>(storeUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    storeUserProfile
  );
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
      const [userData, profileData] = await Promise.all([
        secureStorage.getUser(),
        secureStorage.getUserProfile(),
      ]);

      if (userData) {
        setUser(userData);
      }

      if (profileData) {
        setUserProfile(profileData);
      } else if (userData) {
        // Nếu chưa có profile, thử fetch từ /me
        try {
          await fetchUserProfile();
          const newProfile = await secureStorage.getUserProfile();
          if (newProfile) {
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.log(
            "⚠️ [Profile] Không thể tải profile chi tiết, dùng dữ liệu cơ bản"
          );
        }
      }
    } catch (error) {
      console.error("❌ [Profile] Lỗi load user:", error);
      toast.error("Có lỗi khi tải thông tin. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchUserProfile]);

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
        text: "Bắt đầu xác thực",
        route: "/settings/verify/id-scan",
        disabled: false,
        icon: BadgeX,
      };
    }

    if (ekycStatus.is_face_verified && ekycStatus.is_ocr_done) {
      return {
        text: "Đã xác thực",
        route: null,
        disabled: true,
        icon: BadgeCheck,
      };
    }

    if (ekycStatus.is_ocr_done && !ekycStatus.is_face_verified) {
      return {
        text: "Tiếp tục xác thực",
        route: "/settings/verify/face-scan",
        disabled: false,
        icon: BadgeAlert,
      };
    }

    return {
      text: "Bắt đầu xác thực",
      route: "/settings/verify/id-scan",
      disabled: false,
      icon: BadgeX,
    };
  };

  // ============================================
  // 🔧 ACTIONS
  // ============================================

    const capitalizeName = (name: string | null | undefined) => {
      if (!name) return null;
      return name
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  };
  
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
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            {/* Avatar & Name */}
            <VStack space="md" alignItems="center">
              {/* Avatar với gradient */}
              <Box position="relative">
                <Box
                  w={88}
                  h={88}
                  borderRadius="$full"
                  bg={colors.primary}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={3}
                  borderColor={colors.background}
                  shadowColor={colors.shadow}
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.2}
                  shadowRadius={8}
                  elevation={6}
                >
                  <UserCircle
                    size={44}
                    color={colors.primary_white_text}
                    strokeWidth={2}
                  />
                </Box>
              </Box>

              {/* User Name */}
              <VStack space="xs" alignItems="center">
                <HStack space="sm" alignItems="center">
                  <Text
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {/* ✅ ƯU TIÊN: display_name/full_name từ UserProfile */}
                    {capitalizeName(userProfile?.display_name) ||
                      capitalizeName(userProfile?.full_name) ||
                      capitalizeName(user?.email?.split("@")[0]) ||
                      "Người dùng"}
                  </Text>                  
                </HStack>
              </VStack>
            </VStack>

            {/* Action Buttons */}
            <HStack space="sm" mt="$4">
              <Pressable
                onPress={() => {
                  if (kycButton.route) {
                    router.push(kycButton.route as any);
                  }
                }}
                disabled={kycButton.disabled}
                style={{ flex: 1 }}
              >
                <Box
                  bg={kycButton.disabled ? colors.success : colors.background}
                  borderRadius="$xl"
                  py="$3"
                  px="$4"
                  borderWidth={1}
                  borderColor={
                    kycButton.disabled ? colors.success : colors.frame_border
                  }
                  opacity={kycButton.disabled ? 1 : 1}
                >
                  <HStack
                    space="sm"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {kycButton.disabled ? (
                      <CheckCircle
                        size={18}
                        color={colors.primary_white_text}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Shield
                        size={18}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                    )}
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={
                        kycButton.disabled
                          ? colors.primary_white_text
                          : colors.primary
                      }
                    >
                      {kycButton.text}
                    </Text>
                  </HStack>
                </Box>
              </Pressable>

              <Pressable
                onPress={() => router.push("/settings/profile")}
                style={{ flex: 1 }}
              >
                <Box
                  bg={colors.background}
                  borderRadius="$xl"
                  py="$3"
                  px="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <HStack
                    space="sm"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <User
                      size={18}
                      color={colors.secondary_text}
                      strokeWidth={2.5}
                    />
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.secondary_text}
                    >
                      Trang cá nhân
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            </HStack>
          </Box>

          {/* ============================================ */}
          {/* ⚙️ CÀI ĐẶT */}
          {/* ============================================ */}
          <View
            className={`bg-[#f8f9fa] p-4 rounded-xl border border-gray-300 mb-4`}
          >
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
                Về chúng tôi
              </Text>
              <Text className="text-gray-400">›</Text>
            </Pressable>

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
                {"\n"}• User ID: {userProfile?.user_id || user?.id}
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

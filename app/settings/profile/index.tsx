/**
 * ============================================
 * 👤 PROFILE DETAIL SCREEN
 * ============================================
 * Màn hình hiển thị thông tin cá nhân chi tiết
 * - Fetch data từ useAuthMe
 * - Hiển thị thông tin cá nhân, eKYC, ngân hàng
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { useBank } from "@/domains/shared/hooks/use-bank";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
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
  Calendar,
  Edit,
  IdCard,
  Shield,
  User,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl } from "react-native";

export default function ProfileDetailScreen() {
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const { geteKYCStatusQuery } = useEkyc();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch profile từ useAuthMe
  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useAuthMe();

  // Bank hook để lấy tên ngân hàng
  const { getBankShortName } = useBank();

  // Fetch eKYC status
  const { data: ekycResponse, refetch: refetchEkyc } = user?.id
    ? geteKYCStatusQuery(user.id)
    : { data: null, refetch: () => {} };

  const ekycStatus =
    ekycResponse && "data" in ekycResponse ? ekycResponse.data : null;

  // Profile data từ API
  const profile = (profileData as any)?.data || profileData || null;

  // Auto fetch profile on mount
  useEffect(() => {
    refetchProfile();
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        user?.id ? refetchEkyc() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("❌ [Profile Detail] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, refetchEkyc, refetchProfile]);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      if (user?.id) {
        refetchEkyc();
      }
    }, [user?.id, refetchEkyc, refetchProfile])
  );

  // Loading state
  if (isProfileLoading && !profile) {
    return (
      <VStack
        flex={1}
        bg={colors.background}
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="large" color={colors.primary} />
        <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
          Đang tải thông tin...
        </Text>
      </VStack>
    );
  }

  // Verification status helper
  const getVerificationStatus = () => {
    if (!ekycStatus) {
      return {
        icon: XCircle,
        text: "Chưa xác thực",
        color: colors.error,
        bgColor: colors.errorSoft,
      };
    }

    if (ekycStatus.is_face_verified && ekycStatus.is_ocr_done) {
      return {
        icon: BadgeCheck,
        text: "Đã xác thực",
        color: colors.success,
        bgColor: colors.successSoft,
      };
    }

    if (ekycStatus.is_ocr_done) {
      return {
        icon: BadgeAlert,
        text: "Đang xác thực",
        color: colors.warning,
        bgColor: colors.warningSoft,
      };
    }

    return {
      icon: BadgeX,
      text: "Chưa xác thực",
      color: colors.error,
      bgColor: colors.errorSoft,
    };
  };

  const verificationStatus = getVerificationStatus();

  // Helper để format địa chỉ đầy đủ
  const getFullAddress = () => {
    const parts = [
      profile?.current_address,
      profile?.ward_name,
      profile?.district_name,
      profile?.province_name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  // Helper để format ngày sinh
  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Helper để format giới tính
  const formatGender = (gender: string) => {
    if (gender === "M") return "Nam";
    if (gender === "F") return "Nữ";
    return gender || null;
  };

  // Helper để capitalize tên (viết hoa chữ cái đầu mỗi từ)
  const capitalizeName = (name: string | null | undefined) => {
    if (!name) return null;
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Reusable Info Row Component (không có icon)
  const InfoRow = ({
    label,
    value,
    showStatus = false,
    isVerified = false,
  }: {
    label: string;
    value: string | null;
    showStatus?: boolean;
    isVerified?: boolean;
  }) => (
    <HStack space="md" alignItems="center" p="$4">
      <VStack flex={1}>
        <Text fontSize="$xs" color={colors.muted_text}>
          {label}
        </Text>
        <Text
          fontSize="$sm"
          fontWeight="$semibold"
          color={value ? colors.primary_text : colors.muted_text}
        >
          {value || "Chưa cập nhật"}
        </Text>
      </VStack>
      {showStatus && (
        <Box
          w={10}
          h={10}
          borderRadius="$full"
          bg={isVerified ? colors.success : colors.muted_text}
        />
      )}
    </HStack>
  );

  // Divider Component
  const Divider = () => (
    <Box height={1} bg={colors.frame_border} width="100%" />
  );

  return (
    <ScrollView
      flex={1}
      bg={colors.background}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <VStack space="lg" p="$5" pb="$8">
        {/* Profile Header */}
        <VStack space="md" alignItems="center" pt="$2">
          <Box
            w={100}
            h={100}
            borderRadius="$full"
            bg={colors.primary}
            alignItems="center"
            justifyContent="center"
            borderWidth={4}
            borderColor={colors.background}
            shadowColor={colors.shadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={8}
            elevation={4}
          >
            <User size={50} color={colors.primary_white_text} strokeWidth={2} />
          </Box>

          <VStack space="xs" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Text
                fontSize="$xl"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {capitalizeName(profile?.full_name) || capitalizeName(profile?.display_name) || "Chưa cập nhật"}
              </Text>
              <verificationStatus.icon
                size={18}
                color={verificationStatus.color}
              />
            </HStack>
            <Text fontSize="$sm" color={colors.secondary_text}>
              {user?.email || profile?.email || ""}
            </Text>
          </VStack>

          {/* Edit Profile Button */}
          <Pressable onPress={() => router.push("/edit-profile")}>
            <Box bg={colors.primary} borderRadius="$xl" py="$3" px="$6" mt="$2">
              <HStack space="sm" alignItems="center" justifyContent="center">
                <Edit
                  size={18}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  Chỉnh sửa thông tin
                </Text>
              </HStack>
            </Box>
          </Pressable>
        </VStack>

        {/* Personal Information Section */}
        <VStack space="md">
          <HStack space="sm" alignItems="center">
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Thông tin cá nhân
            </Text>
          </HStack>

          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
          >
            <VStack>
              <InfoRow
                label="Họ và tên"
                value={capitalizeName(profile?.full_name)}
              />
              <Divider />
              <InfoRow
                label="Tên hiển thị"
                value={capitalizeName(profile?.display_name)}
              />
              <Divider />
              <InfoRow
                label="Ngày sinh"
                value={formatDateOfBirth(profile?.date_of_birth)}
              />
              <Divider />
              <InfoRow
                label="Giới tính"
                value={formatGender(profile?.gender)}
              />
              <Divider />
              <InfoRow
                label="Email"
                value={profile?.email || user?.email}
                showStatus
                isVerified={true}
              />
              <Divider />
              <InfoRow
                label="Số điện thoại chính"
                value={profile?.primary_phone || user?.phone_number}
                showStatus
                isVerified={user?.phone_verified}
              />
              <Divider />
              <InfoRow
                label="Số điện thoại phụ"
                value={profile?.alternate_phone}
              />
              <Divider />
              <InfoRow
                label="Địa chỉ hiện tại"
                value={getFullAddress()}
              />
              <Divider />
              <InfoRow
                label="Địa chỉ thường trú"
                value={profile?.permanent_address}
              />
            </VStack>
          </Box>
        </VStack>

        {/* Bank Information Section */}
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
            Thông tin ngân hàng
          </Text>

          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
          >
            <VStack>
              <InfoRow
                label="Ngân hàng"
                value={
                  profile?.bank_code
                    ? getBankShortName(profile.bank_code)
                    : null
                }
              />
              <Divider />
              <InfoRow
                label="Số tài khoản"
                value={profile?.account_number}
              />
              <Divider />
              <InfoRow
                label="Tên chủ tài khoản"
                value={capitalizeName(profile?.account_name)}
              />
            </VStack>
          </Box>
        </VStack>

        {/* eKYC Information Section */}
        {ekycStatus && (
          <VStack space="md">
            <Text
              fontSize="$lg"
              fontWeight="$bold"
              color={colors.primary_text}
            >
              Xác thực danh tính
            </Text>

            <Box
              bg={colors.card_surface}
              borderRadius="$2xl"
              borderWidth={1}
              borderColor={colors.frame_border}
              overflow="hidden"
            >
              <VStack>
                {/* CCCD Status */}
                <HStack space="md" alignItems="center" p="$4">
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Căn cước công dân
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {ekycStatus.cic_no || "Chưa cập nhật"}
                    </Text>
                  </VStack>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="$full"
                    bg={ekycStatus.is_ocr_done ? colors.success : colors.error}
                  />
                </HStack>

                <Divider />

                {/* Face Verification Status */}
                <HStack space="md" alignItems="center" p="$4">
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Xác thực khuôn mặt
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {ekycStatus.is_face_verified
                        ? "Đã xác thực"
                        : "Chưa xác thực"}
                    </Text>
                  </VStack>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="$full"
                    bg={
                      ekycStatus.is_face_verified
                        ? colors.success
                        : colors.error
                    }
                  />
                </HStack>

                {/* Timestamps */}
                {(ekycStatus.ocr_done_at || ekycStatus.face_verified_at) && (
                  <>
                    <Divider />
                    <Box p="$4">
                      <VStack space="xs">
                        <Text
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.secondary_text}
                          mb="$2"
                        >
                          Thời gian xác thực
                        </Text>
                        {ekycStatus.ocr_done_at && (
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            • CCCD:{" "}
                            {new Date(ekycStatus.ocr_done_at).toLocaleString(
                              "vi-VN"
                            )}
                          </Text>
                        )}
                        {ekycStatus.face_verified_at && (
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            • Khuôn mặt:{" "}
                            {new Date(
                              ekycStatus.face_verified_at
                            ).toLocaleString("vi-VN")}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </Box>
          </VStack>
        )}

        {/* Account Information Section */}
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
            Thông tin tài khoản
          </Text>

          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            overflow="hidden"
          >
            <VStack p="$4" space="sm">
              <HStack justifyContent="space-between">
                <Text fontSize="$sm" color={colors.muted_text}>
                  Trạng thái
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.success}
                >
                  Đang hoạt động
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" my="$1" />

              <HStack justifyContent="space-between">
                <Text fontSize="$sm" color={colors.muted_text}>
                  Loại tài khoản
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  Nông dân
                </Text>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" my="$1" />

              <HStack justifyContent="space-between">
                <Text fontSize="$sm" color={colors.muted_text}>
                  Ngày tạo
                </Text>
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("vi-VN")
                    : "Không xác định"}
                </Text>
              </HStack>

              {profile?.updated_at && (
                <>
                  <Box
                    height={1}
                    bg={colors.frame_border}
                    width="100%"
                    my="$1"
                  />
                  <HStack justifyContent="space-between">
                    <Text fontSize="$sm" color={colors.muted_text}>
                      Cập nhật lần cuối
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {new Date(profile.updated_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </HStack>
                </>
              )}
            </VStack>
          </Box>
        </VStack>

        {/* Footer Note */}
        <Box alignItems="center" mt="$2">
          <Text fontSize="$xs" color={colors.muted_text} textAlign="center">
            Thông tin được bảo mật và chỉ sử dụng cho mục đích bảo hiểm
          </Text>
        </Box>
      </VStack>
    </ScrollView>
  );
}

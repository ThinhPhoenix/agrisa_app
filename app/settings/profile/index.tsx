/**
 * ============================================
 * 👤 PROFILE DETAIL SCREEN
 * ============================================
 * Màn hình hiển thị thông tin cá nhân chi tiết
 * - Fetch data từ useAuthMe
 * - Hiển thị thông tin cá nhân, eKYC, ngân hàng
 */

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { useBank } from "@/domains/shared/hooks/use-bank";
import { Utils } from "@/libs/utils/utils";
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
  Edit,
  User,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl } from "react-native";

export default function ProfileDetailScreen() {
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const { geteKYCStatusQuery, getCardInfo } = useEkyc();
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

  // Fetch card info từ eKYC
  const { data: cardInfoResponse, refetch: refetchCardInfo } = getCardInfo();
  const cardInfo = (cardInfoResponse as any)?.data || cardInfoResponse || null;

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
        refetchCardInfo(),
      ]);
    } catch (error) {
      console.error("❌ [Profile Detail] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, refetchEkyc, refetchProfile, refetchCardInfo]);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchCardInfo();
      if (user?.id) {
        refetchEkyc();
      }
    }, [user?.id, refetchEkyc, refetchProfile, refetchCardInfo])
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

  // Reusable Info Row Component - Value bên phải
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
    <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
      <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
        {label}
      </Text>
      <HStack space="sm" alignItems="center" flex={1} justifyContent="flex-end" ml="$4">
        <Text
          fontSize="$sm"
          fontWeight="$semibold"
          color={value ? colors.primary_text : colors.muted_text}
          textAlign="right"
        >
          {value || "Chưa cập nhật"}
        </Text>
        {showStatus && (
          <Box
            w={10}
            h={10}
            borderRadius="$full"
            bg={isVerified ? colors.success : colors.muted_text}
          />
        )}
      </HStack>
    </HStack>
  );

  // Status Badge Component - sử dụng Utils.getBadgeConfig
  const StatusBadge = ({
    text,
    variant,
  }: {
    text: string;
    variant: "success" | "error" | "warning" | "info" | "default";
  }) => {
    const badgeConfig = Utils.getBadgeConfig(variant, colors);
    return (
      <Box
        bg={badgeConfig.backgroundColor}
        borderRadius="$full"
        px="$3"
        py="$1"
      >
        <Text
          fontSize="$xs"
          fontWeight="$semibold"
          color={badgeConfig.textColor}
        >
          {text}
        </Text>
      </Box>
    );
  };

  // Divider Component
  const Divider = () => (
    <Box height={1} bg={colors.frame_border} width="100%" />
  );

  return (
    <>
      <AgrisaHeader title="Thông tin cá nhân" showBackButton={true} />
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
              <User
                size={50}
                color={colors.primary_white_text}
                strokeWidth={2}
              />
            </Box>

            <VStack space="xs" alignItems="center">
              <HStack space="sm" alignItems="center">
                <Text
                  fontSize="$xl"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  {capitalizeName(profile?.full_name) ||
                    capitalizeName(profile?.display_name) ||
                    "Chưa cập nhật"}
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
              <Box
                bg={colors.primary}
                borderRadius="$xl"
                py="$3"
                px="$6"
                mt="$2"
              >
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
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Thông tin cơ bản
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
                  label="Tên hiển thị Agrisa"
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
                <InfoRow label="Địa chỉ hiện tại" value={getFullAddress()} />
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
                <InfoRow label="Số tài khoản" value={profile?.account_number} />
                <Divider />
                <InfoRow
                  label="Tên chủ tài khoản"
                  value={capitalizeName(profile?.account_name)}
                />
              </VStack>
            </Box>
          </VStack>

          {/* Thông tin định danh Section */}
          {(ekycStatus || cardInfo) && (
            <VStack space="md">
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Thông tin định danh
              </Text>

              <Box
                bg={colors.card_surface}
                borderRadius="$2xl"
                borderWidth={1}
                borderColor={colors.frame_border}
                overflow="hidden"
              >
                <VStack>
                  {/* Số CCCD */}
                  <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Số CCCD
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="right"
                      flex={1}
                      ml="$4"
                    >
                      {ekycStatus?.cic_no || cardInfo?.national_id || "Chưa cập nhật"}
                    </Text>
                  </HStack>

                  <Divider />

                  {/* Họ và tên trên CCCD */}
                  <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Họ và tên
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="right"
                      flex={1}
                      ml="$4"
                    >
                      {capitalizeName(cardInfo?.name) || capitalizeName(profile?.full_name) || "Chưa cập nhật"}
                    </Text>
                  </HStack>

                  <Divider />

                  {/* Ngày sinh */}
                  <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Ngày sinh
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="right"
                      flex={1}
                      ml="$4"
                    >
                      {cardInfo?.dob || formatDateOfBirth(profile?.date_of_birth) || "Chưa cập nhật"}
                    </Text>
                  </HStack>

                  <Divider />

                  {/* Giới tính */}
                  <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Giới tính
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="right"
                      flex={1}
                      ml="$4"
                    >
                      {cardInfo?.sex || formatGender(profile?.gender) || "Chưa cập nhật"}
                    </Text>
                  </HStack>

                  <Divider />

                  {/* Quốc tịch */}
                  <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Quốc tịch
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="right"
                      flex={1}
                      ml="$4"
                    >
                      {cardInfo?.nationality || profile?.nationality || "Chưa cập nhật"}
                    </Text>
                  </HStack>

                  <Divider />

                  {/* Địa chỉ thường trú */}
                  <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Địa chỉ thường trú
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="right"
                      flex={1}
                      ml="$4"
                    >
                      {cardInfo?.home || profile?.permanent_address || "Chưa cập nhật"}
                    </Text>
                  </HStack>

                  <Divider />

                  {/* Nơi cấp */}
                  {cardInfo?.issue_loc && (
                    <>
                      <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                        <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                          Nơi cấp
                        </Text>
                        <Text
                          fontSize="$sm"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                          textAlign="right"
                          flex={1}
                          ml="$4"
                        >
                          {cardInfo.issue_loc}
                        </Text>
                      </HStack>
                      <Divider />
                    </>
                  )}

                  {/* Ngày cấp */}
                  {cardInfo?.issue_date && (
                    <>
                      <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                        <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                          Ngày cấp
                        </Text>
                        <Text
                          fontSize="$sm"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                          textAlign="right"
                          flex={1}
                          ml="$4"
                        >
                          {cardInfo.issue_date}
                        </Text>
                      </HStack>
                      <Divider />
                    </>
                  )}

                  {/* Ngày hết hạn */}
                  {cardInfo?.doe && (
                    <>
                      <HStack p="$4" justifyContent="space-between" alignItems="flex-start">
                        <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                          Ngày hết hạn
                        </Text>
                        <Text
                          fontSize="$sm"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                          textAlign="right"
                          flex={1}
                          ml="$4"
                        >
                          {cardInfo.doe}
                        </Text>
                      </HStack>
                      <Divider />
                    </>
                  )}

                  {/* Sinh trắc học khuôn mặt - Badge */}
                  <HStack p="$4" justifyContent="space-between" alignItems="center">
                    <Text fontSize="$sm" color={colors.muted_text} flexShrink={0}>
                      Sinh trắc học khuôn mặt
                    </Text>
                    <StatusBadge
                      text={ekycStatus?.is_face_verified ? "Đã xác thực" : "Chưa xác thực"}
                      variant={ekycStatus?.is_face_verified ? "success" : "error"}
                    />
                  </HStack>
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
                {/* Trạng thái - Badge */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$sm" color={colors.muted_text}>
                    Trạng thái
                  </Text>
                  <StatusBadge text="Đang hoạt động" variant="success" />
                </HStack>

                <Box height={1} bg={colors.frame_border} width="100%" my="$1" />

                {/* Loại tài khoản */}
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

                {/* Ngày tạo */}
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
                    <Box height={1} bg={colors.frame_border} width="100%" my="$1" />
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
    </>
  );
}

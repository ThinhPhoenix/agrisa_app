import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import {
  Box,
  HStack,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  XCircle,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { RefreshControl } from "react-native";

export default function ProfileDetailScreen() {
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const { geteKYCStatusQuery } = useEkyc();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch eKYC status
  const { data: ekycResponse, refetch: refetchEkyc } = user?.id
    ? geteKYCStatusQuery(user.id)
    : { data: null, refetch: () => {} };

  const ekycStatus =
    ekycResponse && "data" in ekycResponse ? ekycResponse.data : null;

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (user?.id) {
        await refetchEkyc();
      }
    } catch (error) {
      console.error("❌ [Profile Detail] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, refetchEkyc]);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetchEkyc();
      }
    }, [user?.id, refetchEkyc])
  );

  if (!user) {
    return (
      <VStack flex={1} bg={colors.background} justifyContent="center" alignItems="center">
        <Spinner size="large" color={colors.primary} />
        <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
          Đang tải thông tin...
        </Text>
      </VStack>
    );
  }

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
        icon: CheckCircle2,
        text: "Đã xác thực",
        color: colors.success,
        bgColor: colors.successSoft,
      };
    }

    if (ekycStatus.is_ocr_done) {
      return {
        icon: Clock,
        text: "Đang xác thực",
        color: colors.warning,
        bgColor: colors.warningSoft,
      };
    }

    return {
      icon: XCircle,
      text: "Chưa xác thực",
      color: colors.error,
      bgColor: colors.errorSoft,
    };
  };

  const verificationStatus = getVerificationStatus();

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
      <VStack space="xl" p="$6" pb="$8">
        {/* Testing Notice */}
        <Box
          bg={colors.warningSoft}
          borderRadius="$xl"
          p="$3"
          borderWidth={1}
          borderColor={colors.warning}
        >
          <HStack space="sm" alignItems="center">
            <AlertCircle size={16} color={colors.warning} />
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color={colors.warning}
              flex={1}
            >
              Phiên bản Testing - Thông tin có thể thay đổi
            </Text>
          </HStack>
        </Box>

        {/* Profile Header */}
        <VStack space="md" alignItems="center">
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
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color={colors.primary_text}
            >
              {user.email || "Chưa cập nhật"}
            </Text>
          </VStack>

          {/* Verification Badge */}
          <Box
            bg={verificationStatus.bgColor}
            borderRadius="$full"
            px="$4"
            py="$2"
            borderWidth={1}
            borderColor={verificationStatus.color}
          >
            <HStack space="xs" alignItems="center">
              <verificationStatus.icon
                size={16}
                color={verificationStatus.color}
              />
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={verificationStatus.color}
              >
                {verificationStatus.text}
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Personal Information */}
        <VStack space="md">
          {/* Section Header */}
          <HStack space="sm" alignItems="center">
            <Box bg={colors.primary} borderRadius="$lg" p="$2">
              <User
                size={20}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
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
              {/* Full Name */}
              <HStack space="md" alignItems="center" p="$5">
                <Box
                  bg={colors.primarySoft}
                  borderRadius="$full"
                  p="$2.5"
                  w={40}
                  h={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <User size={20} color={colors.primary} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Họ và tên
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {(user as any).full_name || "Chưa cập nhật"}
                  </Text>
                </VStack>
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" mx="$5" />

              {/* Email */}
              <HStack space="md" alignItems="center" p="$5">
                <Box
                  bg={colors.primarySoft}
                  borderRadius="$full"
                  p="$2.5"
                  w={40}
                  h={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Mail size={20} color={colors.primary} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Email
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {user.email}
                  </Text>
                </VStack>
                <Box w={10} h={10} borderRadius="$full" bg={colors.success} />
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" mx="$5" />

              {/* Phone */}
              <HStack space="md" alignItems="center" p="$5">
                <Box
                  bg={colors.primarySoft}
                  borderRadius="$full"
                  p="$2.5"
                  w={40}
                  h={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Phone size={20} color={colors.primary} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Số điện thoại
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={
                      user.phone_number
                        ? colors.primary_text
                        : colors.muted_text
                    }
                  >
                    {user.phone_number || "Chưa cập nhật"}
                  </Text>
                </VStack>
                <Box
                  w={10}
                  h={10}
                  borderRadius="$full"
                  bg={user.phone_verified ? colors.success : colors.muted_text}
                />
              </HStack>

              <Box height={1} bg={colors.frame_border} width="100%" mx="$5" />

              {/* Address */}
              <HStack space="md" alignItems="center" p="$5">
                <Box
                  bg={colors.primarySoft}
                  borderRadius="$full"
                  p="$2.5"
                  w={40}
                  h={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <MapPin size={20} color={colors.primary} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Địa chỉ
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={
                      (user as any).address
                        ? colors.primary_text
                        : colors.muted_text
                    }
                  >
                    {(user as any).address || "Chưa cập nhật"}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        </VStack>

        {/* eKYC Information */}
        {ekycStatus && (
          <VStack space="md">
            {/* Section Header */}
            <HStack space="sm" alignItems="center">
              <Box bg={colors.info} borderRadius="$lg" p="$2">
                <Shield
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Xác thực danh tính
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
                {/* CCCD Status */}
                <HStack space="md" alignItems="center" p="$5">
                  <Box
                    bg={
                      ekycStatus.is_ocr_done
                        ? colors.successSoft
                        : colors.errorSoft
                    }
                    borderRadius="$full"
                    p="$2.5"
                    w={40}
                    h={40}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <IdCard
                      size={20}
                      color={
                        ekycStatus.is_ocr_done ? colors.success : colors.error
                      }
                    />
                  </Box>
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

                <Box height={1} bg={colors.frame_border} width="100%" mx="$5" />

                {/* Face Verification Status */}
                <HStack space="md" alignItems="center" p="$5">
                  <Box
                    bg={
                      ekycStatus.is_face_verified
                        ? colors.successSoft
                        : colors.errorSoft
                    }
                    borderRadius="$full"
                    p="$2.5"
                    w={40}
                    h={40}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Shield
                      size={20}
                      color={
                        ekycStatus.is_face_verified
                          ? colors.success
                          : colors.error
                      }
                    />
                  </Box>
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
                    <Box
                      height={1}
                      bg={colors.frame_border}
                      width="100%"
                      mx="$5"
                    />

                    <Box p="$5">
                      <VStack space="xs">
                        <HStack space="xs" alignItems="center" mb="$2">
                          <Calendar size={14} color={colors.secondary_text} />
                          <Text
                            fontSize="$xs"
                            fontWeight="$semibold"
                            color={colors.secondary_text}
                          >
                            Thời gian xác thực
                          </Text>
                        </HStack>
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

        {/* Account Information */}
        <VStack space="md">
          {/* Section Header */}
          <HStack space="sm" alignItems="center">
            <Box bg={colors.success} borderRadius="$lg" p="$2">
              <Calendar
                size={20}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Thông tin tài khoản
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
              {/* Account Details */}
              <VStack p="$5" space="sm">
                <HStack justifyContent="space-between">
                  <Text fontSize="$sm" color={colors.muted_text}>
                    Trạng thái tài khoản
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
                    {(user as any).created_at
                      ? new Date((user as any).created_at).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Không xác định"}
                  </Text>
                </HStack>
              </VStack>
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

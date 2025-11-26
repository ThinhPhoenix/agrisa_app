import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  IdCard,
  RefreshCw,
  ScanFace,
  UserCheck,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";

export default function EKYCStatusResultScreen() {
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(15);
  const [isRefetching, setIsRefetching] = useState(false);

  const { geteKYCStatusQuery } = useEkyc();
  const { data: meData, refetch: refetchMe } = useAuthMe();

  // ✅ Thêm refetch function từ React Query
  const {
    data,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = geteKYCStatusQuery(user?.id || "");

  const ekycData = data && "data" in data ? data.data : null;
  const userData = meData;

  // Kiểm tra bước 1: Định danh tài khoản từ /me
  const isAccountIdentified = !!(
    userData?.full_name &&
    userData?.phone_number &&
    userData?.email
  );

  const isOCRDone = ekycData?.is_ocr_done || false;
  const isFaceVerified = ekycData?.is_face_verified || false;
  
  // 3 bước: Account ID + OCR + Face
  const isFullyVerified = isAccountIdentified && isOCRDone && isFaceVerified;
  const completedSteps = (isAccountIdentified ? 1 : 0) + (isOCRDone ? 1 : 0) + (isFaceVerified ? 1 : 0);
  const totalSteps = 3;

  // 🔥 NEW: Hàm manual refresh với loading state
  const handleManualRefresh = async () => {
    console.log("🔄 [eKYC Status] Manual refresh triggered");
    setIsRefetching(true);
    try {
      await Promise.all([refetch(), refetchMe()]);
      console.log("✅ [eKYC Status] Manual refresh thành công");
    } catch (error) {
      console.error("❌ [eKYC Status] Manual refresh failed:", error);
    } finally {
      setIsRefetching(false);
    }
  };

  // 🔥 NEW: Auto-refetch khi component mount hoặc user.id thay đổi
  useEffect(() => {
    console.log("🚀 [eKYC Status] Component mounted - Auto fetching...");
    if (user?.id) {
      refetch();
      refetchMe();
    }
  }, [user?.id]);

  // 🔥 NEW: Auto-refetch khi màn hình được focus (quan trọng nhất!)
  useFocusEffect(
    useCallback(() => {
      console.log(
        "👁️ [eKYC Status] Screen focused - Auto refreshing status..."
      );

      // Refetch data mỗi khi màn hình được focus
      const refreshOnFocus = async () => {
        if (user?.id) {
          try {
            await Promise.all([refetch(), refetchMe()]);
            console.log("✅ [eKYC Status] Auto-refresh on focus thành công");
          } catch (error) {
            console.error(
              "❌ [eKYC Status] Auto-refresh on focus failed:",
              error
            );
          }
        }
      };

      refreshOnFocus();

      return () => {
        console.log("👋 [eKYC Status] Screen unfocused");
      };
    }, [user?.id, refetch])
  );

  // 🔥 IMPROVED: Countdown chỉ chạy khi fully verified
  useEffect(() => {
    if (isFullyVerified) {
      console.log("🎉 [eKYC Status] Fully verified - Starting countdown");

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log("✅ [eKYC Status] Countdown done - Navigating to home");
            router.replace("/(tabs)");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        console.log("🛑 [eKYC Status] Countdown cleanup");
        clearInterval(timer);
      };
    } else {
      // Reset countdown nếu chưa verify xong
      setCountdown(5);
    }
  }, [isFullyVerified]);

  // 🔥 NEW: Log khi data thay đổi
  useEffect(() => {
    if (ekycData) {
      console.log("📊 [eKYC Status] Data updated:", {
        isAccountIdentified,
        isOCRDone,
        isFaceVerified,
        isFullyVerified,
        completedSteps,
        totalSteps,
        cicNo: ekycData.cic_no,
        ocrDoneAt: ekycData.ocr_done_at,
        faceVerifiedAt: ekycData.face_verified_at,
        dataUpdatedAt: new Date(dataUpdatedAt).toLocaleString("vi-VN"),
      });
    }
  }, [dataUpdatedAt, ekycData, userData]);

  // ✅ Early returns sau khi tất cả hooks đã được gọi
  if (isLoading && !ekycData) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.secondary_text}>
          Đang kiểm tra trạng thái xác thực...
        </Text>
      </Center>
    );
  }

  if (isError && !ekycData) {
    return (
      <Center flex={1} bg={colors.background} px="$6">
        <VStack space="lg" alignItems="center">
          <XCircle size={80} color={colors.error} />
          <Heading size="xl" color={colors.primary_text} textAlign="center">
            Lỗi kết nối
          </Heading>
          <Text color={colors.secondary_text} textAlign="center">
            Không thể tải trạng thái xác thực. Vui lòng thử lại.
          </Text>

          {/* 🔥 NEW: Nút retry */}
          <Button
            mt="$4"
            bg={colors.primary}
            onPress={handleManualRefresh}
            isDisabled={isRefetching}
          >
            <Box flexDirection="row" alignItems="center" gap="$2">
              <RefreshCw size={16} color={colors.primary_white_text} />
              <ButtonText color={colors.primary_white_text}>
                {isRefetching ? "Đang tải..." : "Thử lại"}
              </ButtonText>
            </Box>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={colors.background}>
      <VStack space="xl" p="$6" pb="$8">
        {/* Header - Simple & Friendly */}
        <VStack space="md" alignItems="center">
          {/* Icon */}
          {isFullyVerified ? (
            <Box
              bg={colors.success}
              borderRadius="$full"
              p="$4"
              w={80}
              h={80}
              alignItems="center"
              justifyContent="center"
              shadowColor={colors.shadow}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={8}
              elevation={4}
            >
              <CheckCircle2
                size={44}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
          ) : (
            <Box
              bg={colors.warning}
              borderRadius="$full"
              p="$4"
              w={80}
              h={80}
              alignItems="center"
              justifyContent="center"
              shadowColor={colors.shadow}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={8}
              elevation={4}
            >
              <Clock
                size={44}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>
          )}

          {/* Title */}
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            color={colors.primary_text}
            textAlign="center"
          >
            {isFullyVerified ? "Hoàn tất xác thực!" : "Tiếp tục xác thực"}
          </Text>

          {/* Description */}
          <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
            {isFullyVerified
              ? `Bạn đã hoàn tất cả ${totalSteps} bước xác thực`
              : `Bạn đã hoàn tất ${completedSteps}/${totalSteps} bước`}
          </Text>

          {/* Progress Dots - 3 steps */}
          <HStack space="sm" mt="$2">
            <Box
              w={10}
              h={10}
              borderRadius="$full"
              bg={isAccountIdentified ? colors.success : colors.frame_border}
            />
            <Box
              w={10}
              h={10}
              borderRadius="$full"
              bg={isOCRDone ? colors.success : colors.frame_border}
            />
            <Box
              w={10}
              h={10}
              borderRadius="$full"
              bg={isFaceVerified ? colors.success : colors.frame_border}
            />
          </HStack>
        </VStack>
        {/* CCCD Number - Simple */}
        {ekycData?.cic_no && (
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$3"
            mt="$2"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <HStack space="xs" alignItems="center" justifyContent="center">
              <Text fontSize="$xs" color={colors.secondary_text}>
                Số CCCD:
              </Text>
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                {ekycData.cic_no}
              </Text>
            </HStack>
          </Box>
        )}
        {/* Step Cards - Simple */}
        <VStack space="md">
          {/* Step 1: Account Identification */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={
              isAccountIdentified ? colors.success : colors.frame_border
            }
          >
            <HStack space="md" alignItems="center" mb="$3">
              <Box
                bg={isAccountIdentified ? colors.success : colors.primary}
                borderRadius="$full"
                p="$2.5"
                w={40}
                h={40}
                alignItems="center"
                justifyContent="center"
              >
                <UserCheck
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>

              <VStack flex={1}>
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Định danh tài khoản
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Thông tin cơ bản
                </Text>
              </VStack>

              {isAccountIdentified && (
                <Box
                  w={24}
                  h={24}
                  borderRadius="$full"
                  bg={colors.successSoft}
                  alignItems="center"
                  justifyContent="center"
                >
                  <CheckCircle2
                    size={16}
                    color={colors.success}
                    strokeWidth={3}
                  />
                </Box>
              )}
            </HStack>

            {isAccountIdentified && userData && (
              <VStack space="xs" mt="$1">
                <Text fontSize="$xs" color={colors.muted_text}>
                  ✓ {userData.full_name}
                </Text>
                <Text fontSize="$xs" color={colors.muted_text}>
                  ✓ {userData.phone_number}
                </Text>
              </VStack>
            )}

            {!isAccountIdentified && (
              <Button
                mt="$3"
                bg={colors.primary}
                borderRadius="$lg"
                onPress={() => router.push("/edit-profile")}
                h="$11"
              >
                <ButtonText
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_white_text}
                >
                  Cập nhật thông tin
                </ButtonText>
              </Button>
            )}
          </Box>

          {/* Step 2: CCCD */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={isOCRDone ? colors.success : colors.frame_border}
            opacity={isAccountIdentified ? 1 : 0.6}
          >
            <HStack space="md" alignItems="center" mb="$3">
              <Box
                bg={isOCRDone ? colors.success : colors.primary}
                borderRadius="$full"
                p="$2.5"
                w={40}
                h={40}
                alignItems="center"
                justifyContent="center"
              >
                <IdCard
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>

              <VStack flex={1}>
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Xác thực CCCD
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Chụp 2 mặt căn cước
                </Text>
              </VStack>

              {isOCRDone && (
                <Box
                  w={24}
                  h={24}
                  borderRadius="$full"
                  bg={colors.successSoft}
                  alignItems="center"
                  justifyContent="center"
                >
                  <CheckCircle2
                    size={16}
                    color={colors.success}
                    strokeWidth={3}
                  />
                </Box>
              )}
            </HStack>

            {ekycData?.ocr_done_at && (
              <Text fontSize="$xs" color={colors.muted_text} mt="$1">
                ✓ Hoàn tất lúc{" "}
                {new Date(ekycData.ocr_done_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}

            {!isOCRDone && !isAccountIdentified && (
              <Box
                bg={colors.warningSoft}
                borderRadius="$lg"
                p="$2.5"
                mt="$3"
                borderWidth={1}
                borderColor={colors.warning}
              >
                <HStack space="xs" alignItems="center">
                  <AlertCircle size={14} color={colors.warning} />
                  <Text fontSize="$xs" color={colors.warning}>
                    Vui lòng định danh tài khoản trước
                  </Text>
                </HStack>
              </Box>
            )}

            {!isOCRDone && isAccountIdentified && (
              <Button
                mt="$3"
                bg={colors.primary}
                borderRadius="$lg"
                onPress={() => router.push("/settings/verify/id-scan")}
                h="$11"
              >
                <ButtonText
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_white_text}
                >
                  Bắt đầu chụp
                </ButtonText>
              </Button>
            )}
          </Box>

          {/* Step 3: Face */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={isFaceVerified ? colors.success : colors.frame_border}
            opacity={isAccountIdentified && isOCRDone ? 1 : 0.6}
          >
            <HStack space="md" alignItems="center" mb="$3">
              <Box
                bg={isFaceVerified ? colors.success : colors.primary}
                borderRadius="$full"
                p="$2.5"
                w={40}
                h={40}
                alignItems="center"
                justifyContent="center"
              >
                <ScanFace
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>

              <VStack flex={1}>
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Xác thực khuôn mặt
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text}>
                  So khớp với ảnh CCCD
                </Text>
              </VStack>

              {isFaceVerified && (
                <Box
                  w={24}
                  h={24}
                  borderRadius="$full"
                  bg={colors.successSoft}
                  alignItems="center"
                  justifyContent="center"
                >
                  <CheckCircle2
                    size={16}
                    color={colors.success}
                    strokeWidth={3}
                  />
                </Box>
              )}
            </HStack>

            {ekycData?.face_verified_at && (
              <Text fontSize="$xs" color={colors.muted_text} mt="$1">
                ✓ Hoàn tất lúc{" "}
                {new Date(ekycData.face_verified_at).toLocaleTimeString(
                  "vi-VN",
                  { hour: "2-digit", minute: "2-digit" }
                )}
              </Text>
            )}

            {!isFaceVerified && (!isAccountIdentified || !isOCRDone) && (
              <Box
                bg={colors.warningSoft}
                borderRadius="$lg"
                p="$2.5"
                mt="$3"
                borderWidth={1}
                borderColor={colors.warning}
              >
                <HStack space="xs" alignItems="center">
                  <AlertCircle size={14} color={colors.warning} />
                  <Text fontSize="$xs" color={colors.warning}>
                    {!isAccountIdentified
                      ? "Vui lòng định danh tài khoản trước"
                      : "Vui lòng xác thực CCCD trước"}
                  </Text>
                </HStack>
              </Box>
            )}

            {!isFaceVerified && isAccountIdentified && isOCRDone && (
              <Button
                mt="$3"
                bg={colors.primary}
                borderRadius="$lg"
                onPress={() => router.push("/settings/verify/face-scan")}
                h="$11"
              >
                <ButtonText
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_white_text}
                >
                  Bắt đầu quét
                </ButtonText>
              </Button>
            )}
          </Box>
        </VStack>

        {/* Countdown */}
        {isFullyVerified && (
          <Box
            bg={colors.successSoft}
            borderRadius="$xl"
            p="$4"
            mt="$4"
            borderWidth={1}
            borderColor={colors.success}
          >
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.success}
              textAlign="center"
            >
              Về trang chủ sau {countdown}s
            </Text>
          </Box>
        )}

        {/* Last Updated */}
        {dataUpdatedAt && (
          <Box mt="$2" opacity={0.5}>
            <Text color={colors.muted_text} size="xs" textAlign="center">
              Cập nhật lúc: {new Date(dataUpdatedAt).toLocaleString("vi-VN")}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
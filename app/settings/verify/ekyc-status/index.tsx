import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";

export default function EKYCStatusScreen() {
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(5);
  const [isRefetching, setIsRefetching] = useState(false);

  const { geteKYCStatusQuery } = useEkyc();

  // ✅ Thêm refetch function từ React Query
  const {
    data,
    isLoading,
    isError,
    refetch, // 🔥 QUAN TRỌNG: Thêm refetch
    dataUpdatedAt, // 🔥 Track thời gian update
  } = geteKYCStatusQuery(user?.id || "");

  const ekycData = data && "data" in data ? data.data : null;
  const isOCRDone = ekycData?.is_ocr_done || false;
  const isFaceVerified = ekycData?.is_face_verified || false;
  const isFullyVerified = isOCRDone && isFaceVerified;

  // 🔥 NEW: Hàm manual refresh với loading state
  const handleManualRefresh = async () => {
    console.log("🔄 [eKYC Status] Manual refresh triggered");
    setIsRefetching(true);
    try {
      await refetch();
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
            await refetch();
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
        isOCRDone,
        isFaceVerified,
        isFullyVerified,
        cicNo: ekycData.cic_no,
        ocrDoneAt: ekycData.ocr_done_at,
        faceVerifiedAt: ekycData.face_verified_at,
        dataUpdatedAt: new Date(dataUpdatedAt).toLocaleString("vi-VN"),
      });
    }
  }, [dataUpdatedAt, ekycData]);

  // ✅ Early returns sau khi tất cả hooks đã được gọi
  if (isLoading && !ekycData) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.textSecondary}>
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
          <Heading size="xl" color={colors.text} textAlign="center">
            Lỗi kết nối
          </Heading>
          <Text color={colors.textSecondary} textAlign="center">
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
              <RefreshCw size={16} color="white" />
              <ButtonText color="white">
                {isRefetching ? "Đang tải..." : "Thử lại"}
              </ButtonText>
            </Box>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Center flex={1} bg={colors.background} px="$6">
      <VStack space="lg" alignItems="center" width="100%">
        {/* 🔥 NEW: Refresh button ở góc trên */}
        <Box position="absolute" top="$4" right="$4">
          <Button
            size="sm"
            variant="outline"
            borderColor={colors.border}
            onPress={handleManualRefresh}
            isDisabled={isRefetching || isLoading}
          >
            <Box flexDirection="row" alignItems="center" gap="$2">
              <RefreshCw
                size={14}
                color={colors.text}
                style={{
                  transform: [{ rotate: isRefetching ? "360deg" : "0deg" }],
                }}
              />
              <ButtonText color={colors.text} size="xs">
                Làm mới
              </ButtonText>
            </Box>
          </Button>
        </Box>

        {/* Status Icon */}
        {isFullyVerified ? (
          <CheckCircle2 size={100} color={colors.success} />
        ) : (
          <Clock size={100} color={colors.warning} />
        )}

        {/* Title */}
        <Heading size="2xl" color={colors.text} textAlign="center">
          {isFullyVerified ? "Xác thực thành công! 🎉" : "Đang xác thực"}
        </Heading>

        {/* Description */}
        <Text color={colors.textSecondary} textAlign="center" size="md">
          {isFullyVerified
            ? "Tài khoản của bạn đã được xác thực hoàn tất"
            : "Vui lòng hoàn tất tất cả các bước xác thực"}
        </Text>

        {/* 🔥 NEW: Progress indicator */}
        {!isFullyVerified && (
          <Box width="100%" bg={colors.card} p="$3" borderRadius="$lg">
            <Text
              color={colors.text}
              fontWeight="$semibold"
              mb="$2"
              textAlign="center"
            >
              Tiến độ: {(isOCRDone ? 1 : 0) + (isFaceVerified ? 1 : 0)}/2 bước
            </Text>
            <Box flexDirection="row" gap="$2">
              <Box
                flex={1}
                height="$1"
                bg={isOCRDone ? colors.success : colors.border}
                borderRadius="$full"
              />
              <Box
                flex={1}
                height="$1"
                bg={isFaceVerified ? colors.success : colors.border}
                borderRadius="$full"
              />
            </Box>
          </Box>
        )}

        {/* Status Details */}
        <VStack space="md" width="100%">
          {/* OCR Status */}
          <Box
            bg={colors.card}
            p="$4"
            borderRadius="$lg"
            borderWidth={1}
            borderColor={isOCRDone ? colors.success : colors.border}
          >
            <Box flexDirection="row" alignItems="center">
              {isOCRDone ? (
                <CheckCircle2 size={24} color={colors.success} />
              ) : (
                <XCircle size={24} color={colors.textSecondary} />
              )}
              <Text color={colors.text} fontWeight="$bold" ml="$3" flex={1}>
                Xác thực CCCD
              </Text>
              <Text
                color={isOCRDone ? colors.success : colors.textSecondary}
                fontWeight="$semibold"
                size="sm"
              >
                {isOCRDone ? "Hoàn tất ✓" : "Chưa hoàn tất"}
              </Text>
            </Box>

            <Text color={colors.textSecondary} size="sm" mt="$2">
              Quét và xác thực thông tin trên Căn cước công dân
            </Text>

            {ekycData?.ocr_done_at && (
              <Box
                mt="$2"
                bg={colors.success}
                opacity={0.1}
                p="$2"
                borderRadius="$md"
              >
                <Text color={colors.text} size="xs">
                  ✓ Hoàn tất lúc:{" "}
                  {new Date(ekycData.ocr_done_at).toLocaleString("vi-VN")}
                </Text>
              </Box>
            )}

            {/* 🔥 NEW: Nút tiếp tục nếu chưa làm */}
            {!isOCRDone && (
              <Button
                mt="$3"
                size="sm"
                bg={colors.primary}
                onPress={() => router.push("/settings/verify/id-scan")}
              >
                <ButtonText color="white">Bắt đầu quét CCCD →</ButtonText>
              </Button>
            )}
          </Box>

          {/* Face Verification Status */}
          <Box
            bg={colors.card}
            p="$4"
            borderRadius="$lg"
            borderWidth={1}
            borderColor={isFaceVerified ? colors.success : colors.border}
            opacity={isOCRDone ? 1 : 0.5} // Làm mờ nếu chưa làm OCR
          >
            <Box flexDirection="row" alignItems="center">
              {isFaceVerified ? (
                <CheckCircle2 size={24} color={colors.success} />
              ) : (
                <XCircle size={24} color={colors.textSecondary} />
              )}
              <Text color={colors.text} fontWeight="$bold" ml="$3" flex={1}>
                Xác thực khuôn mặt
              </Text>
              <Text
                color={isFaceVerified ? colors.success : colors.textSecondary}
                fontWeight="$semibold"
                size="sm"
              >
                {isFaceVerified ? "Hoàn tất ✓" : "Chưa hoàn tất"}
              </Text>
            </Box>

            <Text color={colors.textSecondary} size="sm" mt="$2">
              So sánh khuôn mặt với ảnh trên CCCD để xác minh danh tính
            </Text>

            {ekycData?.face_verified_at && (
              <Box
                mt="$2"
                bg={colors.success}
                opacity={0.1}
                p="$2"
                borderRadius="$md"
              >
                <Text color={colors.text} size="xs">
                  ✓ Hoàn tất lúc:{" "}
                  {new Date(ekycData.face_verified_at).toLocaleString("vi-VN")}
                </Text>
              </Box>
            )}

            {/* 🔥 NEW: Nút tiếp tục nếu đã làm OCR nhưng chưa làm Face */}
            {!isFaceVerified && isOCRDone && (
              <Button
                mt="$3"
                size="sm"
                bg={colors.primary}
                onPress={() => router.push("/settings/verify/face-scan")}
              >
                <ButtonText color="white">Bắt đầu quét khuôn mặt →</ButtonText>
              </Button>
            )}

            {/* 🔥 NEW: Thông báo cần làm OCR trước */}
            {!isFaceVerified && !isOCRDone && (
              <Box
                mt="$2"
                bg={colors.warning}
                opacity={0.1}
                p="$2"
                borderRadius="$md"
              >
                <Text color={colors.text} size="xs">
                  ⚠️ Vui lòng hoàn tất quét CCCD trước
                </Text>
              </Box>
            )}
          </Box>
        </VStack>

        {/* Countdown */}
        {isFullyVerified && (
          <Box
            mt="$6"
            bg={colors.success}
            opacity={0.1}
            p="$4"
            borderRadius="$lg"
            width="100%"
          >
            <Text color={colors.success} textAlign="center" fontWeight="$bold">
              🎉 Chuyển về trang chủ trong {countdown} giây...
            </Text>
          </Box>
        )}

        {/* CCCD Number */}
        {ekycData?.cic_no && (
          <Box mt="$4" bg={colors.card} p="$3" borderRadius="$md" width="100%">
            <Text color={colors.textSecondary} size="sm" textAlign="center">
              Số CCCD:{" "}
              <Text fontWeight="$semibold" color={colors.text}>
                {ekycData.cic_no}
              </Text>
            </Text>
          </Box>
        )}

        {/* 🔥 NEW: Timestamp cuối cùng update */}
        {dataUpdatedAt && (
          <Box mt="$2" opacity={0.5}>
            <Text color={colors.textSecondary} size="xs" textAlign="center">
              Cập nhật lúc: {new Date(dataUpdatedAt).toLocaleString("vi-VN")}
            </Text>
          </Box>
        )}
      </VStack>
    </Center>
  );
}
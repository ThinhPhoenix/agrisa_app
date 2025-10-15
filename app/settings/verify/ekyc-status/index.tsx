import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import {
    Box,
    Center,
    Heading,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";

export default function EKYCStatusScreen() {
  // ✅ Đảm bảo các hooks luôn được gọi theo thứ tự cố định
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(5);
  
  // ✅ FIX: Luôn gọi useEkyc, nhưng chỉ enable query khi có user
  const { geteKYCStatusQuery } = useEkyc();
  
  // ✅ Sử dụng user?.id || "" và enable: !!user?.id
  const { data, isLoading, isError } = geteKYCStatusQuery(user?.id || "");

  const ekycData = data && "data" in data ? data.data : null;
  const isOCRDone = ekycData?.is_ocr_done || false;
  const isFaceVerified = ekycData?.is_face_verified || false;
  const isFullyVerified = isOCRDone && isFaceVerified;

  // ✅ useEffect phải luôn được gọi (không điều kiện)
  useEffect(() => {
    if (isFullyVerified) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.replace("/(tabs)");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isFullyVerified]);

  // Early returns sau khi tất cả hooks đã được gọi
  if (isLoading) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.textSecondary}>
          Đang kiểm tra trạng thái xác thực...
        </Text>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center flex={1} bg={colors.background} px="$6">
        <XCircle size={80} color={colors.error} />
        <Heading size="xl" color={colors.text} mt="$4" textAlign="center">
          Lỗi
        </Heading>
        <Text color={colors.textSecondary} mt="$2" textAlign="center">
          Không thể tải trạng thái xác thực. Vui lòng thử lại sau.
        </Text>
      </Center>
    );
  }

  return (
    <Center flex={1} bg={colors.background} px="$6">
      <VStack space="lg" alignItems="center">
        {/* Status Icon */}
        {isFullyVerified ? (
          <CheckCircle2 size={100} color={colors.success} />
        ) : (
          <Clock size={100} color={colors.warning} />
        )}

        {/* Title */}
        <Heading size="2xl" color={colors.text} textAlign="center">
          {isFullyVerified ? "Xác thực thành công!" : "Đang xác thực"}
        </Heading>

        {/* Description */}
        <Text color={colors.textSecondary} textAlign="center" size="md">
          {isFullyVerified
            ? "Tài khoản của bạn đã được xác thực hoàn tất"
            : "Vui lòng hoàn tất tất cả các bước xác thực"}
        </Text>

        {/* Status Details */}
        <VStack space="md" mt="$6" width="100%">
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
                {isOCRDone ? "Hoàn tất" : "Chưa hoàn tất"}
              </Text>
            </Box>
            
            <Text color={colors.textSecondary} size="sm" mt="$2">
              Quét và xác thực thông tin trên Căn cước công dân
            </Text>
            
            {ekycData?.ocr_done_at && (
              <Box mt="$2" bg={colors.primary} p="$2" borderRadius="$md">
                <Text color={colors.textSecondary} size="xs">
                  Hoàn tất lúc: {new Date(ekycData.ocr_done_at).toLocaleString("vi-VN")}
                </Text>
              </Box>
            )}
          </Box>

          {/* Face Verification Status */}
          <Box
            bg={colors.card}
            p="$4"
            borderRadius="$lg"
            borderWidth={1}
            borderColor={isFaceVerified ? colors.success : colors.border}
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
                {isFaceVerified ? "Hoàn tất" : "Chưa hoàn tất"}
              </Text>
            </Box>
            
            <Text color={colors.textSecondary} size="sm" mt="$2">
              So sánh khuôn mặt với ảnh trên CCCD để xác minh danh tính
            </Text>
            
            {ekycData?.face_verified_at && (
              <Box mt="$2" bg={colors.primary} p="$2" borderRadius="$md">
                <Text color={colors.textSecondary} size="xs">
                  Hoàn tất lúc: {new Date(ekycData.face_verified_at).toLocaleString("vi-VN")}
                </Text>
              </Box>
            )}
          </Box>
        </VStack>

        {/* Countdown */}
        {isFullyVerified && (
          <Box mt="$6" bg={colors.textWhiteButton} p="$4" borderRadius="$lg">
            <Text color={colors.primary} textAlign="center" fontWeight="$medium">
              Chuyển về trang chủ trong {countdown} giây...
            </Text>
          </Box>
        )}

        {/* CCCD Number */}
        {ekycData?.cic_no && (
          <Box mt="$4" bg={colors.card} p="$3" borderRadius="$md" width="100%">
            <Text color={colors.textSecondary} size="sm" textAlign="center">
              Số CCCD: <Text fontWeight="$semibold" color={colors.text}>{ekycData.cic_no}</Text>
            </Text>
          </Box>
        )}
      </VStack>
    </Center>
  );
}
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useTest } from "@/domains/test/hooks/use-test";
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    RefreshCw,
    Wifi,
} from "lucide-react-native";
import React from "react";


export const PingScreen = () => {
  const { colors } = useAgrisaColors();
  const { data, isLoading, error, refetch } = useTest.ping();

  // Type guard helper
  const isSuccessResponse = (
    response: any
  ): response is ApiSuccessResponse<string> => {
    return response && response.success === true;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Helper để lấy error message
  const getErrorMessage = (error: any): string => {
    if (error && typeof error === "object") {
      if ("message" in error) return error.message;
      if ("error" in error && error.error?.message) return error.error.message;
      return "Có lỗi xảy ra khi kiểm tra kết nối";
    }
    return "Có lỗi xảy ra khi kiểm tra kết nối";
  };

  return (
    <VStack
      flex={1}
      bg={colors.background}
      paddingVertical={50}
      padding={20}
      space="md"
    >
      {/* Header với icon Agrisa */}
      <HStack alignItems="center" space="sm" marginBottom={16}>
        <Wifi size={24} color={colors.primary} />
        <Text color={colors.text} fontSize="$xl" fontWeight="bold">
          Kiểm tra kết nối Agrisa
        </Text>
      </HStack>

      {/* Status indicator - Card design cho nông dân */}
      <Box
        bg={colors.card}
        padding={20}
        borderRadius={16}
        borderWidth={1}
        borderColor={colors.border}
        shadowColor={colors.shadow}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={3}
      >
        {/* Ping result - Hiển thị chi tiết cho nông dân */}
        {data && isSuccessResponse(data) && (
          <VStack space="sm">
            {/* Trạng thái kết nối */}
            <HStack alignItems="center" space="sm">
              <CheckCircle size={20} color={colors.success} />
              <Text color={colors.success} fontSize="$lg" fontWeight="600">
                ✅ Kết nối thành công
              </Text>
            </HStack>

            {/* Thông tin chi tiết */}
            <Box
              bg={`${colors.success}15`}
              padding={12}
              borderRadius={8}
              borderLeftWidth={4}
              borderLeftColor={colors.success}
            >
              <VStack space="xs">
                <HStack justifyContent="space-between">
                  <Text color={colors.textSecondary} fontSize="$sm">
                    Phản hồi từ server:
                  </Text>
                  <Text color={colors.success} fontSize="$sm" fontWeight="600">
                    {data.data}
                  </Text>
                </HStack>

                <HStack justifyContent="space-between">
                  <Text color={colors.textSecondary} fontSize="$sm">
                    Trạng thái:
                  </Text>
                  <Text color={colors.success} fontSize="$sm" fontWeight="600">
                    {data.success ? "Hoạt động tốt" : "Có vấn đề"}
                  </Text>
                </HStack>

                {data.meta?.timestamp && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack alignItems="center" space="xs">
                      <Clock size={14} color={colors.textSecondary} />
                      <Text color={colors.textSecondary} fontSize="$sm">
                        Thời gian phản hồi:
                      </Text>
                    </HStack>
                    <Text color={colors.text} fontSize="$sm" fontWeight="500">
                      {formatTimestamp(data.meta.timestamp)}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Thông báo cho nông dân */}
            <Box bg={`${colors.info}10`} padding={10} borderRadius={6}>
              <Text color={colors.info} fontSize="$xs" textAlign="center">
                🌾 Hệ thống Agrisa đang hoạt động bình thường. Bạn có thể sử
                dụng đầy đủ các tính năng.
              </Text>
            </Box>
          </VStack>
        )}

        {/* Error handling - Thiết kế thân thiện với nông dân */}
        {error && (
          <VStack space="sm">
            <HStack alignItems="center" space="sm">
              <AlertCircle size={20} color={colors.error} />
              <Text color={colors.error} fontSize="$lg" fontWeight="600">
                ❌ Mất kết nối
              </Text>
            </HStack>

            <Box
              bg={`${colors.error}15`}
              padding={12}
              borderRadius={8}
              borderLeftWidth={4}
              borderLeftColor={colors.error}
            >
              <Text color={colors.error} fontSize="$sm" marginBottom={8}>
                Chi tiết lỗi: {getErrorMessage(error)}
              </Text>

              {/* Hướng dẫn khắc phục cho nông dân */}
              <Box bg={`${colors.warning}10`} padding={8} borderRadius={6}>
                <Text
                  color={colors.warning}
                  fontSize="$xs"
                  fontWeight="600"
                  marginBottom={4}
                >
                  💡 Hướng dẫn khắc phục:
                </Text>
                <Text color={colors.warning} fontSize="$xs">
                  • Kiểm tra kết nối WiFi hoặc 3G/4G{"\n"}• Di chuyển đến nơi có
                  sóng tốt hơn{"\n"}• Thử lại sau vài phút{"\n"}• Liên hệ hỗ trợ
                  nếu vẫn lỗi
                </Text>
              </Box>
            </Box>
          </VStack>
        )}

        {/* Xử lý trường hợp data là error response */}
        {data && !isSuccessResponse(data) && (
          <VStack space="sm">
            <HStack alignItems="center" space="sm">
              <AlertCircle size={20} color={colors.error} />
              <Text color={colors.error} fontSize="$lg" fontWeight="600">
                ❌ Lỗi phản hồi từ server
              </Text>
            </HStack>

            <Box
              bg={`${colors.error}15`}
              padding={12}
              borderRadius={8}
              borderLeftWidth={4}
              borderLeftColor={colors.error}
            >
              <Text color={colors.error} fontSize="$sm" marginBottom={8}>
                Mã lỗi: {data.error?.code || "UNKNOWN"}
                {"\n"}
                Chi tiết: {data.error?.message || "Không có thông tin lỗi"}
              </Text>
            </Box>
          </VStack>
        )}

        {/* Loading state */}
        {isLoading && (
          <VStack space="sm" alignItems="center">
            <HStack alignItems="center" space="sm">
              <RefreshCw size={20} color={colors.warning} />
              <Text color={colors.warning} fontSize="$lg" fontWeight="600">
                🔄 Đang kiểm tra...
              </Text>
            </HStack>
            <Text
              color={colors.textSecondary}
              fontSize="$sm"
              textAlign="center"
            >
              Vui lòng chờ trong giây lát
            </Text>
          </VStack>
        )}
      </Box>

      {/* Manual ping button - Thiết kế nổi bật cho nông dân */}
      <Button
        onPress={() => refetch()}
        isDisabled={isLoading}
        bg={isLoading ? colors.textMuted : colors.primary}
        borderRadius={12}
        padding={16}
        shadowColor={colors.shadow}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.2}
        shadowRadius={4}
        elevation={2}
      >
        <HStack alignItems="center" space="sm">
          <RefreshCw
            size={18}
            color="white"
            style={{
              transform: [{ rotate: isLoading ? "360deg" : "0deg" }],
            }}
          />
          <ButtonText color="white" fontSize="$md" fontWeight="600">
            {isLoading ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
          </ButtonText>
        </HStack>
      </Button>

      {/* Thông tin bổ sung cho nông dân */}
      <Box
        bg={`${colors.primary}10`}
        padding={16}
        borderRadius={12}
        borderWidth={1}
        borderColor={`${colors.primary}30`}
      >
        <Text
          color={colors.primary}
          fontSize="$sm"
          fontWeight="600"
          marginBottom={8}
        >
          📱 Về tính năng kiểm tra kết nối
        </Text>
        <Text color={colors.textSecondary} fontSize="$xs" lineHeight={16}>
          • Hệ thống tự động kiểm tra mỗi 30 giây{"\n"}• Giúp đảm bảo dữ liệu
          nông trại được đồng bộ{"\n"}• Quan trọng cho việc báo cáo thiệt hại
          cây trồng{"\n"}• Kết nối tốt = xử lý chi trả nhanh hơn
        </Text>
      </Box>
    </VStack>
  );
};
export default PingScreen;
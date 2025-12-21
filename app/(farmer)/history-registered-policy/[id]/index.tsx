import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { HistoryDetailRegisteredPolicy } from "@/domains/policy/components/history-registered-policy";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Box, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import React from "react";

export default function RegisteredPolicyDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getRegisteredPolicyDetail } = usePolicy();
  const { data, isLoading, isFetching, refetch } = getRegisteredPolicyDetail(
    id!
  );

  const policy = data?.success ? data.data : null;

  if (isLoading) {
    return (
      <VStack flex={1} bg={colors.background}>
        <AgrisaHeader
          title="Chi tiết hợp đồng đăng ký"
          showBackButton={true}
          onBack={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color={colors.primary} />
          <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
            Đang tải thông tin...
          </Text>
        </Box>
      </VStack>
    );
  }

  if (!policy) {
    return (
      <VStack flex={1} bg={colors.background}>
        <AgrisaHeader
          title="Chi tiết hợp đồng đăng ký"
          showBackButton={true}
          onBack={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center" p="$4">
          <AlertCircle size={48} color={colors.error} strokeWidth={1.5} />
          <Text
            fontSize="$lg"
            fontWeight="$semibold"
            color={colors.primary_text}
            mt="$3"
          >
            Không tìm thấy thông tin
          </Text>
          <Text
            fontSize="$sm"
            color={colors.secondary_text}
            textAlign="center"
            mt="$1"
          >
            Đơn đăng ký bảo hiểm không tồn tại hoặc đã bị xóa
          </Text>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader
        title="Chi tiết hợp đồng đăng ký"
        showBackButton={true}
        onBack={() => router.back()}
      />

      <HistoryDetailRegisteredPolicy
        policy={policy}
        isRefreshing={isFetching && !isLoading}
        onRefresh={refetch}
      />
    </VStack>
  );
}

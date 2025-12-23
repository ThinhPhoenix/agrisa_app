import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { ClaimEventDetail } from "@/domains/claim-event-monitor/components";
import { useClaim } from "@/domains/claim-event-monitor/hooks/use-claim";
import { Box, Text, VStack } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, FileWarning } from "lucide-react-native";
import React from "react";

export default function ClaimDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Sử dụng hook để lấy chi tiết claim
  const { getDetailClaim } = useClaim();
  const {
    data: claimData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = getDetailClaim(id);

  // Lấy dữ liệu claim từ response (type narrowing)
  const claim = claimData?.success === true ? claimData.data : null;

  /**
   * Component hiển thị khi đang loading
   */
  const LoadingState = () => (
    <VStack flex={1} justifyContent="center" alignItems="center" p="$8">
      <Box
        bg={colors.primarySoft || colors.background}
        p="$6"
        borderRadius="$full"
        mb="$4"
      >
        <FileWarning size={48} color={colors.primary} strokeWidth={1.5} />
      </Box>
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        textAlign="center"
      >
        Đang tải thông tin...
      </Text>
      <Text
        fontSize="$sm"
        color={colors.secondary_text}
        textAlign="center"
        mt="$2"
      >
        Vui lòng chờ trong giây lát
      </Text>
    </VStack>
  );

  /**
   * Component hiển thị khi có lỗi
   */
  const ErrorState = () => (
    <VStack flex={1} justifyContent="center" alignItems="center" p="$8">
      <Box bg={colors.errorSoft} p="$6" borderRadius="$full" mb="$4">
        <AlertCircle size={48} color={colors.error} strokeWidth={1.5} />
      </Box>
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        textAlign="center"
      >
        Không thể tải thông tin
      </Text>
      <Text
        fontSize="$sm"
        color={colors.secondary_text}
        textAlign="center"
        mt="$2"
        lineHeight="$lg"
      >
        Đã xảy ra lỗi khi tải thông tin yêu cầu bồi thường. Vui lòng thử lại sau.
      </Text>
    </VStack>
  );

  /**
   * Component hiển thị khi không tìm thấy claim
   */
  const NotFoundState = () => (
    <VStack flex={1} justifyContent="center" alignItems="center" p="$8">
      <Box
        bg={colors.warningSoft || colors.background}
        p="$6"
        borderRadius="$full"
        mb="$4"
      >
        <FileWarning size={48} color={colors.warning} strokeWidth={1.5} />
      </Box>
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        textAlign="center"
      >
        Không tìm thấy yêu cầu
      </Text>
      <Text
        fontSize="$sm"
        color={colors.secondary_text}
        textAlign="center"
        mt="$2"
        lineHeight="$lg"
      >
        Yêu cầu chi trả này không tồn tại hoặc đã bị xóa.
      </Text>
    </VStack>
  );

  /**
   * Render content dựa trên trạng thái
   */
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (isError) {
      return <ErrorState />;
    }

    if (!claim) {
      return <NotFoundState />;
    }

    return (
      <ClaimEventDetail
        claim={claim}
        onRefresh={refetch}
        isRefreshing={isRefetching}
      />
    );
  };

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title="Chi tiết yêu cầu bồi thường"
        showBackButton={true}
        onBack={() => router.back()}
      />

      {/* Main Content */}
      {renderContent()}
    </VStack>
  );
}

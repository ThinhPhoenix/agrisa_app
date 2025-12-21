import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { RegisterPolicyForm } from "@/domains/policy/components/register-policy-form";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { PolicyDetailResponse } from "@/domains/policy/models/policy.models";
import { Box, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import { AlertCircle } from "lucide-react-native";

export default function RegisterPolicyPage() {
  const { colors } = useAgrisaColors();
  const params = useLocalSearchParams();
  const policyId = params.id as string;

  const { getDetailBasePolicy } = usePolicy();
  const { data, isLoading, isError } = getDetailBasePolicy(policyId);

  const policyDetail = data?.data as PolicyDetailResponse | undefined;

  // Loading State
  if (isLoading) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Đơn đăng ký gói bảo hiểm" showBackButton={true} />
        <Box flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary} />
          <Text color={colors.secondary_text} mt="$3">
            Đang tải thông tin...
          </Text>
        </Box>
      </Box>
    );
  }

  // Error State
  if (isError || !policyDetail) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Đơn đăng ký gói bảo hiểm" showBackButton={true} />
        <Box flex={1} alignItems="center" justifyContent="center" px="$6">
          <Box bg={colors.errorSoft} p="$6" borderRadius="$full" mb="$4">
            <AlertCircle size={48} color={colors.error} />
          </Box>
          <VStack space="sm" alignItems="center">
            <Text
              fontSize="$lg"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Không tìm thấy thông tin gói bảo hiểm
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
            >
              Vui lòng thử lại hoặc liên hệ hỗ trợ
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Đơn đăng ký gói bảo hiểm" showBackButton={true} />
      <RegisterPolicyForm policyDetail={policyDetail} basePolicyId={policyId} />
    </Box>
  );
}

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import PublicBasePolicyScreen from "@/domains/policy/components/public-base-policy";
import { Box, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Info } from "lucide-react-native";

export default function PolicyHomeScreen() {
  const { colors } = useAgrisaColors();

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader title="Chương trình bảo hiểm" showBackButton={true} onBack={() => router.back()} />

      {/* Info Description */}
      <Box
        bg={colors.infoSoft}
        borderLeftWidth={3}
        borderLeftColor={colors.info}
        p="$3"
        mx="$4"
        mt="$4"
        borderRadius="$lg"
      >
        <VStack space="xs">
          <Box flexDirection="row" alignItems="center" mb="$1">
            <Info size={18} color={colors.info} strokeWidth={2} />
            <Text
              fontSize="$sm"
              fontWeight="$bold"
              color={colors.info}
              ml="$2"
            >
              Quản lý chương trình bảo hiểm
            </Text>
          </Box>
          <Text fontSize="$xs" color={colors.primary_text} lineHeight="$md">
            Khám phá các chương trình bảo hiểm nông nghiệp được cung cấp, đăng
            ký bảo hiểm cho trang trại của bạn, và theo dõi trạng thái đăng ký
            của các chương trình bảo hiểm.
          </Text>
        </VStack>
      </Box>

      {/* Main Content */}
      <PublicBasePolicyScreen />
    </VStack>
  );
}

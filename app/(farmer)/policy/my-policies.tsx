import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, ScrollView, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { FileText, Info } from "lucide-react-native";
import { RefreshControl } from "react-native";

export default function MyPoliciesScreen() {
  const { colors } = useAgrisaColors();

  // TODO: Implement actual data fetching
  // const { data, isLoading, isFetching, refetch } = useMyPolicies();

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title="Bảo hiểm của tôi"
        showBackButton={true}
        onBack={() => router.back()}
      />

      <ScrollView
        bg={colors.background}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            colors={[colors.success]}
            tintColor={colors.success}
          />
        }
      >
        <VStack space="md" p="$4">
          {/* Info Description */}
          <Box
            bg={colors.infoSoft}
            borderWidth={1}
            borderColor={colors.info}
            p="$3"
            borderRadius="$lg"
          >
            <VStack space="xs">
              <HStack alignItems="center" mb="$1">
                <Box
                  bg={colors.info}
                  p="$1"
                  borderRadius="$sm"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Info
                    size={14}
                    color={colors.white_button_text}
                    strokeWidth={2.5}
                  />
                </Box>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.info}
                  ml="$2"
                >
                  Bảo hiểm của tôi
                </Text>
              </HStack>
              <Text fontSize="$xs" color={colors.primary_text} lineHeight="$md">
                Quản lý các hợp đồng bảo hiểm đang hoạt động của bạn.
              </Text>
            </VStack>
          </Box>{" "}
          {/* Empty State - TODO: Replace with actual policy list */}
          <Box
            borderWidth={1}
            borderColor={colors.frame_border}
            borderRadius="$xl"
            p="$6"
            bg={colors.card_surface}
            alignItems="center"
            mt="$4"
          >
            <FileText
              size={48}
              color={colors.secondary_text}
              strokeWidth={1.5}
            />
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.primary_text}
              mt="$3"
            >
              Chưa có bảo hiểm
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
              mt="$1"
            >
              Bạn chưa đăng ký bảo hiểm nào. Hãy khám phá các chương trình bảo
              hiểm tại trang Trang chủ.
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

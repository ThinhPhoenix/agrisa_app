import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
    Box,
    HStack,
    ScrollView,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { History, Info } from "lucide-react-native";
import { RefreshControl } from "react-native";

export default function TransactionHistoryScreen() {
  const { colors } = useAgrisaColors();

  // TODO: Implement actual transaction history data fetching
  // const { data, isLoading, isFetching, refetch } = useTransactionHistory();

  return (
    <VStack flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader title="Lịch sử giao dịch" showBackButton={false} />

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
            borderLeftWidth={3}
            borderLeftColor={colors.info}
            p="$3"
            borderRadius="$lg"
          >
            <VStack space="xs">
              <HStack alignItems="center" mb="$1">
                <Info size={18} color={colors.info} strokeWidth={2} />
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={colors.info}
                  ml="$2"
                >
                  Lịch sử giao dịch
                </Text>
              </HStack>
              <Text fontSize="$xs" color={colors.primary_text} lineHeight="$md">
                Theo dõi toàn bộ lịch sử giao dịch thanh toán phí bảo hiểm, nhận
                bồi thường và các giao dịch tài chính khác.
              </Text>
            </VStack>
          </Box>

          {/* Empty State - TODO: Replace with actual transaction list */}
          <Box
            borderWidth={1}
            borderColor={colors.frame_border}
            borderRadius="$xl"
            p="$6"
            bg={colors.card_surface}
            alignItems="center"
            mt="$4"
          >
            <History size={48} color={colors.secondary_text} strokeWidth={1.5} />
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.primary_text}
              mt="$3"
            >
              Chưa có giao dịch
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
              mt="$1"
            >
              Lịch sử giao dịch của bạn sẽ được hiển thị ở đây khi có giao dịch
              mới.
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

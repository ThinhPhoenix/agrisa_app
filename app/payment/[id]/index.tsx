import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { PaymentDetail } from "@/domains/payment/components/Payment-Detail";
import { VStack } from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";

/**
 * Màn hình chi tiết giao dịch thanh toán
 * Route: /(tabs)/transaction-history/[id]
 */
export default function PaymentDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader title="Chi tiết giao dịch" showBackButton />
      {id && <PaymentDetail paymentId={id} />}
    </VStack>
  );
}

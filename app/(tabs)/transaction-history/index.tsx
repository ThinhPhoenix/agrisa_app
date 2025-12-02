import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { PaymentHistory } from "@/domains/payment/components/Payment-History";
import { VStack } from "@gluestack-ui/themed";

/**
 * Màn hình lịch sử giao dịch thanh toán
 * Hiển thị tất cả giao dịch của người dùng
 */
export default function TransactionHistoryScreen() {
  const { colors } = useAgrisaColors();

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader title="Lịch sử giao dịch" showBackButton={false} />
      <PaymentHistory />
    </VStack>
  );
}

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import {
    Box,
    HStack,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import {
    FileText,
    Package,
    Receipt
} from "lucide-react-native";
import { usePayment } from "../hooks/use-payment";

interface PaymentDetailProps {
  paymentId: string;
}

/**
 * Component hiển thị chi tiết giao dịch thanh toán
 */
export const PaymentDetail: React.FC<PaymentDetailProps> = ({ paymentId }) => {
  const { colors } = useAgrisaColors();
  const { getDetailPayment } = usePayment();
  const { data, isLoading, isError } = getDetailPayment(paymentId);

  const payment = data?.success ? data.data : null;

  if (isLoading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" py="$20">
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" fontSize="$sm" color={colors.secondary_text}>
          Đang tải thông tin giao dịch...
        </Text>
      </Box>
    );
  }

  if (isError || !payment) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" p="$8">
        <Box
          bg={colors.errorSoft}
          borderRadius="$full"
          p="$4"
          mb="$3"
        >
          <FileText size={32} color={colors.error} strokeWidth={1.5} />
        </Box>
        <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text} mb="$1">
          Không tìm thấy giao dịch
        </Text>
        <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
          Giao dịch không tồn tại hoặc đã bị xóa
        </Text>
      </Box>
    );
  }

  // Xác định loại giao dịch
  const isPremium = payment.type === 'policy_registration_payment';
  const isExpired = payment.status === 'expired';
  const isCompleted = payment.status === 'completed';
  const isExpense = isPremium;

  // Màu sắc theo loại giao dịch
  const statusColor = isExpired ? colors.muted_text : (isCompleted ? colors.success : colors.warning);
  const statusBgColor = isExpired ? colors.muted : (isCompleted ? colors.successSoft : colors.warningSoft);
  const amountColor = isExpired ? colors.muted_text : (isExpense ? colors.warning : colors.success);
  const amountBgColor = isExpired ? colors.muted : (isExpense ? colors.warningSoft : colors.successSoft);

  // Label trạng thái
  const statusLabel = payment.status === 'completed' ? 'Thành công' 
    : payment.status === 'expired' ? 'Hết hạn'
    : payment.status === 'pending' ? 'Đang chờ'
    : 'Đã hủy';

  return (
    <ScrollView>
      <VStack space="md" p="$4">
        {/* Header Card - Amount & Icon */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          p="$5"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <HStack space="md" alignItems="center">
            {/* Icon */}
            <Box
              bg={amountBgColor}
              borderRadius="$full"
              p="$3.5"
              w={60}
              h={60}
              alignItems="center"
              justifyContent="center"
            >
              <Receipt size={30} color={amountColor} strokeWidth={2} />
            </Box>

            {/* Amount */}
            <VStack flex={1}>
              <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
                {Utils.getPaymentTypeLabel(payment.type)}
              </Text>
              <Text fontSize="$2xl" fontWeight="$bold" color={amountColor}>
                {isExpired ? '' : (isExpense ? '-' : '+')}{Utils.formatCurrency(Number(payment.amount))}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Info Card */}
        <Box
          bg={colors.card_surface}
          borderRadius="$xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$4"
        >
          <VStack space="sm">
            {/* Trạng thái */}
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Trạng thái
              </Text>
              <Box
                bg={statusBgColor}
                borderRadius="$md"
                px="$3"
                py="$1.5"
              >
                <Text fontSize="$xs" fontWeight="$semibold" color={statusColor}>
                  {statusLabel}
                </Text>
              </Box>
            </HStack>

            <Box h={1} bg={colors.frame_border} />

            {/* Thời gian */}
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Thời gian
              </Text>
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                {isExpired 
                  ? Utils.formatStringVietnameseDate(payment.expired_at)
                  : Utils.formatStringVietnameseDate(payment.paid_at)
                }
              </Text>
            </HStack>

            <Box h={1} bg={colors.frame_border} />

            {/* Cập nhật cuối */}
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Cập nhật cuối
              </Text>
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                {Utils.formatStringVietnameseDate(payment.updated_at)}
              </Text>
            </HStack>

            <Box h={1} bg={colors.frame_border} />

            {/* Mô tả */}
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Mô tả
              </Text>
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                {payment.description}
              </Text>
            </HStack>

            <Box h={1} bg={colors.frame_border} />

            {/* Tổng phí */}
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Tổng phí
              </Text>
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                Miễn phí
              </Text>
            </HStack>

            <Box h={1} bg={colors.frame_border} />

            {/* Danh mục */}
            <HStack justifyContent="space-between" alignItems="flex-start" py="$2">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Danh mục
              </Text>
              <HStack space="xs" alignItems="center">
                <Package size={14} color={amountColor} />
                <Text fontSize="$sm" fontWeight="$semibold" color={amountColor}>
                  {Utils.getPaymentTypeLabel(payment.type)}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Thông tin bảo hiểm */}
        {payment.orderItems && payment.orderItems.length > 0 && (
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$4"
          >
            <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text} mb="$3">
              Thông tin bảo hiểm
            </Text>

            <VStack space="sm">
              {payment.orderItems.map((item, index) => (
                <Box key={item.id}>
                  {/* Tên bảo hiểm */}
                  <HStack justifyContent="space-between" alignItems="center" py="$2">
                    <Text fontSize="$sm" color={colors.secondary_text}>
                      Tên bảo hiểm
                    </Text>
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary}>
                      {item.name}
                    </Text>
                  </HStack>

                  <Box h={1} bg={colors.frame_border} />

                  {/* Mã bảo hiểm */}
                  <HStack justifyContent="space-between" alignItems="center" py="$2">
                    <Text fontSize="$sm" color={colors.secondary_text}>
                      Mã bảo hiểm
                    </Text>
                    <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                      {item.item_id}
                    </Text>
                  </HStack>

                  {index < payment.orderItems.length - 1 && (
                    <Box h={1} bg={colors.frame_border} my="$2" />
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </ScrollView>
  );
};

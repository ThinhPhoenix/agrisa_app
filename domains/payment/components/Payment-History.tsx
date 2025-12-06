import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import { useState } from "react";
import { RefreshControl } from "react-native";
import { usePayment } from "../hooks/use-payment";
import { PaymentStatusCode, PaymentTransaction } from "../models/payment.model";

interface PaymentHistoryProps {
  onRefresh?: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  onRefresh,
}) => {
  const { colors } = useAgrisaColors();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<
    "all" | "premium" | "compensation" | "expired"
  >("all");

  const { getAllPayment } = usePayment();
  const { data, isLoading, refetch, isRefetching } = getAllPayment();

  const payments = data?.success ? data.data.items : [];

  const handleRefresh = async () => {
    await refetch();
    onRefresh?.();
  };

  // Lọc transactions theo tab
  const filteredPayments = payments.filter((p) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "premium")
      return p.type === "policy_registration_payment";
    if (selectedTab === "compensation")
      return (
        p.type !== "policy_registration_payment" &&
        p.status.code === PaymentStatusCode.COMPLETED
      );
    if (selectedTab === "expired")
      return p.status.code === PaymentStatusCode.EXPIRED;
    return true;
  });

  // Tính tổng phí bảo hiểm (tiền ra)
  const totalPremium = payments
    .filter((p) => p.type === "policy_registration_payment")
    .reduce((sum, p) => sum + p.amount, 0);

  // Tính tổng bồi thường (tiền vào - chưa có trong data hiện tại)
  const totalCompensation = payments
    .filter(
      (p) =>
        p.type !== "policy_registration_payment" &&
        p.status.code === PaymentStatusCode.COMPLETED
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const getCategoryIcon = (payment: PaymentTransaction) => {
    // Nếu là phí bảo hiểm (tiền ra)
    if (payment.type === "policy_registration_payment") {
      return Receipt;
    }
    // Nếu là hết hạn
    if (payment.status.code === PaymentStatusCode.EXPIRED) {
      return Clock;
    }
    // Nếu là bồi thường (tiền vào)
    if (payment.status.code === PaymentStatusCode.COMPLETED) {
      return TrendingUp;
    }
    // Mặc định
    return Wallet;
  };

  const renderPayment = (payment: PaymentTransaction, index: number) => {
    // Phí bảo hiểm = tiền ra (màu cam), Bồi thường = tiền vào (màu xanh), Hết hạn (màu xám)
    const isPremium = payment.type === "policy_registration_payment";
    const isExpired = payment.status.code === PaymentStatusCode.EXPIRED;
    const isExpense = isPremium; // Phí bảo hiểm là chi phí
    const IconComponent = getCategoryIcon(payment);
    const TransactionDirectionIcon = isExpired
      ? Clock
      : isExpense
        ? ArrowUpRight
        : ArrowDownLeft;

    // Màu sắc theo loại giao dịch
    const bgColor = isExpired
      ? colors.errorSoft
      : isExpense
        ? colors.warningSoft
        : colors.successSoft;
    const iconColor = isExpired
      ? colors.muted_text
      : isExpense
        ? colors.warning
        : colors.success;
    const textColor = isExpired
      ? colors.muted_text
      : isExpense
        ? colors.warning
        : colors.success;

    return (
      <Box key={payment.id}>
        <Pressable
          py="$4"
          onPress={() => router.push(`/payment/${payment.id}`)}
        >
          <HStack space="md" alignItems="center">
            <Box position="relative">
              <Box
                bg={bgColor}
                borderRadius="$full"
                p="$2.5"
                w={44}
                h={44}
                alignItems="center"
                justifyContent="center"
              >
                <IconComponent size={20} color={iconColor} strokeWidth={2.5} />
              </Box>
              <Box
                position="absolute"
                bottom={-2}
                right={-2}
                bg={colors.background}
                borderRadius="$full"
                p="$0.5"
              >
                <Box bg={iconColor} borderRadius="$full" p="$1">
                  <TransactionDirectionIcon
                    size={10}
                    color={colors.primary_white_text}
                    strokeWidth={3}
                  />
                </Box>
              </Box>
            </Box>

            <VStack flex={1} space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {isPremium ? "Thanh toán phí bảo hiểm" : payment.status.label}
              </Text>

              <HStack space="sm" alignItems="center">
                <Text fontSize="$xs" color={colors.muted_text}>
                  {isExpired
                    ? Utils.formatStringVietnameseDateTime(payment.expired_at)
                    : Utils.formatStringVietnameseDateTime(payment.paid_at)}
                </Text>
              </HStack>
            </VStack>

            <VStack alignItems="flex-end" space="xs">
              <Text fontSize="$md" fontWeight="$bold" color={textColor}>
                {isExpired ? "" : isExpense ? "-" : "+"}
                {Utils.formatCurrency(payment.amount)}
              </Text>
              <Box bg={bgColor} borderRadius="$md" px="$2" py="$1">
                <Text fontSize="$2xs" fontWeight="$semibold" color={textColor}>
                  {payment.status.label}
                </Text>
              </Box>
            </VStack>
          </HStack>
        </Pressable>
        {index < filteredPayments.length - 1 && (
          <Box h={1} bg={colors.frame_border} />
        )}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" py="$20">
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" fontSize="$sm" color={colors.secondary_text}>
          Đang tải lịch sử giao dịch...
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <VStack space="md" p="$4">
        {/* Summary Cards */}
        <HStack space="sm">
          <Box
            flex={1}
            bg={colors.warningSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.warning}
          >
            <HStack space="xs" alignItems="center" mb="$2">
              <Receipt size={16} color={colors.warning} strokeWidth={2.5} />
              <Text
                fontSize="$xs"
                fontWeight="$semibold"
                color={colors.warning}
              >
                Phí chi trả bảo hiểm
              </Text>
            </HStack>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.warning}>
              {Utils.formatCurrency(totalPremium)}
            </Text>
            <Text fontSize="$2xs" color={colors.warning} mt="$1">
              {
                payments.filter((p) => p.type === "policy_registration_payment")
                  .length
              }{" "}
              giao dịch
            </Text>
          </Box>

          <Box
            flex={1}
            bg={colors.successSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.success}
          >
            <HStack space="xs" alignItems="center" mb="$2">
              <ArrowDownLeft
                size={16}
                color={colors.success}
                strokeWidth={2.5}
              />
              <Text
                fontSize="$xs"
                fontWeight="$semibold"
                color={colors.success}
              >
                Phí bảo hiểm bồi thường
              </Text>
            </HStack>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.success}>
              {Utils.formatCurrency(totalCompensation)}
            </Text>
            <Text fontSize="$2xs" color={colors.success} mt="$1">
              {
                payments.filter(
                  (p) =>
                    p.type !== "policy_registration_payment" &&
                    p.status.code === PaymentStatusCode.COMPLETED
                ).length
              }{" "}
              giao dịch
            </Text>
          </Box>
        </HStack>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space="sm">
            <Pressable onPress={() => setSelectedTab("all")}>
              <Box
                bg={
                  selectedTab === "all" ? colors.primary : colors.card_surface
                }
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={
                  selectedTab === "all" ? colors.primary : colors.frame_border
                }
                alignItems="center"
                minWidth={90}
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={
                    selectedTab === "all"
                      ? colors.primary_white_text
                      : colors.secondary_text
                  }
                >
                  Tất cả ({payments.length})
                </Text>
              </Box>
            </Pressable>

            <Pressable onPress={() => setSelectedTab("premium")}>
              <Box
                bg={
                  selectedTab === "premium"
                    ? colors.primary
                    : colors.card_surface
                }
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={
                  selectedTab === "premium"
                    ? colors.primary
                    : colors.frame_border
                }
                alignItems="center"
                minWidth={120}
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={
                    selectedTab === "premium"
                      ? colors.primary_white_text
                      : colors.secondary_text
                  }
                >
                  Phí bảo hiểm
                </Text>
              </Box>
            </Pressable>

            <Pressable onPress={() => setSelectedTab("compensation")}>
              <Box
                bg={
                  selectedTab === "compensation"
                    ? colors.primary
                    : colors.card_surface
                }
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={
                  selectedTab === "compensation"
                    ? colors.primary
                    : colors.frame_border
                }
                alignItems="center"
                minWidth={110}
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={
                    selectedTab === "compensation"
                      ? colors.primary_white_text
                      : colors.secondary_text
                  }
                >
                  Phí bồi thường
                </Text>
              </Box>
            </Pressable>

            <Pressable onPress={() => setSelectedTab("expired")}>
              <Box
                bg={
                  selectedTab === "expired"
                    ? colors.primary
                    : colors.card_surface
                }
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={
                  selectedTab === "expired"
                    ? colors.primary
                    : colors.frame_border
                }
                alignItems="center"
                minWidth={100}
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={
                    selectedTab === "expired"
                      ? colors.primary_white_text
                      : colors.secondary_text
                  }
                >
                  Khác
                </Text>
              </Box>
            </Pressable>
          </HStack>
        </ScrollView>

        {/* Payment List */}
        {filteredPayments.length > 0 ? (
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            px="$4"
            mt="$2"
          >
            {filteredPayments.map((payment, index) =>
              renderPayment(payment, index)
            )}
          </Box>
        ) : (
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$8"
            mt="$2"
            alignItems="center"
          >
            <Box bg={colors.primary} borderRadius="$full" p="$4" mb="$3">
              <Wallet
                size={32}
                color={colors.primary_white_text}
                strokeWidth={1.5}
              />
            </Box>
            <Text
              fontSize="$md"
              fontWeight="$bold"
              color={colors.primary_text}
              mb="$1"
            >
              Chưa có giao dịch
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
            >
              {selectedTab === "all"
                ? "Lịch sử giao dịch của bạn sẽ hiển thị tại đây"
                : selectedTab === "premium"
                  ? "Chưa có giao dịch phí bảo hiểm"
                  : selectedTab === "compensation"
                    ? "Chưa có giao dịch bồi thường"
                    : "Chưa có giao dịch hết hạn"}
            </Text>
          </Box>
        )}
      </VStack>
    </ScrollView>
  );
};
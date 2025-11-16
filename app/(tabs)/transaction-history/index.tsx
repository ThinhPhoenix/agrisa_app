import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard,
  TrendingUp,
  Wallet
} from "lucide-react-native";
import { useState } from "react";
import { RefreshControl } from "react-native";

interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'insurance' | 'compensation' | 'premium' | 'refund';
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionHistoryScreen() {
  const { colors } = useAgrisaColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'compensation' | 'premium'>('all');

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'Nhận bồi thường',
      description: 'Bồi thường thiệt hại - Gói Lúa Premium',
      amount: 2500000,
      type: 'income',
      category: 'compensation',
      timestamp: Date.now() / 1000 - 3600,
      status: 'completed',
    },
    {
      id: '2',
      title: 'Thanh toán phí bảo hiểm',
      description: 'Phí bảo hiểm tháng 11/2025',
      amount: -500000,
      type: 'expense',
      category: 'premium',
      timestamp: Date.now() / 1000 - 86400,
      status: 'completed',
    },
    {
      id: '3',
      title: 'Thanh toán phí bảo hiểm',
      description: 'Phí bảo hiểm tháng 10/2025',
      amount: -500000,
      type: 'expense',
      category: 'premium',
      timestamp: Date.now() / 1000 - 2592000,
      status: 'completed',
    },
    {
      id: '4',
      title: 'Nhận bồi thường',
      description: 'Bồi thường hạn hán - Gói Lúa Basic',
      amount: 1800000,
      type: 'income',
      category: 'compensation',
      timestamp: Date.now() / 1000 - 5184000,
      status: 'completed',
    },
    {
      id: '5',
      title: 'Hoàn tiền',
      description: 'Hoàn phí do hủy hợp đồng sớm',
      amount: 200000,
      type: 'income',
      category: 'refund',
      timestamp: Date.now() / 1000 - 7776000,
      status: 'completed',
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const filteredTransactions = transactions.filter(t => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'compensation') return t.type === 'income';
    if (selectedTab === 'premium') return t.type === 'expense';
    return true;
  });

  const totalCompensation = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPremium = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compensation':
        return TrendingUp;
      case 'premium':
        return CreditCard;
      case 'refund':
        return Wallet;
      default:
        return CreditCard;
    }
  };

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isIncome = transaction.type === 'income';
    const IconComponent = getCategoryIcon(transaction.category);
    const TransactionIcon = isIncome ? ArrowDownLeft : ArrowUpRight;

    return (
      <Box key={transaction.id}>
        <Pressable py="$4">
          <HStack space="md" alignItems="center">
            <Box position="relative">
              <Box
                bg={isIncome ? colors.successSoft : colors.errorSoft}
                borderRadius="$full"
                p="$2.5"
                w={44}
                h={44}
                alignItems="center"
                justifyContent="center"
              >
                <IconComponent 
                  size={20} 
                  color={isIncome ? colors.success : colors.error} 
                  strokeWidth={2.5} 
                />
              </Box>
              <Box
                position="absolute"
                bottom={-2}
                right={-2}
                bg={colors.background}
                borderRadius="$full"
                p="$0.5"
              >
                <Box
                  bg={isIncome ? colors.success : colors.error}
                  borderRadius="$full"
                  p="$1"
                >
                  <TransactionIcon 
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
                {transaction.title}
              </Text>
              <Text
                fontSize="$xs"
                color={colors.secondary_text}
              >
                {transaction.description}
              </Text>
              <Text fontSize="$xs" color={colors.muted_text}>
                {Utils.formatDateForMS(transaction.timestamp)}
              </Text>
            </VStack>

            <Text
              fontSize="$md"
              fontWeight="$bold"
              color={isIncome ? colors.success : colors.error}
            >
              {isIncome ? '+' : ''}{transaction.amount.toLocaleString('vi-VN')}đ
            </Text>
          </HStack>
        </Pressable>
        {index < filteredTransactions.length - 1 && (
          <Box h={1} bg={colors.frame_border} />
        )}
      </Box>
    );
  };

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader title="Lịch sử giao dịch" showBackButton={false} />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
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
              bg={colors.successSoft}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.success}
            >
              <HStack space="xs" alignItems="center" mb="$2">
                <ArrowDownLeft size={16} color={colors.success} strokeWidth={2.5} />
                <Text fontSize="$xs" fontWeight="$semibold" color={colors.success}>
                  Bồi thường
                </Text>
              </HStack>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.success}>
                {totalCompensation.toLocaleString('vi-VN')}đ
              </Text>
            </Box>

            <Box
              flex={1}
              bg={colors.errorSoft}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.error}
            >
              <HStack space="xs" alignItems="center" mb="$2">
                <ArrowUpRight size={16} color={colors.error} strokeWidth={2.5} />
                <Text fontSize="$xs" fontWeight="$semibold" color={colors.error}>
                  Phí bảo hiểm
                </Text>
              </HStack>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.error}>
                {totalPremium.toLocaleString('vi-VN')}đ
              </Text>
            </Box>
          </HStack>

          {/* Filter Tabs */}
          <HStack space="sm">
            <Pressable
              flex={1}
              onPress={() => setSelectedTab('all')}
            >
              <Box
                bg={selectedTab === 'all' ? colors.primary : colors.card_surface}
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={selectedTab === 'all' ? colors.primary : colors.frame_border}
                alignItems="center"
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={selectedTab === 'all' ? colors.primary_white_text : colors.secondary_text}
                >
                  Tất cả
                </Text>
              </Box>
            </Pressable>

            <Pressable
              flex={1}
              onPress={() => setSelectedTab('compensation')}
            >
              <Box
                bg={selectedTab === 'compensation' ? colors.primary : colors.card_surface}
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={selectedTab === 'compensation' ? colors.primary : colors.frame_border}
                alignItems="center"
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={selectedTab === 'compensation' ? colors.primary_white_text : colors.secondary_text}
                >
                  Bồi thường
                </Text>
              </Box>
            </Pressable>

            <Pressable
              flex={1}
              onPress={() => setSelectedTab('premium')}
            >
              <Box
                bg={selectedTab === 'premium' ? colors.primary : colors.card_surface}
                borderRadius="$full"
                py="$2"
                px="$4"
                borderWidth={1}
                borderColor={selectedTab === 'premium' ? colors.primary : colors.frame_border}
                alignItems="center"
              >
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={selectedTab === 'premium' ? colors.primary_white_text : colors.secondary_text}
                >
                  Phí bảo hiểm
                </Text>
              </Box>
            </Pressable>
          </HStack>

          {/* Transaction List */}
          {filteredTransactions.length > 0 ? (
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              borderWidth={1}
              borderColor={colors.frame_border}
              px="$4"
              mt="$2"
            >
              {filteredTransactions.map((transaction, index) => renderTransaction(transaction, index))}
            </Box>
          ) : (
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$8"
              alignItems="center"
              borderWidth={1}
              borderColor={colors.frame_border}
              mt="$2"
            >
              <Box
                bg={colors.primary}
                borderRadius="$full"
                p="$4"
                mb="$3"
              >
                <Wallet size={32} color={colors.primary_white_text} strokeWidth={1.5} />
              </Box>
              <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text} mb="$1">
                Chưa có giao dịch
              </Text>
              <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
                Giao dịch của bạn sẽ hiển thị tại đây
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </VStack>
  );
}

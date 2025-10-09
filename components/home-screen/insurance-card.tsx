import { useAgrisaColors } from "@/domains/agrisa-theme/hooks/use-agrisa-colors";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  VStack,
} from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import {
  CheckCircle,
  Clock,
  CloudRain,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useState } from "react";

interface InsuranceCard {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  status: "money" | "weather" | "success" | "pending";
  additionalInfo?: {
    label: string;
    value: string;
  }[];
}

const mockCards: InsuranceCard[] = [
  {
    id: "1",
    title: "Tổng số tiền bảo hiểm",
    value: "850.000.000",
    subtitle: "VNĐ",
    icon: DollarSign,
    status: "money",
    additionalInfo: [
      { label: "Số hợp đồng", value: "12" },
      { label: "Đã chi trả", value: "150.000.000 VNĐ" },
    ],
  },
  {
    id: "2",
    title: "Theo dõi thời tiết",
    value: "32°C",
    subtitle: "Nắng ít mây",
    icon: CloudRain,
    status: "weather",
    additionalInfo: [
      { label: "Độ ẩm", value: "68%" },
      { label: "Gió", value: "12 km/h" },
    ],
  },
  {
    id: "3",
    title: "Đơn thành công",
    value: "8",
    subtitle: "Hợp đồng đã phê duyệt",
    icon: CheckCircle,
    status: "success",
    additionalInfo: [
      { label: "Diện tích", value: "45.2 ha" },
      { label: "Giá trị BH", value: "680.000.000 VNĐ" },
    ],
  },
  {
    id: "4",
    title: "Đang chờ xử lý",
    value: "3",
    subtitle: "Đơn đang được xem xét",
    icon: Clock,
    status: "pending",
    additionalInfo: [
      { label: "Diện tích", value: "12.8 ha" },
      { label: "Thời gian chờ", value: "5 ngày" },
    ],
  },
];

export default function InsuranceCards() {
  const { colors } = useAgrisaColors();
  const [showMoney, setShowMoney] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "money":
        return colors.success;
      case "weather":
        return colors.info;
      case "success":
        return colors.success;
      case "pending":
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getWeatherIcon = () => {
    return <CloudRain size={24} color="white" />;
  };

  const formatMoney = (value: string) => {
    if (!showMoney) return "*********";
    return new Intl.NumberFormat("vi-VN").format(parseInt(value));
  };

  return (
    <VStack space="md" padding={20}>
      <Text color={colors.text} fontSize="$lg" fontWeight="600">
        Bảng điều khiển
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space="lg">
          {mockCards.map((card) => {
            const IconComponent = card.icon;
            const statusColor = getStatusColor(card.status);

            return (
              <Pressable key={card.id}>
                <Box
                  bg={colors.card}
                  padding={20}
                  borderRadius={20}
                  borderWidth={1}
                  borderColor={colors.border}
                  shadowColor={colors.shadow}
                  shadowOffset={{ width: 0, height: 6 }}
                  shadowOpacity={0.15}
                  shadowRadius={12}
                  elevation={6}
                  width={260}
                  minHeight={180}
                >
                  <VStack space="lg" flex={1}>
                    {/* Header với icon và toggle money */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Box
                        bg={statusColor}
                        padding={12}
                        borderRadius={16}
                        shadowColor={statusColor}
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.3}
                        shadowRadius={4}
                        elevation={3}
                      >
                        {card.status === "weather" ? (
                          getWeatherIcon()
                        ) : (
                          <IconComponent size={24} color="white" />
                        )}
                      </Box>

                      {card.status === "money" && (
                        <Pressable
                          onPress={() => setShowMoney(!showMoney)}
                          bg={colors.background}
                          padding={8}
                          borderRadius={12}
                          borderWidth={1}
                          borderColor={colors.border}
                        >
                          {showMoney ? (
                            <EyeOff size={16} color={colors.textSecondary} />
                          ) : (
                            <Eye size={16} color={colors.textSecondary} />
                          )}
                        </Pressable>
                      )}
                    </HStack>

                    {/* Title */}
                    <VStack space="xs">
                      <Text
                        color={colors.textSecondary}
                        fontSize="$sm"
                        fontWeight="500"
                      >
                        {card.title}
                      </Text>

                      {/* Main Value */}
                      <HStack alignItems="baseline" space="xs">
                        <Text
                          color={colors.text}
                          fontSize="$2xl"
                          fontWeight="bold"
                        >
                          {card.status === "money"
                            ? formatMoney(card.value)
                            : card.value}
                        </Text>
                        {card.subtitle && (
                          <Text
                            color={colors.textSecondary}
                            fontSize="$sm"
                            fontWeight="500"
                          >
                            {card.subtitle}
                          </Text>
                        )}
                      </HStack>
                    </VStack>

                    {/* Additional Info */}
                    {card.additionalInfo && (
                      <VStack space="xs">
                        {card.additionalInfo.map((info, index) => (
                          <HStack
                            key={index}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text
                              color={colors.textSecondary}
                              fontSize="$xs"
                              fontWeight="500"
                            >
                              {info.label}
                            </Text>
                            <Text
                              color={colors.text}
                              fontSize="$xs"
                              fontWeight="600"
                            >
                              {card.status === "money" &&
                              info.value.includes("VNĐ") &&
                              !showMoney
                                ? "***"
                                : info.value}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </Box>
              </Pressable>
            );
          })}
        </HStack>
      </ScrollView>
    </VStack>
  );
}

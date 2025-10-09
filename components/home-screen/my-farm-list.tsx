import { useAgrisaColors } from "@/domains/agrisa-theme/hooks/use-agrisa-colors";
import { Box, HStack, Pressable, VStack } from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Droplets,
  Leaf,
  MapPin,
} from "lucide-react-native";

interface FarmItem {
  id: string;
  name: string;
  location: string;
  status: "emergency" | "normal" | "good";
  date: string;
  area: string;
  crop: string;
  lastUpdate: string;
}

const mockFarms: FarmItem[] = [
  {
    id: "1",
    name: "Nông trại lúa A1",
    location: "Tỉnh An Giang",
    status: "emergency",
    date: "2025-09-15",
    area: "5.2 hecta",
    crop: "Lúa ST25",
    lastUpdate: "2 giờ trước",
  },
  {
    id: "2",
    name: "Vườn ngô B2",
    location: "Thành phố Cần Thơ",
    status: "good",
    date: "2025-09-10",
    area: "3.8 hecta",
    crop: "Ngô lai",
    lastUpdate: "5 giờ trước",
  },
  {
    id: "3",
    name: "Nông trại rau C3",
    location: "Tỉnh Đồng Tháp",
    status: "normal",
    date: "2025-09-12",
    area: "2.1 hecta",
    crop: "Rau cải",
    lastUpdate: "1 ngày trước",
  },
];

export default function MyFarmList() {
  const { colors } = useAgrisaColors();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "emergency":
        return {
          color: colors.error,
          text: "Khẩn cấp",
          icon: AlertTriangle,
          bgColor: colors.error,
        };
      case "good":
        return {
          color: colors.success,
          text: "Tốt",
          icon: Leaf,
          bgColor: colors.success,
        };
      default:
        return {
          color: colors.warning,
          text: "Bình thường",
          icon: Droplets,
          bgColor: colors.warning,
        };
    }
  };

  return (
    <VStack space="md" padding={20}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text color={colors.text} fontSize="$lg" fontWeight="600">
          Trang trại của tôi
        </Text>
        <Pressable>
          <Text color={colors.text} fontSize="$sm" fontWeight="500">
            Xem tất cả
          </Text>
        </Pressable>
      </HStack>

      <VStack space="md">
        {mockFarms.map((farm) => {
          const statusConfig = getStatusConfig(farm.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Pressable key={farm.id}>
              <Box
                bg={colors.card}
                padding={20}
                borderRadius={16}
                borderWidth={farm.status === "emergency" ? 2 : 1}
                borderColor={
                  farm.status === "emergency" ? colors.error : colors.border
                }
                shadowColor={
                  farm.status === "emergency" ? colors.error : colors.shadow
                }
                shadowOffset={{
                  width: 0,
                  height: farm.status === "emergency" ? 4 : 2,
                }}
                shadowOpacity={farm.status === "emergency" ? 0.3 : 0.1}
                shadowRadius={farm.status === "emergency" ? 8 : 4}
                elevation={farm.status === "emergency" ? 6 : 2}
              >
                <VStack space="md">
                  <HStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <VStack flex={1} space="xs">
                      <HStack alignItems="center" space="sm">
                        <Text
                          color={colors.text}
                          fontSize="$md"
                          fontWeight="600"
                        >
                          {farm.name}
                        </Text>
                        <Box
                          bg={statusConfig.bgColor}
                          paddingHorizontal={8}
                          paddingVertical={4}
                          borderRadius={8}
                        >
                          <HStack alignItems="center" space="xs">
                            <StatusIcon size={12} color="white" />
                            <Text color="white" fontSize="$xs" fontWeight="600">
                              {statusConfig.text}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>

                      <HStack alignItems="center" space="sm">
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text color={colors.textSecondary} fontSize="$sm">
                          {farm.location}
                        </Text>
                      </HStack>

                      <HStack justifyContent="space-between">
                        <HStack alignItems="center" space="sm">
                          <Calendar size={14} color={colors.textSecondary} />
                          <Text color={colors.textSecondary} fontSize="$sm">
                            {farm.date}
                          </Text>
                        </HStack>
                        <Text color={colors.textSecondary} fontSize="$sm">
                          {farm.area}
                        </Text>
                      </HStack>

                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          color={colors.pending}
                          fontSize="$sm"
                          fontWeight="500"
                        >
                          {farm.crop}
                        </Text>
                        <Text color={colors.textMuted} fontSize="$xs">
                          {farm.lastUpdate}
                        </Text>
                      </HStack>
                    </VStack>

                    <ChevronRight size={20} color={colors.textSecondary} />
                  </HStack>
                </VStack>
              </Box>
            </Pressable>
          );
        })}
      </VStack>
    </VStack>
  );
}

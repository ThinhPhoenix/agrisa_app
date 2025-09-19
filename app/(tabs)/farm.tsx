import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, Button, ButtonText, HStack, VStack } from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import { Link } from "expo-router";
import { Bell, MapPin, Search, TestTube, Wifi } from "lucide-react-native";

export default function ExploreScreen() {
  const { colors, isDark } = useAgrisaColors();

  return (
    <VStack flex={1} bg={colors.background} padding={20} space="lg">
      {/* Header */}
      <HStack alignItems="center" space="sm" marginTop={20}>
        <Search size={28} color={colors.primary} />
        <Text color={colors.text} fontSize="$2xl" fontWeight="bold">
          Trang trại của tôi
        </Text>
      </HStack>

      {/* Mô tả */}
      <Text color={colors.textSecondary} fontSize="$md" lineHeight={22}>
        🌾 Khám phá các tính năng hỗ trợ nông dân trong việc quản lý và bảo vệ
        mùa màng
      </Text>

      {/* Test Connection Card */}
      <Box
        bg={colors.card}
        padding={20}
        borderRadius={16}
        borderWidth={1}
        borderColor={colors.border}
        shadowColor={colors.shadow}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={3}
      >
        <HStack alignItems="center" space="md" marginBottom={12}>
          <Box bg={`${colors.primary}20`} padding={12} borderRadius={12}>
            <TestTube size={24} color={colors.primary} />
          </Box>
          <VStack flex={1}>
            <Text color={colors.text} fontSize="$lg" fontWeight="600">
              Kiểm tra kết nối
            </Text>
            <Text color={colors.textSecondary} fontSize="$sm">
              Test kết nối với máy chủ Agrisa
            </Text>
          </VStack>
        </HStack>

        <Link href="/ping-test" asChild>
          <Button
            bg={colors.success}
            borderRadius={10}
            shadowColor={colors.success}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.3}
            shadowRadius={4}
            elevation={2}
          >
            <HStack alignItems="center" space="sm">
              <Wifi size={16} color="white" />
              <ButtonText color={colors.textWhiteButton} fontWeight="600">
                🔍 Kiểm tra ngay
              </ButtonText>
            </HStack>
          </Button>
        </Link>
      </Box>

      {/* Các tính năng sắp có */}
      <VStack space="md">
        <Box
          bg={colors.card}
          padding={20}
          borderRadius={16}
          borderWidth={1}
          borderColor={colors.border}
          opacity={0.6}
        >
          <HStack alignItems="center" space="md" marginBottom={12}>
            <Box bg={`${colors.success}20`} padding={12} borderRadius={12}>
              <MapPin size={24} color={colors.success} />
            </Box>
            <VStack flex={1}>
              <Text color={colors.text} fontSize="$lg" fontWeight="600">
                Bản đồ nông trại
              </Text>
              <Text color={colors.textSecondary} fontSize="$sm">
                Quản lý vị trí và diện tích canh tác
              </Text>
            </VStack>
          </HStack>
          <Text color={colors.textMuted} fontSize="$sm" fontStyle="italic">
            🚧 Tính năng đang phát triển...
          </Text>
        </Box>

        <Box
          bg={colors.card}
          padding={20}
          borderRadius={16}
          borderWidth={1}
          borderColor={colors.border}
          opacity={0.6}
        >
          <HStack alignItems="center" space="md" marginBottom={12}>
            <Box bg={`${colors.warning}20`} padding={12} borderRadius={12}>
              <Bell size={24} color={colors.warning} />
            </Box>
            <VStack flex={1}>
              <Text color={colors.text} fontSize="$lg" fontWeight="600">
                Cảnh báo thời tiết
              </Text>
              <Text color={colors.textSecondary} fontSize="$sm">
                Nhận thông báo về điều kiện thời tiết
              </Text>
            </VStack>
          </HStack>
          <Text color={colors.textMuted} fontSize="$sm" fontStyle="italic">
            🚧 Tính năng đang phát triển...
          </Text>
        </Box>
      </VStack>

      {/* Footer info */}
      <Box
        bg={`${colors.primary}10`}
        padding={16}
        borderRadius={12}
        borderWidth={1}
        borderColor={`${colors.primary}30`}
        marginTop="auto"
      >
        <Text
          color={colors.primary}
          fontSize="$sm"
          textAlign="center"
          fontWeight="600"
        >
          💡 Mẹo: Thường xuyên kiểm tra kết nối để đảm bảo dữ liệu được đồng bộ
        </Text>
      </Box>
    </VStack>
  );
}

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, ScrollView, Text, VStack } from "@gluestack-ui/themed";
import { Image } from "expo-image";
import {
    Activity,
    BarChart3,
    Bell,
    Brain,
    CreditCard,
    Globe,
    Info,
    Link,
    Mail,
    Satellite,
    Shield,
    Smartphone,
    Users
} from "lucide-react-native";
import { Linking } from "react-native";

export default function AboutScreen() {
  const { colors } = useAgrisaColors();

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack space="xl" p="$6" pb="$8">
        {/* Logo & App Name */}
        <VStack space="md" alignItems="center" mt="$4">
          <Box
            w={120}
            h={120}
            borderRadius="$2xl"
            bg={colors.card_surface}
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor={colors.frame_border}
            shadowColor={colors.shadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
          >
            <Image
              source={require("@/assets/images/Logo/Agrisa_Logo.png")}
              style={{ width: 100, height: 100 }}
              contentFit="contain"
            />
          </Box>

          <VStack space="xs" alignItems="center">
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color={colors.primary_text}
            >
              Agrisa
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text}>
              Nền tảng bảo hiểm chỉ số nông nghiệp
            </Text>
          </VStack>

          {/* Version Badge */}
          <Box
            bg={colors.warningSoft}
            borderRadius="$full"
            px="$4"
            py="$2"
            borderWidth={1}
            borderColor={colors.warning}
          >
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.warning}>
              Phiên bản Testing - v1.0.0
            </Text>
          </Box>
        </VStack>

        {/* About Section */}
        <VStack space="md" mt="$4">
          <HStack space="sm" alignItems="center">
            <Box
              bg={colors.primary}
              borderRadius="$full"
              p="$2"
              w={32}
              h={32}
              alignItems="center"
              justifyContent="center"
            >
              <Info size={16} color={colors.primary_white_text} />
            </Box>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Giới thiệu
            </Text>
          </HStack>

          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <Text fontSize="$sm" color={colors.secondary_text} lineHeight="$xl">
              Agrisa là nền tảng kết nối giữa nông dân và các công ty bảo hiểm,
              cung cấp{" "}
              <Text fontWeight="$bold" color={colors.primary_text}>
                bảo hiểm chỉ số nông nghiệp
              </Text>{" "}
              dựa trên dữ liệu vệ tinh và các chỉ số môi trường.
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              lineHeight="$xl"
              mt="$3"
            >
              Chúng tôi đánh giá thiệt hại cây trồng thông qua các chỉ số như:
              độ ẩm đất, nhiệt độ, lượng mưa, chỉ số thực vật (NDVI), giúp quy
              trình bồi thường nhanh chóng và minh bạch.
            </Text>
          </Box>

          {/* Role Badge */}
          <Box
            bg={colors.infoSoft}
            borderRadius="$xl"
            p="$3"
            borderWidth={1}
            borderColor={colors.info}
          >
            <HStack space="sm" alignItems="center">
              <Link size={16} color={colors.info} />
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.info}>
                Nền tảng trung gian kết nối nông dân & bảo hiểm
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Features */}
        <VStack space="md">
          <HStack space="sm" alignItems="center">
            <Box
              bg={colors.success}
              borderRadius="$full"
              p="$2"
              w={32}
              h={32}
              alignItems="center"
              justifyContent="center"
            >
              <BarChart3 size={16} color={colors.primary_white_text} />
            </Box>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Tính năng chính
            </Text>
          </HStack>

          <VStack space="sm">
            {[
              {
                icon: Satellite,
                text: "Giám sát cây trồng qua dữ liệu vệ tinh",
              },
              {
                icon: Activity,
                text: "Phân tích chỉ số NDVI, độ ẩm, nhiệt độ",
              },
              { icon: Smartphone, text: "Đăng ký bảo hiểm dễ dàng trên app" },
              { icon: Brain, text: "AI đánh giá thiệt hại dựa trên chỉ số" },
              { icon: CreditCard, text: "Thanh toán & bồi thường nhanh chóng" },
              { icon: Bell, text: "Cảnh báo rủi ro & thời tiết bất lợi" },
            ].map((feature, index) => (
              <Box
                key={index}
                bg={colors.card_surface}
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor={colors.frame_border}
              >
                <HStack space="sm" alignItems="center">
                  <Box
                    bg={colors.primary}
                    borderRadius="$full"
                    p="$1.5"
                    w={28}
                    h={28}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <feature.icon size={14} color={colors.primary_white_text} />
                  </Box>
                  <Text fontSize="$sm" color={colors.primary_text} flex={1}>
                    {feature.text}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>

        {/* Testing Notice */}
        <Box
          bg={colors.warningSoft}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.warning}
        >
          <HStack space="sm" alignItems="center" mb="$2">
            <Shield size={18} color={colors.warning} />
            <Text fontSize="$md" fontWeight="$bold" color={colors.warning}>
              Phiên bản thử nghiệm
            </Text>
          </HStack>
          <Text fontSize="$sm" color={colors.warning} lineHeight="$lg">
            Đây là phiên bản testing dành cho mục đích thử nghiệm và đánh giá.
            Một số tính năng có thể chưa hoàn thiện hoặc thay đổi trong phiên
            bản chính thức.
          </Text>
        </Box>

        {/* Contact Info */}
        <VStack space="md">
          <HStack space="sm" alignItems="center">
            <Box
              bg={colors.info}
              borderRadius="$full"
              p="$2"
              w={32}
              h={32}
              alignItems="center"
              justifyContent="center"
            >
              <Mail size={16} color={colors.primary_white_text} />
            </Box>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Liên hệ
            </Text>
          </HStack>

          <VStack space="sm">
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <HStack space="sm" alignItems="center" mb="$2">
                <Mail size={16} color={colors.secondary_text} />
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Email hỗ trợ
                </Text>
              </HStack>
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                support@agrisa.vn
              </Text>
            </Box>

            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <HStack space="sm" alignItems="center" mb="$2">
                <Globe size={16} color={colors.secondary_text} />
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Website
                </Text>
              </HStack>
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary}
                onPress={() => Linking.openURL("https://agrisa.phrimp.io.vn/")}
                textDecorationLine="underline"
              >
                agrisa.phrimp.io.vn
              </Text>
            </Box>

            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <HStack space="sm" alignItems="center" mb="$2">
                <Users size={16} color={colors.secondary_text} />
                <Text fontSize="$sm" color={colors.secondary_text}>
                  Dành cho
                </Text>
              </HStack>
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                Nông dân & Đối tác bảo hiểm
              </Text>
            </Box>
          </VStack>
        </VStack>

        {/* Footer */}
        <VStack space="xs" alignItems="center" mt="$4">
          <Text fontSize="$xs" color={colors.muted_text} textAlign="center">
            © 2025 Agrisa. All rights reserved.
          </Text>
        </VStack>
      </VStack>
    </ScrollView>
  );
}

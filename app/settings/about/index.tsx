import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, Divider, HStack, Pressable, ScrollView, Text, VStack } from "@gluestack-ui/themed";
import { Image } from "expo-image";
import {
    Activity,
    BarChart3,
    Bell,
    Brain,
    CheckCircle2,
    CreditCard,
    Globe,
    Mail,
    MapPin,
    Phone,
    Satellite,
    Smartphone,
    Sparkles,
    Target,
    TrendingUp,
    Users
} from "lucide-react-native";
import { Linking } from "react-native";

export default function AboutScreen() {
  const { colors } = useAgrisaColors();

  const handleContactPress = (type: 'email' | 'website' | 'phone') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@agrisa.vn');
        break;
      case 'website':
        Linking.openURL('https://agrisa.phrimp.io.vn/');
        break;
      case 'phone':
        Linking.openURL('tel:+84123456789');
        break;
    }
  };

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack space="lg" pb="$8">
        {/* Hero Section - Gradient Header */}
        <Box
          bg={colors.primary}
          pt="$8"
          pb="$6"
          px="$6"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative circles */}
          <Box
            position="absolute"
            top={-40}
            right={-40}
            w={150}
            h={150}
            borderRadius="$full"
            bg={colors.primary_white_text}
            opacity={0.1}
          />
          <Box
            position="absolute"
            bottom={-20}
            left={-30}
            w={100}
            h={100}
            borderRadius="$full"
            bg={colors.primary_white_text}
            opacity={0.08}
          />

          <VStack space="lg" alignItems="center" zIndex={1}>
            {/* Logo with glow effect */}
            <Box
              w={100}
              h={100}
              borderRadius="$2xl"
              bg={colors.primary_white_text}
              alignItems="center"
              justifyContent="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.15}
              shadowRadius={12}
              elevation={8}
            >
              <Image
                source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                style={{ width: 80, height: 80 }}
                contentFit="contain"
              />
            </Box>

            <VStack space="xs" alignItems="center">
              <Text
                fontSize="$3xl"
                fontWeight="$bold"
                color={colors.primary_white_text}
              >
                Agrisa
              </Text>
              <Text
                fontSize="$md"
                color={colors.primary_white_text}
                opacity={0.9}
                textAlign="center"
                px="$4"
              >
                Nền tảng bảo hiểm chỉ số nông nghiệp thông minh
              </Text>
              <HStack space="xs" mt="$2" alignItems="center">
                <Text
                  fontSize="$sm"
                  color={colors.primary_white_text}
                  opacity={0.85}
                >
                  Phiên bản 1.0.0
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <VStack space="lg" mt="$2">
          <VStack space="lg" px="$3" mt="$2">
            {/* Mission Statement */}
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$5"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <HStack space="sm" alignItems="center" mb="$3">
                <Box
                  bg={colors.primary + "15"}
                  borderRadius="$lg"
                  p="$2"
                  w={36}
                  h={36}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Target size={20} color={colors.primary} />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Sứ mệnh của chúng tôi
                </Text>
              </HStack>

              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                lineHeight="$xl"
              >
                Agrisa kết nối nông dân với các công ty bảo hiểm, cung cấp giải
                pháp{" "}
                <Text fontWeight="$bold" color={colors.primary_text}>
                  bảo hiểm chỉ số nông nghiệp
                </Text>{" "}
                dựa trên công nghệ vệ tinh và AI, giúp nông dân an tâm canh tác
                và phát triển bền vững.
              </Text>
            </Box>

            {/* Value Propositions */}
            <VStack space="md">
              <HStack space="sm" alignItems="center">
                <Box
                  bg={colors.success + "15"}
                  borderRadius="$lg"
                  p="$2"
                  w={36}
                  h={36}
                  alignItems="center"
                  justifyContent="center"
                >
                  <TrendingUp size={20} color={colors.success} />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Giá trị cốt lõi
                </Text>
              </HStack>

              <HStack space="sm">
                {[
                  {
                    icon: CheckCircle2,
                    text: "Minh bạch",
                    color: colors.success,
                  },
                  {
                    icon: CheckCircle2,
                    text: "Nhanh chóng",
                    color: colors.info,
                  },
                  {
                    icon: CheckCircle2,
                    text: "Tin cậy",
                    color: colors.primary,
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    flex={1}
                    bg={item.color + "10"}
                    borderRadius="$lg"
                    p="$3"
                    borderWidth={1}
                    borderColor={item.color + "30"}
                    alignItems="center"
                  >
                    <item.icon size={18} color={item.color} strokeWidth={2.5} />
                    <Text
                      fontSize="$xs"
                      fontWeight="$semibold"
                      color={item.color}
                      mt="$1"
                      textAlign="center"
                    >
                      {item.text}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </VStack>

            {/* Key Features */}
            <VStack space="md">
              <HStack space="sm" alignItems="center">
                <Box
                  bg={colors.primary + "15"}
                  borderRadius="$lg"
                  p="$2"
                  w={36}
                  h={36}
                  alignItems="center"
                  justifyContent="center"
                >
                  <BarChart3 size={20} color={colors.primary} />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Tính năng nổi bật
                </Text>
              </HStack>

              <VStack space="sm">
                {[
                  {
                    icon: Satellite,
                    title: "Giám sát vệ tinh",
                    desc: "Theo dõi tình trạng cây trồng 24/7",
                    color: colors.primary,
                  },
                  {
                    icon: Activity,
                    title: "Phân tích chỉ số",
                    desc: "NDVI, độ ẩm, nhiệt độ chính xác",
                    color: colors.success,
                  },
                  {
                    icon: Brain,
                    title: "Đánh giá AI",
                    desc: "Phát hiện thiệt hại tự động",
                    color: colors.info,
                  },
                  {
                    icon: Smartphone,
                    title: "Đăng ký dễ dàng",
                    desc: "Thao tác đơn giản trên app",
                    color: colors.warning,
                  },
                  {
                    icon: CreditCard,
                    title: "Thanh toán nhanh",
                    desc: "Bồi thường trong vài ngày",
                    color: colors.success,
                  },
                  {
                    icon: Bell,
                    title: "Cảnh báo rủi ro",
                    desc: "Thông báo thời tiết bất lợi",
                    color: colors.error,
                  },
                ].map((feature, index) => (
                  <Box
                    key={index}
                    bg={colors.card_surface}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        bg={feature.color + "15"}
                        borderRadius="$lg"
                        p="$2.5"
                        w={44}
                        h={44}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <feature.icon
                          size={20}
                          color={feature.color}
                          strokeWidth={2}
                        />
                      </Box>
                      <VStack flex={1} space="xs">
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={colors.primary_text}
                        >
                          {feature.title}
                        </Text>
                        <Text
                          fontSize="$xs"
                          color={colors.secondary_text}
                          lineHeight="$sm"
                        >
                          {feature.desc}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>

            <Divider bg={colors.frame_border} my="$2" />

            {/* Contact Information */}
            <VStack space="md">
              <HStack space="sm" alignItems="center">
                <Box
                  bg={colors.info + "15"}
                  borderRadius="$lg"
                  p="$2"
                  w={36}
                  h={36}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Mail size={20} color={colors.info} />
                </Box>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Liên hệ với chúng tôi
                </Text>
              </HStack>

              <VStack space="sm">
                <Pressable onPress={() => handleContactPress("email")}>
                  {({ pressed }) => (
                    <Box
                      bg={colors.card_surface}
                      borderRadius="$xl"
                      p="$4"
                      borderWidth={1}
                      borderColor={colors.frame_border}
                      opacity={pressed ? 0.7 : 1}
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          bg={colors.error + "15"}
                          borderRadius="$lg"
                          p="$2.5"
                          w={40}
                          h={40}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Mail size={18} color={colors.error} />
                        </Box>
                        <VStack flex={1}>
                          <Text
                            fontSize="$xs"
                            color={colors.secondary_text}
                            mb="$1"
                          >
                            Email hỗ trợ
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            support@agrisa.vn
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                </Pressable>

                <Pressable onPress={() => handleContactPress("website")}>
                  {({ pressed }) => (
                    <Box
                      bg={colors.card_surface}
                      borderRadius="$xl"
                      p="$4"
                      borderWidth={1}
                      borderColor={colors.frame_border}
                      opacity={pressed ? 0.7 : 1}
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          bg={colors.primary + "15"}
                          borderRadius="$lg"
                          p="$2.5"
                          w={40}
                          h={40}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Globe size={18} color={colors.primary} />
                        </Box>
                        <VStack flex={1}>
                          <Text
                            fontSize="$xs"
                            color={colors.secondary_text}
                            mb="$1"
                          >
                            Website
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary}
                          >
                            agrisa.phrimp.io.vn
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                </Pressable>

                <Pressable onPress={() => handleContactPress("phone")}>
                  {({ pressed }) => (
                    <Box
                      bg={colors.card_surface}
                      borderRadius="$xl"
                      p="$4"
                      borderWidth={1}
                      borderColor={colors.frame_border}
                      opacity={pressed ? 0.7 : 1}
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          bg={colors.success + "15"}
                          borderRadius="$lg"
                          p="$2.5"
                          w={40}
                          h={40}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Phone size={18} color={colors.success} />
                        </Box>
                        <VStack flex={1}>
                          <Text
                            fontSize="$xs"
                            color={colors.secondary_text}
                            mb="$1"
                          >
                            Hotline
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            0377744322
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                </Pressable>
              </VStack>
            </VStack>

            {/* User Type Badge */}
            <Box
              bg={colors.primary + "10"}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.primary + "30"}
            >
              <HStack space="sm" alignItems="center" justifyContent="center">
                
                <Text fontSize="$sm" fontWeight="$bold" color={colors.primary}>
                  Dành riêng cho nông dân Việt Nam
                </Text>
              </HStack>
            </Box>

            {/* Footer */}
            <VStack space="sm" alignItems="center" mt="$4" mb="$2">
              <Divider bg={colors.frame_border} w="50%" />
              <Text fontSize="$xs" color={colors.muted_text} textAlign="center">
                © 2025 Agrisa Platform
              </Text>
              <Text
                fontSize="$2xs"
                color={colors.muted_text}
                textAlign="center"
              >
                Bảo vệ mùa màng - An tâm canh tác
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}

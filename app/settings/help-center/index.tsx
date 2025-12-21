import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Pressable, ScrollView, Text, VStack } from "@gluestack-ui/themed";
import { Image } from "expo-image";
import {
    AlertCircle,
    BookOpen,
    ChevronRight,
    CreditCard,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Settings,
    Shield,
    Users
} from "lucide-react-native";
import { useState } from "react";
import { Linking } from "react-native";

export default function HelpCenterScreen() {
  const { colors } = useAgrisaColors();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "Bảo hiểm chỉ số nông nghiệp là gì?",
      answer: "Bảo hiểm chỉ số nông nghiệp là loại bảo hiểm dựa trên các chỉ số đo lường như độ ẩm đất, nhiệt độ, lượng mưa, chỉ số NDVI từ vệ tinh. Khi chỉ số vượt ngưỡng quy định, bạn sẽ được bồi thường tự động, không cần giám định hiện trường."
    },
    {
      question: "Làm sao để đăng ký bảo hiểm?",
      answer: "1. Hoàn tất xác thực tài khoản (CCCD & khuôn mặt)\n2. Khai báo thông tin nông trại và cây trồng\n3. Chọn gói bảo hiểm phù hợp\n4. Thanh toán phí bảo hiểm\n5. Nhận hợp đồng điện tử qua email"
    },
    {
      question: "Agrisa có phải là công ty bảo hiểm không?",
      answer: "Không. Agrisa là nền tảng trung gian kết nối nông dân với các công ty bảo hiểm uy tín. Chúng tôi cung cấp công nghệ đánh giá rủi ro và xử lý claims tự động, giúp quy trình nhanh chóng và minh bạch hơn."
    },
    {
      question: "Tôi được bồi thường khi nào?",
      answer: "Bồi thường tự động khi các chỉ số môi trường vượt ngưỡng thiệt hại đã thỏa thuận trong hợp đồng. Ví dụ: hạn hán kéo dài, lượng mưa quá lớn, nhiệt độ cực đoan. Hệ thống AI của chúng tôi theo dõi liên tục và thông báo ngay khi có rủi ro."
    },
    {
      question: "Phí bồi thường bảo hiểm được tính như thế nào?",
      answer: "Phí dựa trên: loại cây trồng, diện tích, vị trí địa lý, thời gian bảo hiểm, và mức độ rủi ro từ dữ liệu lịch sử. Hệ thống AI phân tích và đưa ra mức phí hợp lý nhất. Bạn có thể xem chi tiết trước khi quyết định."
    },
    {
      question: "App có miễn phí không?",
      answer: "App hoàn toàn miễn phí tải và sử dụng. Bạn chỉ trả phí bảo hiểm khi quyết định mua gói. Phiên bản testing hiện tại có thể có ưu đãi đặc biệt cho người dùng đầu tiên."
    }
  ];

  const quickActions = [
    
    {
      icon: Phone,
      title: "Gọi điện",
      description: "1900-xxxx (8:00 - 20:00)",
      onPress: () => Linking.openURL("tel:1900000000")
    },
    {
      icon: Mail,
      title: "Gửi email",
      description: "support@agrisa.vn",
      onPress: () => Linking.openURL("mailto:support@agrisa.vn")
    }
  ];

  const guideTopics = [
    { icon: BookOpen, title: "Hướng dẫn đăng ký", description: "Cách tạo tài khoản và xác thực" },
    { icon: Shield, title: "Chính sách bảo hiểm", description: "Điều khoản và quyền lợi" },
    { icon: CreditCard, title: "Thanh toán & bồi thường", description: "Cách thức và thời gian" },
    { icon: Settings, title: "Cài đặt tài khoản", description: "Quản lý thông tin cá nhân" }
  ];

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack space="xl" p="$6" pb="$8">
        {/* Header */}
        <VStack space="md" alignItems="center" mt="$4">
          <Box
            w={80}
            h={80}
            borderRadius="$2xl"
            bg={colors.card_surface}
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <Image
              source={require("@/assets/images/Logo/Agrisa_Logo.png")}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
          </Box>

          <VStack space="xs" alignItems="center">
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary_text}>
              Trung tâm trợ giúp
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </Text>
          </VStack>
        </VStack>

        {/* Testing Notice */}
        <Box
          bg={colors.warningSoft}
          borderRadius="$xl"
          p="$3"
          borderWidth={1}
          borderColor={colors.warning}
        >
          <HStack space="sm" alignItems="center">
            <AlertCircle size={16} color={colors.warning} />
            <Text fontSize="$xs" fontWeight="$semibold" color={colors.warning} flex={1}>
              Phiên bản Testing - Một số tính năng đang phát triển
            </Text>
          </HStack>
        </Box>

        {/* Quick Contact */}
        <VStack space="md">
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
              <Phone size={16} color={colors.primary_white_text} />
            </Box>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Liên hệ nhanh
            </Text>
          </HStack>

          <VStack space="sm">
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                onPress={action.onPress}
              >
                <Box
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <HStack space="md" alignItems="center">
                    <Box
                      bg={colors.primary}
                      borderRadius="$full"
                      p="$2.5"
                      w={40}
                      h={40}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <action.icon size={20} color={colors.primary_white_text} />
                    </Box>
                    
                    <VStack flex={1}>
                      <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
                        {action.title}
                      </Text>
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        {action.description}
                      </Text>
                    </VStack>

                    <ChevronRight size={20} color={colors.muted_text} />
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        </VStack>

        {/* FAQ Section */}
        <VStack space="md" mt="$2">
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
              <HelpCircle size={16} color={colors.primary_white_text} />
            </Box>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
              Câu hỏi thường gặp
            </Text>
          </HStack>

          <VStack space="sm">
            {faqData.map((faq, index) => (
              <Pressable
                key={index}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <Box
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={1}
                  borderColor={expandedFaq === index ? colors.primary : colors.frame_border}
                >
                  <HStack space="sm" alignItems="center">
                    <HelpCircle 
                      size={18} 
                      color={expandedFaq === index ? colors.primary : colors.secondary_text} 
                    />
                    <Text 
                      fontSize="$sm" 
                      fontWeight="$semibold" 
                      color={colors.primary_text}
                      flex={1}
                    >
                      {faq.question}
                    </Text>
                    <ChevronRight 
                      size={18} 
                      color={colors.muted_text}
                      style={{
                        transform: [{ rotate: expandedFaq === index ? '90deg' : '0deg' }]
                      }}
                    />
                  </HStack>

                  {expandedFaq === index && (
                    <Box mt="$3" pt="$3" borderTopWidth={1} borderTopColor={colors.frame_border}>
                      <Text fontSize="$sm" color={colors.secondary_text} lineHeight="$lg">
                        {faq.answer}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Pressable>
            ))}
          </VStack>
        </VStack>

        

        {/* Footer */}
        <VStack space="xs" alignItems="center" mt="$4">
          <Text fontSize="$xs" color={colors.muted_text} textAlign="center">
            Không tìm thấy câu trả lời?
          </Text>
          <Text 
            fontSize="$sm" 
            fontWeight="$semibold" 
            color={colors.primary}
            onPress={() => Linking.openURL("mailto:support@agrisa.vn")}
            textDecorationLine="underline"
          >
            Liên hệ với chúng tôi
          </Text>
        </VStack>
      </VStack>
    </ScrollView>
  );
}

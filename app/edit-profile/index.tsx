import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ChevronRight, CreditCard, Phone, User } from "lucide-react-native";
import React from "react";

/**
 * ============================================
 * 📋 MENU CHỈNH SỬA THÔNG TIN CÁ NHÂN
 * ============================================
 * Trang menu với 4 tuỳ chọn để chỉnh sửa:
 * 1. Thông tin cá nhân
 * 2. Thông tin ngân hàng
 * 3. Thay đổi số điện thoại
 */

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
}

export default function EditProfileScreen() {
  const { colors } = useAgrisaColors();

  const menuOptions: MenuOption[] = [
    {
      id: "personal-info",
      title: "Thông tin cá nhân",
      description: "Họ tên, ngày sinh, giới tính, địa chỉ",
      icon: User,
      route: "/edit-profile/personal-info",
      color: colors.primary,
    },
    {
      id: "bank-info",
      title: "Thông tin ngân hàng",
      description: "Số tài khoản, tên chủ tài khoản, ngân hàng",
      icon: CreditCard,
      route: "/edit-profile/bank-info",
      color: colors.primary,
    },
    {
      id: "phone-change",
      title: "Thay đổi số điện thoại",
      description: "Cập nhật số điện thoại đăng nhập",
      icon: Phone,
      route: "/edit-profile/phone-change",
      color: colors.primary,
    },
  ];

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <>
      <AgrisaHeader title="Chỉnh sửa thông tin" />
      <ScrollView flex={1} bg={colors.background}>
        <VStack p="$4" space="lg" pb="$8">
          {/* Header */}
          <Box>
            <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
              Chỉnh sửa thông tin
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text} mt="$2">
              Chọn mục bạn muốn cập nhật thông tin
            </Text>
          </Box>

          {/* Menu Options */}
          <VStack space="md">
            {menuOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleMenuPress(option.route)}
              >
                {({ pressed }) => (
                  <Box
                    bg={colors.card_surface}
                    borderRadius="$xl"
                    p="$4"
                    shadowColor="$black"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={0.1}
                    shadowRadius={12}
                    elevation={5}
                    opacity={pressed ? 0.7 : 1}
                    transform={[{ scale: pressed ? 0.98 : 1 }]}
                  >
                    <HStack space="md" alignItems="center">
                      {/* Icon */}
                      <Box bg={`${option.color}15`} p="$3" borderRadius="$lg">
                        <option.icon size={24} color={option.color} />
                      </Box>

                      {/* Content */}
                      <VStack flex={1} space="xs">
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                        >
                          {option.title}
                        </Text>
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          {option.description}
                        </Text>
                      </VStack>

                      {/* Arrow */}
                      <ChevronRight size={20} color={colors.muted_text} />
                    </HStack>
                  </Box>
                )}
              </Pressable>
            ))}
          </VStack>
        </VStack>
      </ScrollView>
    </>
  );
}

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  HStack,
  Image,
  Input,
  InputField,
  Pressable,
  VStack,
} from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import { Bell, Menu } from "lucide-react-native";
import { useState } from "react";
import UserDrawer from "./UserDrawer/UserDrawer";

export default function HomeHeader() {
  const { colors } = useAgrisaColors();
  const [searchValue, setSearchValue] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSearch = (text: string) => {
    setSearchValue(text);
    console.log("Tìm kiếm trong Agrisa:", text);
  };

  const openDrawer = () => {
    console.log("Mở drawer menu"); // Debug log
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    console.log("Đóng drawer menu"); // Debug log
    setIsDrawerOpen(false);
  };

  return (
    <>
      <VStack space="lg" paddingHorizontal={20}>
        {/* Header với Logo và Greeting */}
        <Box position="relative" width="100%">
          <HStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {/* Logo Agrisa */}
            <HStack alignItems="center" space="xs">
              <Image
                source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                alt="Logo Agrisa - Bảo hiểm nông nghiệp"
                width={80}
                height={48}
                resizeMode="contain"
                borderRadius={8}
              />
              <VStack space="xs">
                <Text
                  color={colors.text}
                  fontSize="$xl"
                  fontWeight="bold"
                  lineHeight={24}
                >
                  Agrisa
                </Text>
              </VStack>
            </HStack>

            {/* Lời chào người dùng */}
            <VStack alignItems="flex-end" space="xs">
              <Text
                color={colors.textSecondary}
                fontSize="$sm"
                fontWeight="500"
                textAlign="right"
              >
                Xin chào,
              </Text>
              <Text
                color={colors.text}
                fontSize="$lg"
                fontWeight="bold"
                textAlign="right"
              >
                Nguyễn Văn A
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Thanh tìm kiếm và nút action */}
        <HStack space="md" alignItems="center">
          <Box flex={1}>
            <Input
              bg={colors.card}
              borderColor={colors.border}
              borderRadius={16}
              size="md"
              shadowColor={colors.shadow}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.08}
              shadowRadius={6}
              elevation={3}
            >
              <InputField
                placeholder="Tìm kiếm bảo hiểm và trang trại..."
                placeholderTextColor={colors.textSecondary}
                color={colors.text}
                value={searchValue}
                onChangeText={handleSearch}
                fontSize="$md"
                paddingHorizontal={16}
              />
            </Input>
          </Box>

          {/* Nút thông báo */}
          <Pressable
            bg={colors.card}
            width={40}
            height={40}
            borderRadius={20}
            borderWidth={1}
            borderColor={colors.border}
            shadowColor={colors.shadow}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={2}
            alignItems="center"
            justifyContent="center"
          >
            <Bell size={20} color={colors.text} />
            {/* Badge thông báo */}
            <Box
              position="absolute"
              top={-2}
              right={-2}
              bg={colors.error}
              width={16}
              height={16}
              borderRadius={8}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" fontSize="$xs" fontWeight="bold">
                3
              </Text>
            </Box>
          </Pressable>

          {/* Nút menu - Mở drawer */}
          <Pressable
            onPress={openDrawer} // Đảm bảo function được gọi
            bg={colors.card}
            width={40}
            height={40}
            borderRadius={20}
            borderWidth={1}
            borderColor={colors.border}
            shadowColor={colors.shadow}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={2}
            alignItems="center"
            justifyContent="center"
            // Thêm highlight khi nhấn
            android_ripple={{ color: colors.primary, borderless: true }}
          >
            <Menu size={20} color={colors.text} />
          </Pressable>
        </HStack>
      </VStack>

      {/* User Drawer - Đảm bảo render */}
      <UserDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
}

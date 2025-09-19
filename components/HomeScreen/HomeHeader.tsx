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
import { Bell, Leaf, Menu } from "lucide-react-native";
import { useState } from "react";

export default function HomeHeader() {
  const { colors, isDark } = useAgrisaColors();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (text: string) => {
    setSearchValue(text);
    // Xử lý logic tìm kiếm ở đây
    console.log("Tìm kiếm:", text);
  };

  return (
    <VStack space="lg" paddingHorizontal={20}>
      {/* Header với Logo bên trái và Greeting bên phải */}
      <Box position="relative" width="100%">
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          {/* Logo và tên Agrisa bên trái */}
          <HStack alignItems="center" space="sm">
            
              <Image
                source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                alt="Logo"
                width={70}
                          height={40}
                          
              />
            <VStack>
              <Text
                color={colors.text}
                fontSize="$xl"
                fontWeight="bold"
                className="italic"
              >
                Agrisa
              </Text>
              <Text
                color={colors.textSecondary}
                fontSize="$xs"
                fontWeight="500"
              >
                Bảo hiểm nông nghiệp
              </Text>
            </VStack>
          </HStack>

          {/* Greeting bên phải */}
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

      {/* Search Bar và Action Buttons */}
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

        {/* Notification Button - Hình tròn */}
        <Pressable
          bg={colors.card}
          width={40}
          height={40}
          borderRadius={20} // Hình tròn hoàn toàn
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

        {/* Menu Button - Hình tròn */}
        <Pressable
          bg={colors.card}
          width={40}
          height={40}
          borderRadius={20} // Hình tròn hoàn toàn
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
          <Menu size={20} color={colors.text} />
        </Pressable>
      </HStack>
    </VStack>
  );
}

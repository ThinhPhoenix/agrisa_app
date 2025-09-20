import ThemeToggle from "@/components/theme/ThemeSetting";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    Box,
    HStack,
    VStack,
} from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import { router } from "expo-router";
import {
    ChevronRight,
    HelpCircle,
    LogOut,
    Settings,
    Shield,
    X
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDrawer({ isOpen, onClose }: UserDrawerProps) {
  const { colors } = useAgrisaColors();
  const { width: screenWidth } = useWindowDimensions();

  // Animation values
  const translateX = useSharedValue(screenWidth);
  const backdropOpacity = useSharedValue(0);

  // Menu items tối ưu cho nông dân Việt Nam
  const menuItems = [
    {
      id: 1,
      title: "Cấu hình",
      icon: Settings,
      hasNew: true, // Badge "NEW" như trong reference
      onPress: () => {
        console.log("⚙️ Mở cài đặt Agrisa");
        onClose();
      },
    },
    {
      id: 2,
      title: "Bảo mật",
      icon: Shield,
      onPress: () => {
        console.log("🔒 Cài đặt bảo mật");
        onClose();
      },
    },
    {
      id: 3,
      title: "Hỗ trợ khách hàng",
      icon: HelpCircle,
      onPress: () => {
        console.log("📞 Liên hệ hỗ trợ");
        onClose();
      },
    },
  ];

  const onUserPress = () => {
    console.log("📝 Mở hồ sơ nông dân");
    onClose();
  };

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(screenWidth, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, screenWidth]);

  // Animated styles
  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          backdropAnimatedStyle,
        ]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          android_ripple={{ color: "transparent" }}
        />
      </Animated.View>

      {/* Drawer Content */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            width: screenWidth * 0.82,
            height: "100%",
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 16,
          },
          drawerAnimatedStyle,
        ]}
      >
        {/* Close Button */}
        <Box position="absolute" top={50} right={20} zIndex={10}>
          <Pressable onPress={onClose}>
            <X size={30} color={colors.text} />
          </Pressable>
        </Box>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* User Profile Section */}
          <VStack space="lg" paddingTop={90} paddingHorizontal={20}>
            <Pressable onPress={onUserPress}>
              <HStack alignItems="center" space="md">
                <Avatar size="lg" bg={colors.border}>
                  <AvatarFallbackText color={colors.text}>
                    Võ Thanh Nhân
                  </AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                    }}
                    alt="Avatar nông dân Agrisa"
                  />
                </Avatar>

                <VStack flex={1} justifyContent="center" space="xs">
                  <Text color={colors.text} fontSize="$xl" fontWeight="bold">
                    VÕ THANH NHÂN
                  </Text>
                  <Text color={colors.textSecondary} fontSize="$sm">
                    Hồ sơ người dùng
                  </Text>
                </VStack>

                <ChevronRight size={20} color={colors.textSecondary} />
              </HStack>
            </Pressable>

            {/* Divider */}
            <Box height={1} bg={colors.border} width="100%" marginTop={10} />

            {/* Menu Items */}
            <VStack space="xs">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Pressable key={item.id} onPress={item.onPress}>
                    <HStack
                      alignItems="center"
                      space="md"
                      paddingVertical={16}
                      paddingHorizontal={4}
                    >
                      <Box padding={8} borderRadius={8}>
                        <IconComponent size={22} color={colors.success} />
                      </Box>

                      <Text
                        color={colors.text}
                        fontSize="$md"
                        fontWeight="500"
                        flex={1}
                      >
                        {item.title}
                      </Text>

                      {item.hasNew && (
                        <Box
                          bg={colors.error}
                          paddingHorizontal={8}
                          paddingVertical={2}
                          borderRadius={12}
                        >
                          <Text color="white" fontSize="$xs" fontWeight="600">
                            NEW
                          </Text>
                        </Box>
                      )}

                      <ChevronRight size={16} color={colors.textSecondary} />
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>

            <Box>
              <ThemeToggle />
            </Box>

            <Box height={1} bg={colors.border} width="100%" marginVertical={16} />


            {/* Logout */}
            <Pressable
              onPress={() => {
                router.push("/auth/signin")
                onClose();
              }}
            >
                
              <HStack
                alignItems="center"
                space="md"
                paddingHorizontal={4}
              >
                <Box padding={8} borderRadius={8}>
                  <LogOut size={18} color={colors.error} />
                </Box>
                <Text color={colors.error} fontSize="$md" fontWeight="500">
                  Đăng xuất
                </Text>
              </HStack>
            </Pressable>

            {/* Version Info - Bottom center */}
            <VStack alignItems="center" space="xs">
              <Text color={colors.textMuted} fontSize="$xs">
                v2025.01
              </Text>
              <Text
                color={colors.text}
                fontSize="$sm"
                fontWeight="600"
                textAlign="center"
              >
                Agrisa - Nền tảng bảo hiểm nông nghiệp
              </Text>
            </VStack>
          </VStack>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

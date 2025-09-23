import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { Box, HStack, Pressable } from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import { Moon, Sun } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function ThemeToggle() {
  const { colors, isDark } = useAgrisaColors();
  const { toggleTheme } = useThemeStore();

  // Animation cho toggle switch
  const translateX = useSharedValue(isDark ? 32 : 0);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 32 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={4}
    >
      <HStack alignItems="center" space="md">
        <Box padding={8} borderRadius={8}>
          <Sun size={18} color={colors.warning} />
        </Box>
        <Text color={colors.text} fontSize="$md" fontWeight="500">
          Chế độ tối
        </Text>
      </HStack>

      {/* Custom Toggle Switch */}
      <Pressable onPress={handleToggle}>
        <Box
          bg={isDark ? colors.primary : colors.border}
          width={64}
          height={32}
          borderRadius={16}
          padding={2}
          shadowColor={colors.shadow}
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.2}
          shadowRadius={2}
          elevation={2}
        >
          <Animated.View
            style={[
              {
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 3,
              },
              animatedStyle,
            ]}
          >
            {isDark ? (
              <Moon size={14} color={colors.primary} />
            ) : (
              <Sun size={14} color={colors.warning} />
            )}
          </Animated.View>
        </Box>
      </Pressable>
    </HStack>
  );
}

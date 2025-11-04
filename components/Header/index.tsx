import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Pressable, Text } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";

interface AgrisaHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const AgrisaHeader: React.FC<AgrisaHeaderProps> = ({
  title,
  onBack,
  showBackButton = true,
}) => {
  const { colors } = useAgrisaColors();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <Box bg={colors.background}>
      <HStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        height="$12"
      >
        {/* Back Button */}
        {showBackButton ? (
          <Pressable
            onPress={handleBack}
            padding="$2"
            borderRadius="$md"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
        ) : (
          <Box width="$8" /> // Placeholder để giữ title ở giữa
        )}

        {/* Title */}
        <Text
          fontSize="$lg"
          fontWeight="$semibold"
          color={colors.text}
          flex={1}
          textAlign="center"
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right placeholder để cân bằng */}
        <Box width="$8" />
      </HStack>
    </Box>
  );
};

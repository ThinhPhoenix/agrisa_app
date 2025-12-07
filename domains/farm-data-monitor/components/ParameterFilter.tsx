import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Pressable, ScrollView, Text } from "@gluestack-ui/themed";
import { Database, Filter } from "lucide-react-native";
import React from "react";

interface ParameterOption {
  value: string;
  label: string;
  color: string;
}

interface ParameterFilterProps {
  selected: string | null;
  onSelect: (value: string | null) => void;
  options: ParameterOption[];
}

/**
 * Component filter để chọn parameter cần xem
 */
export const ParameterFilter: React.FC<ParameterFilterProps> = ({
  selected,
  onSelect,
  options,
}) => {
  const { colors } = useAgrisaColors();

  // Option "Tất cả"
  const allOption: ParameterOption = {
    value: "all",
    label: "Tất cả chỉ số",
    color: colors.primary,
  };

  const allOptions = [allOption, ...options];

  return (
    <Box>
      {/* Header */}
      <HStack space="sm" alignItems="center" mb="$3" px="$1">
        <Filter size={16} color={colors.secondary_text} strokeWidth={2} />
        <Text fontSize="$sm" fontWeight="$semibold" color={colors.secondary_text}>
          Chọn chỉ số theo dõi
        </Text>
      </HStack>

      {/* Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space="sm">
          {allOptions.map((option) => {
            const isSelected =
              selected === option.value ||
              (selected === null && option.value === "all");

            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  onSelect(option.value === "all" ? null : option.value)
                }
              >
                {({ pressed }) => (
                  <Box
                    bg={isSelected ? option.color : colors.card_surface}
                    borderWidth={1}
                    borderColor={isSelected ? option.color : colors.frame_border}
                    borderRadius="$full"
                    px="$4"
                    py="$2"
                    opacity={pressed ? 0.7 : 1}
                  >
                    <HStack space="xs" alignItems="center">
                      <Database
                        size={14}
                        color={
                          isSelected ? colors.primary_white_text : colors.secondary_text
                        }
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={
                          isSelected ? colors.primary_white_text : colors.primary_text
                        }
                      >
                        {option.label}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Pressable>
            );
          })}
        </HStack>
      </ScrollView>
    </Box>
  );
};

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Pressable, Text } from "@gluestack-ui/themed";
import { Clock } from "lucide-react-native";
import React from "react";

export type TimeRange = "7d" | "1m" | "3m" | "6m" | "1y" | "all";

interface TimeRangeOption {
  value: TimeRange;
  label: string;
  days: number | null; // null = all
}

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

const TIME_RANGES: TimeRangeOption[] = [
  { value: "7d", label: "7 ngày", days: 7 },
  { value: "1m", label: "1 tháng", days: 30 },
  { value: "3m", label: "3 tháng", days: 90 },
  { value: "6m", label: "6 tháng", days: 180 },
  { value: "1y", label: "1 năm", days: 365 },
];

/**
 * Component chọn khoảng thời gian xem dữ liệu
 */
export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { colors } = useAgrisaColors();

  return (
    <Box>
      {/* Header */}
      <HStack space="sm" alignItems="center" mb="$3" px="$1">
        <Clock size={16} color={colors.secondary_text} strokeWidth={2} />
        <Text fontSize="$sm" fontWeight="$semibold" color={colors.secondary_text}>
          Khoảng thời gian
        </Text>
      </HStack>

      {/* Time range buttons */}
      <HStack space="sm" flexWrap="wrap">
        {TIME_RANGES.map((range) => {
          const isSelected = selected === range.value;

          return (
            <Pressable
              key={range.value}
              onPress={() => onSelect(range.value)}
              flex={1}
              minWidth="30%"
            >
              {({ pressed }) => (
                <Box
                  bg={isSelected ? colors.primary : colors.card_surface}
                  borderWidth={1}
                  borderColor={isSelected ? colors.primary : colors.frame_border}
                  borderRadius="$lg"
                  px="$3"
                  py="$2"
                  opacity={pressed ? 0.7 : 1}
                  alignItems="center"
                  mb="$2"
                >
                  <Text
                    fontSize="$sm"
                    fontWeight={isSelected ? "$bold" : "$semibold"}
                    color={
                      isSelected ? colors.primary_white_text : colors.primary_text
                    }
                  >
                    {range.label}
                  </Text>
                </Box>
              )}
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
};

/**
 * Helper function để tính timestamp range
 */
export const getTimeRangeTimestamps = (
  range: TimeRange
): { start_timestamp?: number; end_timestamp?: number } => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds

  const rangeConfig = TIME_RANGES.find((r) => r.value === range);
  if (!rangeConfig || rangeConfig.days === null) {
    // "all" - không filter, nhưng vẫn set end_timestamp là hiện tại
    return { end_timestamp: now };
  }

  const start_timestamp = now - rangeConfig.days * 24 * 60 * 60;

  return {
    start_timestamp,
    end_timestamp: now, // Luôn lấy đến thời điểm hiện tại
  };
};

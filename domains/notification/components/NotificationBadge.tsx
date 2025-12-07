/**
 * NotificationBadge - Component hiển thị số lượng thông báo chưa đọc
 * Sử dụng trong header, tab bar, hoặc bất kỳ đâu cần hiển thị badge
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, Text } from "@gluestack-ui/themed";
import React from "react";
import { useNotification } from "../hooks/use-notification";

interface NotificationBadgeProps {
  /**
   * Kích thước badge
   * - sm: 16x16, text 10
   * - md: 20x20, text 11 (default)
   * - lg: 24x24, text 12
   */
  size?: "sm" | "md" | "lg";
  /**
   * Vị trí absolute (nếu true, badge sẽ có position absolute)
   */
  absolute?: boolean;
  /**
   * Custom top position (chỉ khi absolute=true)
   */
  top?: number;
  /**
   * Custom right position (chỉ khi absolute=true)
   */
  right?: number;
  /**
   * Hiển thị "99+" nếu count > 99
   */
  maxCount?: number;
  /**
   * Override count (không fetch từ API)
   */
  count?: number;
}

const sizeConfig = {
  sm: { size: 16, fontSize: 10, minWidth: 16 },
  md: { size: 20, fontSize: 11, minWidth: 20 },
  lg: { size: 24, fontSize: 12, minWidth: 24 },
};

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = "md",
  absolute = false,
  top = -4,
  right = -4,
  maxCount = 99,
  count: overrideCount,
}) => {
  const { colors } = useAgrisaColors();
  const { getNotificationCount } = useNotification();

  // Chỉ fetch từ API nếu không có override count
  const { data: countData } = getNotificationCount();

  // Sử dụng override count hoặc API count
  const count = overrideCount ?? (countData?.success ? countData.count ?? 0 : 0);

  // Không hiển thị nếu count = 0
  if (count === 0) {
    return null;
  }

  const config = sizeConfig[size];
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Tính toán width dựa trên số ký tự
  const dynamicWidth = displayCount.length > 1 
    ? config.minWidth + (displayCount.length - 1) * 6 
    : config.minWidth;

  const badgeStyle: any = {
    backgroundColor: colors.error,
    borderRadius: config.size / 2,
    height: config.size,
    minWidth: dynamicWidth,
    paddingHorizontal: displayCount.length > 1 ? 4 : 0,
    alignItems: "center",
    justifyContent: "center",
  };

  if (absolute) {
    badgeStyle.position = "absolute";
    badgeStyle.top = top;
    badgeStyle.right = right;
    badgeStyle.zIndex = 10;
  }

  return (
    <Box style={badgeStyle}>
      <Text
        fontSize={config.fontSize}
        fontWeight="$bold"
        color={colors.primary_white_text}
        textAlign="center"
        lineHeight={config.size}
      >
        {displayCount}
      </Text>
    </Box>
  );
};

export default NotificationBadge;

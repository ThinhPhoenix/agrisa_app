/**
 * ============================================
 * 🎨 CCCD SVG ILLUSTRATIONS
 * ============================================
 * SVG minh họa CCCD mặt trước và mặt sau
 * Giúp người dùng dễ hình dung khi chụp
 */

import React from "react";
import { View } from "react-native";
import Svg, {
    Circle,
    Path,
    Rect
} from "react-native-svg";

interface CCCDSvgProps {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * SVG minh họa CCCD mặt trước
 * Chỉ hiển thị khung và cấu trúc cơ bản theo CCCD thật, không có thông tin giả
 */
export const CCCDFrontSvg: React.FC<CCCDSvgProps> = ({
  width = 200,
  height = 126, // Aspect ratio 1.586
  primaryColor = "#16a34a",
  secondaryColor = "#dcfce7",
}) => {
  return (
    <View style={{ width, height }}>
      <Svg width="100%" height="100%" viewBox="0 0 200 126">
        {/* Card background */}
        <Rect
          x="0"
          y="0"
          width="200"
          height="126"
          rx="8"
          fill="#f0fdf4"
          stroke={primaryColor}
          strokeWidth="2"
        />

        {/* Header stripe - red band like real CCCD */}
        <Rect x="0" y="0" width="200" height="18" fill="#dc2626" rx="8" />
        <Rect x="0" y="10" width="200" height="8" fill="#dc2626" />
        
        {/* National emblem area */}
        <Circle cx="100" cy="35" r="12" fill="#fef3c7" stroke="#eab308" strokeWidth="1.5" />
        <Path d="M 100 27 L 102 33 L 108 33 L 103 37 L 105 43 L 100 39 L 95 43 L 97 37 L 92 33 L 98 33 Z" fill="#eab308" />

        {/* Avatar placeholder area */}
        <Rect x="15" y="52" width="45" height="60" rx="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
        
        {/* Info lines placeholder - right side */}
        <Rect x="68" y="52" width="120" height="6" rx="3" fill="#d1d5db" />
        <Rect x="68" y="62" width="90" height="5" rx="2.5" fill="#e5e7eb" />
        
        <Rect x="68" y="72" width="55" height="5" rx="2.5" fill="#d1d5db" />
        <Rect x="130" y="72" width="40" height="5" rx="2.5" fill="#d1d5db" />
        
        <Rect x="68" y="82" width="70" height="5" rx="2.5" fill="#e5e7eb" />
        <Rect x="68" y="92" width="85" height="5" rx="2.5" fill="#e5e7eb" />

        {/* ID Number area at bottom */}
        <Rect x="15" y="102" width="170" height="16" rx="4" fill="#ffffff" stroke="#d1d5db" strokeWidth="1" />
        <Rect x="20" y="107" width="100" height="6" rx="3" fill={primaryColor} opacity="0.3" />
      </Svg>
    </View>
  );
};

/**
 * SVG minh họa CCCD mặt sau
 * Chỉ hiển thị khung và cấu trúc cơ bản theo CCCD thật, không có thông tin giả
 */
export const CCCDBackSvg: React.FC<CCCDSvgProps> = ({
  width = 200,
  height = 126,
  primaryColor = "#2563eb",
  secondaryColor = "#dbeafe",
}) => {
  return (
    <View style={{ width, height }}>
      <Svg width="100%" height="100%" viewBox="0 0 200 126">
        {/* Card background */}
        <Rect
          x="0"
          y="0"
          width="200"
          height="126"
          rx="8"
          fill="#eff6ff"
          stroke={primaryColor}
          strokeWidth="2"
        />

        {/* Header stripe - blue band */}
        <Rect x="0" y="0" width="200" height="18" fill="#0ea5e9" rx="8" />
        <Rect x="0" y="10" width="200" height="8" fill="#0ea5e9" />

        {/* QR Code placeholder */}
        <Rect x="12" y="28" width="42" height="42" rx="4" fill="#ffffff" stroke="#374151" strokeWidth="1.5" />
        <Rect x="16" y="32" width="34" height="34" fill="#1f2937" />
        {/* QR pattern - realistic */}
        <Rect x="18" y="34" width="6" height="6" fill="#ffffff" />
        <Rect x="26" y="34" width="6" height="6" fill="#ffffff" />
        <Rect x="42" y="34" width="6" height="6" fill="#ffffff" />
        <Rect x="18" y="42" width="6" height="6" fill="#ffffff" />
        <Rect x="42" y="42" width="6" height="6" fill="#ffffff" />
        <Rect x="18" y="58" width="6" height="6" fill="#ffffff" />
        <Rect x="26" y="58" width="6" height="6" fill="#ffffff" />
        <Rect x="42" y="58" width="6" height="6" fill="#ffffff" />

        {/* Info placeholder lines - right side */}
        <Rect x="62" y="30" width="125" height="6" rx="3" fill="#d1d5db" />
        <Rect x="62" y="40" width="100" height="5" rx="2.5" fill="#e5e7eb" />
        <Rect x="62" y="50" width="115" height="5" rx="2.5" fill="#e5e7eb" />
        <Rect x="62" y="60" width="90" height="5" rx="2.5" fill="#e5e7eb" />

        {/* Features/characteristics placeholder */}
        <Rect x="12" y="78" width="175" height="5" rx="2.5" fill="#d1d5db" />
        <Rect x="12" y="88" width="140" height="5" rx="2.5" fill="#e5e7eb" />

        {/* MRZ (Machine Readable Zone) - dark strip at bottom */}
        <Rect x="10" y="100" width="180" height="18" rx="3" fill="#1f2937" />
        {/* MRZ lines */}
        <Rect x="14" y="104" width="170" height="3" rx="1.5" fill="#10b981" opacity="0.6" />
        <Rect x="14" y="110" width="170" height="3" rx="1.5" fill="#10b981" opacity="0.6" />
      </Svg>
    </View>
  );
};

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WifiOff, RotateCcw } from "lucide-react-native";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";

interface Props {
  onRetry: () => void;
  isRetrying?: boolean;
}

const NoConnectionScreen: React.FC<Props> = ({
  onRetry,
  isRetrying = false,
}) => {
    const { colors } = useAgrisaColors();

  return (
    <View
      className="flex-1 justify-center items-center px-5"
      style={{ backgroundColor: colors.background }}
    >
      {/* Icon không có kết nối */}
      <WifiOff size={80} color={colors.error || "#FF6B6B"} className="mb-5" />

      {/* Tiêu đề */}
      <Text
        className="text-2xl font-bold text-center mt-5 mb-3"
        style={{ color: colors.text }}
      >
        Không có kết nối mạng
      </Text>

      {/* Mô tả */}
      <Text
        className="text-base text-center mb-8"
        style={{ color: colors.textSecondary }}
      >
        Vui lòng kiểm tra kết nối internet và thử lại
      </Text>

      {/* Gợi ý khắc phục */}
      <View
        className="w-full p-5 rounded-xl mb-8"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
          • Bật Wi-Fi hoặc 4G
        </Text>
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
          • Kiểm tra vùng phủ sóng
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          • Khởi động lại ứng dụng
        </Text>
      </View>

      {/* Nút thử lại */}
      <TouchableOpacity
        className={`flex-row items-center px-8 py-4 rounded-full ${
          isRetrying ? "opacity-70" : ""
        }`}
        style={{ backgroundColor: colors.success }}
        onPress={onRetry}
        disabled={isRetrying}
        activeOpacity={0.8}
      >
        <RotateCcw
          size={20}
          color="#FFF"
          className={`mr-2 ${isRetrying ? "animate-spin" : ""}`}
        />
        <Text style={{ color: colors.textWhiteButton }} className="text-base font-semibold">
          {isRetrying ? "Đang kiểm tra..." : "Thử lại"}
        </Text>
      </TouchableOpacity>

      {/* Thông tin thêm cho nông dân */}
      
    </View>
  );
};

export default NoConnectionScreen;

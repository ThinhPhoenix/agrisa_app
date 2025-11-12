import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import { BlurView } from "expo-blur";
import {
    Banknote,
    CloudRain,
    Eye,
    EyeOff,
    FileText,
    Wheat,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function InfoCards() {
  const [moneyVisible, setMoneyVisible] = useState(false);
  const colors = AgrisaColors.light;

  return (
    <View className="mb-4">
      <BlurView
        intensity={30}
        className="overflow-hidden rounded-2xl border shadow-lg"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderColor: colors.primary,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          {/* Ví MoMo - Số tiền bảo hiểm */}
          <View className="px-5 py-6">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Banknote size={18} color={colors.muted_text} />
              <Text
                className="text-xs"
                style={{ color: colors.secondary_text }}
              >
                Số tiền bảo hiểm
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text
                className="font-bold text-xl"
                style={{ color: colors.primary_text }}
              >
                {moneyVisible ? "4.000.000.000đ" : "••••••••"}
              </Text>
              <Pressable onPress={() => setMoneyVisible(!moneyVisible)}>
                {moneyVisible ? (
                  <EyeOff size={16} color={colors.muted_text} />
                ) : (
                  <Eye size={16} color={colors.muted_text} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Divider */}
          <View
            className="w-px my-5"
            style={{ backgroundColor: colors.frame_border }}
          />

          {/* Trang trại */}
          <View className="px-5 py-6">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Wheat size={18} color={colors.success} />
              <Text
                className="text-xs"
                style={{ color: colors.secondary_text }}
              >
                Trang trại
              </Text>
            </View>
            <Text
              className="font-bold text-xl"
              style={{ color: colors.primary_text }}
            >
              8 trang trại
            </Text>
          </View>

          {/* Divider */}
          <View
            className="w-px my-5"
            style={{ backgroundColor: colors.frame_border }}
          />

          {/* Hợp đồng */}
          <View className="px-5 py-6">
            <View className="flex-row items-center gap-2 mb-1.5">
              <FileText size={18} color={colors.info} />
              <Text
                className="text-xs"
                style={{ color: colors.secondary_text }}
              >
                Hợp đồng
              </Text>
            </View>
            <Text
              className="font-bold text-xl"
              style={{ color: colors.primary_text }}
            >
              12 hợp đồng
            </Text>
          </View>

          {/* Divider */}
          <View
            className="w-px my-5"
            style={{ backgroundColor: colors.frame_border }}
          />

          {/* Thời tiết */}
          <View className="px-5 py-6">
            <View className="flex-row items-center gap-2 mb-1.5">
              <CloudRain size={18} color={colors.warning} />
              <Text
                className="text-xs"
                style={{ color: colors.secondary_text }}
              >
                Thời tiết
              </Text>
            </View>
            <Text
              className="font-bold text-xl"
              style={{ color: colors.primary_text }}
            >
              32°C • Mưa to
            </Text>
          </View>
        </ScrollView>
      </BlurView>
    </View>
  );
}

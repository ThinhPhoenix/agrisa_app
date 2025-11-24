import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useStats } from "@/domains/shared/hooks/use-stats";
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
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function InfoCards() {
  const { colors } = useAgrisaColors();
  const { stats, isLoading } = useStats();
  const [moneyVisible, setMoneyVisible] = useState(false);

  // Card data configuration
  const cards = [
    {
      id: "money",
      icon: Banknote,
      iconColor: colors.primary,
      iconBgColor: `${colors.primary}15`,
      label: "Số tiền bảo hiểm",
      value: (
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
      ),
      gradient: ["rgba(163, 20, 42, 0.08)", "rgba(163, 20, 42, 0.02)"],
    },
    {
      id: "farms",
      icon: Wheat,
      iconColor: colors.success,
      iconBgColor: `${colors.success}15`,
      label: "Trang trại",
      value: isLoading ? (
        <ActivityIndicator size="small" color={colors.success} />
      ) : (
        `${stats?.farm_active_count || 0} trang trại`
      ),
      gradient: ["rgba(34, 197, 94, 0.08)", "rgba(34, 197, 94, 0.02)"],
    },
    {
      id: "policies",
      icon: FileText,
      iconColor: colors.info,
      iconBgColor: `${colors.info}15`,
      label: "Hợp đồng",
      value: isLoading ? (
        <ActivityIndicator size="small" color={colors.info} />
      ) : (
        `${stats?.registered_policy_count || 0} hợp đồng`
      ),
      gradient: ["rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.02)"],
    },
    {
      id: "weather",
      icon: CloudRain,
      iconColor: colors.warning,
      iconBgColor: `${colors.warning}15`,
      label: "Thời tiết",
      value: "32°C • Mưa to",
      gradient: ["rgba(245, 158, 11, 0.08)", "rgba(245, 158, 11, 0.02)"],
    },
  ];

  return (
    <View className="mb-4">
      <BlurView
        intensity={40}
        tint="light"
        className="overflow-hidden rounded-3xl"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderWidth: 1,
          borderColor: "rgba(163, 20, 42, 0.1)",
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <View key={card.id}>
                <View className="px-6 py-5" style={{ minWidth: 160 }}>
                  {/* Icon với background gradient */}
                  <View
                    className="mb-3 w-11 h-11 rounded-2xl items-center justify-center"
                    style={{
                      backgroundColor: card.iconBgColor,
                    }}
                  >
                    <Icon size={22} color={card.iconColor} strokeWidth={2.5} />
                  </View>

                  {/* Label */}
                  <Text
                    className="text-xs mb-1.5 font-medium"
                    style={{ color: colors.secondary_text }}
                  >
                    {card.label}
                  </Text>

                  {/* Value */}
                  {typeof card.value === "string" ? (
                    <Text
                      className="font-bold text-xl"
                      style={{ color: colors.primary_text }}
                    >
                      {card.value}
                    </Text>
                  ) : (
                    card.value
                  )}
                </View>

                {/* Divider - không hiện ở card cuối */}
                {index < cards.length - 1 && (
                  <View
                    className="absolute right-0 top-4 bottom-4 w-px"
                    style={{
                      backgroundColor: "rgba(163, 20, 42, 0.08)",
                    }}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      </BlurView>
    </View>
  );
}

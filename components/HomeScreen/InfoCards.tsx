import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { usePayment } from "@/domains/payment/hooks/use-payment";
import { useStats } from "@/domains/shared/hooks/use-stats";
import { Utils } from "@/libs/utils/utils";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.35)";
const CARD_GRADIENT = [
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.2)",
] as const;

export default function InfoCards() {
  const { colors } = useAgrisaColors();
  const { stats, isLoading } = useStats();
  const { getTotalByType } = usePayment();
  const [moneyVisible, setMoneyVisible] = useState(false);

  // Lấy tổng số tiền bồi thường (payout)
  const { data: payoutData, isLoading: isLoadingPayout } = getTotalByType("policy_payout_payment");
  const totalPayout = payoutData?.success ? payoutData.data : 0;

  // Card data configuration
  const cards = [
    {
      id: "money",
      icon: Banknote,
      iconColor: colors.primary,
      iconBgColor: `${colors.primary}15`,
      label: "Số tiền bồi thường bảo hiểm",
      value: (
        <View className="flex-row items-center gap-2">
          {isLoadingPayout ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              className="font-bold text-xl"
              style={{ color: colors.primary_text }}
            >
              {moneyVisible ? Utils.formatCurrency(totalPayout) : "••••••••"}
            </Text>
          )}
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
      label: "Trang trại đăng ký",
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
      label: "Hợp đồng đã đăng ký",
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
      <View
        className="overflow-hidden rounded-3xl"
        style={{
          borderWidth: 1.5,
          borderColor: CARD_BORDER_COLOR,
          // Outer glow - soft ambient shadow
          shadowColor: "rgba(0, 0, 0, 0.15)",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 32,
          elevation: 20,
          // Inner highlight effect via background
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Top highlight border */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            right: 20,
            height: 1,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: 1,
          }}
        />
        <LinearGradient
          colors={CARD_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <BlurView
            intensity={80}
            tint="light"
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
                      {/* Label với Icon bên cạnh */}
                      <View className="flex-row items-center gap-2 mb-2">
                        <View
                          className="w-6 h-6 rounded-lg items-center justify-center"
                          style={{
                            backgroundColor: card.iconBgColor,
                          }}
                        >
                          <Icon size={14} color={card.iconColor} strokeWidth={2.5} />
                        </View>
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.secondary_text }}
                        >
                          {card.label}
                        </Text>
                      </View>

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
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </BlurView>
        </LinearGradient>
      </View>
    </View>
  );
}

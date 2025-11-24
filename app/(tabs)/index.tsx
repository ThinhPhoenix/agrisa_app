import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import usePushNoti from "@/domains/shared/hooks/usePushNoti";
import {
  DancingScript_400Regular,
  useFonts,
} from "@expo-google-fonts/dancing-script";
import { VStack } from "@gluestack-ui/themed";
import { ReceiptText, Satellite, Scroll, Wheat } from "lucide-react-native";
import React from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import InfoCards from "../../components/HomeScreen/InfoCards";
import { NewPolicies } from "../../components/HomeScreen/NewPolicies";
import QuickActions from "../../components/quick-actions";

const quickActionItems = [
  {
    key: "farm",
    name: "Trang trại",
    icon: Wheat,
    color: "#059669",
  },
  {
    key: "policy",
    name: "Hợp đồng bảo hiểm",
    icon: ReceiptText,
    color: "#476EAE",
  },
  {
    key: "satellite",
    name: "Vệ tinh",
    icon: Satellite,
    color: "#59AC77",
  },
  {
    key: "documents",
    name: "Quản lý giấy tờ",
    icon: Scroll,
    color: "#C1856D",
  },
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ DancingScript_400Regular });
  const { colors } = useAgrisaColors();
  const { getPublicBasePolicy } = usePolicy();
  const { refetch } = getPublicBasePolicy();
  const [refreshing, setRefreshing] = React.useState(false);

  const sendNotification = usePushNoti({
    title: "Thông báo từ Agrisa",
    body: "Bạn vừa chạm vào xem ngay!",
  });

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!fontsLoaded) return null;

  return (
    <VStack className="flex-1 bg-white">
      {/* Cover Policy Image - Extended Background */}
      <Image
        source={require("../../assets/images/Cover/Agrisa-Cover-Policy.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300, // Kéo dài xuống để phủ cả phần Quick Actions
          width: "100%",
          resizeMode: "cover",
          opacity: 0.25,
          zIndex: 0,
        }}
      />

      {/* Header Section with Greeting and InfoCards */}
      <View className="relative z-10 px-4 pt-20 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-black text-lg">
            <Text
              style={{ fontFamily: "DancingScript_400Regular" }}
              className="text-emerald-700 text-xl"
            >
              Xin chào,
            </Text>{" "}
            Lai Chí Thịnh
          </Text>
          <Image
            source={require("../../assets/images/Logo/Agrisa_Logo.png")}
            style={{
              width: 80,
              height: 40,
              resizeMode: "contain",
            }}
          />
        </View>

        <InfoCards />
      </View>

      {/* Quick Actions & New Policies Section with Border and Rounded Top */}
      <View className="flex-1 bg-white rounded-tl-[3rem] rounded-tr-[3rem] shadow-sm relative z-20">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Quick Actions */}
          <View className="px-4 py-5">
            <QuickActions items={quickActionItems} />
          </View>

          {/* New Policies List */}
          <NewPolicies />
        </ScrollView>
      </View>
    </VStack>
  );
}

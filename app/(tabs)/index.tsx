import {
  DancingScript_400Regular,
  useFonts,
} from "@expo-google-fonts/dancing-script";
import { Heading, VStack } from "@gluestack-ui/themed";
import { BlurView } from "expo-blur";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Headset,
  MapPinPlus,
  ReceiptText,
  Satellite,
  Scroll,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import QuickActions from "../../components/quick-actions";

const quickActionItems = [
  {
    key: "add",
    name: "Thêm mới",
    icon: MapPinPlus,
    color: "#476EAE",
  },
  {
    key: "satellite",
    name: "Vệ tinh",
    icon: Satellite,
    color: "#EF7722",
  },
  {
    key: "registered-policies",
    name: "Hợp đồng của tôi",
    icon: ReceiptText,
    color: "#59AC77",
  },
  {
    key: "documents",
    name: "Quản lý giấy tờ",
    icon: Scroll,
    color: "#C1856D",
  },
  {
    key: "support",
    name: "Yêu cầu hỗ trợ",
    icon: Headset,
    color: "#E45A92",
  },
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ DancingScript_400Regular });
  const [moneyVisible, setMoneyVisible] = useState(false);
  if (!fontsLoaded) return null;

  return (
    <VStack className="flex-1 bg-white">
      <View className="h-48 px-4 pt-4 relative">
        <View className="flex-1">
          <Text className="text-black text-lg mt-1 mb-2">
            <Text
              style={{ fontFamily: "DancingScript_400Regular" }}
              className="text-emerald-700 text-xl"
            >
              Xin chào,
            </Text>{" "}
            Lai Chí Thịnh
          </Text>

          <BlurView
            intensity={20}
            style={{ backgroundColor: "rgba(247, 232, 171, 0.75)" }}
            className="overflow-hidden flex-row justify-start gap-5 rounded-lg py-8 px-4 w-full relative z-10 border border-secondary-400"
          >
            <View className="flex-row items-center gap-2">
              <Pressable onPress={() => setMoneyVisible(!moneyVisible)}>
                {moneyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </Pressable>
              <View>
                <Text className="text-secondary-700 text-sm">Tổng tiền</Text>
                {moneyVisible ? <Text>4.000.000.000đ</Text> : <Text>****</Text>}
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <View>
                <Text className="text-secondary-700 text-sm">Thời tiết</Text>
                <View className="flex-row gap-2">
                  <Text>32°C</Text>
                  <Text className="text-xs text-secondary-700">/</Text>
                  <Text>Mưa to</Text>
                </View>
              </View>
            </View>
          </BlurView>
          <QuickActions items={quickActionItems} />
          <View className="flex-row items-center gap-2">
            <Heading>Trang trại</Heading>
            <ChevronRight size={16} />
          </View>
          <View>
            <View className="bg-white p-4 rounded-xl border border-gray-300 relative flex-row">
              <View className="relative mr-4">
                <Image
                  className="object-cover rounded-lg"
                  source={{
                    uri: "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/05/game-nong-trai.jpg",
                  }}
                  style={{ width: 140, height: 140 }}
                />
                <View className="flex-row gap-1 absolute top-1 right-1 z-10 bg-red-200 border border-red-500 px-1 py-0.5 rounded-md">
                  <TriangleAlert size={12} color="red" />
                  <Text className="text-red-600 font-semibold text-xs">
                    Khẩn cấp
                  </Text>
                </View>
              </View>
              <View className="flex-1 justify-center">
                <Text className="text-black font-bold text-lg mb-2 line-clamp-2">
                  Trại ThinhPhoenix Chuyên Trồng Lúa Gạo ST25
                </Text>
                <Text className="text-black mb-1 truncate">Sóc Trăng</Text>
                <Text className="text-black mb-1 truncate">21/09/2025</Text>
                <Text className="text-black mb-1 truncate">50 Hecta</Text>
                <Text className="text-black truncate">Gạo ST25</Text>
              </View>
              <View className="absolute bottom-4 right-4 z-10">
                <Text className="text-primary-500 font-semibold text-xs">
                  Xem ngay
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            width: 300,
            height: 220,
            overflow: "visible",
            position: "absolute",
            top: 0,
            right: -20,
            zIndex: 0,
          }}
        >
          <Image
            className="-right-18 -top-10"
            source={require("../../assets/images/leave.jpg")}
            style={{
              width: 300,
              height: 220,
              resizeMode: "cover",
              transform: [{ rotate: "180deg" }],
            }}
          />
        </View>
      </View>
    </VStack>
  );
}

import usePushNoti from "@/domains/shared/hooks/usePushNoti";
import {
  DancingScript_400Regular,
  useFonts,
} from "@expo-google-fonts/dancing-script";
import { Heading, VStack } from "@gluestack-ui/themed";
import {
  ChevronRight,
  ReceiptText,
  Satellite,
  Scroll,
  TriangleAlert,
  Wheat,
} from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import InfoCards from "../../components/HomeScreen/InfoCards";
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
    key: "ocr",
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

  const sendNotification = usePushNoti({
    title: "Thông báo từ Agrisa",
    body: "Bạn vừa chạm vào xem ngay!",
  });

  if (!fontsLoaded) return null;

  const handleTouchEnd = () => {
    sendNotification();
  };

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
          height: 250, // Kéo dài xuống để phủ cả phần Quick Actions
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

      {/* Quick Actions & Farm List Section with Border and Rounded Top */}
      <View className="flex-1 bg-white border-x border-t  rounded-tl-3xl rounded-tr-3xl shadow-sm relative z-20">
        {/* Quick Actions */}
        <View className="px-4 py-4">
          <QuickActions items={quickActionItems} />
        </View>

        {/* Farm List */}
        <View className="px-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Heading size="xl">Trang trại</Heading>
            <ChevronRight size={18} />
          </View>
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
              <Text className="text-gray-600 text-xs mb-0.5 truncate">
                Sóc Trăng
              </Text>
              <Text className="text-gray-600 text-xs mb-0.5 truncate">
                21/09/2025
              </Text>
              <Text className="text-gray-600 text-xs mb-0.5 truncate">
                50 Hecta
              </Text>
              <Text className="text-gray-600 text-xs truncate">Gạo ST25</Text>
            </View>
            <View className="absolute bottom-4 right-4 z-10">
              <Pressable onTouchEnd={handleTouchEnd}>
                <Text className="text-primary-500 font-semibold text-xs">
                  Xem ngay
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </VStack>
  );
}

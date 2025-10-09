import { Tabs } from "expo-router";
import React from "react";

import { useAgrisaColors } from "@/domains/agrisa-theme/hooks/use-agrisa-colors";
import { History, Home, MessageCircle, Wheat } from "lucide-react-native";

export default function TabLayout() {
  const { colors } = useAgrisaColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ✅ Ẩn header title
        tabBarStyle: {
          backgroundColor: colors.card, // 🎨 Áp dụng màu custom cho tab bar
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.success, // Màu icon khi active
        tabBarInactiveTintColor: colors.textMuted, // Màu icon khi inactive
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <Home size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          title: "Trang trại",
          tabBarIcon: ({ color }) => <Wheat size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Lịch sử",
          tabBarIcon: ({ color }) => <History size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Tin nhắn",

          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

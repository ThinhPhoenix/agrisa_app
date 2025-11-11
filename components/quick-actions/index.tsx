import { Pressable, Text, View } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";

interface QuickActionItem {
  key: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  href?: string;
}

interface QuickActionsProps {
  items: QuickActionItem[];
}

export default function QuickActions({ items }: QuickActionsProps) {
  const handlePress = (item: QuickActionItem) => {
    if (item.key === "farm") {
      router.push("/(farmer)/farm");
    } else if (item.key === "policy") {
      router.push("/(farmer)/policy");
    } else {
      router.push(item.href || `/${item.key}`);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 16,
        position: "relative",
        zIndex: 10,
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => handlePress(item)}
          style={{
            flexBasis: "25%",
            alignItems: "center",
            paddingHorizontal: 8,
            minHeight: 72,
          }}
        >
          <item.icon color={item.color} size={35} strokeWidth={1.5} />
          <Text
            size="xs"
            style={{ textAlign: "center" }}
            numberOfLines={2}
            className="text-sm text-secondary-700"
          >
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

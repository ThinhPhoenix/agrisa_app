import { Stack } from "expo-router";
import React from "react";

/**
 * Layout cho Documents Management
 * Hiển thị giấy tờ chứng nhận quyền sử dụng đất của farm
 */
export default function DocumentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
    </Stack>
  );
}

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import EditCardInfoScreen from "@/domains/eKYC/components/edit-card-info";
import { VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";

export default function EditCardInfo() {
  const { colors } = useAgrisaColors();

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader
        title="Chỉnh sửa thông tin CCCD"
        showBackButton={true}
        onBack={() => router.back()}
      />
      <EditCardInfoScreen />
    </VStack>
  );
}

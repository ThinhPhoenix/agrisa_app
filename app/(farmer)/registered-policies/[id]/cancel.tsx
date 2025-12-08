import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { CancelPolicyRequest } from "@/domains/policy/components/cancel-policy-request";
import { VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";

export default function CancelPolicyRequestScreen() {
  const { colors } = useAgrisaColors();

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader
        title="Đề nghị hủy hợp đồng"
        showBackButton={true}
        onBack={() => router.back()}
      />

      <CancelPolicyRequest />
    </VStack>
  );
}

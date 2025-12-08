import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { CancelPolicyRequest } from "@/domains/policy/components/cancel-policy-request";
import { VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";

/**
 * Màn hình hủy đăng ký policy từ history
 * Dùng cho các trạng thái: pending_payment, pending_review
 */
export default function CancelHistoryPolicyScreen() {
  const { colors } = useAgrisaColors();

  return (
    <VStack flex={1} bg={colors.background}>
      <AgrisaHeader
        title="Hủy đăng ký"
        showBackButton={true}
        onBack={() => router.back()}
      />

      <CancelPolicyRequest />
    </VStack>
  );
}

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { DetailFarm } from "@/domains/farm/components/detail-farm";
import { RegisterFarmForm } from "@/domains/farm/components/register-farm";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { Farm, FormFarmDTO } from "@/domains/farm/models/farm.models";
import { Box, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";

/**
 * 🌾 Farm Form Screen - Màn hình quản lý nông trại Agrisa
 *
 * Routes:
 * - /(farmer)/form-farm/new → Create Mode (Tạo mới)
 * - /(farmer)/form-farm/[id]?mode=detail → Detail Mode (Xem chi tiết)
 * - /(farmer)/form-farm/[id]?mode=edit → Edit Mode (Chỉnh sửa)
 *
 * Features:
 * - ✅ Auto-detect mode từ params
 * - ✅ OCR sổ đỏ (Create Mode)
 * - ✅ Detail view với nút Edit
 * - ✅ Pre-fill data (Edit Mode)
 */
export default function FarmFormScreen() {
  const { colors } = useAgrisaColors();
  const params = useLocalSearchParams();
  const { getDetailFarm } = useFarm();

  // ===== STATE MANAGEMENT =====
  // Không cần state isSubmitting nữa vì đã handle trong useFarmForm

  // ===== MODE DETECTION =====
  const farmId = params.id as string;
  const queryMode = params.mode as string | undefined;

  // Normalize mode: "view" hoặc "detail" đều là Detail Mode
  const normalizedMode = queryMode === "view" ? "detail" : queryMode;
  const mode = normalizedMode || "detail"; // default: detail nếu có id

  const isCreateMode = farmId === "new";
  const isDetailMode = !isCreateMode && (mode === "detail" || !mode);
  const isEditMode = !isCreateMode && mode === "edit";

  console.log("📋 [FarmForm] Params:", params);
  console.log("📋 [FarmForm] Farm ID:", farmId);
  console.log(
    "📋 [FarmForm] Mode:",
    isCreateMode ? "➕ CREATE" : isDetailMode ? "👁️ DETAIL" : "✏️ EDIT"
  );

  // ===== FETCH FARM DATA (Detail/Edit Mode) =====
  // Chỉ fetch khi không phải create mode
  const {
    data: farmResponse,
    isLoading: isLoadingFarm,
    error: farmError,
  } = getDetailFarm(isCreateMode ? "" : farmId);

  // Lấy dữ liệu farm từ response
  const farmData: Farm | null = farmResponse?.success
    ? farmResponse.data
    : null;

  // Handle error từ API
  if (!isCreateMode && farmError) {
    console.error("❌ [FarmForm] Fetch farm error:", farmError);
  }


  /**
   * Handle Edit button click từ Detail view
   */
  const handleEditClick = () => {
    console.log("✏️ [FarmForm] Switching to Edit Mode");
    router.push(`/(farmer)/form-farm/${farmId}?mode=edit`);
  }; 

  // ===== LOADING STATE =====
  if (!isCreateMode && isLoadingFarm) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Đang tải..." onBack={() => router.back()} />
        <VStack flex={1} alignItems="center" justifyContent="center" space="md">
          <Spinner size="large" color={colors.success} />
          <Text fontSize="$sm" color={colors.secondary_text}>
            Đang tải thông tin nông trại...
          </Text>
        </VStack>
      </Box>
    );
  }

  // ===== ERROR STATE =====
  if (!isCreateMode && !farmData) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Lỗi" onBack={() => router.back()} />
        <VStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          space="md"
          px="$6"
        >
          <Text
            fontSize="$lg"
            fontWeight="$bold"
            color={colors.primary_text}
            textAlign="center"
          >
            Không tìm thấy nông trại
          </Text>
          <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
            Nông trại này không tồn tại hoặc đã bị xóa
          </Text>
        </VStack>
      </Box>
    );
  }

  // ===== MAIN RENDER =====
  // Xác định title động
  const headerTitle = isCreateMode
    ? "Đăng ký nông trại"
    : isDetailMode
      ? "Chi tiết nông trại"
      : "Cập nhật nông trại";

  return (
    <Box flex={1} bg={colors.background}>
      {/* Header - Động theo mode */}
      <AgrisaHeader title={headerTitle} onBack={() => router.back()} />

      {/* Render theo Mode */}
      {isDetailMode ? (
        // ===== DETAIL MODE =====
        <DetailFarm
          farm={farmData!}
          onEdit={handleEditClick}
          isLoading={isLoadingFarm}
        />
      ) : (
        // ===== CREATE/EDIT MODE =====
        <RegisterFarmForm
          mode={isCreateMode ? "create" : "edit"}
          initialData={farmData}
          farmId={farmId}
        />
      )}
    </Box>
  );
}

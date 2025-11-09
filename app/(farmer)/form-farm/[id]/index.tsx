import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { DetailFarm } from "@/domains/farm/components/detail-farm";
import { RegisterFarmForm } from "@/domains/farm/components/register-farm";
import { Farm, FormFarmDTO } from "@/domains/farm/models/farm.models";
import { useToast } from "@/domains/shared/hooks/useToast";
import { Box, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

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
  const { toast } = useToast();
  const params = useLocalSearchParams();

  // ===== STATE MANAGEMENT =====
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [farmData, setFarmData] = useState<Farm | null>(null);

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
  useEffect(() => {
    if (!isCreateMode) {
      fetchFarmData(farmId);
    }
  }, [farmId, isCreateMode]);

  /**
   * Fetch farm data
   */
  const fetchFarmData = async (id: string) => {
    try {
      setIsLoadingFarm(true);
      console.log("📥 [FarmForm] Fetching farm:", id);

      // TODO: Call API to get farm by ID
      // const response = await getFarmByIdAPI(id);
      // setFarmData(response.data);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock farm data
      const mockFarm: Farm = {
        id: id,
        farm_name: "Trang trại lúa Đồng Tháp",
        farm_code: "dEA671o57D",
        boundary: {
          type: "Polygon",
          coordinates: [
            [
              [105.6252, 10.4583],
              [105.6352, 10.4583],
              [105.6352, 10.4483],
              [105.6252, 10.4483],
              [105.6252, 10.4583],
            ],
          ],
        },
        center_location: {
          type: "Point",
          coordinates: [105.6302, 10.4533],
        },
        area_sqm: 50000,
        province: "Đồng Tháp",
        district: "Cao Lãnh",
        commune: "Mỹ Hội",
        address: "Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh, tỉnh Đồng Tháp",
        crop_type: "rice",
        planting_date: 1704067200,
        expected_harvest_date: 1714521600,
        crop_type_verified: false,
        land_certificate_number: "SH-2024-001234",
        land_ownership_verified: true,
        has_irrigation: true,
        irrigation_type: "canal",
        soil_type: "alluvial",
        status: "active",
        created_at: "2025-11-06T13:20:58.742857687+07:00",
        updated_at: "2025-11-06T13:20:58.742857846+07:00",
      };

      setFarmData(mockFarm);
      console.log("✅ [FarmForm] Farm data loaded");
    } catch (error) {
      console.error("❌ [FarmForm] Fetch farm error:", error);
      toast.error("Không thể tải thông tin nông trại");
      router.back();
    } finally {
      setIsLoadingFarm(false);
    }
  };

  /**
   * Handle submit form (Create hoặc Update)
   */
  const handleSubmit = async (formData: FormFarmDTO) => {
    try {
      setIsSubmitting(true);

      if (isEditMode) {
        // ===== UPDATE MODE =====
        console.log("📝 [FarmForm] Updating farm:", farmId);
        console.log("Data:", formData);

        // TODO: Call API
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("✅ Cập nhật nông trại thành công!");

        // Quay về Detail Mode sau khi update
        router.replace(`/(farmer)/form-farm/${farmId}?mode=detail`);
      } else {
        // ===== CREATE MODE =====
        console.log("📝 [FarmForm] Creating new farm");
        console.log("Data:", formData);

        // TODO: Call API
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("✅ Đăng ký nông trại thành công!");

        // Quay về danh sách
        router.replace("/(farmer)/farm");
      }
    } catch (error) {
      console.error("❌ [FarmForm] Submit error:", error);
      toast.error(
        isEditMode
          ? "Không thể cập nhật nông trại"
          : "Không thể đăng ký nông trại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text fontSize="$sm" color={colors.textSecondary}>
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
            color={colors.text}
            textAlign="center"
          >
            Không tìm thấy nông trại
          </Text>
          <Text fontSize="$sm" color={colors.textSecondary} textAlign="center">
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
          onSubmitSuccess={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </Box>
  );
}

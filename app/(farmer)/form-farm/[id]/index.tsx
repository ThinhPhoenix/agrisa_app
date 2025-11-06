import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { RegisterFarmForm } from "@/domains/farm/components/register-farm";
import { Farm, FormFarmDTO } from "@/domains/farm/models/farm.models";
import { useToast } from "@/domains/shared/hooks/useToast";
import { Box, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

/**
 * 🌾 Farm Form Screen - Màn hình đăng ký/cập nhật nông trại Agrisa
 *
 * Route: /(farmer)/form-farm/[id]
 * - [id] = "new" → Create Mode (Tạo mới nông trại)
 * - [id] = farm_id → Edit Mode (Cập nhật nông trại)
 * 
 * Features:
 * - ✅ Auto-detect mode từ params.id
 * - ✅ OCR sổ đỏ (chỉ Create Mode)
 * - ✅ Pre-fill data (Edit Mode)
 * - ✅ Loading states
 * - ✅ Error handling
 * - ✅ Navigate back sau khi submit
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
  const isEditMode = farmId && farmId !== "new";

  console.log('📋 [FarmForm] Params:', params);
  console.log('📋 [FarmForm] Farm ID:', farmId);
  console.log('📋 [FarmForm] Mode:', isEditMode ? '✏️ EDIT' : '➕ CREATE');

  // ===== FETCH FARM DATA (Edit Mode Only) =====
  useEffect(() => {
    if (isEditMode) {
      fetchFarmData(farmId);
    }
  }, [farmId, isEditMode]);

  /**
   * Fetch farm data để edit
   */
  const fetchFarmData = async (id: string) => {
    try {
      setIsLoadingFarm(true);

      console.log("📥 [FarmForm] Fetching farm for edit:", id);

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
      console.log("✅ [FarmForm] Farm data loaded successfully");
    } catch (error) {
      console.error("❌ [FarmForm] Fetch farm error:", error);
      toast.error("Không thể tải thông tin nông trại");

      // Quay lại list nếu không tải được
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

        // TODO: Call API to update farm
        // const response = await updateFarmAPI(farmId, formData);

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("✅ Cập nhật nông trại thành công!");

        console.log("✅ [FarmForm] Farm updated successfully");
      } else {
        // ===== CREATE MODE =====
        console.log("📝 [FarmForm] Creating new farm");
        console.log("Data:", formData);

        // TODO: Call API to create farm
        // const response = await createFarmAPI(formData);

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("✅ Đăng ký nông trại thành công!");

        console.log("✅ [FarmForm] Farm created successfully");
      }

      // ✅ Navigate back to farms list
      router.replace("/(farmer)/farm");
    } catch (error) {
      console.error("❌ [FarmForm] Submit error:", error);

      const errorMessage = isEditMode
        ? "Không thể cập nhật nông trại. Vui lòng thử lại."
        : "Không thể đăng ký nông trại. Vui lòng thử lại.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== LOADING STATE (Đang fetch farm data để edit) =====
  if (isEditMode && isLoadingFarm) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Đang tải..." onBack={() => router.back()} />

        <VStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          space="md"
        >
          <Spinner size="large" color={colors.success} />
          <Text fontSize="$sm" color={colors.textSecondary}>
            Đang tải thông tin nông trại...
          </Text>
        </VStack>
      </Box>
    );
  }

  // ===== ERROR STATE (Không tìm thấy farm trong Edit Mode) =====
  if (isEditMode && !farmData) {
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
          <Text
            fontSize="$sm"
            color={colors.textSecondary}
            textAlign="center"
          >
            Nông trại này không tồn tại hoặc đã bị xóa
          </Text>
        </VStack>
      </Box>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <Box flex={1} bg={colors.background}>
      {/* Header - Động theo mode */}
      <AgrisaHeader
        title={isEditMode ? "Cập nhật nông trại" : "Đăng ký nông trại"}
        onBack={() => router.back()}
      />

      {/* Register Farm Form Component */}
      <RegisterFarmForm
        mode={isEditMode ? "edit" : "create"}
        initialData={farmData}
        onSubmitSuccess={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}

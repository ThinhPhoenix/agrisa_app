import { useCallback, useState } from "react";
import { Farm, FormFarmDTO } from "../models/farm.models";
import { useFarm } from "./use-farm";

interface UseFarmFormProps {
  mode: "create" | "edit";
  farmId?: string;
  initialData?: Farm | null;
}

/**
 * Hook quản lý form đăng ký/cập nhật farm
 * Tích hợp với CustomForm và xử lý OCR
 */
export const useFarmForm = ({ mode, farmId, initialData }: UseFarmFormProps) => {
  const { createFarmMutation, updateFarmMutation } = useFarm();

  const [formValues, setFormValues] = useState<Partial<FormFarmDTO>>(() => {
    // Initialize form values nếu là edit mode
    if (mode === "edit" && initialData) {
      // Convert center_location thành lng/lat riêng
      const centerLng = initialData.center_location?.coordinates?.[0];
      const centerLat = initialData.center_location?.coordinates?.[1];

      // Convert boundary thành string format
      let boundaryCoords = "";
      if (initialData.boundary?.coordinates?.[0]) {
        boundaryCoords = initialData.boundary.coordinates[0]
          .map((coord: number[]) => `${coord[0]},${coord[1]}`)
          .join("; ");
      }

      return {
        farm_name: initialData.farm_name,
        province: initialData.province,
        district: initialData.district,
        commune: initialData.commune,
        address: initialData.address,
        crop_type: initialData.crop_type,
        area_sqm: initialData.area_sqm, // Giữ nguyên giá trị từ backend (đã là ha)
        planting_date: initialData.planting_date,
        expected_harvest_date: initialData.expected_harvest_date,
        land_certificate_number: initialData.land_certificate_number,
        owner_national_id: (initialData as any).owner_national_id, // Might not exist in old data
        soil_type: initialData.soil_type,
        has_irrigation: initialData.has_irrigation,
        irrigation_type: initialData.irrigation_type,
        boundary: initialData.boundary,
        center_location: initialData.center_location,
        status: initialData.status,
        // Helper fields cho form
        center_lng: centerLng,
        center_lat: centerLat,
        boundary_coords: boundaryCoords,
      } as any;
    }

    // Create mode - set giá trị mặc định
    return {
      has_irrigation: false, // Mặc định là không có hệ thống tưới tiêu
      irrigation_type: "none", // Mặc định là không có
    };
  });

  /**
   * Update form values (dùng khi OCR hoặc user nhập liệu)
   */
  const updateFormValues = useCallback((values: Partial<FormFarmDTO>) => {
    setFormValues((prev) => ({ ...prev, ...values }));
  }, []);

  /**
   * Reset form về trạng thái ban đầu
   */
  const resetForm = useCallback(() => {
    setFormValues({});
  }, []);

  /**
   * Submit form - Tự động phân biệt create/update
   */
  const submitForm = useCallback(
    async (values: Record<string, any>) => {
      try {
        console.log("\n🔄 ===== useFarmForm.submitForm() =====");
        console.log("Mode:", mode);
        console.log("Farm ID:", farmId);
        console.log("Raw Values:", values);

        // Convert date strings (DD/MM/YYYY) to Unix timestamp
        const parseDateToTimestamp = (dateString: string): number => {
          const [day, month, year] = dateString.split("/");
          return Math.floor(
            new Date(`${year}-${month}-${day}`).getTime() / 1000
          );
        };

        const farmData: FormFarmDTO = {
          farm_name: values.farm_name as string,
          province: values.province as string,
          district: values.district as string,
          commune: values.commune as string,
          address: values.address as string,
          crop_type: values.crop_type as string,
          area_sqm: Number(values.area_sqm), // Giữ nguyên giá trị ha (đã được convert từ OCR hoặc user nhập)
          planting_date: parseDateToTimestamp(values.planting_date),
          expected_harvest_date: parseDateToTimestamp(
            values.expected_harvest_date
          ),
          land_certificate_number: values.land_certificate_number as string,
          owner_national_id: values.owner_national_id as string,
          soil_type: values.soil_type as string,
          has_irrigation: Boolean(values.has_irrigation),
          irrigation_type: (values.irrigation_type as string) || "none",
          boundary: values.boundary || formValues.boundary,
          center_location: values.center_location || formValues.center_location,
          land_certificate_photos:
            values.land_certificate_photos ||
            formValues.land_certificate_photos,
          status: "active",
          ...(mode === "edit" && values.status
            ? { status: values.status as string }
            : {}),
        };

        if (mode === "edit" && farmId) {
          // Update farm
          console.log("🔄 Calling updateFarmMutation...");
          await updateFarmMutation.mutateAsync({ farmId, payload: farmData });
        } else {
          // Create new farm
          console.log("➕ Calling createFarmMutation...");
          await createFarmMutation.mutateAsync(farmData);
        }
      } catch (error) {
        console.error("\n❌ ===== useFarmForm Submit Error =====");
        console.error(error);
        console.error("========================================\n");
        // Error sẽ được handle bởi mutation
      }
    },
    [mode, farmId, formValues, createFarmMutation, updateFarmMutation]
  );

  return {
    formValues,
    updateFormValues,
    resetForm,
    submitForm,
    isSubmitting: createFarmMutation.isPending || updateFarmMutation.isPending,
    isSuccess: createFarmMutation.isSuccess || updateFarmMutation.isSuccess,
    error: createFarmMutation.error || updateFarmMutation.error,
  };
};

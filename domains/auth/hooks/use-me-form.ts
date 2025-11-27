import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { UserProfile } from "../models/auth.models";
import { UserProfileFormSchema, userProfileSchema } from "../schemas/auth.schema";
import { useAuthStore } from "../stores/auth.store";
import useAuthMe from "./use-auth-me";

/**
 * Hook quản lý form chỉnh sửa thông tin profile
 * - Validation với Zod schema
 * - Submit với API update
 * - Đồng bộ với auth store
 * - Redirect vào eKYC workflow nếu cần
 */
export const useMeForm = (options?: { isFromEkyc?: boolean }) => {
  const { updateProfile, isUpdating } = useAuthMe();
  const { fetchUserProfile } = useAuthStore();
  const isFromEkyc = options?.isFromEkyc || false;

  // Form với validation
  const form = useForm<UserProfileFormSchema>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: "",
      display_name: "",
      date_of_birth: "",
      gender: "M",
      nationality: "Việt Nam",
      primary_phone: "",
      alternate_phone: "",
      email: "",
      permanent_address: "",
      current_address: "",
      province_code: "",
      province_name: "",
      district_code: "",
      district_name: "",
      ward_code: "",
      ward_name: "",
      postal_code: "",
    },
  });

  /**
   * Load dữ liệu profile hiện tại vào form
   */
  const loadProfileData = (profile: UserProfile) => {
    form.reset({
      full_name: profile.full_name || "",
      display_name: profile.display_name || "",
      date_of_birth: profile.date_of_birth || "",
      gender: (profile.gender as "M" | "F") || "M",
      nationality: profile.nationality || "Việt Nam",
      primary_phone: profile.primary_phone || "",
      alternate_phone: profile.alternate_phone || "",
      email: profile.email || "",
      permanent_address: profile.permanent_address || "",
      current_address: profile.current_address || "",
      province_code: profile.province_code || "",
      province_name: profile.province_name || "",
      district_code: profile.district_code || "",
      district_name: profile.district_name || "",
      ward_code: profile.ward_code || "",
      ward_name: profile.ward_name || "",
      postal_code: profile.postal_code || "",
    });
  };

  /**
   * Submit form - Cập nhật profile
   */
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Gọi API update
      await updateProfile(data as Partial<UserProfile>);

      // Refresh profile trong auth store
      await fetchUserProfile();

      // Thông báo thành công
      Alert.alert(
        "Thành công",
        "Cập nhật thông tin cá nhân thành công!",
        [
          {
            text: "OK",
            onPress: () => {
              if (isFromEkyc) {
                // Nếu đến từ eKYC workflow, redirect đến id-scan
                router.replace("/settings/verify/id-scan");
              } else {
                // Nếu không, quay lại trang trước
                router.back();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật profile:", error);
      
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể cập nhật thông tin. Vui lòng thử lại.",
        [{ text: "OK" }]
      );
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: isUpdating,
    loadProfileData,
  };
};

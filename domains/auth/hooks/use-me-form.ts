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
 */
export const useMeForm = () => {
  const { updateProfile, isUpdating } = useAuthMe();
  const { fetchUserProfile } = useAuthStore();

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
      // Thông tin ngân hàng
      account_number: "",
      account_name: "",
      bank_code: "",
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
      // Thông tin ngân hàng
      account_number: profile.account_number || "",
      account_name: profile.account_name || "",
      bank_code: profile.bank_code || "",
    });
  };

  /**
   * Submit form - Cập nhật profile (chỉ gửi các field đã thay đổi)
   */
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Lấy các field đã thay đổi (dirty fields)
      const dirtyFields = form.formState.dirtyFields;
      const changedData: Partial<UserProfile> = {};

      // Chỉ gửi các field đã thay đổi
      Object.keys(dirtyFields).forEach((key) => {
        if (dirtyFields[key as keyof typeof dirtyFields]) {
          changedData[key as keyof UserProfile] = data[
            key as keyof typeof data
          ] as any;
        }
      });

      // Nếu không có thay đổi, không gửi request
      if (Object.keys(changedData).length === 0) {
        Alert.alert("Thông báo", "Không có thông tin nào thay đổi!", [
          { text: "OK" },
        ]);
        return;
      }

      console.log("📤 Đang gửi dữ liệu đã thay đổi:", changedData);

      // Gọi API update với chỉ các field đã thay đổi
      await updateProfile(changedData);

      // Refresh profile trong auth store
      await fetchUserProfile();

      // Reset dirty state sau khi update thành công
      form.reset(data);

      // Thông báo thành công
      Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật profile:", error);

      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại.",
        [{ text: "OK" }]
      );
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: isUpdating,
    loadProfileData,
    isDirty: form.formState.isDirty, // Có thay đổi hay không
    dirtyFields: form.formState.dirtyFields, // Các field đã thay đổi
  };
};

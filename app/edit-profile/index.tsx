import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useToast } from "@/domains/shared/hooks/useToast";
import { VStack } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import CustomForm, { FormField } from "../../components/custom-form/index";
import { AgrisaHeader } from "../../components/Header";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const formRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Form fields for editing profile
  const formFields: FormField[] = [
    {
      name: "email",
      label: "Email",
      type: "input",
      placeholder: "Nhập email của bạn",
      required: true,
      helperText: "Email sẽ được sử dụng để đăng nhập và nhận thông báo",
    },
    {
      name: "phone_number",
      label: "Số điện thoại",
      type: "input",
      placeholder: "Nhập số điện thoại",
      required: true,
      helperText: "Số điện thoại sẽ được sử dụng để xác minh tài khoản",
    },
    {
      name: "submit",
      label: "Cập nhật thông tin",
      type: "button",
      isSubmit: true,
      buttonText: "Lưu thay đổi",
      loading: isLoading,
    },
  ];

  // Initial values from current user
  const initialValues = {
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      // TODO: Implement API call to update user profile
      // For now, just show a success message
      console.log("📝 [EditProfile] Updating profile:", values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Cập nhật thông tin thành công!");
      router.back();
    } catch (error) {
      console.error("❌ [EditProfile] Update failed:", error);
      toast.error("Có lỗi khi cập nhật thông tin. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <VStack className="flex-1 bg-white">
      <AgrisaHeader
        title="Chỉnh sửa hồ sơ"
        showBackButton={true}
        onBack={handleGoBack}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack space="md">
          {/* Header Info */}
          <View className="bg-white p-4 rounded-xl border border-gray-300">
            <Text className="text-black font-bold text-lg mb-2">
              Chỉnh sửa thông tin cá nhân
            </Text>
            <Text className="text-gray-600 text-sm">
              Cập nhật thông tin của bạn để đảm bảo tài khoản luôn được bảo mật
              và chính xác.
            </Text>
          </View>

          {/* Edit Form */}
          <View className="bg-white p-4 rounded-xl border border-gray-300">
            <CustomForm
              ref={formRef}
              fields={formFields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              formStyle={{ gap: 16 }}
            />
          </View>

          {/* Note */}
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <Text className="text-blue-800 text-sm">
              📝 Lưu ý: Việc thay đổi email hoặc số điện thoại có thể yêu cầu
              xác minh lại tài khoản.
            </Text>
          </View>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

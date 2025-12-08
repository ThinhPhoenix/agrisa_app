import CustomForm, { FormField } from "@/components/custom-form";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { Box, ScrollView, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import useAuthMe from "../../hooks/use-auth-me";
import { useMeForm } from "../../hooks/use-me-form";

/**
 * Component chỉnh sửa thông tin cá nhân
 * - Tất cả các field đều bắt buộc để xác thực danh tính
 * - Validation với Zod schema
 * - Auto-load dữ liệu từ profile hiện tại
 * - Sử dụng CustomForm với tối ưu hóa cho người Việt
 */
const MeComponentUI: React.FC = () => {
  const { colors } = useAgrisaColors();
  const { userProfile } = useAuthStore();
  const { data: profileData, refetch } = useAuthMe();
  const formRef = useRef<any>(null);

  // Form data state từ useMeForm
  const {
    form,
    onSubmit: handleFormSubmit,
    isSubmitting,
    loadProfileData,
    isDirty,
    dirtyFields,
  } = useMeForm();

  // Watch form values để detect changes
  const formValues = form.watch();

  // State để track đã load data chưa
  const [dataLoaded, setDataLoaded] = React.useState(false);

  // Load dữ liệu profile khi component mount
  useEffect(() => {
    const loadData = async () => {
      const data = profileData || userProfile;

      if (data) {
        loadProfileData(data);
        // Auto-fill vào CustomForm
        if (formRef.current) {
          formRef.current.setFieldsValue({
            full_name: data.full_name || "",
            display_name: data.display_name || "",
            date_of_birth: data.date_of_birth || "",
            gender: data.gender || "",
            nationality: data.nationality || "Việt Nam",
            primary_phone: data.primary_phone || "",
            alternate_phone: data.alternate_phone || "",
            email: data.email || "",
            permanent_address: data.permanent_address || "",
            current_address: data.current_address || "",
            province_code: data.province_code || "",
            province_name: data.province_name || "",
            district_code: data.district_code || "",
            district_name: data.district_name || "",
            ward_code: data.ward_code || "",
            ward_name: data.ward_name || "",
            postal_code: data.postal_code || "",
            // Thông tin ngân hàng
            account_number: data.account_number || "",
            account_name: data.account_name || "",
            bank_code: data.bank_code || "",
          });
        }
        setDataLoaded(true);
      } else {
        const { data: fetchedData } = await refetch();
        if (fetchedData) {
          loadProfileData(fetchedData);
          // Auto-fill vào CustomForm
          if (formRef.current) {
            formRef.current.setFieldsValue({
              full_name: fetchedData.full_name || "",
              display_name: fetchedData.display_name || "",
              date_of_birth: fetchedData.date_of_birth || "",
              gender: fetchedData.gender || "",
              nationality: fetchedData.nationality || "Việt Nam",
              primary_phone: fetchedData.primary_phone || "",
              alternate_phone: fetchedData.alternate_phone || "",
              email: fetchedData.email || "",
              permanent_address: fetchedData.permanent_address || "",
              current_address: fetchedData.current_address || "",
              province_code: fetchedData.province_code || "",
              province_name: fetchedData.province_name || "",
              district_code: fetchedData.district_code || "",
              district_name: fetchedData.district_name || "",
              ward_code: fetchedData.ward_code || "",
              ward_name: fetchedData.ward_name || "",
              postal_code: fetchedData.postal_code || "",
              // Thông tin ngân hàng
              account_number: fetchedData.account_number || "",
              account_name: fetchedData.account_name || "",
              bank_code: fetchedData.bank_code || "",
            });
          }
          setDataLoaded(true);
        }
      }
    };

    loadData();
  }, [profileData, userProfile]);

  // Helper format phone number cho người Việt
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, "").replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }

    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }

    if (cleaned.startsWith("+84")) {
      return cleaned;
    }

    if (cleaned.length >= 9 && cleaned.length <= 10) {
      return "+84" + cleaned;
    }

    return phone;
  };

  // Get current form values
  const getCurrentValues = () => form.getValues();

  // Define ALL form fields
  const formFields: FormField[] = [
    // ============================================
    // THÔNG TIN CƠ BẢN
    // ============================================
    {
      name: "full_name",
      label: "Họ và tên",
      type: "input",
      placeholder: "Nguyễn Văn A",
      required: false,
      helperText: "Họ tên đầy đủ theo CMND/CCCD",
    },
    {
      name: "display_name",
      label: "Tên hiển thị",
      type: "input",
      placeholder: "Tên gọi của bạn",
      required: false,
      helperText: "Tên bạn muốn hiển thị trong ứng dụng",
    },
    {
      name: "date_of_birth",
      label: "Ngày sinh",
      type: "datepicker",
      placeholder: "Chọn ngày sinh",
      required: false,
      dateFormat: "DD/MM/YYYY",
      maxDate: new Date(),
      helperText: "Định dạng: Ngày/Tháng/Năm",
    },
    {
      name: "gender",
      label: "Giới tính",
      type: "combobox",
      placeholder: "Chọn giới tính",
      required: false,
      options: [
        { label: "Nam", value: "M" },
        { label: "Nữ", value: "F" },
      ],
      showSearch: false,
    },
    {
      name: "nationality",
      label: "Quốc tịch",
      type: "input",
      placeholder: "Việt Nam",
      required: false,
    },

    // ============================================
    // THÔNG TIN LIÊN HỆ
    // ============================================
    {
      name: "primary_phone",
      label: "Số điện thoại chính",
      type: "input",
      placeholder: "0987654321 hoặc +84987654321",
      required: false,
      helperText: "Số điện thoại để xác thực và nhận thông báo",
    },
    {
      name: "alternate_phone",
      label: "Số điện thoại phụ",
      type: "input",
      placeholder: "0987654321 (không bắt buộc)",
      required: false,
      helperText: "Số điện thoại dự phòng",
    },
    {
      name: "email",
      label: "Email",
      type: "input",
      placeholder: "email@example.com",
      required: false,
      disabled: true,
      helperText: "Email không thể thay đổi",
    },

    // ============================================
    // ĐỊA CHỈ
    // ============================================
    {
      name: "permanent_address",
      label: "Địa chỉ thường trú",
      type: "input",
      placeholder: "Số nhà, tên đường, thôn/xóm...",
      required: false,
      helperText: "Địa chỉ theo CMND/CCCD",
    },
    {
      name: "current_address",
      label: "Địa chỉ hiện tại",
      type: "input",
      placeholder: "Số nhà, tên đường, thôn/xóm...",
      required: false,
      helperText: "Nơi bạn đang sinh sống",
    },
    {
      name: "province_code",
      label: "Mã tỉnh/thành",
      type: "input",
      placeholder: "VD: 01, 79...",
      required: false,
      helperText: "Mã hành chính tỉnh/thành phố",
    },
    {
      name: "province_name",
      label: "Tên tỉnh/thành",
      type: "input",
      placeholder: "VD: Hà Nội, TP Hồ Chí Minh...",
      required: false,
    },
    {
      name: "district_code",
      label: "Mã quận/huyện",
      type: "input",
      placeholder: "VD: 001, 002...",
      required: false,
      helperText: "Mã hành chính quận/huyện",
    },
    {
      name: "district_name",
      label: "Tên quận/huyện",
      type: "input",
      placeholder: "VD: Quận 1, Huyện Củ Chi...",
      required: false,
    },
    {
      name: "ward_code",
      label: "Mã phường/xã",
      type: "input",
      placeholder: "VD: 00001, 00002...",
      required: false,
      helperText: "Mã hành chính phường/xã",
    },
    {
      name: "ward_name",
      label: "Tên phường/xã",
      type: "input",
      placeholder: "VD: Phường Bến Nghé, Xã Tân Thông Hội...",
      required: false,
    },
    {
      name: "postal_code",
      label: "Mã bưu chính",
      type: "input",
      placeholder: "VD: 700000 (không bắt buộc)",
      required: false,
    },

    // ============================================
    // THÔNG TIN NGÂN HÀNG
    // ============================================
    {
      name: "account_number",
      label: "Số tài khoản ngân hàng",
      type: "input",
      placeholder: "VD: 28083101117776",
      required: false,
      helperText: "Số tài khoản để nhận bồi thường bảo hiểm",
    },
    {
      name: "account_name",
      label: "Tên chủ tài khoản",
      type: "input",
      placeholder: "VD: NGUYEN VAN A",
      required: false,
      helperText: "Tên chủ tài khoản (viết hoa, không dấu)",
    },
    {
      name: "bank_code",
      label: "Ngân hàng",
      type: "input",
      placeholder: "VD: 970422 (MB Bank)",
      required: false,
      helperText: "Mã NAPAS của ngân hàng (6 số)",
    },

    // ============================================
    // SUBMIT BUTTONS
    // ============================================
    {
      name: "submit",
      label: isSubmitting ? "Đang cập nhật..." : "Cập nhật thông tin",
      type: "button",
      isSubmit: true,
      disabled: isSubmitting || !isDirty, // Chỉ enable khi có thay đổi
      loading: isSubmitting,
    },
    {
      name: "cancel",
      label: "Hủy",
      type: "button",
      variant: "outline",
      onClick: () => router.back(),
    },
  ];

  // Handle submit với sync từ CustomForm sang react-hook-form
  const onSubmit = async (values: Record<string, any>) => {
    console.log("📝 Form values từ CustomForm:", values);
    console.log("🔍 Dirty fields:", dirtyFields);

    // Format phone numbers
    if (values.primary_phone) {
      values.primary_phone = formatPhoneNumber(values.primary_phone);
    }
    if (values.alternate_phone && values.alternate_phone.trim()) {
      values.alternate_phone = formatPhoneNumber(values.alternate_phone);
    }

    // Sync values to react-hook-form với dirty marking
    Object.keys(values).forEach((key) => {
      form.setValue(key as any, values[key], {
        shouldDirty: true, // Đánh dấu là dirty
        shouldValidate: true, // Validate field
      });
    });

    // Call original submit
    await handleFormSubmit();
  };

  // Get initial values from form - sử dụng dữ liệu đã load
  const data = profileData || userProfile;
  const initialValues = {
    full_name: data?.full_name || form.getValues("full_name") || "",
    display_name: data?.display_name || form.getValues("display_name") || "",
    date_of_birth: data?.date_of_birth || form.getValues("date_of_birth") || "",
    gender: data?.gender || form.getValues("gender") || "",
    nationality:
      data?.nationality || form.getValues("nationality") || "Việt Nam",
    primary_phone: data?.primary_phone || form.getValues("primary_phone") || "",
    alternate_phone:
      data?.alternate_phone || form.getValues("alternate_phone") || "",
    email: data?.email || form.getValues("email") || "",
    permanent_address:
      data?.permanent_address || form.getValues("permanent_address") || "",
    current_address:
      data?.current_address || form.getValues("current_address") || "",
    province_code: data?.province_code || form.getValues("province_code") || "",
    province_name: data?.province_name || form.getValues("province_name") || "",
    district_code: data?.district_code || form.getValues("district_code") || "",
    district_name: data?.district_name || form.getValues("district_name") || "",
    ward_code: data?.ward_code || form.getValues("ward_code") || "",
    ward_name: data?.ward_name || form.getValues("ward_name") || "",
    postal_code: data?.postal_code || form.getValues("postal_code") || "",
    // Thông tin ngân hàng
    account_number:
      data?.account_number || form.getValues("account_number") || "",
    account_name: data?.account_name || form.getValues("account_name") || "",
    bank_code: data?.bank_code || form.getValues("bank_code") || "",
  };

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack p="$4" space="lg" pb="$8">
        {/* Header */}
        <Box mb="$2">
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary_text}>
            Thông tin cá nhân
          </Text>
          <Text fontSize="$sm" color={colors.secondary_text} mt="$1">
            Cập nhật thông tin cá nhân của bạn
          </Text>
        </Box>

        {/* Single Form with all fields */}
        <CustomForm
          ref={formRef}
          fields={formFields}
          initialValues={initialValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          formStyle={{
            padding: 16,
            backgroundColor: colors.card_surface,
            borderRadius: 16,
          }}
        />
      </VStack>
    </ScrollView>
  );
};

export default MeComponentUI;

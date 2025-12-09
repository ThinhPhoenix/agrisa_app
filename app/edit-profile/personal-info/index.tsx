/**
 * ============================================
 * 👤 CHỈNH SỬA THÔNG TIN CÁ NHÂN
 * ============================================
 * Trang chỉnh sửa thông tin cá nhân bao gồm:
 * - Họ và tên
 * - Tên hiển thị
 * - Ngày sinh
 * - Giới tính
 * - Địa chỉ thường trú
 * - Địa chỉ hiện tại
 * - Tỉnh/Thành phố
 * - Quận/Huyện
 * - Phường/Xã
 */

import { AgrisaHeader } from "@/components/Header";
import { useGlobalNotification } from "@/components/modal/providers";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { UserProfile } from "@/domains/auth/models/auth.models";
import {
    Box,
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    ScrollView,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";

export default function PersonalInfoScreen() {
  const { colors } = useAgrisaColors();
  const { updateProfile, isUpdating } = useAuthMe();
  const notification = useGlobalNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho các fields
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("M");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation logic nếu cần
    // Hiện tại để tất cả field không bắt buộc

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const updateData: Partial<UserProfile> = {
        full_name: fullName.trim(),
        display_name: displayName.trim(),
        date_of_birth: dateOfBirth.trim(),
        gender: gender,
        permanent_address: permanentAddress.trim(),
        current_address: currentAddress.trim(),
        province_name: provinceName.trim(),
        district_name: districtName.trim(),
        ward_name: wardName.trim(),
      };

      console.log("📝 Updating personal info:", updateData);

      await updateProfile(updateData);

      notification.success("Cập nhật thông tin cá nhân thành công!");
      router.back();
    } catch (error: any) {
      console.error("❌ Error updating personal info:", error);
      notification.error("Không thể cập nhật thông tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AgrisaHeader title="Thông tin cá nhân" />
      <ScrollView flex={1} bg={colors.background}>
        <VStack p="$4" space="lg" pb="$8">
          {/* Header */}
          <Box>
            <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
              Cập nhật thông tin cá nhân
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text} mt="$2">
              Vui lòng điền đầy đủ thông tin cá nhân của bạn. Thông tin này sẽ được sử dụng cho các giao dịch bảo hiểm.
            </Text>
          </Box>

          {/* Form */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            elevation={5}
          >
            <VStack space="md">
              {/* Họ và tên */}
              <FormControl isInvalid={!!errors.full_name}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Họ và tên
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.full_name ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.full_name) setErrors({ ...errors, full_name: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.full_name && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.full_name}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Họ tên đầy đủ theo CMND/CCCD
                </Text>
              </FormControl>

              {/* Tên hiển thị */}
              <FormControl isInvalid={!!errors.display_name}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Tên hiển thị
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.display_name ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="Tên gọi của bạn"
                    value={displayName}
                    onChangeText={(text) => {
                      setDisplayName(text);
                      if (errors.display_name) setErrors({ ...errors, display_name: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.display_name && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.display_name}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Tên bạn muốn hiển thị trong ứng dụng
                </Text>
              </FormControl>

              {/* Ngày sinh */}
              <FormControl isInvalid={!!errors.date_of_birth}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Ngày sinh
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.date_of_birth ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="DD/MM/YYYY"
                    value={dateOfBirth}
                    onChangeText={(text) => {
                      setDateOfBirth(text);
                      if (errors.date_of_birth) setErrors({ ...errors, date_of_birth: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.date_of_birth && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.date_of_birth}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Định dạng: Ngày/Tháng/Năm
                </Text>
              </FormControl>

              {/* Giới tính */}
              <FormControl isInvalid={!!errors.gender}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Giới tính
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.gender ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="M (Nam) hoặc F (Nữ)"
                    value={gender}
                    onChangeText={(text) => {
                      setGender(text.toUpperCase());
                      if (errors.gender) setErrors({ ...errors, gender: "" });
                    }}
                    maxLength={1}
                    autoCapitalize="characters"
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.gender && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.gender}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Nhập M (Nam) hoặc F (Nữ)
                </Text>
              </FormControl>

              {/* Địa chỉ thường trú */}
              <FormControl isInvalid={!!errors.permanent_address}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Địa chỉ thường trú
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.permanent_address ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="Số nhà, tên đường, thôn/xóm..."
                    value={permanentAddress}
                    onChangeText={(text) => {
                      setPermanentAddress(text);
                      if (errors.permanent_address) setErrors({ ...errors, permanent_address: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.permanent_address && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.permanent_address}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Địa chỉ theo CMND/CCCD
                </Text>
              </FormControl>

              {/* Địa chỉ hiện tại */}
              <FormControl isInvalid={!!errors.current_address}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Địa chỉ hiện tại
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.current_address ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="Số nhà, tên đường, thôn/xóm..."
                    value={currentAddress}
                    onChangeText={(text) => {
                      setCurrentAddress(text);
                      if (errors.current_address) setErrors({ ...errors, current_address: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.current_address && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.current_address}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Nơi bạn đang sinh sống
                </Text>
              </FormControl>

              {/* Tỉnh/Thành phố */}
              <FormControl isInvalid={!!errors.province_name}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Tỉnh/Thành phố
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.province_name ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="VD: Hà Nội, TP Hồ Chí Minh..."
                    value={provinceName}
                    onChangeText={(text) => {
                      setProvinceName(text);
                      if (errors.province_name) setErrors({ ...errors, province_name: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.province_name && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.province_name}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Quận/Huyện */}
              <FormControl isInvalid={!!errors.district_name}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Quận/Huyện
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.district_name ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="VD: Quận 1, Huyện Củ Chi..."
                    value={districtName}
                    onChangeText={(text) => {
                      setDistrictName(text);
                      if (errors.district_name) setErrors({ ...errors, district_name: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.district_name && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.district_name}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Phường/Xã */}
              <FormControl isInvalid={!!errors.ward_name}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Phường/Xã
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.ward_name ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    placeholder="VD: Phường Bến Nghé, Xã Tân Thông Hội..."
                    value={wardName}
                    onChangeText={(text) => {
                      setWardName(text);
                      if (errors.ward_name) setErrors({ ...errors, ward_name: "" });
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.ward_name && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.ward_name}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Buttons */}
              <VStack space="sm" mt="$4">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? colors.frame_border : colors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Cập nhật thông tin</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.frame_border,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.primary_text, fontSize: 16, fontWeight: "600" }}>Hủy</Text>
                </TouchableOpacity>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </>
  );
}

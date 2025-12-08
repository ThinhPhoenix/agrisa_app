/**
 * ============================================
 * 📝 EDIT CARD INFO SCREEN
 * ============================================
 * Màn hình cho phép chỉnh sửa thông tin CCCD
 * 
 * Features:
 * - Load thông tin CCCD hiện tại
 * - Cho phép chỉnh sửa bất kỳ field nào
 * - Chỉ gửi các field đã thay đổi
 * - Thành công → quay lại trang confirm-info
 */

import CustomForm from "@/components/custom-form";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { UpdateCardInfoPayload } from "@/domains/eKYC/models/ekyc.models";
import {
    Box,
    Button,
    ButtonText,
    Center,
    HStack,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { AlertCircle, Save, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export default function EditCardInfoScreen() {
  const { colors } = useAgrisaColors();
  const { getCardInfo, updateCardInfoFieldsMutation, isUpdating } = useEkyc();
  const formRef = useRef<any>(null);

  // Fetch card info
  const {
    data: cardInfoData,
    isLoading,
    isError,
    refetch,
  } = getCardInfo();

  const cardInfo = cardInfoData && "data" in cardInfoData ? cardInfoData.data : null;

  // Form values - track changes
  const [formValues, setFormValues] = useState<UpdateCardInfoPayload>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values khi có data
  useEffect(() => {
    if (cardInfo) {
      setFormValues({
        national_id: cardInfo.national_id,
        name: cardInfo.name,
        dob: cardInfo.dob,
        sex: cardInfo.sex,
        nationality: cardInfo.nationality,
        home: cardInfo.home,
        address: cardInfo.address,
        doe: cardInfo.doe,
        issue_date: cardInfo.issue_date,
        issue_loc: cardInfo.issue_loc,
      });
    }
  }, [cardInfo]);

  // Track changes
  useEffect(() => {
    if (!cardInfo) return;
    
    const changed = Object.keys(formValues).some(
      (key) => formValues[key as keyof UpdateCardInfoPayload] !== cardInfo[key as keyof typeof cardInfo]
    );
    setHasChanges(changed);
  }, [formValues, cardInfo]);

  // Handle form values change
  const handleValuesChange = (values: any) => {
    setFormValues((prev) => ({ ...prev, ...values }));
  };

  // Handle submit - chỉ gửi các field đã thay đổi
  const handleSubmit = async () => {
    if (!cardInfo || !hasChanges) {
      Alert.alert("Thông báo", "Không có thay đổi nào để lưu.", [{ text: "Đóng" }]);
      return;
    }

    // Lọc ra chỉ các field đã thay đổi
    const changedFields: UpdateCardInfoPayload = {};
    Object.keys(formValues).forEach((key) => {
      const fieldKey = key as keyof UpdateCardInfoPayload;
      if (formValues[fieldKey] !== cardInfo[fieldKey]) {
        changedFields[fieldKey] = formValues[fieldKey];
      }
    });

    console.log("📤 Submitting changed fields:", changedFields);
    await updateCardInfoFieldsMutation.mutateAsync(changedFields);
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Hủy chỉnh sửa?",
        "Các thay đổi của bạn sẽ không được lưu.",
        [
          { text: "Tiếp tục chỉnh sửa", style: "cancel" },
          {
            text: "Hủy",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.secondary_text}>
          Đang tải thông tin...
        </Text>
      </Center>
    );
  }

  // Error state
  if (isError || !cardInfo) {
    return (
      <Center flex={1} bg={colors.background} px="$6">
        <VStack space="lg" alignItems="center">
          <AlertCircle size={80} color={colors.error} />
          <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
            Không thể tải thông tin
          </Text>
          <Button bg={colors.primary} onPress={() => refetch()}>
            <ButtonText>Thử lại</ButtonText>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg" p="$5" pb="$8">
          {/* Header */}
          <VStack space="sm" pt="$4">
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary_text}>
              Chỉnh sửa thông tin
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text}>
              Cập nhật các thông tin chưa chính xác từ CCCD
            </Text>
          </VStack>

          {/* Warning */}
          <Box
            bg={colors.warningSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.warning}
          >
            <HStack space="sm" alignItems="flex-start">
              <AlertCircle size={20} color={colors.warning} strokeWidth={2} />
              <VStack flex={1} space="xs">
                <Text fontSize="$sm" fontWeight="$semibold" color={colors.warning}>
                  Lưu ý khi chỉnh sửa
                </Text>
                <Text fontSize="$xs" color={colors.warning} lineHeight="$md">
                  • Chỉ chỉnh sửa nếu thông tin OCR bị sai{"\n"}
                  • Đảm bảo thông tin chính xác theo CCCD của bạn{"\n"}
                  • Thông tin này sẽ được sử dụng cho hồ sơ bảo hiểm
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Edit Form */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$5"
          >
            <CustomForm
              ref={formRef}
              fields={[
                {
                  name: "national_id",
                  label: "Số CCCD",
                  type: "input",
                  placeholder: "Nhập số CCCD",
                  required: true,
                  keyboardType: "numeric",
                },
                {
                  name: "name",
                  label: "Họ và tên",
                  type: "input",
                  placeholder: "Nhập họ tên đầy đủ",
                  required: true,
                },
                {
                  name: "dob",
                  label: "Ngày sinh (DD/MM/YYYY)",
                  type: "input",
                  placeholder: "VD: 15/03/1990",
                  required: true,
                  helperText: "Định dạng: Ngày/Tháng/Năm",
                },
                {
                  name: "sex",
                  label: "Giới tính",
                  type: "select",
                  placeholder: "Chọn giới tính",
                  required: true,
                  options: [
                    { label: "Nam", value: "NAM" },
                    { label: "Nữ", value: "NỮ" },
                  ],
                },
                {
                  name: "nationality",
                  label: "Quốc tịch",
                  type: "input",
                  placeholder: "VD: Việt Nam",
                  required: true,
                },
                {
                  name: "home",
                  label: "Quê quán",
                  type: "textarea",
                  placeholder: "Nhập địa chỉ quê quán",
                  required: true,
                  rows: 2,
                },
                {
                  name: "address",
                  label: "Nơi thường trú",
                  type: "textarea",
                  placeholder: "Nhập địa chỉ thường trú",
                  required: true,
                  rows: 2,
                },
                {
                  name: "issue_date",
                  label: "Ngày cấp (DD/MM/YYYY)",
                  type: "input",
                  placeholder: "VD: 01/01/2020",
                  required: true,
                },
                {
                  name: "doe",
                  label: "Ngày hết hạn (DD/MM/YYYY)",
                  type: "input",
                  placeholder: "VD: 01/01/2040",
                  required: true,
                },
                {
                  name: "issue_loc",
                  label: "Nơi cấp",
                  type: "input",
                  placeholder: "VD: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
                  required: true,
                },
              ]}
              initialValues={formValues}
              onValuesChange={handleValuesChange}
              showSubmitButton={false}
              formStyle={{
                padding: 0,
                backgroundColor: "transparent",
              }}
            />
          </Box>

          {/* Action Buttons */}
          <VStack space="md" mt="$2">
            {/* Save Button */}
            <Button
              bg={hasChanges ? colors.success : colors.muted_text}
              borderRadius="$xl"
              h="$12"
              onPress={handleSubmit}
              isDisabled={!hasChanges || isUpdating}
            >
              <HStack space="sm" alignItems="center">
                {isUpdating ? (
                  <Spinner size="small" color={colors.primary_white_text} />
                ) : (
                  <Save size={20} color={colors.primary_white_text} />
                )}
                <ButtonText fontSize="$md" fontWeight="$bold" color={colors.primary_white_text}>
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </ButtonText>
              </HStack>
            </Button>

            {/* Cancel Button */}
            <Button
              bg={colors.background}
              borderRadius="$xl"
              h="$12"
              borderWidth={1}
              borderColor={colors.frame_border}
              onPress={handleCancel}
              isDisabled={isUpdating}
            >
              <HStack space="sm" alignItems="center">
                <X size={20} color={colors.primary_text} />
                <ButtonText fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                  Hủy bỏ
                </ButtonText>
              </HStack>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

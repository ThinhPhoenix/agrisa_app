import CustomForm from "@/components/custom-form";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { CancelRequestType } from "@/domains/policy/models/policy.models";
import {
    Box,
    HStack,
    Image,
    Pressable,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, ImagePlus, Trash2, Upload } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Alert } from "react-native";
import { usePolicy } from "../../hooks/use-policy";

interface EvidencePhoto {
  id: string;
  uri: string;
  isUploading?: boolean;
  uploadedUrl?: string;
}

/**
 * Component form đề nghị hủy hợp đồng bảo hiểm
 * Bao gồm:
 * - Lý do hủy (reason)
 * - Số tiền đề nghị bồi thường (compensate_amount)
 * - Bằng chứng (evidence_photos) - tối đa 10 ảnh với ghi chú
 */
export const CancelPolicyRequest: React.FC = () => {
  const { colors } = useAgrisaColors();
  const { id: registeredPolicyId } = useLocalSearchParams<{ id: string }>();
  const { cancelPolicyMutation } = usePolicy();
  const formRef = useRef<any>(null);

  // States
  const [cancelType, setCancelType] = useState<CancelRequestType>("other");
  const [reason, setReason] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState(""); // Mô tả bằng chứng
  const [evidencePhotos, setEvidencePhotos] = useState<EvidencePhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const isFormValid =
    cancelType !== undefined &&
    reason.trim().length > 0 &&
    evidenceDescription.trim().length > 0 &&
    evidencePhotos.length > 0;

  // Debug validation
  console.log("🔍 Validation Debug:", {
    cancelType,
    reasonLength: reason.trim().length,
    evidenceDescriptionLength: evidenceDescription.trim().length,
    photosCount: evidencePhotos.length,
    isFormValid,
  });

  /**
   * Chọn ảnh từ thư viện
   */
  const pickImage = async () => {
    if (evidencePhotos.length >= 10) {
      Alert.alert(
        "Giới hạn ảnh",
        "Bạn chỉ có thể tải lên tối đa 10 ảnh bằng chứng.",
        [{ text: "Đóng" }]
      );
      return;
    }

    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục.",
          [{ text: "Đóng" }]
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: EvidencePhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          isUploading: false,
        };

        setEvidencePhotos([...evidencePhotos, newPhoto]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.", [
        { text: "Đóng" },
      ]);
    }
  };

  /**
   * Chụp ảnh mới
   */
  const takePhoto = async () => {
    if (evidencePhotos.length >= 10) {
      Alert.alert(
        "Giới hạn ảnh",
        "Bạn chỉ có thể tải lên tối đa 10 ảnh bằng chứng.",
        [{ text: "Đóng" }]
      );
      return;
    }

    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập camera để tiếp tục.",
          [{ text: "Đóng" }]
        );
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: EvidencePhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          isUploading: false,
        };

        setEvidencePhotos([...evidencePhotos, newPhoto]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.", [
        { text: "Đóng" },
      ]);
    }
  };

  /**
   * Xóa ảnh
   */
  const removePhoto = (photoId: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa ảnh này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setEvidencePhotos(evidencePhotos.filter((p) => p.id !== photoId));
        },
      },
    ]);
  };

  /**
   * Submit form
   */
  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ lý do, mô tả bằng chứng và tải lên ít nhất 1 ảnh.",
        [{ text: "Đóng" }]
      );
      return;
    }

    try {
        setIsSubmitting(true);

        // Set compensate_amount = 0 (không cho người dùng nhập)
        const amount = 0;

        // Tạo evidence object (description + images URLs)
        const evidence = {
          description: evidenceDescription,
          images: evidencePhotos.map((photo) => ({
            url: photo.uri, // TODO: Thay bằng URL thực sau khi upload
          })),
        };

        // Validate registered_policy_id exists
        if (!registeredPolicyId) {
          Alert.alert(
            "Lỗi",
            "Không tìm thấy thông tin hợp đồng. Vui lòng thử lại.",
            [{ text: "Đóng" }]
          );
          setIsSubmitting(false);
          return;
        }

        console.log("📤 Submitting cancel request:", {
          registered_policy_id: registeredPolicyId,
          cancel_request_type: cancelType,
          reason,
          compensate_amount: amount,
          evidence,
        });

        // Call mutation
        await cancelPolicyMutation.mutateAsync({
          registered_policy_id: registeredPolicyId,
          cancel_request_type: cancelType,
          reason,
          compensate_amount: amount,
          evidence,
        });

        // Success được xử lý trong mutation onSuccess
      } catch (error) {
      console.error("❌ Error submitting cancel request:", error);
      // Error được xử lý trong mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render ảnh bằng chứng
   */
  const renderEvidencePhoto = (photo: EvidencePhoto, index: number) => (
    <Box
      key={photo.id}
      position="relative"
      borderRadius="$lg"
      overflow="hidden"
      borderWidth={1}
      borderColor={colors.frame_border}
    >
      {/* Image */}
      <Image
        source={{ uri: photo.uri }}
        alt={`Evidence ${index + 1}`}
        width="100%"
        height={200}
        resizeMode="cover"
      />

      {/* Delete button overlay */}
      <Pressable
        onPress={() => removePhoto(photo.id)}
        position="absolute"
        top="$2"
        right="$2"
        bg={colors.error}
        borderRadius="$full"
        p="$2"
      >
        <Trash2 size={16} color={colors.primary_white_text} strokeWidth={2} />
      </Pressable>

      {/* Index badge */}
      <Box
        position="absolute"
        bottom="$2"
        left="$2"
        bg={colors.primary}
        borderRadius="$md"
        px="$2"
        py="$1"
      >
        <Text fontSize="$xs" fontWeight="$bold" color={colors.primary_white_text}>
          #{index + 1}
        </Text>
      </Box>
    </Box>
  );

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack p="$4" space="lg" pb="$20">
        {/* Header */}
        <Box>
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary_text}>
            Đề nghị hủy hợp đồng
          </Text>
          <Text fontSize="$sm" color={colors.secondary_text} mt="$1">
            Điền đầy đủ thông tin để gửi yêu cầu hủy hợp đồng bảo hiểm
          </Text>
        </Box>

        {/* Cảnh báo */}
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
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.warning}
              >
                Lưu ý quan trọng
              </Text>
              <Text fontSize="$xs" color={colors.warning} lineHeight="$md">
                • Yêu cầu hủy hợp đồng sẽ được xem xét trong 3-5 ngày làm việc
                {"\n"}• Vui lòng cung cấp đầy đủ bằng chứng và lý do chính xác
                {"\n"}• Số tiền bồi thường sẽ được đánh giá dựa trên thiệt hại
                thực tế
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Form chính */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <Text
              fontSize="$lg"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Thông tin yêu cầu
            </Text>

            {/* Loại hủy hợp đồng */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                Loại yêu cầu hủy <Text color={colors.error}>*</Text>
              </Text>
              <HStack space="sm">
                <Pressable
                  flex={1}
                  onPress={() => setCancelType("contract_violation")}
                >
                  <Box
                    bg={
                      cancelType === "contract_violation"
                        ? colors.primary
                        : colors.background
                    }
                    borderRadius="$lg"
                    p="$3"
                    alignItems="center"
                    borderWidth={1}
                    borderColor={
                      cancelType === "contract_violation"
                        ? colors.primary
                        : colors.frame_border
                    }
                  >
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={
                        cancelType === "contract_violation"
                          ? colors.primary_white_text
                          : colors.primary_text
                      }
                      textAlign="center"
                    >
                      Vi phạm hợp đồng
                    </Text>
                  </Box>
                </Pressable>

                <Pressable flex={1} onPress={() => setCancelType("other")}>
                  <Box
                    bg={
                      cancelType === "other"
                        ? colors.primary
                        : colors.background
                    }
                    borderRadius="$lg"
                    p="$3"
                    alignItems="center"
                    borderWidth={1}
                    borderColor={
                      cancelType === "other"
                        ? colors.primary
                        : colors.frame_border
                    }
                  >
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={
                        cancelType === "other"
                          ? colors.primary_white_text
                          : colors.primary_text
                      }
                      textAlign="center"
                    >
                      Lý do khác
                    </Text>
                  </Box>
                </Pressable>
              </HStack>
              <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                {cancelType === "contract_violation"
                  ? "Nhà cung cấp bảo hiểm vi phạm các điều khoản trong hợp đồng"
                  : "Các lý do khác như thiệt hại cây trồng, không thể tiếp tục,..."}
              </Text>
            </VStack>

            <VStack space="sm">
              {/* Reason field */}
              <CustomForm
                ref={formRef}
                fields={[
                  {
                    name: "reason",
                    label: "Lý do hủy hợp đồng",
                    type: "textarea",
                    placeholder:
                      "VD: Cây trồng bị thiệt hại nặng do lũ lụt, không thể phục hồi...",
                    required: true,
                    rows: 5,
                    helperText:
                      "Mô tả chi tiết lý do và tình trạng thiệt hại của cây trồng",
                  },
                ]}
                initialValues={{
                  reason: reason,
                }}
                onSubmit={() => {}}
                showSubmitButton={false}
                onValuesChange={(values) => {
                  if (values.reason !== undefined) {
                    setReason(values.reason);
                  }
                }}
                formStyle={{
                  padding: 0,
                  backgroundColor: "transparent",
                }}
              />
            </VStack>
          </VStack>
        </Box>

        {/* Bằng chứng */}
        <Box
          bg={colors.card_surface}
          borderRadius="$2xl"
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$5"
        >
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack flex={1}>
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Bằng chứng thiệt hại
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Mô tả + {evidencePhotos.length}/10 ảnh
                </Text>
              </VStack>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Mô tả bằng chứng */}
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                Mô tả bằng chứng <Text color={colors.error}>*</Text>
              </Text>
              <CustomForm
                fields={[
                  {
                    name: "evidence_description",
                    label: "",
                    type: "textarea",
                    placeholder:
                      "VD: Hình ảnh cho thấy cây lúa bị ngập úng hoàn toàn sau cơn lũ ngày 5/12, khoảng 80% diện tích bị thiệt hại...",
                    required: true,
                    rows: 4,
                  },
                ]}
                initialValues={{
                  evidence_description: evidenceDescription,
                }}
                onSubmit={() => {}}
                showSubmitButton={false}
                onValuesChange={(values) => {
                  if (values.evidence_description !== undefined) {
                    setEvidenceDescription(values.evidence_description);
                  }
                }}
                formStyle={{
                  padding: 0,
                  backgroundColor: "transparent",
                }}
              />
            </VStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
              Hình ảnh bằng chứng <Text color={colors.error}>*</Text>
            </Text>

            {/* Upload buttons */}
            <HStack space="sm">
              <Pressable
                flex={1}
                onPress={takePhoto}
                disabled={evidencePhotos.length >= 10}
                opacity={evidencePhotos.length >= 10 ? 0.5 : 1}
              >
                <Box
                  bg={colors.primary}
                  borderRadius="$lg"
                  p="$3"
                  alignItems="center"
                >
                  <HStack space="xs" alignItems="center">
                    <Upload
                      size={16}
                      color={colors.primary_white_text}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_white_text}
                    >
                      Chụp ảnh
                    </Text>
                  </HStack>
                </Box>
              </Pressable>

              <Pressable
                flex={1}
                onPress={pickImage}
                disabled={evidencePhotos.length >= 10}
                opacity={evidencePhotos.length >= 10 ? 0.5 : 1}
              >
                <Box
                  bg={colors.background}
                  borderRadius="$lg"
                  p="$3"
                  alignItems="center"
                  borderWidth={1}
                  borderColor={colors.primary}
                >
                  <HStack space="xs" alignItems="center">
                    <ImagePlus size={16} color={colors.primary} strokeWidth={2} />
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary}
                    >
                      Chọn ảnh
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            </HStack>

            {/* Danh sách ảnh - Grid 2 cột */}
            {evidencePhotos.length > 0 && (
              <Box mt="$2">
                <HStack flexWrap="wrap" gap="$3">
                  {evidencePhotos.map((photo, index) => (
                    <Box key={photo.id} width="48%">
                      {renderEvidencePhoto(photo, index)}
                    </Box>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Empty state */}
            {evidencePhotos.length === 0 && (
              <Box
                bg={colors.background}
                borderRadius="$lg"
                p="$8"
                alignItems="center"
                borderWidth={1}
                borderColor={colors.frame_border}
                borderStyle="dashed"
              >
                <ImagePlus
                  size={48}
                  color={colors.muted_text}
                  strokeWidth={1.5}
                />
                <Text
                  fontSize="$sm"
                  color={colors.muted_text}
                  textAlign="center"
                  mt="$3"
                >
                  Chưa có ảnh bằng chứng
                </Text>
                <Text
                  fontSize="$xs"
                  color={colors.muted_text}
                  textAlign="center"
                  mt="$1"
                >
                  Nhấn nút bên trên để thêm ảnh
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Submit button */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          opacity={!isFormValid || isSubmitting ? 0.5 : 1}
        >
          <Box
            bg={!isFormValid || isSubmitting ? colors.muted_text : colors.error}
            borderRadius="$xl"
            p="$4"
            alignItems="center"
          >
            {isSubmitting ? (
              <HStack space="sm" alignItems="center">
                <Spinner size="small" color={colors.primary_white_text} />
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  Đang gửi yêu cầu...
                </Text>
              </HStack>
            ) : (
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_white_text}
              >
                Gửi yêu cầu hủy hợp đồng
              </Text>
            )}
          </Box>
        </Pressable>

        {/* Cancel button */}
        <Pressable onPress={() => router.back()} disabled={isSubmitting}>
          <Box
            bg={colors.background}
            borderRadius="$xl"
            p="$4"
            alignItems="center"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
              Hủy bỏ
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </ScrollView>
  );
};

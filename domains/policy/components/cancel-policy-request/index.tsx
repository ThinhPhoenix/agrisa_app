import CustomForm from "@/components/custom-form";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { CancelRequestType } from "@/domains/policy/models/policy.models";
import { useImageUpload } from "@/domains/shared/hooks/use-image-upload";
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
  comment?: string; // Ghi chú/mô tả cho ảnh
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
  const { uploadMultipleImages } = useImageUpload();
  const formRef = useRef<any>(null);

  // States
  const [cancelType, setCancelType] = useState<CancelRequestType>("other");
  const [reason, setReason] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState(""); // Mô tả bằng chứng
  const [evidencePhotos, setEvidencePhotos] = useState<EvidencePhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState<string>(""); // Progress message

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
   * Cập nhật comment cho ảnh
   */
  const updatePhotoComment = (photoId: string, comment: string) => {
    setEvidencePhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, comment } : photo
      )
    );
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

    // Validate registered_policy_id exists
    if (!registeredPolicyId) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin hợp đồng. Vui lòng thử lại.",
        [{ text: "Đóng" }]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadingProgress("Đang upload ảnh lên server...");

      console.log("📤 Starting image upload process...");
      console.log(`📸 Total images to upload: ${evidencePhotos.length}`);

      // Bước 1: Upload tất cả ảnh lên imgbb
      const imageUris = evidencePhotos.map((photo) => photo.uri);
      let uploadedImageUrls: string[] = [];

      try {
        uploadedImageUrls = await uploadMultipleImages(imageUris);
        console.log("✅ All images uploaded successfully:", uploadedImageUrls);
      } catch (error: any) {
        console.error("❌ Error during image upload:", error);
        setUploadingProgress("");
        setIsSubmitting(false);

        Alert.alert(
          "Lỗi upload ảnh",
          error.message || "Không thể upload ảnh. Vui lòng kiểm tra kết nối và thử lại.",
          [{ text: "Đóng" }]
        );
        return;
      }

      // Bước 2: Sau khi upload ảnh thành công, tạo evidence object
      setUploadingProgress("Đang gửi yêu cầu hủy hợp đồng...");

      // Set compensate_amount = 0 (không cho người dùng nhập)
      const amount = 0;

      // Tạo evidence object với URLs đã upload và comments
      const evidence = {
        description: evidenceDescription,
        images: uploadedImageUrls.map((url, index) => ({
          url: url,
          comment: evidencePhotos[index]?.comment || undefined,
        })),
      };

      console.log("📤 Submitting cancel request with uploaded images:", {
        registered_policy_id: registeredPolicyId,
        cancel_request_type: cancelType,
        reason,
        compensate_amount: amount,
        evidence,
      });

      // Bước 3: Call mutation để gửi cancel request
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
      setUploadingProgress("");
    }
  };

  /**
   * Render ảnh bằng chứng
   */
  const renderEvidencePhoto = (photo: EvidencePhoto, index: number) => (
    <VStack
      key={photo.id}
      space="xs"
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.frame_border}
      p="$2"
      bg={colors.background}
    >
      {/* Image container */}
      <Box
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
          style={{ width: "100%", height: 180 }}
          resizeMode="cover"
        />

        {/* Delete button */}
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

      {/* Comment input */}
      <CustomForm
        fields={[
          {
            name: "comment",
            label: "",
            type: "input",
            placeholder: "Ghi chú cho ảnh này (tùy chọn)",
            required: false,
          },
        ]}
        initialValues={{
          comment: photo.comment || "",
        }}
        onSubmit={() => {}}
        showSubmitButton={false}
        onValuesChange={(values) => {
          if (values.comment !== undefined) {
            updatePhotoComment(photo.id, values.comment);
          }
        }}
        formStyle={{
          padding: 0,
          backgroundColor: "transparent",
        }}
      />
    </VStack>
  );

  return (
    <ScrollView flex={1} bg={colors.background}>
      <VStack p="$4" space="lg" pb="$20">
        {/* Header */}
        <Box>
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary_text}>
            Đơn đề nghị hủy hợp đồng
          </Text>
          <Text fontSize="$sm" color={colors.secondary_text} mt="$1">
            Điền đầy đủ thông tin để gửi yêu cầu hủy hợp đồng bảo hiểm
          </Text>
        </Box>

        {/* Cảnh báo */}
        <Box
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
                {"\n"}• Số tiền hoàn trả sẽ được đánh giá dựa trên thiệt hại
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
              Đơn đề nghị huỷ bỏ hợp đồng
            </Text>

            {/* Loại hủy hợp đồng */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={colors.primary_text}
              >
                Lý do huỷ <Text color={colors.error}>*</Text>
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
                      Phát hiện vi phạm
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
                    label: "Chi tiết lý do",
                    type: "textarea",
                    
                    required: true,
                    
                    helperText:
                      "Mô tả chi tiết lý do",
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
                  Thông tin bổ sung
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Cung cấp thêm các thông tin và bằng chứng bổ sung để hỗ trợ
                  đơn đề nghị hủy
                </Text>
              </VStack>
            </HStack>

            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Mô tả bằng chứng */}
            <VStack space="xs">
              
              <CustomForm
                fields={[
                  {
                    name: "evidence_description",
                    label: "Mô tả",
                    type: "textarea",
                    required: true,
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

            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Hình ảnh bổ sung <Text color={colors.error}>*</Text>
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
                    <ImagePlus
                      size={16}
                      color={colors.primary}
                      strokeWidth={2}
                    />
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

            {/* Danh sách ảnh - Full width với comment */}
            {evidencePhotos.length > 0 && (
              <VStack space="md" mt="$2">
                {evidencePhotos.map((photo, index) =>
                  renderEvidencePhoto(photo, index)
                )}
              </VStack>
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
              <VStack space="xs" alignItems="center">
                <HStack space="sm" alignItems="center">
                  <Spinner size="small" color={colors.primary_white_text} />
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                  >
                    Đang xử lý...
                  </Text>
                </HStack>
                {uploadingProgress && (
                  <Text
                    fontSize="$xs"
                    color={colors.primary_white_text}
                    textAlign="center"
                  >
                    {uploadingProgress}
                  </Text>
                )}
              </VStack>
            ) : (
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_white_text}
              >
                Gửi đơn yêu cầu huỷ
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
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Hủy bỏ
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </ScrollView>
  );
};

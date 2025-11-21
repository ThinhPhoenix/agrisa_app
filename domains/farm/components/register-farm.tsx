import { BoundaryCoordinatesInput } from "@/components/coordinates-input/BoundaryCoordinatesInput";
import { CustomForm } from "@/components/custom-form";
import FarmBoundaryMap from "@/components/map/FarmBoundaryMap";
import { NotificationModal, useNotificationModal } from "@/components/modal";
import OcrScanner from "@/components/ocr-scanner";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Farm, FormFarmDTO } from "@/domains/farm/models/farm.models";
import { BoundaryPolygon } from "@/libs/utils/coordinate-converter";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Button,
  ButtonText,
  Divider,
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import * as ImagePicker from "expo-image-picker";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  MapPin,
  Sprout,
  Trash2,
  Wheat,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { RED_BOOK_OCR_PROMPT } from "../constants/ocr-prompts";
import { useFarmForm } from "../hooks/use-farm-form";
import { createFarmFormFields } from "./form-fields";

interface RegisterFarmFormProps {
  mode?: "create" | "edit";
  initialData?: Farm | null;
  farmId?: string;
}

/**
 * Component nhỏ để upload thêm ảnh (không OCR)
 */
interface ImagePickerButtonProps {
  onImagesSelected: (uris: string[]) => void;
  maxImages: number;
}

const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImagesSelected,
  maxImages,
}) => {
  const { colors } = useAgrisaColors();
  const [isUploading, setIsUploading] = useState(false);

  const pickImages = async () => {
    try {
      setIsUploading(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Cần cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri);
        onImagesSelected(uris);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      alert("Không thể mở thư viện ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button
      onPress={pickImages}
      isDisabled={isUploading || maxImages <= 0}
      variant="outline"
      borderColor={colors.frame_border}
      borderWidth={1}
      bg={colors.background}
      borderRadius="$md"
      h="$12"
    >
      <ButtonText color={colors.primary_text} fontSize="$sm">
        + Thêm ảnh ({maxImages} còn lại)
      </ButtonText>
    </Button>
  );
};

/**
 * Component đăng ký nông trại - Giao diện mới trực quan
 *
 * Features:
 * - ✅ OCR sổ đỏ với multi-image support
 * - ✅ Form fields mapping theo FarmModel
 * - ✅ Tích hợp useFarmForm hook
 * - ✅ UI/UX được cải thiện
 */
export const RegisterFarmForm: React.FC<RegisterFarmFormProps> = ({
  mode = "create",
  initialData = null,
  farmId,
}) => {
  const { colors } = useAgrisaColors();
  const notification = useNotificationModal();

  // ===== FARM FORM HOOK =====
  const { formValues, updateFormValues, submitForm, isSubmitting } =
    useFarmForm({
      mode,
      farmId,
      initialData,
    });

  // ===== STATE =====
  const [redBookImages, setRedBookImages] = useState<string[]>([]);
  const [ocrResult, setOcrResult] = useState<Partial<FormFarmDTO> | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isVn2000, setIsVn2000] = useState(false); // Flag để biết OCR trả về VN2000 hay WGS84

  const MAX_IMAGES = 4;

  // Helper field cho boundary coordinates input (không gửi lên server)
  const [boundaryCoords, setBoundaryCoords] = useState<string>("");

  // Boundary polygon để hiển thị map
  const [boundaryPolygon, setBoundaryPolygon] =
    useState<BoundaryPolygon | null>(null);

  // Sync boundary from initialData (edit mode)
  useEffect(() => {
    if (initialData?.boundary) {
      const coordString = Utils.boundaryToString(initialData.boundary);
      setBoundaryCoords(coordString);
      setBoundaryPolygon(initialData.boundary);
      setIsVn2000(false); // Từ server về là WGS84
    }
  }, [initialData]);

  // ===== FORM FIELDS =====
  const formFields = createFarmFormFields({ mode, ocrResult });

  // ===== SUBMIT HANDLER =====
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      try {
        // Validate ảnh sổ đỏ trong Create Mode
        if (mode === "create" && redBookImages.length === 0) {
          notification.error("Vui lòng tải lên ít nhất 1 ảnh sổ đỏ!");
          return;
        }

        if (mode === "create" && redBookImages.length > MAX_IMAGES) {
          notification.error(`Chỉ được tải tối đa ${MAX_IMAGES} ảnh!`);
          return;
        }

        // Parse boundary từ string input nếu có
        let boundary =
          values.boundary || ocrResult?.boundary || formValues.boundary;
        if (boundaryCoords && typeof boundaryCoords === "string") {
          const parsedBoundary = Utils.parseBoundaryCoordinates(boundaryCoords);
          if (!parsedBoundary) {
            notification.error("Tọa độ ranh giới không hợp lệ!");
            return;
          }

          // GỬI NGUYÊN VN2000 VỀ BE - KHÔNG CONVERT!
          // Convert chỉ dùng để hiển thị map, không dùng để gửi về server
          boundary = parsedBoundary;

          console.log(
            isVn2000
              ? "✅ Sending VN2000 boundary to BE (no conversion)"
              : "✅ Sending WGS84 boundary to BE",
            JSON.stringify(boundary, null, 2)
          );
        }

        // Merge values (bỏ center_location)
        const finalValues: any = {
          ...values,
          boundary,
        };

        // Validate tọa độ boundary
        if (!finalValues.boundary) {
          notification.info(
            "Thiếu thông tin tọa độ ranh giới. Vui lòng nhập tọa độ thủ công!"
          );
        }
        await submitForm(finalValues);
      } catch (error) {
        notification.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    },
    [
      mode,
      farmId,
      ocrResult,
      formValues,
      submitForm,
      notification,
      boundaryCoords,
      redBookImages,
      isVn2000,
    ]
  );

  // ===== IMAGE HANDLERS =====
  const handleViewImage = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  const handleDeleteImage = (index: number) => {
    setRedBookImages((prev) => prev.filter((_, i) => i !== index));
    notification.success(`Đã xoá ảnh ${index + 1}`);
  };

  const handleCloseViewer = () => {
    setShowImageViewer(false);
    setSelectedImageIndex(null);
  };

  // ===== RENDER =====
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <VStack space="lg" px="$4" py="$4">
          {/* ===== HEADER ===== */}
          <Box
            bg={colors.primary}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.primary}
          >
            <HStack space="md" alignItems="center">
              <Box bg={colors.background} borderRadius="$lg" p="$3">
                {mode === "edit" ? (
                  <Wheat size={28} color={colors.primary} strokeWidth={2} />
                ) : (
                  <Sprout size={28} color={colors.success} strokeWidth={2} />
                )}
              </Box>

              <VStack flex={1}>
                <Text
                  fontSize="$xl"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  {mode === "edit" ? "Cập nhật nông trại" : "Đăng ký nông trại"}
                </Text>
                <Text
                  fontSize="$sm"
                  color={colors.primary_white_text}
                  opacity={0.85}
                >
                  {mode === "edit"
                    ? "Chỉnh sửa thông tin nông trại"
                    : "Bước đầu để nhận bảo hiểm nông nghiệp"}
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* ===== BƯỚC 1: OCR (CHỈ CREATE MODE) ===== */}
          {mode === "create" && (
            <VStack space="md">
              {/* Header đơn giản */}
              <HStack alignItems="center" justifyContent="space-between">
                <VStack flex={1}>
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    Bước 1: Chụp sổ đỏ
                  </Text>
                  <Text fontSize="$sm" color={colors.secondary_text} mt="$1">
                    {redBookImages.length > 0
                      ? `Đã tải lên ${redBookImages.length} ảnh`
                      : "Tải lên giấy chứng nhận quyền sử dụng đất"}
                  </Text>
                </VStack>

                {ocrResult && (
                  <HStack alignItems="center" space="xs">
                    <CheckCircle2
                      size={16}
                      color={colors.success}
                      strokeWidth={2}
                    />
                    <Text
                      fontSize="$sm"
                      color={colors.success}
                      fontWeight="$semibold"
                    >
                      Hoàn tất
                    </Text>
                  </HStack>
                )}
              </HStack>

              {/* Gallery ảnh - ra ngoài khung */}
              {redBookImages.length > 0 && (
                <Box>
                  <HStack flexWrap="wrap" gap="$2">
                    {redBookImages.map((uri, index) => (
                      <Box
                        key={index}
                        borderRadius="$md"
                        overflow="hidden"
                        borderWidth={1}
                        borderColor={colors.frame_border}
                        position="relative"
                        style={{ width: "48%", aspectRatio: 1 }}
                      >
                        <Image
                          source={{ uri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />

                        {/* Action buttons overlay */}
                        <HStack
                          position="absolute"
                          top="$2"
                          right="$2"
                          space="xs"
                        >
                          {/* View button */}
                          <TouchableOpacity
                            onPress={() => handleViewImage(index)}
                            style={{
                              backgroundColor: "rgba(0,0,0,0.6)",
                              borderRadius: 6,
                              padding: 6,
                            }}
                          >
                            <Eye size={16} color={"#fff"} strokeWidth={2} />
                          </TouchableOpacity>

                          {/* Delete button */}
                          <TouchableOpacity
                            onPress={() => handleDeleteImage(index)}
                            style={{
                              backgroundColor: "rgba(239,68,68,0.9)",
                              borderRadius: 6,
                              padding: 6,
                            }}
                          >
                            <Trash2 size={16} color={"#fff"} strokeWidth={2} />
                          </TouchableOpacity>
                        </HStack>

                        {/* Image number badge */}
                        <Box
                          position="absolute"
                          bottom="$2"
                          left="$2"
                          bg="rgba(0,0,0,0.6)"
                          borderRadius="$sm"
                          px="$2"
                          py="$1"
                        >
                          <Text
                            fontSize="$xs"
                            fontWeight="$semibold"
                            color={"#fff"}
                          >
                            {index + 1}/{redBookImages.length}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Nút upload - hiện khi chưa có ảnh HOẶC chưa đủ MAX_IMAGES */}
              {redBookImages.length === 0 ? (
                <VStack space="md">
                  {/* Tips đơn giản */}
                  <Box
                    bg={colors.background}
                    borderRadius="$md"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <HStack alignItems="flex-start" space="xs">
                      <AlertCircle
                        size={16}
                        color={colors.secondary_text}
                        strokeWidth={2}
                        style={{ marginTop: 2 }}
                      />
                      <VStack flex={1} space="xs">
                        <Text fontSize="$sm" color={colors.secondary_text}>
                          Chụp rõ giấy chứng nhận (tối đa {MAX_IMAGES} ảnh)
                        </Text>
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          Đủ ánh sáng, không bị mờ{"\n"}Chụp toàn bộ trang
                          {"\n"}Không che khuất thông tin
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* OCR Scanner */}
                  <OcrScanner
                    multiple
                    buttonLabel="Chụp sổ đỏ & Nhận diện"
                    prompt={RED_BOOK_OCR_PROMPT}
                    onResult={async ({
                      text,
                      uris,
                    }: {
                      text: string;
                      uris: string[];
                    }) => {
                      try {
                        // Giới hạn số lượng ảnh
                        const limitedUris = uris.slice(0, MAX_IMAGES);

                        if (uris.length > MAX_IMAGES) {
                          notification.info(
                            `Chỉ chọn được tối đa ${MAX_IMAGES} ảnh. Đã bỏ qua ${uris.length - MAX_IMAGES} ảnh.`
                          );
                        }

                        console.log("\n📸 ===== OCR RESULT =====");
                        console.log("Raw text:", text);
                        console.log("Images:", limitedUris); // Parse JSON từ response
                        let ocrData;
                        const trimmedText = text.trim();

                        // Remove markdown code blocks nếu có
                        const jsonMatch = trimmedText.match(
                          /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
                        );
                        const jsonText = jsonMatch ? jsonMatch[1] : trimmedText;

                        try {
                          ocrData = JSON.parse(jsonText);
                        } catch (e) {
                          ocrData = JSON.parse(trimmedText);
                        }

                        console.log(
                          "✅ Parsed OCR data:",
                          JSON.stringify(ocrData, null, 2)
                        );

                        // Validate required fields
                        if (
                          !ocrData.land_certificate_number ||
                          !ocrData.address
                        ) {
                          notification.error(
                            "Không đọc được thông tin. Vui lòng chụp lại!"
                          );
                          console.log(
                            "❌ Validation failed: Thiếu land_certificate_number hoặc address"
                          );
                          return;
                        }

                        // Validate boundary
                        if (!ocrData.boundary) {
                          console.log("⚠️ Warning: Thiếu thông tin boundary");
                          notification.info(
                            "Thiếu thông tin tọa độ ranh giới. Vui lòng bổ sung sau!"
                          );
                        }

                        // Convert boundary to string format using Utils
                        if (ocrData.boundary) {
                          const coordString = Utils.boundaryToString(
                            ocrData.boundary
                          );
                          setBoundaryCoords(coordString);
                          setBoundaryPolygon(ocrData.boundary);

                          // Kiểm tra xem boundary có phải VN2000 không
                          // VN2000: tọa độ thường > 100,000 (easting/northing)
                          // WGS84: kinh độ 102-110, vĩ độ 8-24
                          const firstCoord = ocrData.boundary.coordinates[0][0];
                          const isVn =
                            firstCoord[0] > 100000 || firstCoord[1] > 100000;
                          setIsVn2000(isVn);

                          if (isVn) {
                            console.log("⚠️ OCR detected VN2000 coordinates");
                          } else {
                            console.log("✅ OCR detected WGS84 coordinates");
                          }
                        }

                        // Convert images to base64 using Utils
                        console.log("🔄 Converting images to base64...");
                        const base64Images = await Promise.all(
                          uris.map(async (uri, index) => {
                            const base64Data =
                              await Utils.convertImageToBase64(uri);
                            return {
                              file_name: `land_certificate_${Date.now()}_${index + 1}.jpg`,
                              field_name: "land_certificate_photos",
                              data: base64Data,
                            };
                          })
                        );
                        console.log(
                          `✅ Converted ${base64Images.length} images to base64`
                        );

                        // Convert area_sqm từ m² sang ha trước khi set form
                        const areaInHectares = ocrData.area_sqm
                          ? ocrData.area_sqm / 10000
                          : undefined;

                        setOcrResult(ocrData);
                        updateFormValues({
                          ...ocrData,
                          area_sqm: areaInHectares,
                          land_certificate_photos: base64Images,
                        });
                        setRedBookImages(limitedUris);

                        console.log(
                          "✅ OCR thành công! Form đã được cập nhật."
                        );
                        console.log("==========================\n");

                        notification.success(
                          "Cập nhật thông tin từ sổ đỏ thành công"
                        );
                      } catch (error) {
                        console.error("\n❌ ===== OCR PARSE ERROR =====");
                        console.error("Error:", error);
                        console.error("==============================\n");
                        notification.error(
                          "Không thể xử lý kết quả. Vui lòng thử lại!"
                        );
                      }
                    }}
                  />
                </VStack>
              ) : (
                redBookImages.length < MAX_IMAGES && (
                  <ImagePickerButton
                    onImagesSelected={(newUris) => {
                      const remainingSlots = MAX_IMAGES - redBookImages.length;
                      const limitedUris = newUris.slice(0, remainingSlots);

                      if (newUris.length > remainingSlots) {
                        notification.info(
                          `Chỉ thêm được ${remainingSlots} ảnh. Đã bỏ qua ${newUris.length - remainingSlots} ảnh.`
                        );
                      }

                      setRedBookImages((prev) => [...prev, ...limitedUris]);
                      notification.success(`Đã thêm ${limitedUris.length} ảnh`);
                    }}
                    maxImages={MAX_IMAGES - redBookImages.length}
                  />
                )
              )}
            </VStack>
          )}

          {/* ===== FORM: THÔNG TIN NÔNG TRẠI ===== */}
          {(mode === "edit" || redBookImages.length > 0) && (
            <>
              <Divider />
              {/* Section Header */}
              <Box>
                <HStack space="sm" alignItems="center">
                  <VStack>
                    <Text
                      fontSize="$lg"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {mode === "edit"
                        ? "Thông tin nông trại"
                        : "Bước 2: Điền thông tin"}
                    </Text>
                    <Text pt="$2" fontSize="$sm" color={colors.secondary_text}>
                      {mode === "edit"
                        ? "Cập nhật chi tiết"
                        : "Thông tin được điền tự động, có thể sai sót. Vui lòng kiểm tra kỹ."}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
              <Divider />
              {/* Boundary Coordinates */}
              <VStack space="sm">
                <BoundaryCoordinatesInput
                  value={boundaryCoords}
                  onChange={(value) => {
                    setBoundaryCoords(value);
                  }}
                  label="Tọa độ ranh giới"
                  helperText={
                    ocrResult
                      ? "Thông tin được nhập tự động từ sổ đỏ nên có thể không chính xác hoàn toàn. Vui lòng kiểm tra kỹ."
                      : "Nhập các điểm tọa độ ranh giới nông trại (Polygon geometry)"
                  }
                  disabled={mode === "create" && !ocrResult}
                />

                {/* Nút cập nhật bản đồ */}
                {boundaryCoords && (
                  <Button
                    onPress={() => {
                      const parsed =
                        Utils.parseBoundaryCoordinates(boundaryCoords);
                      if (parsed) {
                        // Kiểm tra xem có phải VN2000 không
                        const firstCoord = parsed.coordinates[0][0];
                        const isVn =
                          firstCoord[0] > 100000 || firstCoord[1] > 100000;
                        setIsVn2000(isVn);

                        // Update polygon (giữ nguyên format gốc - VN2000 hoặc WGS84)
                        setBoundaryPolygon(parsed);

                        notification.success("Đã cập nhật bản đồ");
                        console.log(
                          isVn
                            ? "🗺️ Updated map with VN2000 coordinates"
                            : "🗺️ Updated map with WGS84 coordinates"
                        );
                      } else {
                        notification.error("Tọa độ không hợp lệ");
                      }
                    }}
                    variant="outline"
                    borderColor={colors.primary}
                    bg={colors.primary}
                    size="sm"
                  >
                    <HStack space="xs" alignItems="center">
                      <MapPin
                        size={16}
                        color={colors.primary_white_text}
                        strokeWidth={2}
                      />
                      <ButtonText
                        color={colors.primary_white_text}
                      >
                        Cập nhật bản đồ
                      </ButtonText>
                    </HStack>
                  </Button>
                )}
              </VStack>

              {/* Map Viewer */}
              {boundaryPolygon && (
                <VStack space="sm">
                  <HStack alignItems="center" space="xs">
                    <MapPin size={16} color={colors.primary} strokeWidth={2} />
                    <Text
                      fontSize="$md"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      Bản đồ nông trại
                    </Text>
                    {isVn2000 && (
                      <Box
                        bg={colors.warning + "20"}
                        borderRadius="$sm"
                        px="$2"
                        py="$1"
                      >
                        <Text
                          fontSize="$xs"
                          color={colors.warning}
                          fontWeight="$semibold"
                        >
                          VN2000
                        </Text>
                      </Box>
                    )}
                  </HStack>

                  <FarmBoundaryMap
                    boundary={boundaryPolygon}
                    isVn2000={isVn2000}
                    province={ocrResult?.province || formValues.province}
                    height={350}
                    showControls={true}
                  />

                  <Box
                    bg={colors.background}
                    borderRadius="$md"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <HStack alignItems="flex-start" space="xs">
                      <AlertCircle
                        size={16}
                        color={colors.secondary_text}
                        strokeWidth={2}
                        style={{ marginTop: 2 }}
                      />
                      <VStack flex={1}>
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          {isVn2000
                            ? "Tọa độ VN2000 được tự động chuyển sang WGS84 để hiển thị bản đồ. Dữ liệu gốc (VN2000) sẽ được gửi về hệ thống."
                            : "Bản đồ hiển thị ranh giới nông trại của bạn. Có thể zoom và di chuyển để xem chi tiết."}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              )}
              <Divider />

              <Box>
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$sm" flex={1}>
                    Thông tin nông trại
                  </Text>
                </HStack>
              </Box>

              {/* Main Form */}
              <CustomForm
                fields={formFields}
                initialValues={formValues}
                onSubmit={handleSubmit}
                submitButtonText={
                  isSubmitting
                    ? "Đang xử lý..."
                    : mode === "edit"
                      ? "Cập nhật"
                      : "Hoàn tất đăng ký"
                }
                isSubmitting={isSubmitting}
                gap={18}
              />
            </>
          )}
        </VStack>
      </ScrollView>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        {...notification.config}
        onClose={notification.hide}
      />

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseViewer}
        statusBarTranslucent
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleCloseViewer}
        >
          <Box
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            {selectedImageIndex !== null && (
              <Image
                source={{ uri: redBookImages[selectedImageIndex] }}
                style={{
                  width: Dimensions.get("window").width,
                  height: Dimensions.get("window").height * 0.8,
                }}
                resizeMode="contain"
              />
            )}

            {/* Close button */}
            <TouchableOpacity
              onPress={handleCloseViewer}
              style={{
                position: "absolute",
                top: 50,
                right: 20,
                backgroundColor: colors.error,
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.primary_white_text,
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                ×
              </Text>
            </TouchableOpacity>

            {/* Image counter */}
            {selectedImageIndex !== null && (
              <Box
                position="absolute"
                bottom={50}
                bg={colors.overlay}
                borderRadius="$lg"
                px="$4"
                py="$2"
              >
                <Text
                  fontSize="$md"
                  fontWeight="$semibold"
                  color={colors.primary_white_text}
                >
                  {selectedImageIndex + 1} / {redBookImages.length}
                </Text>
              </Box>
            )}
          </Box>
        </Pressable>
      </Modal>
    </>
  );
};

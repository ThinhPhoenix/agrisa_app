import { BoundaryCoordinatesInput } from "@/components/coordinates-input/BoundaryCoordinatesInput";
import { CustomForm } from "@/components/custom-form";
import OcrScanner from "@/components/ocr-scanner";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Farm, FormFarmDTO } from "@/domains/farm/models/farm.models";
import { useToast } from "@/domains/shared/hooks/useToast";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  HStack,
  Input,
  InputField,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText,
  Leaf,
  MapPin,
  Mountain,
  Sprout,
  Wheat,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";
import { RED_BOOK_OCR_PROMPT } from "../constants/ocr-prompts";
import { useFarmForm } from "../hooks/use-farm-form";
import { createFarmFormFields } from "./form-fields";

interface RegisterFarmFormProps {
  mode?: "create" | "edit";
  initialData?: Farm | null;
  farmId?: string;
}

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
  const { toast } = useToast();

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

  // Helper fields cho coordinate inputs (không gửi lên server)
  const [centerLng, setCenterLng] = useState<string>("");
  const [centerLat, setCenterLat] = useState<string>("");
  const [boundaryCoords, setBoundaryCoords] = useState<string>("");

  // Sync helper fields from initialData (edit mode)
  useEffect(() => {
    if (initialData) {
      // Parse center_location
      if (initialData.center_location?.coordinates) {
        setCenterLng(
          initialData.center_location.coordinates[0]?.toString() || ""
        );
        setCenterLat(
          initialData.center_location.coordinates[1]?.toString() || ""
        );
      }

      // Parse boundary using Utils
      if (initialData.boundary) {
        const coordString = Utils.boundaryToString(initialData.boundary);
        setBoundaryCoords(coordString);
      }
    }
  }, [initialData]);

  // ===== FORM FIELDS =====
  const formFields = createFarmFormFields({ mode, ocrResult });

  // ===== SUBMIT HANDLER =====
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      try {
        // Validate OCR trong Create Mode
        if (mode === "create" && !ocrResult) {
          toast.error("Vui lòng chụp ảnh sổ đỏ trước!");
          console.log("❌ Validation failed: Thiếu OCR result");
          return;
        }

        // Parse boundary từ string input nếu có
        let boundary =
          values.boundary || ocrResult?.boundary || formValues.boundary;
        if (boundaryCoords && typeof boundaryCoords === "string") {
          const parsedBoundary = Utils.parseBoundaryCoordinates(boundaryCoords);
          if (!parsedBoundary) {
            toast.error("Tọa độ ranh giới không hợp lệ!");
            return;
          }
          boundary = parsedBoundary;
          console.log(
            "✅ Parsed boundary from input:",
            JSON.stringify(boundary, null, 2)
          );
        }

        // Parse center_location từ lng/lat inputs
        let center_location =
          values.center_location ||
          ocrResult?.center_location ||
          formValues.center_location;
        if (centerLng && centerLat) {
          const parsedCenter = Utils.parseCenterLocation(centerLng, centerLat);
          if (!parsedCenter) {
            toast.error("Tọa độ trung tâm không hợp lệ!");
            return;
          }
          center_location = parsedCenter;
          console.log(
            "✅ Parsed center_location from inputs:",
            JSON.stringify(center_location, null, 2)
          );
        }

        // Merge values
        const finalValues: any = {
          ...values,
          boundary,
          center_location,
        };

        // Validate tọa độ
        if (!finalValues.boundary || !finalValues.center_location) {
          toast.warning(
            "Thiếu thông tin tọa độ. Vui lòng nhập tọa độ thủ công!"
          );
        }
        await submitForm(finalValues);
      } catch (error) {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    },
    [mode, farmId, ocrResult, formValues, submitForm, toast]
  );

  // ===== RENDER =====
  return (
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
          <Box
            bg={ocrResult ? colors.successSoft : colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={ocrResult ? colors.success : colors.frame_border}
          >
            <VStack space="md">
              {/* Header */}
              <HStack alignItems="center" justifyContent="space-between">
                <HStack space="sm" alignItems="center" flex={1}>
                  <Camera
                    size={20}
                    color={ocrResult ? colors.success : colors.secondary_text}
                    strokeWidth={2}
                  />

                  <VStack flex={1}>
                    <Text
                      fontSize="$md"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      Bước 1: Chụp sổ đỏ
                    </Text>
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      mt="$0.5"
                    >
                      {redBookImages.length > 0
                        ? `Đã tải ${redBookImages.length} ảnh`
                        : "Bắt buộc để lấy thông tin"}
                    </Text>
                  </VStack>
                </HStack>

                {ocrResult && (
                  <Box bg={colors.success} borderRadius="$md" px="$3" py="$1">
                    <HStack alignItems="center" space="xs">
                      <CheckCircle2
                        size={14}
                        color={colors.primary_white_text}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$xs"
                        color={colors.primary_white_text}
                        fontWeight="$semibold"
                      >
                        Hoàn tất
                      </Text>
                    </HStack>
                  </Box>
                )}
              </HStack>

              {/* Image Gallery hoặc Upload Button */}
              {redBookImages.length > 0 ? (
                <VStack space="sm">
                  {/* Preview ảnh */}
                  <Box
                    borderRadius="$lg"
                    overflow="hidden"
                    borderWidth={1}
                    borderColor={colors.success}
                  >
                    <Image
                      source={{ uri: redBookImages[0] }}
                      style={{ width: "100%", height: 200 }}
                      resizeMode="cover"
                    />
                  </Box>

                  {/* OCR Result Card */}
                  {ocrResult && (
                    <Box bg={colors.success} borderRadius="$lg" p="$3">
                      <HStack alignItems="center" space="xs" mb="$2">
                        <CheckCircle2
                          size={16}
                          color={colors.primary_white_text}
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          fontWeight="$semibold"
                          color={colors.primary_white_text}
                        >
                          Thông tin đã nhận diện
                        </Text>
                      </HStack>

                      <VStack space="xs">
                        {ocrResult.land_certificate_number && (
                          <HStack
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <HStack space="xs" alignItems="center">
                              <FileText
                                size={14}
                                color={colors.primary_white_text}
                                opacity={0.85}
                              />
                              <Text
                                fontSize="$xs"
                                color={colors.primary_white_text}
                                opacity={0.85}
                              >
                                Số sổ đỏ
                              </Text>
                            </HStack>
                            <Text
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_white_text}
                            >
                              {ocrResult.land_certificate_number}
                            </Text>
                          </HStack>
                        )}

                        {ocrResult.area_sqm && (
                          <HStack
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <HStack space="xs" alignItems="center">
                              <Mountain
                                size={14}
                                color={colors.primary_white_text}
                                opacity={0.85}
                              />
                              <Text
                                fontSize="$xs"
                                color={colors.primary_white_text}
                                opacity={0.85}
                              >
                                Diện tích
                              </Text>
                            </HStack>
                            <Text
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.primary_white_text}
                            >
                              {ocrResult.area_sqm.toLocaleString("vi-VN")} m²
                            </Text>
                          </HStack>
                        )}

                        {ocrResult.address && (
                          <VStack space="xs">
                            <HStack space="xs" alignItems="center">
                              <MapPin
                                size={14}
                                color={colors.primary_white_text}
                                opacity={0.85}
                              />
                              <Text
                                fontSize="$xs"
                                color={colors.primary_white_text}
                                opacity={0.85}
                              >
                                Địa chỉ
                              </Text>
                            </HStack>
                            <Text
                              fontSize="$xs"
                              fontWeight="$medium"
                              color={colors.primary_white_text}
                              ml="$4"
                            >
                              {ocrResult.address}
                            </Text>
                          </VStack>
                        )}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              ) : (
                // Upload Area
                <VStack space="md">
                  <Box alignItems="center" py="$6">
                    <Box
                      bg={colors.warningSoft}
                      borderRadius="$lg"
                      p="$6"
                      mb="$3"
                    >
                      <FileText
                        size={48}
                        color={colors.warning}
                        strokeWidth={1.5}
                      />
                    </Box>

                    <Text
                      fontSize="$md"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      Chụp ảnh sổ đỏ
                    </Text>
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      textAlign="center"
                      mt="$2"
                      px="$4"
                    >
                      Hệ thống AI sẽ tự động nhận diện thông tin
                    </Text>
                  </Box>

                  {/* Tips Card */}
                  <Box
                    bg={colors.infoSoft}
                    borderRadius="$lg"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.info}
                  >
                    <HStack alignItems="center" space="xs" mb="$2">
                      <AlertCircle
                        size={14}
                        color={colors.info}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$xs"
                        fontWeight="$semibold"
                        color={colors.info}
                      >
                        Hình ảnh phải đảm bảo:
                      </Text>
                    </HStack>
                    <VStack space="xs" ml="$4">
                      <Text fontSize="$xs" color={colors.primary_text}>
                        Đủ ánh sáng, rõ nét
                      </Text>
                      <Text fontSize="$xs" color={colors.primary_text}>
                        Chụp toàn bộ trang
                      </Text>
                      <Text fontSize="$xs" color={colors.primary_text}>
                        Không bị che khuất
                      </Text>
                    </VStack>
                  </Box>

                  {/* OCR Scanner */}
                  <OcrScanner
                    multiple
                    buttonLabel="Chụp ảnh sổ đỏ"
                    prompt={RED_BOOK_OCR_PROMPT}
                    onResult={async ({
                      text,
                      uris,
                    }: {
                      text: string;
                      uris: string[];
                    }) => {
                      try {
                        console.log("\n📸 ===== OCR RESULT =====");
                        console.log("Raw text:", text);
                        console.log("Images:", uris);

                        // Parse JSON từ response
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
                          toast.error(
                            "❌ Không đọc được thông tin. Vui lòng chụp lại!"
                          );
                          console.log(
                            "❌ Validation failed: Thiếu land_certificate_number hoặc address"
                          );
                          return;
                        }

                        // Validate boundary và center_location
                        if (!ocrData.boundary || !ocrData.center_location) {
                          console.log(
                            "⚠️ Warning: Thiếu boundary hoặc center_location"
                          );
                          toast.warning(
                            "Thiếu thông tin tọa độ. Sẽ bổ sung sau!"
                          );
                        }

                        // Convert center_location to helper fields
                        if (ocrData.center_location?.coordinates) {
                          setCenterLng(
                            ocrData.center_location.coordinates[0]?.toString() ||
                              ""
                          );
                          setCenterLat(
                            ocrData.center_location.coordinates[1]?.toString() ||
                              ""
                          );
                        }

                        // Convert boundary to string format using Utils
                        if (ocrData.boundary) {
                          const coordString = Utils.boundaryToString(
                            ocrData.boundary
                          );
                          setBoundaryCoords(coordString);
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

                        // Set OCR result và update form values
                        setOcrResult(ocrData);
                        updateFormValues({
                          ...ocrData,
                          land_certificate_photos: base64Images,
                        });
                        setRedBookImages(uris);

                        console.log(
                          "✅ OCR thành công! Form đã được cập nhật."
                        );
                        console.log("==========================\n");

                        toast.success("✅ Đã nhận diện thông tin thành công!");
                      } catch (error) {
                        console.error("\n❌ ===== OCR PARSE ERROR =====");
                        console.error("Error:", error);
                        console.error("==============================\n");
                        toast.error(
                          "Không thể xử lý kết quả. Vui lòng thử lại!"
                        );
                      }
                    }}
                  />
                </VStack>
              )}
            </VStack>
          </Box>
        )}

        

        {/* ===== FORM: THÔNG TIN NÔNG TRẠI ===== */}
        {(mode === "edit" || ocrResult) && (
          <>
            {/* Section Header */}
            <Box
              bg={colors.primarySoft}
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor={colors.primary + "30"}
            >
              <HStack space="sm" alignItems="center">
                <Leaf size={18} color={colors.primary} strokeWidth={2} />
                <VStack>
                  <Text
                    fontSize="$md"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {mode === "edit"
                      ? "Thông tin nông trại"
                      : "Bước 2: Điền thông tin"}
                  </Text>
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    {mode === "edit"
                      ? "Cập nhật chi tiết"
                      : "Xem và chỉnh sửa nếu cần"}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Info Notice (CREATE) */}
            {mode === "create" && (
              <Box
                bg={colors.successSoft}
                borderRadius="$md"
                p="$2.5"
                borderWidth={1}
                borderColor={colors.success + "30"}
              >
                <HStack space="xs" alignItems="center">
                  <CheckCircle2
                    size={14}
                    color={colors.success}
                    strokeWidth={2}
                  />
                  <Text fontSize="$xs" color={colors.success} flex={1}>
                    Thông tin đã tự động điền từ sổ đỏ
                  </Text>
                </HStack>
              </Box>
            )}

            {/* ===== PHẦN TỌA ĐỘ ===== */}
            <Box
              bg={colors.warningSoft}
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor={colors.warning + "30"}
            >
              <HStack space="sm" alignItems="center">
                <MapPin size={18} color={colors.warning} strokeWidth={2} />
                <VStack>
                  <Text
                    fontSize="$md"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    Tọa độ nông trại
                  </Text>
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    {ocrResult
                      ? "Kiểm tra và chỉnh sửa nếu cần"
                      : "Nhập thủ công nếu OCR thiếu"}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Center Location - 2 cột */}
            <Box
              bg={colors.card_surface}
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <VStack space="md">
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  Tọa độ trung tâm
                </Text>

                <HStack space="md">
                  {/* Kinh độ */}
                  <VStack flex={1} space="xs">
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Kinh độ
                    </Text>
                    <Input
                      variant="outline"
                      borderColor={colors.frame_border}
                      isDisabled={mode === "create" && !ocrResult}
                    >
                      <InputField
                        value={centerLng}
                        onChangeText={(v) => setCenterLng(v)}
                        placeholder="105.6302"
                        keyboardType="numeric"
                      />
                    </Input>
                  </VStack>

                  {/* Vĩ độ */}
                  <VStack flex={1} space="xs">
                    <Text
                      fontSize="$xs"
                      color={colors.secondary_text}
                      fontWeight="$medium"
                    >
                      Vĩ độ
                    </Text>
                    <Input
                      variant="outline"
                      borderColor={colors.frame_border}
                      isDisabled={mode === "create" && !ocrResult}
                    >
                      <InputField
                        value={centerLat}
                        onChangeText={(v) => setCenterLat(v)}
                        placeholder="10.4533"
                        keyboardType="numeric"
                      />
                    </Input>
                  </VStack>
                </HStack>

                
              </VStack>
            </Box>

            {/* Boundary Coordinates */}
            <BoundaryCoordinatesInput
              value={boundaryCoords}
              onChange={(value) => setBoundaryCoords(value)}
              label="Tọa độ ranh giới"
              helperText={
                ocrResult
                  ? "Thông tin được nhập tự động từ sổ đỏ nên có thể không chính xác hoàn toàn. Vui lòng kiểm tra kỹ."
                  : "Nhập các điểm tọa độ ranh giới nông trại (Polygon geometry)"
              }
              disabled={mode === "create" && !ocrResult}
            />

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
  );
};

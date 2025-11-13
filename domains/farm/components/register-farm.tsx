import type { FormField } from "@/components/custom-form";
import { BoundaryCoordinatesInput } from "@/components/BoundaryCoordinatesInput";
import { CustomForm } from "@/components/custom-form";
import OcrScanner from "@/components/ocr-scanner";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Farm, FormFarmDTO } from "@/domains/farm/models/farm.models";
import { useToast } from "@/domains/shared/hooks/useToast";
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
  Sprout
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, Image } from "react-native";
import { useFarmForm } from "../hooks/use-farm-form";

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
  const screenWidth = Dimensions.get('window').width;

  // ===== FARM FORM HOOK =====
  const { 
    formValues, 
    updateFormValues, 
    submitForm, 
    isSubmitting 
  } = useFarmForm({ 
    mode, 
    farmId, 
    initialData 
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
        setCenterLng(initialData.center_location.coordinates[0]?.toString() || "");
        setCenterLat(initialData.center_location.coordinates[1]?.toString() || "");
      }
      
      // Parse boundary
      if (initialData.boundary?.coordinates?.[0]) {
        const coordString = initialData.boundary.coordinates[0]
          .map((coord: number[]) => `${coord[0]},${coord[1]}`)
          .join("; ");
        setBoundaryCoords(coordString);
      }
    }
  }, [initialData]);

  // ===== HELPER FUNCTIONS =====
  /**
   * Convert image URI sang base64
   */
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      // Sử dụng fetch API để convert image sang base64
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove data URL prefix (data:image/jpeg;base64,)
          const base64 = base64data.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("❌ Error converting image to base64:", error);
      throw error;
    }
  };

  // ===== FORM FIELDS - Theo FormFarmDTO =====
  const formFields: FormField[] = [
    // ===== THÔNG TIN CƠ BẢN =====
    {
      name: "farm_name",
      label: "Tên nông trại",
      placeholder: "VD: Trang trại lúa Đồng Tháp",
      type: "input",
      required: true,
    },
    
    // ===== VỊ TRÍ ĐỊA LÝ =====
    {
      name: "province",
      label: "Tỉnh/Thành phố",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập tỉnh",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "district",
      label: "Quận/Huyện",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập quận/huyện",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "commune",
      label: "Phường/Xã",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập phường/xã",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "address",
      label: "Địa chỉ chi tiết",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập địa chỉ đầy đủ",
      type: "textarea",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },

    // ===== THÔNG TIN CANH TÁC =====
    {
      name: "crop_type",
      label: "Loại cây trồng",
      placeholder: "Chọn loại cây trồng",
      type: "select",
      required: true,
      options: [
        { label: "Lúa", value: "rice" },
        { label: "Cà phê", value: "coffee" },
      ],
    },
    {
      name: "area_sqm",
      label: "Diện tích (m²)",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập diện tích",
      type: "number",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText: "Đơn vị tính: mét vuông (m²)",
    },

    // ===== LỊCH CANH TÁC =====
    {
      name: "planting_date",
      label: "Ngày gieo trồng",
      placeholder: "Chọn ngày gieo trồng",
      type: "datepicker",
      required: true,
      dateFormat: "DD/MM/YYYY",
    },
    {
      name: "expected_harvest_date",
      label: "Ngày thu hoạch dự kiến",
      placeholder: "Chọn ngày thu hoạch",
      type: "datepicker",
      required: true,
      dateFormat: "DD/MM/YYYY",
    },

    // ===== GIẤY TỞ PHÁP LÝ =====
    {
      name: "land_certificate_number",
      label: "Số giấy chứng nhận đất",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập số sổ đỏ",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "owner_national_id",
      label: "Số CCCD chủ đất",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập số CCCD",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText: "Số Căn cước công dân của chủ sở hữu đất",
    },

    // ===== THÔNG TIN ĐẤT ĐAI =====
    {
      name: "soil_type",
      label: "Loại đất",
      placeholder: "Chọn loại đất",
      type: "select",
      required: true,
      options: [
        { label: "Đất phù sa", value: "alluvial" },
        { label: "Đất sét", value: "clay" },
        { label: "Đất cát", value: "sandy" },
        { label: "Đất thịt", value: "loam" },
        { label: "Đất than bùn", value: "peat" },
        { label: "Khác", value: "other" },
      ],
    },

    // ===== HỆ THỐNG TƯỚI TIÊU =====
    {
      name: "has_irrigation",
      label: "Có hệ thống tưới tiêu?",
      type: "switch",
      required: true,
    },
    {
      name: "irrigation_type",
      label: "Loại hệ thống tưới",
      placeholder: "Chọn loại hệ thống",
      type: "select",
      required: false,
      options: [
        { label: "Kênh mương", value: "canal" },
        { label: "Nhỏ giọt", value: "drip" },
        { label: "Phun mưa", value: "sprinkler" },
        { label: "Máy bơm", value: "pump" },
        { label: "Nước mưa", value: "rain_fed" },
        { label: "Không có", value: "none" },
      ],
    },

    // ===== TRẠNG THÁI (CHỈ EDIT MODE) =====
    ...(mode === "edit"
      ? [
          {
            name: "status",
            label: "Trạng thái nông trại",
            placeholder: "Chọn trạng thái",
            type: "select" as const,
            required: false,
            options: [
              { label: "Hoạt động", value: "active" },
              { label: "Tạm ngưng", value: "inactive" },
              { label: "Chờ xác minh", value: "pending_verification" },
              { label: "Lưu trữ", value: "archived" },
            ],
          },
        ]
      : []),
  ];

  // ===== SUBMIT HANDLER =====
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      try {
        console.log("\n🚀 ===== FARM FORM SUBMISSION =====");
        console.log("📋 Mode:", mode);
        console.log("🆔 Farm ID:", farmId);
        
        // Validate OCR trong Create Mode
        if (mode === "create" && !ocrResult) {
          toast.error("Vui lòng chụp ảnh sổ đỏ trước!");
          console.log("❌ Validation failed: Thiếu OCR result");
          return;
        }

        // Parse boundary từ string input nếu có
        let boundary = values.boundary || ocrResult?.boundary || formValues.boundary;
        if (boundaryCoords && typeof boundaryCoords === 'string') {
          try {
            // Parse boundary từ format: "lng,lat; lng,lat; lng,lat"
            const coords = boundaryCoords
              .split(';')
              .map((pair: string) => {
                const [lng, lat] = pair.trim().split(',').map(Number);
                return [lng, lat];
              });
            
            // Đảm bảo polygon đóng (điểm đầu = điểm cuối)
            if (coords.length > 0 && 
                (coords[0][0] !== coords[coords.length - 1][0] || 
                 coords[0][1] !== coords[coords.length - 1][1])) {
              coords.push([...coords[0]]);
            }

            boundary = {
              type: "Polygon",
              coordinates: [coords]
            };
            console.log("✅ Parsed boundary from input:", JSON.stringify(boundary, null, 2));
          } catch (error) {
            console.error("❌ Error parsing boundary_coords:", error);
            toast.error("Tọa độ ranh giới không hợp lệ!");
            return;
          }
        }

        // Parse center_location từ lng/lat inputs
        let center_location = values.center_location || ocrResult?.center_location || formValues.center_location;
        if (centerLng && centerLat) {
          center_location = {
            type: "Point",
            coordinates: [Number(centerLng), Number(centerLat)]
          };
          console.log("✅ Parsed center_location from inputs:", JSON.stringify(center_location, null, 2));
        }

        // Merge values
        const finalValues: any = {
          ...values,
          boundary,
          center_location,
        };

        // Log chi tiết các field
        console.log("\n📝 ===== FORM VALUES (PROCESSED) =====");
        console.log("farm_name:", finalValues.farm_name);
        console.log("province:", finalValues.province);
        console.log("district:", finalValues.district);
        console.log("commune:", finalValues.commune);
        console.log("address:", finalValues.address);
        console.log("crop_type:", finalValues.crop_type);
        console.log("area_sqm:", finalValues.area_sqm);
        console.log("planting_date (string):", finalValues.planting_date);
        console.log("expected_harvest_date (string):", finalValues.expected_harvest_date);
        console.log("land_certificate_number:", finalValues.land_certificate_number);
        console.log("soil_type:", finalValues.soil_type);
        console.log("has_irrigation:", finalValues.has_irrigation);
        console.log("irrigation_type:", finalValues.irrigation_type);
        console.log("status:", finalValues.status);
        console.log("boundary:", JSON.stringify(finalValues.boundary, null, 2));
        console.log("center_location:", JSON.stringify(finalValues.center_location, null, 2));

        // Validate tọa độ
        if (!finalValues.boundary || !finalValues.center_location) {
          toast.warning("Thiếu thông tin tọa độ. Vui lòng nhập tọa độ thủ công!");
          console.log("⚠️ Warning: Thiếu boundary hoặc center_location");
        }

        // Call submitForm từ useFarmForm
        console.log("\n🔄 Calling useFarmForm.submitForm()...");
        await submitForm(finalValues);
        
        console.log("✅ Submit thành công!");
        console.log("===================================\n");
      } catch (error) {
        console.error("\n❌ ===== SUBMIT ERROR =====");
        console.error("Error:", error);
        console.error("===========================\n");
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
            <Box
              bg="#FFFFFF"
              borderRadius="$lg"
              p="$3"
            >
              {mode === "edit" ? (
                <Leaf size={28} color={colors.primary} strokeWidth={2} />
              ) : (
                <Sprout size={28} color={colors.success} strokeWidth={2} />
              )}
            </Box>
            
            <VStack flex={1}>
              <Text fontSize="$xl" fontWeight="$bold" color="#FFFFFF">
                {mode === "edit" ? "Cập nhật nông trại" : "Đăng ký nông trại"}
              </Text>
              <Text fontSize="$sm" color="#FFFFFF" opacity={0.85}>
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
                  <Camera size={20} color={ocrResult ? colors.success : colors.secondary_text} strokeWidth={2} />
                  
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                      Bước 1: Chụp sổ đỏ
                    </Text>
                    <Text fontSize="$xs" color={colors.secondary_text} mt="$0.5">
                      {redBookImages.length > 0 
                        ? `Đã tải ${redBookImages.length} ảnh` 
                        : "Bắt buộc để lấy thông tin"}
                    </Text>
                  </VStack>
                </HStack>

                {ocrResult && (
                  <Box bg={colors.success} borderRadius="$md" px="$3" py="$1">
                    <HStack alignItems="center" space="xs">
                      <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2} />
                      <Text fontSize="$xs" color="#FFFFFF" fontWeight="$semibold">
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
                      style={{ width: '100%', height: 200 }}
                      resizeMode="cover"
                    />
                  </Box>

                  {/* OCR Result Card */}
                  {ocrResult && (
                    <Box
                      bg={colors.success}
                      borderRadius="$lg"
                      p="$3"
                    >
                      <HStack alignItems="center" space="xs" mb="$2">
                        <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text fontSize="$sm" fontWeight="$semibold" color="#FFFFFF">
                          Thông tin đã nhận diện
                        </Text>
                      </HStack>

                      <VStack space="xs">
                        {ocrResult.land_certificate_number && (
                          <HStack justifyContent="space-between" alignItems="center">
                            <HStack space="xs" alignItems="center">
                              <FileText size={14} color="#FFFFFF" opacity={0.85} />
                              <Text fontSize="$xs" color="#FFFFFF" opacity={0.85}>
                                Số sổ đỏ
                              </Text>
                            </HStack>
                            <Text fontSize="$xs" fontWeight="$semibold" color="#FFFFFF">
                              {ocrResult.land_certificate_number}
                            </Text>
                          </HStack>
                        )}

                        {ocrResult.area_sqm && (
                          <HStack justifyContent="space-between" alignItems="center">
                            <HStack space="xs" alignItems="center">
                              <Mountain size={14} color="#FFFFFF" opacity={0.85} />
                              <Text fontSize="$xs" color="#FFFFFF" opacity={0.85}>
                                Diện tích
                              </Text>
                            </HStack>
                            <Text fontSize="$xs" fontWeight="$semibold" color="#FFFFFF">
                              {ocrResult.area_sqm.toLocaleString("vi-VN")} m²
                            </Text>
                          </HStack>
                        )}

                        {ocrResult.address && (
                          <VStack space="xs">
                            <HStack space="xs" alignItems="center">
                              <MapPin size={14} color="#FFFFFF" opacity={0.85} />
                              <Text fontSize="$xs" color="#FFFFFF" opacity={0.85}>
                                Địa chỉ
                              </Text>
                            </HStack>
                            <Text fontSize="$xs" fontWeight="$medium" color="#FFFFFF" ml="$4">
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
                      <Camera size={48} color={colors.warning} strokeWidth={1.5} />
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
                    borderColor={colors.info + "30"}
                  >
                    <HStack alignItems="center" space="xs" mb="$2">
                      <AlertCircle size={14} color={colors.info} strokeWidth={2} />
                      <Text fontSize="$xs" fontWeight="$semibold" color={colors.info}>
                        Mẹo chụp ảnh tốt
                      </Text>
                    </HStack>
                    <VStack space="xs" ml="$4">
                      <Text fontSize="$xs" color={colors.primary_text}>
                        • Đủ ánh sáng, rõ nét
                      </Text>
                      <Text fontSize="$xs" color={colors.primary_text}>
                        • Chụp toàn bộ trang
                      </Text>
                      <Text fontSize="$xs" color={colors.primary_text}>
                        • Không bị che khuất
                      </Text>
                    </VStack>
                  </Box>

                  {/* OCR Scanner */}
                  <OcrScanner
                    multiple
                    buttonLabel="Chụp ảnh sổ đỏ"
                    prompt={`
                      Hãy phân tích hình ảnh sổ đỏ (Giấy chứng nhận quyền sử dụng đất) và trả về JSON với các trường sau:

                      THÔNG TIN BẮT BUỘC:
                      - land_certificate_number: Số giấy chứng nhận (VD: "BK 01234567")
                      - owner_national_id: Số CCCD/CMT của chủ sở hữu (VD: "001234567890")
                      - address: Địa chỉ thừa đất đầy đủ
                      - province: Tỉnh/Thành phố (VD: "Đồng Tháp")
                      - district: Quận/Huyện (VD: "Cao Lãnh")
                      - commune: Phường/Xã (VD: "Mỹ Hội")
                      - area_sqm: Diện tích đất (m²) - CHỈ LẤY SỐ

                      THÔNG TIN TỌA ĐỘ (nếu có):
                      - boundary: GeoJSON Polygon với format {type: "Polygon", coordinates: [[[lng, lat], [lng, lat], ...]]}
                      - center_location: GeoJSON Point với format {type: "Point", coordinates: [lng, lat]}

                      LƯU Ý:
                      - CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH GÌ THÊM
                      - Nếu không tìm thấy tọa độ, có thể bỏ qua boundary và center_location
                      - Diện tích phải là số nguyên (m²)
                      - owner_national_id là số CCCD/CMT của chủ đất (12 số hoặc 9 số)

                      VÍ DỤ JSON:
                      {
                        "land_certificate_number": "BK 01234567",
                        "owner_national_id": "001234567890",
                        "address": "Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh",
                        "province": "Đồng Tháp",
                        "district": "Cao Lãnh",
                        "commune": "Mỹ Hội",
                        "area_sqm": 50000,
                        "boundary": {
                          "type": "Polygon",
                          "coordinates": [[[105.123, 10.456], [105.124, 10.456], [105.124, 10.457], [105.123, 10.457], [105.123, 10.456]]]
                        },
                        "center_location": {
                          "type": "Point",
                          "coordinates": [105.1235, 10.4565]
                        }
                      }
                    `}
                    onResult={async ({ text, uris }: { text: string; uris: string[] }) => {
                      try {
                        console.log("\n📸 ===== OCR RESULT =====");
                        console.log("Raw text:", text);
                        console.log("Images:", uris);

                        // Parse JSON từ response
                        let ocrData;
                        const trimmedText = text.trim();
                        
                        // Remove markdown code blocks nếu có
                        const jsonMatch = trimmedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                        const jsonText = jsonMatch ? jsonMatch[1] : trimmedText;

                        try {
                          ocrData = JSON.parse(jsonText);
                        } catch (e) {
                          ocrData = JSON.parse(trimmedText);
                        }

                        console.log("✅ Parsed OCR data:", JSON.stringify(ocrData, null, 2));

                        // Validate required fields
                        if (!ocrData.land_certificate_number || !ocrData.address) {
                          toast.error("❌ Không đọc được thông tin. Vui lòng chụp lại!");
                          console.log("❌ Validation failed: Thiếu land_certificate_number hoặc address");
                          return;
                        }

                        // Validate boundary và center_location
                        if (!ocrData.boundary || !ocrData.center_location) {
                          console.log("⚠️ Warning: Thiếu boundary hoặc center_location");
                          toast.warning("Thiếu thông tin tọa độ. Sẽ bổ sung sau!");
                        }

                        // Convert center_location to helper fields
                        if (ocrData.center_location?.coordinates) {
                          setCenterLng(ocrData.center_location.coordinates[0]?.toString() || "");
                          setCenterLat(ocrData.center_location.coordinates[1]?.toString() || "");
                        }
                        
                        // Convert boundary to string format
                        if (ocrData.boundary?.coordinates?.[0]) {
                          const coordString = ocrData.boundary.coordinates[0]
                            .map((coord: number[]) => `${coord[0]},${coord[1]}`)
                            .join("; ");
                          setBoundaryCoords(coordString);
                        }

                        // Convert images to base64
                        console.log("🔄 Converting images to base64...");
                        const base64Images = await Promise.all(
                          uris.map(async (uri, index) => {
                            const base64Data = await convertImageToBase64(uri);
                            return {
                              file_name: `land_certificate_${Date.now()}_${index + 1}.jpg`,
                              field_name: "land_certificate_photos",
                              data: base64Data,
                            };
                          })
                        );
                        console.log(`✅ Converted ${base64Images.length} images to base64`);

                        // Set OCR result và update form values
                        setOcrResult(ocrData);
                        updateFormValues({
                          ...ocrData,
                          land_certificate_photos: base64Images,
                        });
                        setRedBookImages(uris);

                        console.log("✅ OCR thành công! Form đã được cập nhật.");
                        console.log("==========================\n");
                        
                        toast.success("✅ Đã nhận diện thông tin thành công!");
                      } catch (error) {
                        console.error("\n❌ ===== OCR PARSE ERROR =====");
                        console.error("Error:", error);
                        console.error("==============================\n");
                        toast.error("Không thể xử lý kết quả. Vui lòng thử lại!");
                      }
                    }}
                  />
                </VStack>
              )}
            </VStack>
          </Box>
        )}

        {/* ===== WARNING: Phải OCR trước (CREATE MODE) ===== */}
        {mode === "create" && !ocrResult && (
          <Box
            bg={colors.errorSoft}
            borderRadius="$lg"
            p="$3"
            borderWidth={1}
            borderColor={colors.error}
          >
            <HStack space="sm" alignItems="center">
              <AlertCircle size={16} color={colors.error} strokeWidth={2} />
              <VStack flex={1}>
                <Text fontSize="$sm" fontWeight="$semibold" color={colors.error}>
                  Chưa thể điền thông tin
                </Text>
                <Text fontSize="$xs" color={colors.error} mt="$0.5">
                  Vui lòng chụp ảnh sổ đỏ ở Bước 1
                </Text>
              </VStack>
            </HStack>
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
                  <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                    {mode === "edit" ? "Thông tin nông trại" : "Bước 2: Điền thông tin"}
                  </Text>
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    {mode === "edit" ? "Cập nhật chi tiết" : "Xem và chỉnh sửa nếu cần"}
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
                  <CheckCircle2 size={14} color={colors.success} strokeWidth={2} />
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
                  <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                    Tọa độ nông trại
                  </Text>
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    {ocrResult ? "Kiểm tra và chỉnh sửa nếu cần" : "Nhập thủ công nếu OCR thiếu"}
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
                <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                  Tọa độ trung tâm (Center Location)
                </Text>
                
                <HStack space="md">
                  {/* Kinh độ */}
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Kinh độ (Longitude)
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
                    <Text fontSize="$xs" color={colors.secondary_text} fontWeight="$medium">
                      Vĩ độ (Latitude)
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

                <Box
                  bg={colors.infoSoft}
                  borderRadius="$md"
                  p="$2"
                  borderWidth={1}
                  borderColor={colors.info + "30"}
                >
                  <HStack space="xs" alignItems="center">
                    <MapPin size={12} color={colors.info} />
                    <Text fontSize="$2xs" color={colors.info} flex={1}>
                      Điểm trung tâm nông trại (Point geometry)
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            {/* Boundary Coordinates */}
            <BoundaryCoordinatesInput
              value={boundaryCoords}
              onChange={(value) => setBoundaryCoords(value)}
              label="Tọa độ ranh giới (Boundary)"
              helperText={ocrResult 
                ? "OCR đã nhận diện. Bạn có thể chỉnh sửa hoặc thêm điểm nếu cần." 
                : "Nhập các điểm tọa độ ranh giới nông trại (Polygon geometry)"}
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

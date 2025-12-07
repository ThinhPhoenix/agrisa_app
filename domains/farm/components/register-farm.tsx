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
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  Shield,
  Sprout,
  Trash2,
  Upload,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
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
 * Component đăng ký nông trại - Giao diện trực quan theo mockup
 *
 * Features:
 * - ✅ OCR sổ đỏ tích hợp trực tiếp trong nút
 * - ✅ Progress indicator 2 bước rõ ràng
 * - ✅ Layout sạch sẽ, dễ hiểu cho nông dân
 * - ✅ Thông báo về quy trình kiểm duyệt
 */
export const RegisterFarmForm: React.FC<RegisterFarmFormProps> = ({
  mode = "create",
  initialData = null,
  farmId,
}) => {
  const { colors } = useAgrisaColors();
  const notification = useNotificationModal();
  const router = useRouter();
  const navigation = useNavigation();

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
  const [isVn2000, setIsVn2000] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<any>(null);
  const [allowNavigation, setAllowNavigation] = useState(false);

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

  // Reset allowNavigation khi component mount/unmount
  useEffect(() => {
    return () => {
      setAllowNavigation(false);
    };
  }, []);

  // Disable swipe gesture khi đang có dữ liệu (iOS fix)
  useEffect(() => {
    if (mode !== "create") return;

    const hasData = redBookImages.length > 0 || ocrResult !== null;

    navigation.setOptions({
      gestureEnabled: !hasData, // Disable swipe khi có dữ liệu
    });
  }, [navigation, mode, redBookImages, ocrResult]);

  // Xử lý cảnh báo khi thoát giữa chừng - chặn cả navigation gesture và back button
  useEffect(() => {
    if (mode !== "create") return;

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Cho phép navigation nếu đã được mark là allow (submit success, auto redirect, etc.)
      if (allowNavigation) {
        return;
      }

      // Nếu không có dữ liệu thì cho thoát tự do
      if (!redBookImages.length && !ocrResult) {
        return;
      }

      // Prevent default behavior - chặn user tự thoát
      e.preventDefault();

      // Lưu navigation action để thực hiện sau khi confirm
      setPendingNavigation(e.data.action);
      setShowExitConfirm(true);
    });

    return unsubscribe;
  }, [navigation, mode, redBookImages, ocrResult, allowNavigation]);

  // Xử lý hardware back button riêng cho Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Cho phép thoát nếu đã được mark (submit success, redirect, etc.)
        if (allowNavigation) {
          return false;
        }

        if (mode === "create" && (redBookImages.length > 0 || ocrResult)) {
          setShowExitConfirm(true);
          return true; // Block - chờ user confirm trong modal
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [mode, redBookImages, ocrResult, allowNavigation])
  );

  // Handler xác nhận thoát
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (pendingNavigation) {
      navigation.dispatch(pendingNavigation);
      setPendingNavigation(null);
    } else {
      // Nếu từ hardware back button (không có pendingNavigation)
      router.back();
    }
  };

  // Handler hủy thoát
  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavigation(null);
  };

  // ===== FORM FIELDS =====
  const formFields = createFarmFormFields({ mode, ocrResult });

  // ===== OCR RESULT HANDLER =====
  const handleOcrResult = async ({
    text,
    uris,
  }: {
    text: string;
    uris: string[];
  }) => {
    try {
      const limitedUris = uris.slice(0, MAX_IMAGES);

      if (uris.length > MAX_IMAGES) {
        notification.info(
          `Chỉ chọn được tối đa ${MAX_IMAGES} ảnh. Đã bỏ ${uris.length - MAX_IMAGES} ảnh.`
        );
      }

      console.log("\n📸 ===== OCR RESULT =====");
      console.log("Raw text:", text);
      console.log("Images:", limitedUris);

      let ocrData;
      const trimmedText = text.trim();
      const jsonMatch = trimmedText.match(
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
      );
      const jsonText = jsonMatch ? jsonMatch[1] : trimmedText;

      try {
        ocrData = JSON.parse(jsonText);
      } catch (e) {
        ocrData = JSON.parse(trimmedText);
      }

      console.log("✅ Parsed OCR data:", JSON.stringify(ocrData, null, 2));

      if (!ocrData.land_certificate_number || !ocrData.address) {
        notification.error(
          "Không đọc được thông tin từ ảnh. Vui lòng chụp rõ hơn!"
        );
        return;
      }

      if (!ocrData.boundary) {
        notification.info("Thiếu tọa độ ranh giới. Bạn có thể bổ sung sau!");
      }

      if (ocrData.boundary) {
        const coordString = Utils.boundaryToString(ocrData.boundary);
        setBoundaryCoords(coordString);
        setBoundaryPolygon(ocrData.boundary);

        const firstCoord = ocrData.boundary.coordinates[0][0];
        const isVn = firstCoord[0] > 100000 || firstCoord[1] > 100000;
        setIsVn2000(isVn);
      }

      const base64Images = await Promise.all(
        limitedUris.map(async (uri, index) => {
          const base64Data = await Utils.convertImageToBase64(uri);
          return {
            file_name: `land_certificate_${Date.now()}_${index + 1}.jpg`,
            field_name: "land_certificate_photos",
            data: base64Data,
          };
        })
      );

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

      notification.success(
        "Quét thông tin thành công!\nVui lòng kiểm tra thông tin trang trại."
      );
    } catch (error) {
      console.error("❌ OCR PARSE ERROR:", error);
      notification.error("Không thể xử lý ảnh. Vui lòng thử lại!");
    }
  };

  // ===== SUBMIT HANDLER =====
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      try {
        // Validate ảnh giấy tờ trong Create Mode
        if (mode === "create" && redBookImages.length === 0) {
          notification.error("Vui lòng tải lên ít nhất 1 ảnh giấy tờ!");
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

        // CHO PHÉP NAVIGATION NGAY TỪ ĐẦU
        // Vì submitForm có thể trigger navigation ngay lập tức (success hoặc error redirect)
        setAllowNavigation(true);

        try {
          await submitForm(finalValues);
          // Nếu success, giữ allowNavigation = true để redirect
        } catch (error) {
          // Nếu error và KHÔNG redirect, reset lại
          // Nhưng nếu có redirect thì vẫn giữ true
          console.error("Submit error:", error);
          // Delay một chút để cho navigation kịp xảy ra trước khi reset
          setTimeout(() => {
            setAllowNavigation(false);
          }, 100);
          throw error;
        }
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
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <VStack space="xl" px="$4" py="$4">
          {/* ===== HEADER ===== */}
          <VStack space="md">
            {mode === "create" && (
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.success}
              >
                <HStack space="sm" alignItems="center">
                  <Shield size={18} color={colors.success} strokeWidth={2.5} />
                  <Text
                    flex={1}
                    fontSize="$xs"
                    fontWeight="$semibold"
                    lineHeight={18}
                  >
                    Các thông tin liên quan đến nông trại sẽ được bảo mật
                  </Text>
                </HStack>
              </Box>
            )}

            <VStack space="xs">
              <Text
                fontSize="$2xl"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                {mode === "edit"
                  ? "Cập nhật thông tin nông trại"
                  : "Đăng ký nông trại"}
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                lineHeight={20}
              >
                {mode === "edit"
                  ? "Chỉnh sửa thông tin nông trại của bạn"
                  : "Tải ảnh Giấy chứng nhận quyền sử dụng đất để bắt đầu"}
              </Text>
            </VStack>
          </VStack>

          {/* ===== PROGRESS INDICATOR (CHỈ CREATE MODE) ===== */}
          {mode === "create" && (
            <HStack
              justifyContent="center"
              alignItems="center"
              space="md"
              px="$4"
            >
              {/* Step 1 */}
              <VStack space="xs" alignItems="center" flex={1}>
                <Box
                  w={48}
                  h={48}
                  borderRadius="$full"
                  bg={
                    redBookImages.length > 0 ? colors.success : colors.primary
                  }
                  alignItems="center"
                  justifyContent="center"
                >
                  {redBookImages.length > 0 ? (
                    <CheckCircle2
                      size={24}
                      color={colors.primary_white_text}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Text
                      fontSize="$xl"
                      fontWeight="$bold"
                      color={colors.primary_white_text}
                    >
                      1
                    </Text>
                  )}
                </Box>
                <Text
                  fontSize="$xs"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                  textAlign="center"
                >
                  Tải lên ảnh giấy chứng nhận
                </Text>
              </VStack>

              {/* Connector */}
              <Box width={40} height={2} bg={colors.frame_border} mt={-16} />

              {/* Step 2 */}
              <VStack space="xs" alignItems="center" flex={1}>
                <Box
                  w={48}
                  h={48}
                  borderRadius="$full"
                  bg={
                    redBookImages.length > 0
                      ? colors.primary
                      : colors.card_surface
                  }
                  borderWidth={2}
                  borderColor={
                    redBookImages.length > 0
                      ? colors.primary
                      : colors.frame_border
                  }
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={
                      redBookImages.length > 0
                        ? colors.primary_white_text
                        : colors.secondary_text
                    }
                  >
                    2
                  </Text>
                </Box>
                <Text
                  fontSize="$xs"
                  fontWeight={
                    redBookImages.length > 0 ? "$semibold" : "$normal"
                  }
                  color={
                    redBookImages.length > 0
                      ? colors.primary_text
                      : colors.secondary_text
                  }
                  textAlign="center"
                >
                  Kiểm tra thông tin và đăng ký
                </Text>
              </VStack>
            </HStack>
          )}

          {/* ===== BƯỚC 1: TẢI ẢNH GIẤY TỜ ===== */}
          {mode === "create" && redBookImages.length === 0 && (
            <VStack space="lg">
              {/* Card hướng dẫn */}
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$4"
                borderWidth={1}
                borderColor={colors.shadow}
              >
                <VStack space="sm" alignItems="center">
                  <FileText size={40} color={colors.primary} strokeWidth={2} />
                  <VStack space="xs" alignItems="center">
                    <Text
                      fontSize="$lg"
                      fontWeight="$bold"
                      color={colors.primary_text}
                      textAlign="center"
                    >
                      Giấy chứng nhận quyền sử dụng đất
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={colors.secondary_text}
                      textAlign="center"
                    >
                      Chụp hoặc chọn ảnh rõ nét - Tối đa {MAX_IMAGES} ảnh
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              {/* Nút chọn ảnh - 2 nút ngang */}
              <HStack space="md">
                <Button
                  onPress={async () => {
                    try {
                      const { status } =
                        await ImagePicker.requestCameraPermissionsAsync();
                      if (status !== "granted") {
                        notification.error("Cần cấp quyền sử dụng máy ảnh");
                        return;
                      }

                      const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ["images"],
                        quality: 0.8,
                        allowsEditing: false,
                      });

                      if (
                        !result.canceled &&
                        result.assets &&
                        result.assets[0]
                      ) {
                        const newUri = result.assets[0].uri;
                        setRedBookImages((prev) => {
                          if (prev.length >= MAX_IMAGES) {
                            notification.info(`Tối đa ${MAX_IMAGES} ảnh`);
                            return prev;
                          }
                          return [...prev, newUri];
                        });
                        notification.success("Đã chụp ảnh thành công!");
                      }
                    } catch (error) {
                      console.error("Camera error:", error);
                      notification.error("Không thể mở máy ảnh");
                    }
                  }}
                  bg={colors.primary}
                  borderRadius="$xl"
                  size="xl"
                  flex={1}
                >
                  <HStack space="xs" alignItems="center">
                    <Camera
                      size={20}
                      color={colors.primary_white_text}
                      strokeWidth={2}
                    />
                    <ButtonText
                      color={colors.primary_white_text}
                      fontSize="$sm"
                      fontWeight="$bold"
                    >
                      Chụp ảnh
                    </ButtonText>
                  </HStack>
                </Button>

                <Button
                  onPress={async () => {
                    try {
                      const { status } =
                        await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== "granted") {
                        notification.error("Cần cấp quyền truy cập thư viện");
                        return;
                      }

                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ["images"],
                        quality: 0.8,
                        allowsMultipleSelection: true,
                      });

                      if (!result.canceled && result.assets) {
                        const newUris = result.assets.map((a) => a.uri);
                        const remainingSlots =
                          MAX_IMAGES - redBookImages.length;
                        const limitedUris = newUris.slice(0, remainingSlots);

                        if (newUris.length > remainingSlots) {
                          notification.info(
                            `Chỉ thêm được ${remainingSlots} ảnh. Tối đa ${MAX_IMAGES} ảnh.`
                          );
                        }

                        setRedBookImages((prev) => [...prev, ...limitedUris]);
                        notification.success(
                          `Đã chọn ${limitedUris.length} ảnh`
                        );
                      }
                    } catch (error) {
                      console.error("Library error:", error);
                      notification.error("Không thể mở thư viện ảnh");
                    }
                  }}
                  variant="outline"
                  borderColor={colors.primary}
                  borderWidth={2}
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  size="xl"
                  flex={1}
                >
                  <HStack space="xs" alignItems="center">
                    <Upload size={20} color={colors.primary} strokeWidth={2} />
                    <ButtonText
                      color={colors.primary}
                      fontSize="$sm"
                      fontWeight="$bold"
                    >
                      Chọn ảnh
                    </ButtonText>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          )}

          {/* ===== GALLERY ẢNH ĐÃ CHỌN & NÚT QUÉT ===== */}
          {mode === "create" && redBookImages.length > 0 && !ocrResult && (
            <VStack space="md">
              {/* Gallery ảnh */}
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$4"
                borderWidth={1}
                borderColor={colors.frame_border}
              >
                <VStack space="md">
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Ảnh giấy chứng nhận đã đăng tải
                    </Text>
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      {redBookImages.length}/{MAX_IMAGES} ảnh
                    </Text>
                  </HStack>

                  <HStack flexWrap="wrap" gap="$2">
                    {redBookImages.map((uri, index) => (
                      <Box
                        key={index}
                        borderRadius="$lg"
                        overflow="hidden"
                        borderWidth={2}
                        borderColor={colors.primary}
                        position="relative"
                        style={{ width: "48%", aspectRatio: 1 }}
                      >
                        <Pressable onPress={() => handleViewImage(index)}>
                          <Image
                            source={{ uri }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        </Pressable>

                        {/* Delete button */}
                        <TouchableOpacity
                          onPress={() => handleDeleteImage(index)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: colors.error,
                            borderRadius: 20,
                            padding: 6,
                          }}
                        >
                          <Trash2 size={16} color={"#fff"} strokeWidth={2} />
                        </TouchableOpacity>

                        {/* Image number */}
                        <Box
                          position="absolute"
                          bottom={8}
                          left={8}
                          bg={colors.primary}
                          borderRadius="$md"
                          px="$2"
                          py="$1"
                        >
                          <Text
                            fontSize="$xs"
                            fontWeight="$bold"
                            color={colors.primary_white_text}
                          >
                            Ảnh {index + 1}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </HStack>

                  {/* Nút thêm ảnh nếu chưa đủ */}
                  {redBookImages.length < MAX_IMAGES && (
                    <HStack space="sm">
                      <Button
                        onPress={async () => {
                          try {
                            const { status } =
                              await ImagePicker.requestCameraPermissionsAsync();
                            if (status !== "granted") {
                              notification.error("Cần cấp quyền máy ảnh");
                              return;
                            }
                            const result = await ImagePicker.launchCameraAsync({
                              mediaTypes: ["images"],
                              quality: 0.8,
                            });
                            if (!result.canceled && result.assets?.[0]) {
                              setRedBookImages((prev) => [
                                ...prev,
                                result.assets[0].uri,
                              ]);
                              notification.success("Đã thêm ảnh");
                            }
                          } catch (error) {
                            notification.error("Không thể mở máy ảnh");
                          }
                        }}
                        variant="outline"
                        borderColor={colors.primary}
                        bg={colors.successSoft}
                        borderRadius="$lg"
                        size="sm"
                        flex={1}
                      >
                        <HStack space="xs" alignItems="center">
                          <Camera
                            size={16}
                            color={colors.primary}
                            strokeWidth={2}
                          />
                          <ButtonText color={colors.primary} fontSize="$xs">
                            Chụp thêm
                          </ButtonText>
                        </HStack>
                      </Button>

                      <Button
                        onPress={async () => {
                          try {
                            const { status } =
                              await ImagePicker.requestMediaLibraryPermissionsAsync();
                            if (status !== "granted") {
                              notification.error("Cần quyền thư viện");
                              return;
                            }
                            const remainingSlots =
                              MAX_IMAGES - redBookImages.length;
                            const result =
                              await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ["images"],
                                quality: 0.8,
                                allowsMultipleSelection: true,
                              });
                            if (!result.canceled && result.assets) {
                              const newUris = result.assets
                                .map((a) => a.uri)
                                .slice(0, remainingSlots);
                              setRedBookImages((prev) => [...prev, ...newUris]);
                              notification.success(
                                `Đã thêm ${newUris.length} ảnh`
                              );
                            }
                          } catch (error) {
                            notification.error("Không thể mở thư viện");
                          }
                        }}
                        variant="outline"
                        borderColor={colors.primary}
                        bg={colors.successSoft}
                        borderRadius="$lg"
                        size="sm"
                        flex={1}
                      >
                        <HStack space="xs" alignItems="center">
                          <Upload
                            size={16}
                            color={colors.primary}
                            strokeWidth={2}
                          />
                          <ButtonText color={colors.primary} fontSize="$xs">
                            Chọn thêm
                          </ButtonText>
                        </HStack>
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* Nút xác nhận & quét - sử dụng OcrScanner */}
              <OcrScanner
                imageUris={redBookImages}
                buttonLabel="Xác nhận & quét thông tin"
                prompt={RED_BOOK_OCR_PROMPT}
                onResult={handleOcrResult}
              />
            </VStack>
          )}

          {/* ===== BƯỚC 2: THÔNG TIN NÔNG TRẠI ===== */}
          {(mode === "edit" || (redBookImages.length > 0 && ocrResult)) && (
            <VStack space="lg">
              {/* Thông báo kiểm tra thông tin */}
              {mode === "create" && ocrResult && (
                <HStack space="sm" alignItems="center" px="$2">
                  <AlertCircle
                    size={18}
                    color={colors.warning}
                    strokeWidth={2}
                  />
                  <Text
                    flex={1}
                    fontSize="$sm"
                    color={colors.secondary_text}
                    lineHeight={20}
                  >
                    Thông tin được nhận diện tự động. Vui lòng kiểm tra và chỉnh
                    sửa nếu cần.
                  </Text>
                </HStack>
              )}

              {/* Gallery ảnh giấy chứng nhận (có thể thêm/xóa) */}
              {mode === "create" && redBookImages.length > 0 && (
                <Box
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <VStack space="md">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text
                        fontSize="$md"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        Ảnh giấy chứng nhận đã đăng tải
                      </Text>
                      <Text fontSize="$xs" color={colors.secondary_text}>
                        {redBookImages.length}/{MAX_IMAGES} ảnh
                      </Text>
                    </HStack>

                    <HStack flexWrap="wrap" gap="$2">
                      {redBookImages.map((uri, index) => (
                        <Box
                          key={index}
                          borderRadius="$lg"
                          overflow="hidden"
                          borderWidth={2}
                          borderColor={colors.primary}
                          position="relative"
                          style={{ width: "48%", aspectRatio: 1 }}
                        >
                          <Pressable onPress={() => handleViewImage(index)}>
                            <Image
                              source={{ uri }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                          </Pressable>

                          {/* Delete button */}
                          <TouchableOpacity
                            onPress={() => handleDeleteImage(index)}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: colors.error,
                              borderRadius: 20,
                              padding: 6,
                            }}
                          >
                            <Trash2 size={16} color={"#fff"} strokeWidth={2} />
                          </TouchableOpacity>

                          {/* Image number */}
                          <Box
                            position="absolute"
                            bottom={8}
                            left={8}
                            bg={colors.primary}
                            borderRadius="$md"
                            px="$2"
                            py="$1"
                          >
                            <Text
                              fontSize="$xs"
                              fontWeight="$bold"
                              color={colors.primary_white_text}
                            >
                              Ảnh {index + 1}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </HStack>

                    {/* Nút thêm ảnh nếu chưa đủ */}
                    {redBookImages.length < MAX_IMAGES && (
                      <HStack space="sm">
                        <Button
                          onPress={async () => {
                            try {
                              const { status } =
                                await ImagePicker.requestCameraPermissionsAsync();
                              if (status !== "granted") {
                                notification.error("Cần cấp quyền máy ảnh");
                                return;
                              }
                              const result =
                                await ImagePicker.launchCameraAsync({
                                  mediaTypes: ["images"],
                                  quality: 0.8,
                                });
                              if (!result.canceled && result.assets?.[0]) {
                                setRedBookImages((prev) => [
                                  ...prev,
                                  result.assets[0].uri,
                                ]);
                                notification.success("Đã thêm ảnh");
                              }
                            } catch (error) {
                              notification.error("Không thể mở máy ảnh");
                            }
                          }}
                          variant="outline"
                          borderColor={colors.primary}
                          bg={colors.successSoft}
                          borderRadius="$lg"
                          size="sm"
                          flex={1}
                        >
                          <HStack space="xs" alignItems="center">
                            <Camera
                              size={16}
                              color={colors.primary}
                              strokeWidth={2}
                            />
                            <ButtonText color={colors.primary} fontSize="$xs">
                              Chụp thêm
                            </ButtonText>
                          </HStack>
                        </Button>

                        <Button
                          onPress={async () => {
                            try {
                              const { status } =
                                await ImagePicker.requestMediaLibraryPermissionsAsync();
                              if (status !== "granted") {
                                notification.error("Cần quyền thư viện");
                                return;
                              }
                              const remainingSlots =
                                MAX_IMAGES - redBookImages.length;
                              const result =
                                await ImagePicker.launchImageLibraryAsync({
                                  mediaTypes: ["images"],
                                  quality: 0.8,
                                  allowsMultipleSelection: true,
                                });
                              if (!result.canceled && result.assets) {
                                const newUris = result.assets
                                  .map((a) => a.uri)
                                  .slice(0, remainingSlots);
                                setRedBookImages((prev) => [
                                  ...prev,
                                  ...newUris,
                                ]);
                                notification.success(
                                  `Đã thêm ${newUris.length} ảnh`
                                );
                              }
                            } catch (error) {
                              notification.error("Không thể mở thư viện");
                            }
                          }}
                          variant="outline"
                          borderColor={colors.primary}
                          bg={colors.successSoft}
                          borderRadius="$lg"
                          size="sm"
                          flex={1}
                        >
                          <HStack space="xs" alignItems="center">
                            <Upload
                              size={16}
                              color={colors.primary}
                              strokeWidth={2}
                            />
                            <ButtonText color={colors.primary} fontSize="$xs">
                              Chọn thêm
                            </ButtonText>
                          </HStack>
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Tọa độ ranh giới */}
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$4"
                borderWidth={1}
                borderColor={colors.frame_border}
              >
                <VStack space="md">
                  <HStack space="sm" alignItems="center">
                    <MapPin size={18} color={colors.primary} strokeWidth={2} />
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Tọa độ ranh giới
                    </Text>
                  </HStack>

                  <BoundaryCoordinatesInput
                    value={boundaryCoords}
                    onChange={(value) => setBoundaryCoords(value)}
                    label=""
                    helperText="Nhập tọa độ các điểm ranh giới của nông trại"
                    disabled={mode === "create" && !ocrResult}
                  />

                  {boundaryCoords && (
                    <Button
                      onPress={() => {
                        const parsed =
                          Utils.parseBoundaryCoordinates(boundaryCoords);
                        if (parsed) {
                          const firstCoord = parsed.coordinates[0][0];
                          const isVn =
                            firstCoord[0] > 100000 || firstCoord[1] > 100000;
                          setIsVn2000(isVn);
                          setBoundaryPolygon(parsed);
                          notification.success("Đã cập nhật bản đồ!");
                        } else {
                          notification.error("Tọa độ không hợp lệ");
                        }
                      }}
                      bg={colors.primary}
                      borderRadius="$lg"
                      size="md"
                    >
                      <HStack space="xs" alignItems="center">
                        <MapPin
                          size={16}
                          color={colors.primary_white_text}
                          strokeWidth={2}
                        />
                        <ButtonText color={colors.primary_white_text}>
                          Xem trên bản đồ
                        </ButtonText>
                      </HStack>
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* Bản đồ */}
              {boundaryPolygon && (
                <Box
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  overflow="hidden"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <Box p="$3">
                    <HStack alignItems="center" space="sm">
                      <MapPin
                        size={18}
                        color={colors.primary}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$sm"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        Vị trí nông trại
                      </Text>
                    </HStack>
                  </Box>

                  <FarmBoundaryMap
                    boundary={boundaryPolygon}
                    isVn2000={isVn2000}
                    province={ocrResult?.province || formValues.province}
                    height={350}
                    showControls={true}
                  />
                  <Box p="$3">
                    <Text
                      textAlign="center"
                      fontSize="$xs"
                      fontStyle="italic"
                      color={colors.secondary_text}
                    >
                      (*) Bản đồ hiển thị nông trại có thể không chính xác
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Thông tin chi tiết */}
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$4"
                borderWidth={1}
                borderColor={colors.frame_border}
              >
                <VStack space="md">
                  <HStack space="sm" alignItems="center">
                    <Sprout size={18} color={colors.success} strokeWidth={2} />
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      Thông tin nông trại
                    </Text>
                  </HStack>

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
                    gap={14}
                  />
                </VStack>
                {/* Lưu ý kiểm duyệt */}
                {mode === "create" && (
                  <HStack space="sm" alignItems="center" pt={10} px="$2">
                    <Shield size={14} color={colors.info} strokeWidth={2} />
                    <Text
                      flex={1}
                      fontSize="$xs"
                      color={colors.secondary_text}
                      lineHeight={20}
                    >
                      Nông trại sẽ được kiểm duyệt khi bạn đăng ký gói bảo hiểm
                      bất kỳ.
                    </Text>
                  </HStack>
                )}
              </Box>
            </VStack>
          )}
        </VStack>
      </ScrollView>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        {...notification.config}
        onClose={notification.hide}
      />

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
        statusBarTranslucent
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleCancelExit}
        >
          <Pressable
            style={{
              backgroundColor: colors.card_surface,
              borderRadius: 20,
              padding: 24,
              width: "85%",
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <VStack space="lg">
              {/* Icon & Title */}
              <VStack space="md" alignItems="center">
                <Box
                  bg={colors.warningSoft}
                  borderRadius="$full"
                  p="$3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <AlertCircle
                    size={40}
                    color={colors.warning}
                    strokeWidth={2}
                  />
                </Box>
                <VStack space="xs" alignItems="center">
                  <Text
                    fontSize="$xl"
                    fontWeight="$bold"
                    color={colors.primary_text}
                    textAlign="center"
                  >
                    Xác nhận thoát
                  </Text>
                  <Text
                    fontSize="$sm"
                    color={colors.secondary_text}
                    textAlign="center"
                    lineHeight={20}
                  >
                    Bạn đang trong quá trình đăng ký nông trại. Nếu thoát ra, dữ
                    liệu đã nhập sẽ bị mất.
                  </Text>
                </VStack>
              </VStack>

              {/* Buttons */}
              <VStack space="sm">
                <Button
                  onPress={handleCancelExit}
                  bg={colors.primary}
                  borderRadius="$xl"
                  size="lg"
                >
                  <ButtonText
                    color={colors.primary_white_text}
                    fontSize="$md"
                    fontWeight="$bold"
                  >
                    Ở lại và tiếp tục
                  </ButtonText>
                </Button>

                <Button
                  onPress={handleConfirmExit}
                  variant="outline"
                  borderColor={colors.error}
                  borderWidth={2}
                  bg={colors.card_surface}
                  borderRadius="$xl"
                  size="lg"
                >
                  <ButtonText
                    color={colors.error}
                    fontSize="$md"
                    fontWeight="$bold"
                  >
                    Thoát
                  </ButtonText>
                </Button>
              </VStack>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>

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

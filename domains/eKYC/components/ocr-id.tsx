import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
  Image,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import {
  Camera,
  CheckCircle2,
  IdCard,
  RotateCcw,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet } from "react-native";
import { useEkyc } from "../hooks/use-ekyc";
import { useEkycStore } from "../stores/ekyc.store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FRAME_WIDTH_RATIO = 0.85;
const CCCD_ASPECT_RATIO = 1.586;
const CROP_OFFSET_X = 0;
const CROP_OFFSET_Y = 0;
const CROP_SCALE_ADJUSTMENT = 1.0;
const RESIZE_WIDTH = 1300;
const COMPRESS_QUALITY = 0.92;

// Chiều cao của header và footer trong camera view
const HEADER_ESTIMATED_HEIGHT = 140; // Top bar (~56) + Hướng dẫn (~84)
const FOOTER_ESTIMATED_HEIGHT = 160; // Button area + padding

const FRAME_WIDTH = SCREEN_WIDTH * FRAME_WIDTH_RATIO;
const FRAME_HEIGHT = FRAME_WIDTH / CCCD_ASPECT_RATIO;

type CaptureStep = "instruction" | "capturing" | "processing";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFileInfo = async (uri: string) => {
  try {
    const file = new File(uri);
    const exists = file.exists;
    if (!exists) {
      return { size: 0, uri, exists: false };
    }
    const size = file.size;
    return { size, uri, exists: true };
  } catch (error) {
    return { size: 0, uri, exists: false };
  }
};

export const OCRIdScreen = () => {
  const router = useRouter();
  const { colors } = useAgrisaColors();
  const { ocrIdMutation } = useEkyc();
  const { setOcrData } = useEkycStore();
  const { user } = useAuthStore();

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [currentStep, setCurrentStep] = useState<CaptureStep>("instruction");
  const [isCapturingFront, setIsCapturingFront] = useState(true);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, []);

  if (!permission) {
    return (
      <Box
        flex={1}
        bg={colors.background}
        justifyContent="center"
        alignItems="center"
        p="$6"
      >
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.primary_text}>
          Đang kiểm tra quyền camera...
        </Text>
      </Box>
    );
  }

  if (!permission.granted) {
    return (
      <Box
        flex={1}
        bg={colors.background}
        justifyContent="center"
        alignItems="center"
        p="$6"
      >
        <Camera size={64} color={colors.secondary_text} />
        <Text
          fontSize="$lg"
          fontWeight="$bold"
          color={colors.primary_text}
          mt="$4"
          textAlign="center"
        >
          Cần quyền truy cập camera
        </Text>
        <Text
          fontSize="$sm"
          color={colors.secondary_text}
          mt="$2"
          textAlign="center"
        >
          Agrisa cần quyền sử dụng camera để chụp CCCD/CMND của bạn
        </Text>
        <Button
          size="lg"
          bg={colors.primary}
          onPress={requestPermission}
          mt="$6"
        >
          <ButtonText color={colors.primary_white_text}>Cấp quyền</ButtonText>
        </Button>
      </Box>
    );
  }

  const calculateCropRegion = (photoWidth: number, photoHeight: number) => {
    // Tính scale chính xác từ màn hình sang ảnh
    const scaleX = photoWidth / SCREEN_WIDTH;
    const scaleY = photoHeight / SCREEN_HEIGHT;

    // Tính không gian hiển thị thực tế (trừ đi header và footer)
    const availableHeight =
      SCREEN_HEIGHT - HEADER_ESTIMATED_HEIGHT - FOOTER_ESTIMATED_HEIGHT;

    // Tính vị trí khung giữa không gian hiển thị
    const frameTop =
      HEADER_ESTIMATED_HEIGHT + (availableHeight - FRAME_HEIGHT) / 2;
    const frameLeft = (SCREEN_WIDTH - FRAME_WIDTH) / 2;

    // Chuyển đổi sang tọa độ ảnh
    let cropX = frameLeft * scaleX;
    let cropY = frameTop * scaleY;
    let cropWidth = FRAME_WIDTH * scaleX;
    let cropHeight = FRAME_HEIGHT * scaleY;

    // Apply offset và scale adjustment nếu cần
    cropX += CROP_OFFSET_X * scaleX;
    cropY += CROP_OFFSET_Y * scaleY;
    cropWidth *= CROP_SCALE_ADJUSTMENT;
    cropHeight *= CROP_SCALE_ADJUSTMENT;

    // Đảm bảo không vượt quá kích thước ảnh
    const result = {
      originX: Math.max(0, Math.round(cropX)),
      originY: Math.max(0, Math.round(cropY)),
      width: Math.min(
        Math.round(cropWidth),
        photoWidth - Math.max(0, Math.round(cropX))
      ),
      height: Math.min(
        Math.round(cropHeight),
        photoHeight - Math.max(0, Math.round(cropY))
      ),
    };

    // Điều chỉnh để giữ đúng aspect ratio CCCD
    const targetAspect = CCCD_ASPECT_RATIO;
    const cropAspect = result.width / result.height;

    if (Math.abs(cropAspect - targetAspect) > 0.01) {
      if (cropAspect > targetAspect) {
        const newWidth = result.height * targetAspect;
        result.originX += Math.round((result.width - newWidth) / 2);
        result.width = Math.round(newWidth);
      } else {
        const newHeight = result.width / targetAspect;
        result.originY += Math.round((result.height - newHeight) / 2);
        result.height = Math.round(newHeight);
      }
    }

    console.log("📸 [OCR] Crop calculation:", {
      screenSize: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      photoSize: { width: photoWidth, height: photoHeight },
      scale: { x: scaleX.toFixed(2), y: scaleY.toFixed(2) },
      framePosition: { top: frameTop.toFixed(0), left: frameLeft.toFixed(0) },
      frameSize: {
        width: FRAME_WIDTH.toFixed(0),
        height: FRAME_HEIGHT.toFixed(0),
      },
      cropRegion: result,
      aspectRatio: (result.width / result.height).toFixed(3),
    });

    return result;
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (!photo) return;

      const cropRegion = calculateCropRegion(photo.width, photo.height);

      const croppedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: cropRegion }, { resize: { width: RESIZE_WIDTH } }],
        {
          compress: COMPRESS_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fileInfo = await getFileInfo(croppedImage.uri);

      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (fileInfo.size > MAX_FILE_SIZE) {
        Alert.alert(
          "Cảnh báo",
          `Ảnh có dung lượng khá lớn (${formatFileSize(fileInfo.size)}). Upload có thể chậm hơn.`,
          [
            { text: "Chụp lại", onPress: () => retakeCurrentPhoto() },
            { text: "Tiếp tục", style: "default" },
          ]
        );
      }

      const MIN_FILE_SIZE = 50 * 1024;
      if (fileInfo.size < MIN_FILE_SIZE && fileInfo.size > 0) {
        Alert.alert(
          "Cảnh báo",
          `Ảnh có dung lượng quá nhỏ (${formatFileSize(fileInfo.size)}). Có thể không đủ rõ nét.`,
          [
            { text: "Chụp lại", onPress: () => retakeCurrentPhoto() },
            { text: "Tiếp tục", style: "default" },
          ]
        );
      }

      if (isCapturingFront) {
        setFrontPhoto(croppedImage.uri);
        setOcrData({ cccd_front: croppedImage.uri });
      } else {
        setBackPhoto(croppedImage.uri);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.", [
        { text: "Đóng" },
      ]);
    }
  };

  const retakeCurrentPhoto = () => {
    if (isCapturingFront) {
      setFrontPhoto(null);
    } else {
      setBackPhoto(null);
    }
  };

  const confirmCurrentPhoto = () => {
    if (isCapturingFront) {
      setIsCapturingFront(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!frontPhoto || !backPhoto) {
      Alert.alert("Lỗi", "Thiếu ảnh CCCD. Vui lòng chụp lại.", [
        { text: "Đóng" },
      ]);
      return;
    }

    if (!user?.id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        [{ text: "Đóng" }]
      );
      return;
    }

    setCurrentStep("processing");

    try {
      const formData = new FormData();

      formData.append("cccd_front", {
        uri: frontPhoto,
        type: "image/jpeg",
        name: `cccd_front_${Date.now()}.jpg`,
      } as any);

      formData.append("cccd_back", {
        uri: backPhoto,
        type: "image/jpeg",
        name: `cccd_back_${Date.now()}.jpg`,
      } as any);

      formData.append("user_id", user.id);

      await ocrIdMutation.mutateAsync(formData as any);
    } catch (error) {
      setCurrentStep("instruction");
      setFrontPhoto(null);
      setBackPhoto(null);
      setIsCapturingFront(true);
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.", [
        {
          text: "Đóng",
        },
      ]);
    }
  };

  const startCapture = () => {
    setCurrentStep("capturing");
    setIsCapturingFront(true);
    setFrontPhoto(null);
    setBackPhoto(null);
  };

  const cancelCapture = () => {
    setCurrentStep("instruction");
    setFrontPhoto(null);
    setBackPhoto(null);
    setIsCapturingFront(true);
  };

  const renderInstructionScreen = () => (
    <Box flex={1} bg={colors.background} justifyContent="center" px="$6">
      <VStack space="xl" alignItems="center">
        <IdCard size={80} color={colors.primary} />

        <VStack space="md" alignItems="center">
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            color={colors.primary_text}
            textAlign="center"
          >
            Chụp CCCD/CMND
          </Text>
          <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
            Bạn sẽ cần chụp cả 2 mặt của CCCD/CMND
          </Text>
        </VStack>

        <Box
          bg={colors.card_surface}
          p="$5"
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.frame_border}
          w="$full"
        >
          <VStack space="md">
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Lưu ý khi chụp:
            </Text>
            <VStack space="sm">
              <HStack space="sm" alignItems="flex-start">
                <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                  • Đặt CCCD/CMND vào đúng trong khung hiển thị
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                  • Chụp ở nơi có ánh sáng đủ, tránh chói sáng
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                  • Đảm bảo thông tin rõ nét, không bị mờ
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                  • Tránh bóng đổ che khuất thông tin
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Button size="lg" bg={colors.primary} onPress={startCapture} w="$full">
          <ButtonText color={colors.primary_white_text} fontWeight="$semibold">
            Bắt đầu chụp
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );

  const renderCameraScreen = () => {
    const label = isCapturingFront ? "Mặt trước" : "Mặt sau";
    const currentPhoto = isCapturingFront ? frontPhoto : backPhoto;

    // Tính toán vị trí của khung CCCD (khớp với calculateCropRegion)
    const availableHeight =
      SCREEN_HEIGHT - HEADER_ESTIMATED_HEIGHT - FOOTER_ESTIMATED_HEIGHT;
    const frameTop =
      HEADER_ESTIMATED_HEIGHT + (availableHeight - FRAME_HEIGHT) / 2;

    return (
      <Box flex={1}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        >
          <Box flex={1}>
            {/* Header - Kéo dài đến sát khung CCCD */}
            <Box
              bg="rgba(0,0,0,1)"
              position="absolute"
              top={0}
              left={0}
              right={0}
              justifyContent="space-between"
              pb="$4"
            >
              {/* Top bar với nút đóng */}
              <Box p="$4">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                  >
                    Chụp {label} CCCD
                  </Text>
                  <Pressable onPress={cancelCapture}>
                    <X size={24} color={colors.primary_white_text} />
                  </Pressable>
                </HStack>
              </Box>

              {/* Hướng dẫn nằm trong vùng header */}
              <Box px="$6" pb="$2">
                <Text
                  fontSize="$lg"
                  color={colors.primary_white_text}
                  textAlign="center"
                  fontWeight="$medium"
                >
                  Đặt {label.toLowerCase()} CCCD vào trong khung
                </Text>
                <Text
                  fontSize="$sm"
                  color={colors.primary_white_text}
                  textAlign="center"
                  mt="$2"
                  opacity={0.9}
                >
                  {currentPhoto
                    ? "✓ Ảnh đã được chụp thành công"
                    : "Giữ máy thẳng và căn CCCD nằm chính giữa khung"}
                </Text>
              </Box>
            </Box>

            {/* Khung CCCD - Ở giữa màn hình */}
            <Box
              position="absolute"
              top={frameTop}
              left={(SCREEN_WIDTH - FRAME_WIDTH) / 2}
              width={FRAME_WIDTH}
              height={FRAME_HEIGHT}
              borderWidth={3}
              borderColor={currentPhoto ? colors.success : colors.primary}
              borderRadius="$lg"
              overflow="hidden"
            >
              {currentPhoto && (
                <Image
                  source={{ uri: currentPhoto }}
                  alt={`Preview ${label}`}
                  width={FRAME_WIDTH}
                  height={FRAME_HEIGHT}
                  position="absolute"
                  resizeMode="cover"
                />
              )}

              {/* Corner decorations */}
              <Box
                position="absolute"
                top={-2}
                left={-2}
                width={30}
                height={30}
                borderTopWidth={5}
                borderLeftWidth={5}
                borderColor={currentPhoto ? colors.success : colors.primary}
                borderTopLeftRadius="$lg"
              />
              <Box
                position="absolute"
                top={-2}
                right={-2}
                width={30}
                height={30}
                borderTopWidth={5}
                borderRightWidth={5}
                borderColor={currentPhoto ? colors.success : colors.primary}
                borderTopRightRadius="$lg"
              />
              <Box
                position="absolute"
                bottom={-2}
                left={-2}
                width={30}
                height={30}
                borderBottomWidth={5}
                borderLeftWidth={5}
                borderColor={currentPhoto ? colors.success : colors.primary}
                borderBottomLeftRadius="$lg"
              />
              <Box
                position="absolute"
                bottom={-2}
                right={-2}
                width={30}
                height={30}
                borderBottomWidth={5}
                borderRightWidth={5}
                borderColor={currentPhoto ? colors.success : colors.primary}
                borderBottomRightRadius="$lg"
              />
            </Box>

            {/* Footer - Kéo dài từ dưới khung CCCD đến cuối màn hình */}
            <Box
              bg="rgba(0,0,0,1)"
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              justifyContent="flex-end"
              pb="$10"
              pt="$4"
            >
              <Box px="$7">
                {currentPhoto ? (
                  <HStack space="md" pb="$2">
                    <Button
                      flex={1}
                      size="lg"
                      variant="outline"
                      borderColor={colors.frame_border}
                      bg="rgba(255,255,255,0.15)"
                      onPress={retakeCurrentPhoto}
                    >
                      <ButtonIcon
                        as={RotateCcw}
                        color={colors.primary_white_text}
                        mr="$2"
                      />
                      <ButtonText color={colors.primary_white_text}>
                        Chụp lại
                      </ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      size="lg"
                      bg={colors.success}
                      onPress={confirmCurrentPhoto}
                      isDisabled={ocrIdMutation.isPending}
                    >
                      {ocrIdMutation.isPending ? (
                        <Spinner color={colors.primary_white_text} />
                      ) : (
                        <>
                          <ButtonIcon
                            as={CheckCircle2}
                            color={colors.primary_white_text}
                            mr="$2"
                          />
                          <ButtonText color={colors.primary_white_text}>
                            {isCapturingFront ? "Tiếp tục" : "Xác nhận"}
                          </ButtonText>
                        </>
                      )}
                    </Button>
                  </HStack>
                ) : (
                  <VStack space="md" alignItems="center">
                    <Pressable onPress={takePicture}>
                      <Box
                        width={70}
                        height={70}
                        borderRadius="$full"
                        bg={colors.primary_white_text}
                        borderWidth={5}
                        borderColor={colors.primary}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Box
                          width={50}
                          height={50}
                          borderRadius="$full"
                          bg={colors.primary}
                        />
                      </Box>
                    </Pressable>
                    <Text
                      fontSize="$sm"
                      color={colors.primary_white_text}
                      fontWeight="$medium"
                    >
                      Chạm để chụp
                    </Text>
                  </VStack>
                )}
              </Box>
            </Box>
          </Box>
        </CameraView>
      </Box>
    );
  };

  const renderProcessingScreen = () => (
    <Box
      flex={1}
      bg={colors.background}
      justifyContent="center"
      alignItems="center"
      p="$6"
    >
      <Spinner size="large" color={colors.primary} />
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        mt="$4"
      >
        Đang xử lý thông tin CCCD...
      </Text>
      <Text
        fontSize="$sm"
        color={colors.secondary_text}
        mt="$2"
        textAlign="center"
      >
        Hệ thống đang đọc và xác thực thông tin của bạn
      </Text>
      <Text
        fontSize="$xs"
        color={colors.muted_text}
        mt="$4"
        textAlign="center"
        px="$6"
      >
        Quá trình này có thể mất vài giây. Vui lòng không tắt ứng dụng.
      </Text>
    </Box>
  );

  switch (currentStep) {
    case "instruction":
      return renderInstructionScreen();
    case "capturing":
      return renderCameraScreen();
    case "processing":
      return renderProcessingScreen();
    default:
      return renderInstructionScreen();
  }
};

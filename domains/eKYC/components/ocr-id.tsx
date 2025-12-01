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
  ScrollView,
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
  ScanLine,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Platform } from "react-native";
import { useEkyc } from "../hooks/use-ekyc";
import { useEkycStore } from "../stores/ekyc.store";
import { CCCDBackSvg, CCCDFrontSvg } from "./cccd-svg-illustrations";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FRAME_WIDTH_RATIO = 0.92; // Tăng từ 0.9 lên 0.92 để khung rộng hơn
const CCCD_ASPECT_RATIO = 1.586;
const CROP_OFFSET_X = 0;
const CROP_OFFSET_Y = 0;
const CROP_SCALE_ADJUSTMENT = 1.0;
const RESIZE_WIDTH = 1300;
const COMPRESS_QUALITY = 0.92;

// Chiều cao của header và footer trong camera view
const HEADER_ESTIMATED_HEIGHT = 90; // Giảm thêm để có nhiều không gian hơn
const FOOTER_ESTIMATED_HEIGHT = 180;

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
    // Camera trong expo thường có aspect ratio 4:3 hoặc 16:9
    // Photo size sẽ khác với screen size

    // Tính tỷ lệ thực tế giữa ảnh camera và vùng hiển thị camera
    const cameraDisplayWidth = FRAME_WIDTH;
    const cameraDisplayHeight = FRAME_HEIGHT;

    // Camera view sẽ fill toàn bộ khung, nhưng ảnh thực tế có thể bị crop
    // Cần tính scale dựa trên aspect ratio
    const photoAspect = photoWidth / photoHeight;
    const displayAspect = cameraDisplayWidth / cameraDisplayHeight;

    let scale;
    let offsetX = 0;
    let offsetY = 0;

    if (photoAspect > displayAspect) {
      // Ảnh rộng hơn → crop trái phải
      scale = photoHeight / cameraDisplayHeight;
      const scaledWidth = cameraDisplayWidth * scale;
      offsetX = (photoWidth - scaledWidth) / 2;
    } else {
      // Ảnh cao hơn → crop trên dưới
      scale = photoWidth / cameraDisplayWidth;
      const scaledHeight = cameraDisplayHeight * scale;
      offsetY = (photoHeight - scaledHeight) / 2;
    }

    // Crop toàn bộ vùng hiển thị camera
    const result = {
      originX: Math.max(0, Math.round(offsetX)),
      originY: Math.max(0, Math.round(offsetY)),
      width: Math.min(Math.round(cameraDisplayWidth * scale), photoWidth),
      height: Math.min(Math.round(cameraDisplayHeight * scale), photoHeight),
    };

    console.log("📸 [OCR] Crop calculation:", {
      screenSize: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      photoSize: { width: photoWidth, height: photoHeight },
      cameraDisplay: { width: cameraDisplayWidth, height: cameraDisplayHeight },
      photoAspect: photoAspect.toFixed(3),
      displayAspect: displayAspect.toFixed(3),
      scale: scale.toFixed(2),
      offset: { x: offsetX.toFixed(0), y: offsetY.toFixed(0) },
      cropRegion: result,
      resultAspect: (result.width / result.height).toFixed(3),
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
    <ScrollView flex={1} bg={colors.background}>
      <VStack space="xl" p="$6" pb="$10">
        {/* Header */}
        <VStack space="md" alignItems="center" mt="$4">
          <Box
            bg={colors.successSoft}
            borderRadius="$full"
            p="$4"
            w={80}
            h={80}
            alignItems="center"
            justifyContent="center"
          >
            <IdCard size={44} color={colors.primary} strokeWidth={2.5} />
          </Box>

          <VStack space="sm" alignItems="center">
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Chụp ảnh CCCD
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
            >
              Tiến hành xác thực CCCD
            </Text>
          </VStack>
        </VStack>

        {/* Minh họa 2 mặt CCCD - nằm ngang */}
        <VStack space="md">
          <HStack space="lg" justifyContent="space-around" px="$2">
            {/* Mặt trước */}
            <VStack space="sm" flex={1} alignItems="center">
              <HStack space="xs" alignItems="center">
                <Box
                  bg={colors.success}
                  borderRadius="$full"
                  w={20}
                  h={20}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={10}
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                  >
                    1
                  </Text>
                </Box>
                <Text
                  fontSize="$xs"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Mặt trước
                </Text>
              </HStack>
              <CCCDFrontSvg
                width={140}
                height={88}
                primaryColor={colors.success}
                secondaryColor={colors.successSoft}
              />
            </VStack>

            {/* Mặt sau */}
            <VStack space="sm" flex={1} alignItems="center">
              <HStack space="xs" alignItems="center">
                <Box
                  bg={colors.info}
                  borderRadius="$full"
                  w={20}
                  h={20}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={10}
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                  >
                    2
                  </Text>
                </Box>
                <Text
                  fontSize="$xs"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Mặt sau
                </Text>
              </HStack>
              <CCCDBackSvg
                width={140}
                height={88}
                primaryColor={colors.info}
                secondaryColor={colors.infoSoft}
              />
            </VStack>
          </HStack>
        </VStack>

        {/* Lưu ý */}
        <Box
          bg="#fffbeb"
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor="#fbbf24"
        >
          <HStack space="sm" alignItems="flex-start" mb="$2">
            <ScanLine size={18} color="#f59e0b" />
            <Text fontSize="$sm" fontWeight="$bold" color="#92400e">
              Lưu ý khi chụp
            </Text>
          </HStack>
          <VStack space="xs" ml="$6">
            <Text fontSize="$xs" color="#78350f">
              • Đặt CCCD nằm ngang, đúng trong khung
            </Text>
            <Text fontSize="$xs" color="#78350f">
              • Chụp ở nơi có ánh sáng đủ, không chói
            </Text>
            <Text fontSize="$xs" color="#78350f">
              • Thông tin phải rõ nét, không bị mờ
            </Text>
            <Text fontSize="$xs" color="#78350f">
              • Tránh bóng đổ che khuất thông tin
            </Text>
          </VStack>
        </Box>

        {/* Button bắt đầu */}
        <Button
          size="xl"
          bg={colors.primary}
          onPress={startCapture}
          borderRadius="$xl"
          h="$16"
        >
          <HStack space="sm" alignItems="center">
            <Camera size={22} color={colors.primary_white_text} />
            <ButtonText
              color={colors.primary_white_text}
              fontWeight="$bold"
              fontSize="$lg"
            >
              Bắt đầu chụp
            </ButtonText>
          </HStack>
        </Button>
      </VStack>
    </ScrollView>
  );

  const renderCameraScreen = () => {
    const label = isCapturingFront ? "Mặt trước" : "Mặt sau";
    const currentPhoto = isCapturingFront ? frontPhoto : backPhoto;

    // Tính toán vị trí của khung CCCD (khớp với calculateCropRegion)
    const availableHeight =
      SCREEN_HEIGHT - HEADER_ESTIMATED_HEIGHT - FOOTER_ESTIMATED_HEIGHT;
    const frameTop =
      HEADER_ESTIMATED_HEIGHT + (availableHeight - FRAME_HEIGHT) / 2;
    const frameLeft = (SCREEN_WIDTH - FRAME_WIDTH) / 2;

    return (
      <Box flex={1} bg="#000000">
        {/* Header - compact và dark */}
        <Box
          bg="rgba(0,0,0,0.95)"
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={10}
          pt="$10"
          pb="$3"
        >
          <HStack justifyContent="space-between" alignItems="center" px="$4">
            <VStack flex={1}>
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_white_text}
              >
                {label} CCCD
              </Text>
              <Text fontSize="$xs" color="rgba(255,255,255,0.7)">
                {currentPhoto ? "✓ Đã chụp" : "Đặt CCCD vào khung"}
              </Text>
            </VStack>
            <Pressable onPress={cancelCapture} p="$2">
              <X size={28} color={colors.primary_white_text} />
            </Pressable>
          </HStack>
        </Box>

        {/* Camera View - chỉ hiển thị trong vùng crop */}
        <Box
          position="absolute"
          top={frameTop}
          left={frameLeft}
          width={FRAME_WIDTH}
          height={FRAME_HEIGHT}
          overflow="hidden"
          borderRadius="$lg"
        >
          <CameraView
            ref={cameraRef}
            style={{
              width: FRAME_WIDTH,
              height: FRAME_HEIGHT,
            }}
            facing="back"
            // Không dùng zoom, để camera tự scale theo aspect ratio
          >
            {currentPhoto && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(0,0,0,0.4)"
                zIndex={5}
              >
                <Image
                  source={{ uri: currentPhoto }}
                  alt={`Preview ${label}`}
                  style={{
                    width: FRAME_WIDTH,
                    height: FRAME_HEIGHT,
                  }}
                  resizeMode="cover"
                />
              </Box>
            )}
          </CameraView>

          {/* Khung viền và góc indicator */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderWidth={3}
            borderColor={currentPhoto ? colors.success : colors.primary}
            borderRadius="$lg"
            pointerEvents="none"
          >
            {/* Corner decorations */}
            <Box
              position="absolute"
              top={-2}
              left={-2}
              width={40}
              height={40}
              borderTopWidth={6}
              borderLeftWidth={6}
              borderColor={currentPhoto ? colors.success : colors.primary}
              borderTopLeftRadius="$lg"
            />
            <Box
              position="absolute"
              top={-2}
              right={-2}
              width={40}
              height={40}
              borderTopWidth={6}
              borderRightWidth={6}
              borderColor={currentPhoto ? colors.success : colors.primary}
              borderTopRightRadius="$lg"
            />
            <Box
              position="absolute"
              bottom={-2}
              left={-2}
              width={40}
              height={40}
              borderBottomWidth={6}
              borderLeftWidth={6}
              borderColor={currentPhoto ? colors.success : colors.primary}
              borderBottomLeftRadius="$lg"
            />
            <Box
              position="absolute"
              bottom={-2}
              right={-2}
              width={40}
              height={40}
              borderBottomWidth={6}
              borderRightWidth={6}
              borderColor={currentPhoto ? colors.success : colors.primary}
              borderBottomRightRadius="$lg"
            />
          </Box>
        </Box>

        {/* Overlay tối phía trên khung */}
        <Box
          position="absolute"
          top={HEADER_ESTIMATED_HEIGHT - 10}
          left={0}
          right={0}
          height={frameTop - HEADER_ESTIMATED_HEIGHT + 10}
          bg="rgba(0,0,0,0.85)"
          pointerEvents="none"
        />

        {/* Overlay tối bên trái khung */}
        <Box
          position="absolute"
          top={frameTop}
          left={0}
          width={frameLeft}
          height={FRAME_HEIGHT}
          bg="rgba(0,0,0,0.85)"
          pointerEvents="none"
        />

        {/* Overlay tối bên phải khung */}
        <Box
          position="absolute"
          top={frameTop}
          right={0}
          width={frameLeft}
          height={FRAME_HEIGHT}
          bg="rgba(0,0,0,0.85)"
          pointerEvents="none"
        />

        {/* Overlay tối phía dưới khung */}
        <Box
          position="absolute"
          top={frameTop + FRAME_HEIGHT}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.85)"
          pointerEvents="none"
        />

        {/* Footer - Controls */}
        <Box
          bg="rgba(0,0,0,0.95)"
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          zIndex={10}
          pb="$8"
          pt="$6"
        >
          <Box px="$6">
            {currentPhoto ? (
              <HStack space="md">
                <Button
                  flex={1}
                  size="lg"
                  variant="outline"
                  borderColor={colors.frame_border}
                  bg="rgba(255,255,255,0.15)"
                  onPress={retakeCurrentPhoto}
                  borderRadius="$xl"
                >
                  <ButtonIcon
                    as={RotateCcw}
                    color={colors.primary_white_text}
                    mr="$2"
                  />
                  <ButtonText
                    color={colors.primary_white_text}
                    fontWeight="$semibold"
                  >
                    Chụp lại
                  </ButtonText>
                </Button>
                <Button
                  flex={1}
                  size="lg"
                  bg={colors.success}
                  onPress={confirmCurrentPhoto}
                  isDisabled={ocrIdMutation.isPending}
                  borderRadius="$xl"
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
                      <ButtonText
                        color={colors.primary_white_text}
                        fontWeight="$semibold"
                      >
                        {isCapturingFront ? "Tiếp tục" : "Xác nhận"}
                      </ButtonText>
                    </>
                  )}
                </Button>
              </HStack>
            ) : (
              <VStack space="sm" alignItems="center">
                <Pressable onPress={takePicture}>
                  <Box
                    width={75}
                    height={75}
                    borderRadius="$full"
                    bg={colors.primary_white_text}
                    borderWidth={6}
                    borderColor={colors.primary}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box
                      width={55}
                      height={55}
                      borderRadius="$full"
                      bg={colors.primary}
                    />
                  </Box>
                </Pressable>
                <Text
                  fontSize="$sm"
                  color={colors.primary_white_text}
                  fontWeight="$semibold"
                  mt="$2"
                >
                  Chạm để chụp ảnh
                </Text>
              </VStack>
            )}
          </Box>
        </Box>
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

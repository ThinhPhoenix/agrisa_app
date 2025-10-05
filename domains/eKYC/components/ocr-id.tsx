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
import { Camera, CheckCircle2, RotateCcw, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet } from "react-native";
import { useEkyc } from "../hooks/use-ekyc";
import { useEkycStore } from "../stores/ekyc.store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FRAME_WIDTH_RATIO = 0.80;
const CCCD_ASPECT_RATIO = 1.586;
const CROP_OFFSET_X = 0;
const CROP_OFFSET_Y = -50;
const CROP_SCALE_ADJUSTMENT = 1.05;
const RESIZE_WIDTH = 1300;
const COMPRESS_QUALITY = 0.9;

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
    if (ocrIdMutation.isSuccess) {
      router.push("/settings/verify/face-scan");
    }
  }, [ocrIdMutation.isSuccess, router]);

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
        <Text mt="$4" color={colors.text}>
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
        <Camera size={64} color={colors.textSecondary} />
        <Text
          fontSize="$lg"
          fontWeight="$bold"
          color={colors.text}
          mt="$4"
          textAlign="center"
        >
          Cần quyền truy cập camera
        </Text>
        <Text
          fontSize="$sm"
          color={colors.textSecondary}
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
          <ButtonText color={colors.text}>Cấp quyền</ButtonText>
        </Button>
      </Box>
    );
  }

  const calculateCropRegion = (photoWidth: number, photoHeight: number) => {
    const scaleX = photoWidth / SCREEN_WIDTH;
    const scaleY = photoHeight / SCREEN_HEIGHT;

    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;
    const frameX = centerX - FRAME_WIDTH / 2;
    const frameY = centerY - FRAME_HEIGHT / 2;

    let cropX = frameX * scaleX;
    let cropY = frameY * scaleY;
    let cropWidth = FRAME_WIDTH * scaleX;
    let cropHeight = FRAME_HEIGHT * scaleY;

    cropX += CROP_OFFSET_X * scaleX;
    cropY += CROP_OFFSET_Y * scaleY;
    cropWidth *= CROP_SCALE_ADJUSTMENT;
    cropHeight *= CROP_SCALE_ADJUSTMENT;

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

    const targetAspect = CCCD_ASPECT_RATIO;
    let cropAspect = result.width / result.height;
    if (cropAspect > targetAspect) {
      const newWidth = result.height * targetAspect;
      result.originX += (result.width - newWidth) / 2;
      result.width = newWidth;
    } else if (cropAspect < targetAspect) {
      const newHeight = result.width / targetAspect;
      result.originY += (result.height - newHeight) / 2;
      result.height = newHeight;
    }

    result.originX = Math.round(result.originX);
    result.originY = Math.round(result.originY);
    result.width = Math.round(result.width);
    result.height = Math.round(result.height);

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
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.", [
        {
          text: "Chụp lại",
          onPress: () => {
            setFrontPhoto(null);
            setBackPhoto(null);
            setIsCapturingFront(true);
            setCurrentStep("capturing");
          },
        },
      ]);
      setCurrentStep("capturing");
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
    <Box flex={1} bg={colors.background} justifyContent="center" p="$6">
      <VStack space="xl" alignItems="center">
        <Camera size={80} color={colors.primary} />

        <VStack space="md" alignItems="center">
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            color={colors.text}
            textAlign="center"
          >
            Chụp CCCD/CMND
          </Text>
          <Text fontSize="$sm" color={colors.textSecondary} textAlign="center">
            Bạn sẽ cần chụp cả 2 mặt của CCCD/CMND
          </Text>
        </VStack>

        <Box
          bg={colors.surface}
          p="$5"
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.border}
          w="$full"
        >
          <VStack space="md">
            <Text fontSize="$sm" fontWeight="$semibold" color={colors.text}>
              Lưu ý khi chụp:
            </Text>
            <VStack space="sm">
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Đặt CCCD/CMND trong khung
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Chụp ở nơi có ánh sáng đủ, tránh chói sáng
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Đảm bảo thông tin rõ nét, không bị mờ
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Tránh bóng đổ che khuất thông tin
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Button size="lg" bg={colors.primary} onPress={startCapture} w="$full">
          <ButtonText color={colors.text} fontWeight="$semibold">
            Bắt đầu chụp
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );

  const renderCameraScreen = () => {
    const label = isCapturingFront ? "Mặt trước" : "Mặt sau";
    const currentPhoto = isCapturingFront ? frontPhoto : backPhoto;

    return (
      <Box flex={1}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        >
          <Box flex={1}>
            <Box bg="rgba(0,0,0,0.8)" p="$4" pt="$12">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
                  Chụp {label} CCCD
                </Text>
                <Pressable onPress={cancelCapture}>
                  <X size={24} color={colors.text} />
                </Pressable>
              </HStack>
            </Box>

            <Box flex={1} justifyContent="center" alignItems="center">
              <Box mb="$4" px="$6">
                <Text
                  fontSize="$sm"
                  color={colors.text}
                  textAlign="center"
                  fontWeight="$medium"
                >
                  Đặt {label.toLowerCase()} trong khung
                </Text>
              </Box>

              <Box
                width={FRAME_WIDTH}
                height={FRAME_HEIGHT}
                borderWidth={3}
                borderColor={currentPhoto ? colors.success : colors.primary}
                borderRadius="$lg"
                position="relative"
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

              <Box mt="$4" px="$6">
                <Text fontSize="$xs" color={colors.text} textAlign="center">
                  {currentPhoto
                    ? "✅ Ảnh đã được chụp và xử lý"
                    : "Giữ máy thẳng và đảm bảo CCCD nằm gọn trong khung"}
                </Text>
              </Box>
            </Box>

            <Box pb="$8" px="$6" bg="rgba(0,0,0,0.8)">
              {currentPhoto ? (
                <HStack space="md">
                  <Button
                    flex={1}
                    size="lg"
                    variant="outline"
                    borderColor={colors.border}
                    onPress={retakeCurrentPhoto}
                  >
                    <ButtonIcon as={RotateCcw} color={colors.text} mr="$2" />
                    <ButtonText color={colors.text}>Chụp lại</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    size="lg"
                    bg={colors.success}
                    onPress={confirmCurrentPhoto}
                    isDisabled={ocrIdMutation.isPending}
                  >
                    {ocrIdMutation.isPending ? (
                      <Spinner color={colors.text} />
                    ) : (
                      <>
                        <ButtonIcon
                          as={CheckCircle2}
                          color={colors.text}
                          mr="$2"
                        />
                        <ButtonText color={colors.text}>
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
                      bg={colors.text}
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
                  <Text fontSize="$sm" color={colors.text}>
                    Chạm để chụp
                  </Text>
                </VStack>
              )}
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
      <Text fontSize="$lg" fontWeight="$semibold" color={colors.text} mt="$4">
        Đang xử lý thông tin CCCD...
      </Text>
      <Text
        fontSize="$sm"
        color={colors.textSecondary}
        mt="$2"
        textAlign="center"
      >
        Hệ thống đang đọc và xác thực thông tin của bạn
      </Text>
      <Text
        fontSize="$xs"
        color={colors.textSecondary}
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

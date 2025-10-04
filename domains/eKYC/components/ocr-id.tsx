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
import { useRouter } from "expo-router";
import { Camera, CheckCircle2, RotateCcw, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet } from "react-native";
import { useEkyc } from "../hooks/use-ekyc";
import { useEkycStore } from "../stores/ekyc.store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Kích thước khung CCCD (tỷ lệ 16:10 giống thẻ thật - theo tỷ lệ chuẩn CCCD Việt Nam)
const FRAME_WIDTH = SCREEN_WIDTH * 0.85;
const FRAME_HEIGHT = FRAME_WIDTH * (10 / 16);

type CaptureStep = "instruction" | "capturing" | "processing";

// ✅ Helper function để format file size cho dễ đọc
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// ✅ Helper function để lấy thông tin file
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
    console.error("❌ Lỗi khi lấy thông tin file:", error);
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

  // Chuyển trang khi OCR thành công
  useEffect(() => {
    if (ocrIdMutation.isSuccess) {
      console.log("✅ OCR ID thành công! Chuyển sang face-scan");
      router.push("/settings/verify/face-scan");
    }
  }, [ocrIdMutation.isSuccess, router]);

  // Request camera permissions
  useEffect(() => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, []);

  // Kiểm tra quyền camera
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

  // ✅ Chụp ảnh - CÓ LOG FILE SIZE
  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (!photo) return;

      // ✅ Lấy thông tin file size
      const fileInfo = await getFileInfo(photo.uri);

      console.log("📸 Đã chụp ảnh:", {
        uri: photo.uri,
        isFront: isCapturingFront,
        width: photo.width,
        height: photo.height,
        // ✅ Log file size
        fileSizeBytes: fileInfo.size,
        fileSizeFormatted: formatFileSize(fileInfo.size),
        fileExists: fileInfo.exists,
      });

      // ✅ Cảnh báo nếu file quá lớn (> 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (fileInfo.size > MAX_FILE_SIZE) {
        console.warn("⚠️ File size lớn hơn 5MB:", formatFileSize(fileInfo.size));
        Alert.alert(
          "Cảnh báo",
          `Ảnh có dung lượng khá lớn (${formatFileSize(
            fileInfo.size
          )}). Upload có thể chậm hơn.`,
          [
            { text: "Chụp lại", onPress: () => retakeCurrentPhoto() },
            { text: "Tiếp tục", style: "default" },
          ]
        );
      }

      // ✅ Cảnh báo nếu file quá nhỏ (< 100KB - có thể bị lỗi)
      const MIN_FILE_SIZE = 100 * 1024; // 100KB
      if (fileInfo.size < MIN_FILE_SIZE && fileInfo.size > 0) {
        console.warn("⚠️ File size nhỏ hơn 100KB:", formatFileSize(fileInfo.size));
        Alert.alert(
          "Cảnh báo",
          `Ảnh có dung lượng quá nhỏ (${formatFileSize(
            fileInfo.size
          )}). Có thể không đủ rõ nét.`,
          [
            { text: "Chụp lại", onPress: () => retakeCurrentPhoto() },
            { text: "Tiếp tục", style: "default" },
          ]
        );
      }

      // Lưu ảnh vào state
      if (isCapturingFront) {
        setFrontPhoto(photo.uri);
        setOcrData({ cccd_front: photo.uri });
        console.log("✅ Đã lưu ảnh mặt trước vào store");
      } else {
        setBackPhoto(photo.uri);
        console.log("✅ Đã lưu ảnh mặt sau");
      }
    } catch (error) {
      console.error("❌ Lỗi khi chụp ảnh:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.", [
        { text: "Đóng" },
      ]);
    }
  };

  // Chụp lại ảnh hiện tại
  const retakeCurrentPhoto = () => {
    console.log(
      `🔄 Chụp lại ảnh ${isCapturingFront ? "mặt trước" : "mặt sau"}`
    );
    if (isCapturingFront) {
      setFrontPhoto(null);
    } else {
      setBackPhoto(null);
    }
  };

  // Xác nhận ảnh hiện tại
  const confirmCurrentPhoto = () => {
    if (isCapturingFront) {
      console.log("✅ Xác nhận ảnh mặt trước, chuyển sang mặt sau");
      setIsCapturingFront(false);
    } else {
      console.log("✅ Xác nhận ảnh mặt sau, bắt đầu submit");
      handleSubmit();
    }
  };

  // ✅ Submit FormData - CÓ LOG TỔNG DUNG LƯỢNG
  const handleSubmit = async () => {
    console.log("🚀 Bắt đầu handleSubmit");

    // Validate
    if (!frontPhoto || !backPhoto) {
      console.error("❌ Thiếu ảnh CCCD");
      Alert.alert("Lỗi", "Thiếu ảnh CCCD. Vui lòng chụp lại.", [
        { text: "Đóng" },
      ]);
      return;
    }

    if (!user?.id) {
      console.error("❌ Không tìm thấy user_id");
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        [{ text: "Đóng" }]
      );
      return;
    }

    setCurrentStep("processing");

    try {
      // ✅ Lấy file info của cả 2 ảnh
      const frontFileInfo = await getFileInfo(frontPhoto);
      const backFileInfo = await getFileInfo(backPhoto);

      const totalSize = frontFileInfo.size + backFileInfo.size;

      console.log("📦 Thông tin file trước khi submit:");
      console.log("  📄 Mặt trước:", {
        size: formatFileSize(frontFileInfo.size),
        sizeBytes: frontFileInfo.size,
        exists: frontFileInfo.exists,
      });
      console.log("  📄 Mặt sau:", {
        size: formatFileSize(backFileInfo.size),
        sizeBytes: backFileInfo.size,
        exists: backFileInfo.exists,
      });
      console.log("  📊 Tổng dung lượng:", {
        size: formatFileSize(totalSize),
        sizeBytes: totalSize,
      });

      // ✅ Cảnh báo nếu tổng dung lượng quá lớn
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
      if (totalSize > MAX_TOTAL_SIZE) {
        console.warn("⚠️ Tổng dung lượng > 10MB:", formatFileSize(totalSize));
      }

      console.log("📦 Bắt đầu tạo FormData...");

      // Tạo FormData
      const formData = new FormData();

      formData.append("cccd_front", {
        uri: frontPhoto,
        type: "image/jpeg",
        name: `cccd_front_${Date.now()}.jpg`,
      } as any);

      console.log("✅ Đã append cccd_front");

      formData.append("cccd_back", {
        uri: backPhoto,
        type: "image/jpeg",
        name: `cccd_back_${Date.now()}.jpg`,
      } as any);

      console.log("✅ Đã append cccd_back");

      formData.append("user_id", user.id);

      console.log("✅ Đã append user_id:", user.id);

      // Log FormData entries
      console.log("📋 FormData entries:");
      // @ts-ignore
      if (formData._parts) {
        // @ts-ignore
        formData._parts.forEach((part: any, index: number) => {
          console.log(`  Entry ${index}:`, {
            fieldName: part[0],
            value: part[1]?.name || part[1],
          });
        });
      }

      console.log("🚀 Gọi mutation với FormData...");

      // Gọi mutation
      await ocrIdMutation.mutateAsync(formData as any);

      console.log("✅ Submit thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi gửi dữ liệu:", error);

      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.", [
        {
          text: "Chụp lại",
          onPress: () => {
            console.log("🔄 Reset và chụp lại từ đầu");
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

  // Bắt đầu chụp
  const startCapture = () => {
    console.log("▶️ Bắt đầu chụp CCCD");
    setCurrentStep("capturing");
    setIsCapturingFront(true);
    setFrontPhoto(null);
    setBackPhoto(null);
  };

  // Hủy và quay lại
  const cancelCapture = () => {
    console.log("❌ Hủy chụp CCCD");
    setCurrentStep("instruction");
    setFrontPhoto(null);
    setBackPhoto(null);
    setIsCapturingFront(true);
  };

  // Render màn hình hướng dẫn
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

        {/* Hướng dẫn chi tiết - Dành cho nông dân */}
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
                  Đặt CCCD/CMND vừa khít trong khung chữ nhật
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

  // Render camera với preview overlay
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
            {/* Header */}
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

            {/* Vùng camera với khung CCCD */}
            <Box flex={1} justifyContent="center" alignItems="center">
              <Box mb="$4" px="$6">
                <Text
                  fontSize="$sm"
                  color={colors.text}
                  textAlign="center"
                  fontWeight="$medium"
                >
                  Đặt {label.toLowerCase()} CCCD vừa khít trong khung
                </Text>
              </Box>

              {/* Khung CCCD */}
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

                {/* 4 góc highlight */}
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
                    ? "Kiểm tra ảnh có rõ nét không?"
                    : "Giữ máy thẳng và đảm bảo CCCD nằm gọn trong khung"}
                </Text>
              </Box>
            </Box>

            {/* Action buttons */}
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

  // Render màn hình đang xử lý
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

  // Main render
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

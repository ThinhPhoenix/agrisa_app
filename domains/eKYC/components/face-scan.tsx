import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
  Progress,
  ProgressFilledTrack,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { Camera, CheckCircle2, User, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Camera as VisionCamera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import {
  Face,
  Camera as FaceCamera,
  FaceDetectionOptions,
} from "react-native-vision-camera-face-detector";
import { useEkyc } from "../hooks/use-ekyc";
import { useEkycStore } from "../stores/ekyc.store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Kích thước khung oval cho khuôn mặt
const FACE_FRAME_WIDTH = SCREEN_WIDTH * 0.7;
const FACE_FRAME_HEIGHT = FACE_FRAME_WIDTH * 1.3; // Tỷ lệ oval cho khuôn mặt

// Thời gian recording (10 giây)
const RECORDING_DURATION = 10000; // 10 seconds
const COUNTDOWN_DURATION = 3000; // 3 seconds countdown trước khi bắt đầu

type ScanStep =
  | "instruction"
  | "countdown"
  | "recording"
  | "processing"
  | "success";

export const FaceScanScreen = () => {
  const router = useRouter();
  const { colors } = useAgrisaColors();
  const { faceScanMutation } = useEkyc();
  const { ocrData } = useEkycStore(); // Lấy ảnh CMND mặt trước
  const { user } = useAuthStore(); // Lấy user_id từ auth store

  const cameraRef = useRef<VisionCamera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");

  const [currentStep, setCurrentStep] = useState<ScanStep>("instruction");
  const [faceDetected, setFaceDetected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoPath, setRecordedVideoPath] = useState<string | null>(
    null
  );
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);

  // Animated values cho face frame
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);

  // Chuyển trang khi face scan thành công
  useEffect(() => {
    if (faceScanMutation.isSuccess) {
      setCurrentStep("success");

      setTimeout(() => {
        router.push("/settings/profile");
      }, 2000);
    }
  }, [faceScanMutation.isSuccess, router]);

  // Request camera permissions
  useEffect(() => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      if (!hasPermission) {
        requestPermission();
      }
    }
  }, []);

  // Kiểm tra quyền camera
  if (!hasPermission) {
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
          Agrisa cần quyền sử dụng camera để xác thực khuôn mặt của bạn
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

  if (!device) {
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
          Đang khởi tạo camera...
        </Text>
      </Box>
    );
  }

  // Face detection options
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: "accurate",
    landmarkMode: "all",
    contourMode: "none",
    classificationMode: "all",
    trackingEnabled: true,
    windowWidth: SCREEN_WIDTH,
    windowHeight: SCREEN_HEIGHT,
  }).current;

  // Vẽ khung khuôn mặt
  const drawFaceBounds = (face?: Face) => {
    if (face) {
      const { width, height, x, y } = face.bounds;
      aFaceW.value = withTiming(width, { duration: 100 });
      aFaceH.value = withTiming(height, { duration: 100 });
      aFaceX.value = withTiming(x, { duration: 100 });
      aFaceY.value = withTiming(y, { duration: 100 });
    } else {
      aFaceW.value = withTiming(0, { duration: 100 });
      aFaceH.value = withTiming(0, { duration: 100 });
      aFaceX.value = withTiming(0, { duration: 100 });
      aFaceY.value = withTiming(0, { duration: 100 });
    }
  };

  const faceBoxStyle = useAnimatedStyle(() => ({
    position: "absolute",
    borderWidth: 4,
    borderColor: faceDetected ? colors.success : colors.warning,
    borderRadius: 999, // Oval shape
    width: aFaceW.value,
    height: aFaceH.value,
    left: aFaceX.value,
    top: aFaceY.value,
  }));

  // Xử lý khi detect khuôn mặt
  const handleFacesDetection = (faces: Face[]) => {
    try {
      if (faces?.length > 0) {
        const face = faces[0];
        drawFaceBounds(face);

        // Kiểm tra khuôn mặt có hợp lệ không (mắt mở, nhìn thẳng)
        const isValidFace =
          face.leftEyeOpenProbability > 0.7 &&
          face.rightEyeOpenProbability > 0.7 &&
          Math.abs(face.yawAngle) < 15 && // Không quay đầu quá 15 độ
          Math.abs(face.pitchAngle) < 15; // Không ngửa/cúi đầu quá 15 độ

        setFaceDetected(isValidFace);

        // Nếu đang recording và mất mặt -> pause
        if (isRecording && !isValidFace) {
          pauseRecording();
        }
        // Nếu đang recording và có mặt trở lại -> resume
        else if (isRecording && isValidFace) {
          resumeRecording();
        }
      } else {
        drawFaceBounds();
        setFaceDetected(false);

        // Nếu đang recording và mất mặt -> pause
        if (isRecording) {
          pauseRecording();
        }
      }
    } catch (error) {
      console.error("Lỗi khi detect khuôn mặt:", error);
    }
  };

  // Bắt đầu countdown
  const startCountdown = () => {
    if (!faceDetected) {
      Alert.alert(
        "Thông báo",
        "Vui lòng đưa khuôn mặt vào trong khung và nhìn thẳng vào camera",
        [{ text: "Đồng ý" }]
      );
      return;
    }

    setCurrentStep("countdown");
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Bắt đầu recording
  const startRecording = async () => {
    if (!cameraRef.current || !faceDetected) return;

    try {
      setCurrentStep("recording");
      setIsRecording(true);
      setRecordingProgress(0);

      // Bắt đầu recording
      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          console.log("Recording finished:", video.path);
          setRecordedVideoPath(video.path);
          setIsRecording(false);
          handleSubmit(video.path);
        },
        onRecordingError: (error) => {
          console.error("Recording error:", error);
          Alert.alert("Lỗi", "Không thể ghi hình. Vui lòng thử lại.", [
            { text: "Đóng" },
          ]);
          setIsRecording(false);
          setCurrentStep("instruction");
        },
      });

      // Progress bar cho 10 giây
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / RECORDING_DURATION) * 100, 100);
        setRecordingProgress(progress);

        // Dừng sau 10 giây
        if (elapsed >= RECORDING_DURATION) {
          clearInterval(progressInterval);
          stopRecording();
        }
      }, 100);
    } catch (error) {
      console.error("Lỗi khi bắt đầu recording:", error);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi hình. Vui lòng thử lại.", [
        { text: "Đóng" },
      ]);
      setIsRecording(false);
      setCurrentStep("instruction");
    }
  };

  // Tạm dừng recording khi mất mặt
  const pauseRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      // Note: react-native-vision-camera không hỗ trợ pause/resume
      // Nên chúng ta sẽ dừng và bắt đầu lại
      console.log("Mất khuôn mặt - đang chờ detect lại...");
    } catch (error) {
      console.error("Lỗi khi pause recording:", error);
    }
  };

  // Tiếp tục recording khi có mặt trở lại
  const resumeRecording = async () => {
    console.log("Phát hiện khuôn mặt trở lại - tiếp tục recording...");
  };

  // Dừng recording
  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error("Lỗi khi dừng recording:", error);
    }
  };

  // Submit video lên backend
  const handleSubmit = async (videoPath: string) => {
    if (!user?.id || !ocrData.cccd_front) {
      Alert.alert(
        "Lỗi",
        "Thiếu thông tin xác thực. Vui lòng quay lại và thực hiện lại từ đầu.",
        [{ text: "Đóng" }]
      );
      return;
    }

    setCurrentStep("processing");

    try {
      // Tạo FormData để gửi file
      const formData = new FormData();

      // Append user_id
      formData.append("user_id", user.id.toString());

      // Append video file
      formData.append("video", {
        uri: Platform.OS === "android" ? videoPath : videoPath.replace("file://", ""),
        type: "video/mp4",
        name: `face_scan_${Date.now()}.mp4`,
      } as any);

      // Append CMND file (ảnh mặt trước từ OCR)
      formData.append("cmnd", {
        uri: Platform.OS === "android" 
          ? ocrData.cccd_front 
          : ocrData.cccd_front.replace("file://", ""),
        type: "image/jpeg",
        name: `cmnd_${Date.now()}.jpg`,
      } as any);

      console.log("FormData prepared:", {
        user_id: user.id,
        video_path: videoPath,
        cmnd_path: ocrData.cccd_front,
      });


      await faceScanMutation.mutateAsync(formData as any);

    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      Alert.alert("Lỗi", "Không thể xử lý video. Vui lòng thử lại.", [
        {
          text: "Thử lại",
          onPress: () => {
            setRecordedVideoPath(null);
            setCurrentStep("instruction");
          },
        },
      ]);
    }
  };

  // Hủy và quay lại
  const cancelScan = () => {
    if (isRecording) {
      stopRecording();
    }
    setCurrentStep("instruction");
    setRecordedVideoPath(null);
    router.back();
  };

  // Render màn hình hướng dẫn
  const renderInstructionScreen = () => (
    <Box flex={1} bg={colors.background} justifyContent="center" p="$6">
      <VStack space="xl" alignItems="center">
        <User size={80} color={colors.primary} />

        <VStack space="md" alignItems="center">
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            color={colors.text}
            textAlign="center"
          >
            Xác thực khuôn mặt
          </Text>
          <Text fontSize="$sm" color={colors.textSecondary} textAlign="center">
            Quá trình này sẽ ghi hình khuôn mặt của bạn trong 10 giây
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
              Lưu ý khi quay video:
            </Text>
            <VStack space="sm">
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Đặt khuôn mặt vào trong khung oval
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Nhìn thẳng vào camera và giữ nguyên tư thế
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Đảm bảo có đủ ánh sáng, tránh ngược sáng
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Video sẽ tự động dừng sau 10 giây
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Nếu mất khuôn mặt, video sẽ tạm dừng và tiếp tục khi phát hiện
                  lại
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Button
          size="lg"
          bg={colors.primary}
          onPress={startCountdown}
          w="$full"
        >
          <ButtonText color={colors.text} fontWeight="$semibold">
            Bắt đầu quay
          </ButtonText>
        </Button>

        <Button
          size="lg"
          variant="outline"
          borderColor={colors.border}
          onPress={cancelScan}
          w="$full"
        >
          <ButtonText color={colors.text}>Hủy</ButtonText>
        </Button>
      </VStack>
    </Box>
  );

  // Render màn hình camera
  const renderCameraScreen = () => (
    <Box flex={1}>
      <FaceCamera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={currentStep === "countdown" || currentStep === "recording"}
        video={true}
        audio={false}
        faceDetectionCallback={handleFacesDetection}
        faceDetectionOptions={faceDetectionOptions}
      />

      {/* Overlay */}
      <Box flex={1} bg="rgba(0,0,0,0.5)">
        {/* Header */}
        <Box bg="rgba(0,0,0,0.8)" p="$4" pt="$12">
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
              {currentStep === "countdown" ? "Chuẩn bị..." : "Đang quay video"}
            </Text>
            <Button size="sm" variant="link" onPress={cancelScan}>
              <ButtonIcon as={X} color={colors.text} />
            </Button>
          </HStack>
        </Box>

        {/* Face frame và hướng dẫn */}
        <Box flex={1} justifyContent="center" alignItems="center">
          {/* Countdown */}
          {currentStep === "countdown" && (
            <Box
              position="absolute"
              zIndex={10}
              bg="rgba(0,0,0,0.7)"
              borderRadius="$full"
              width={120}
              height={120}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="$6xl" fontWeight="$bold" color={colors.text}>
                {countdown}
              </Text>
            </Box>
          )}

          {/* Hướng dẫn */}
          <Box mb="$6" px="$6">
            <Text
              fontSize="$md"
              color={colors.text}
              textAlign="center"
              fontWeight="$semibold"
            >
              {faceDetected
                ? currentStep === "countdown"
                  ? "Giữ nguyên tư thế..."
                  : "Đang quay - Nhìn thẳng vào camera"
                : "Đưa khuôn mặt vào trong khung"}
            </Text>
          </Box>

          {/* Khung oval cho khuôn mặt */}
          <Box
            width={FACE_FRAME_WIDTH}
            height={FACE_FRAME_HEIGHT}
            borderWidth={3}
            borderColor={faceDetected ? colors.success : colors.warning}
            borderRadius={999}
            position="relative"
          >
            {/* 4 điểm highlight */}
            <Box
              position="absolute"
              top={20}
              left={20}
              width={30}
              height={30}
              borderTopWidth={4}
              borderLeftWidth={4}
              borderColor={faceDetected ? colors.success : colors.warning}
              borderTopLeftRadius="$full"
            />
            <Box
              position="absolute"
              top={20}
              right={20}
              width={30}
              height={30}
              borderTopWidth={4}
              borderRightWidth={4}
              borderColor={faceDetected ? colors.success : colors.warning}
              borderTopRightRadius="$full"
            />
            <Box
              position="absolute"
              bottom={20}
              left={20}
              width={30}
              height={30}
              borderBottomWidth={4}
              borderLeftWidth={4}
              borderColor={faceDetected ? colors.success : colors.warning}
              borderBottomLeftRadius="$full"
            />
            <Box
              position="absolute"
              bottom={20}
              right={20}
              width={30}
              height={30}
              borderBottomWidth={4}
              borderRightWidth={4}
              borderColor={faceDetected ? colors.success : colors.warning}
              borderBottomRightRadius="$full"
            />
          </Box>

          {/* Status message */}
          <Box mt="$6" px="$6">
            <Text fontSize="$xs" color={colors.text} textAlign="center">
              {!faceDetected && "Vui lòng giữ khuôn mặt trong khung"}
              {faceDetected &&
                currentStep === "recording" &&
                "Tuyệt vời! Đang ghi hình..."}
            </Text>
          </Box>

          {/* Animated face bounds */}
          <Animated.View style={faceBoxStyle} />
        </Box>

        {/* Progress bar khi đang recording */}
        {currentStep === "recording" && (
          <Box px="$6" pb="$6" bg="rgba(0,0,0,0.8)">
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$sm" color={colors.text}>
                  Tiến trình: {Math.round(recordingProgress)}%
                </Text>
                <Text fontSize="$sm" color={colors.text}>
                  {Math.round((recordingProgress / 100) * 10)}s / 10s
                </Text>
              </HStack>
              <Progress value={recordingProgress} size="md">
                <ProgressFilledTrack bg={colors.success} />
              </Progress>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );

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
        Đang xử lý video xác thực...
      </Text>
      <Text
        fontSize="$sm"
        color={colors.textSecondary}
        mt="$2"
        textAlign="center"
      >
        Hệ thống đang xác thực khuôn mặt của bạn
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

  // Render màn hình thành công
  const renderSuccessScreen = () => (
    <Box
      flex={1}
      bg={colors.background}
      justifyContent="center"
      alignItems="center"
      p="$6"
    >
      <CheckCircle2 size={80} color={colors.success} />
      <Text
        fontSize="$2xl"
        fontWeight="$bold"
        color={colors.text}
        mt="$4"
        textAlign="center"
      >
        Xác thực thành công!
      </Text>
      <Text
        fontSize="$sm"
        color={colors.textSecondary}
        mt="$2"
        textAlign="center"
      >
        Tài khoản của bạn đã được xác thực
      </Text>
    </Box>
  );

  // Main render
  switch (currentStep) {
    case "instruction":
      return renderInstructionScreen();
    case "countdown":
    case "recording":
      return renderCameraScreen();
    case "processing":
      return renderProcessingScreen();
    case "success":
      return renderSuccessScreen();
    default:
      return renderInstructionScreen();
  }
};

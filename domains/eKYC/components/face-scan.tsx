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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FACE_FRAME_WIDTH = SCREEN_WIDTH * 0.7;
const FACE_FRAME_HEIGHT = FACE_FRAME_WIDTH * 1.3;
const CAMERA_HEIGHT = FACE_FRAME_HEIGHT + 200;

const RECORDING_DURATION = 10000;
const NO_FACE_TIMEOUT = 120000;

type ScanStep =
  | "instruction"
  | "preparing"
  | "recording"
  | "processing"
  | "success";

export const FaceScanScreen = () => {
  const router = useRouter();
  const { colors } = useAgrisaColors();
  const { faceScanMutation } = useEkyc();
  const { ocrData } = useEkycStore();
  const { user } = useAuthStore();

  const cameraRef = useRef<VisionCamera>(null);
  const recordingTimeRef = useRef<number>(0);
  const lastFaceTimeRef = useRef<number>(Date.now());
  const noFaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");

  const [currentStep, setCurrentStep] = useState<ScanStep>("instruction");
  const [faceDetected, setFaceDetected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  useEffect(() => {
    if (faceScanMutation.isSuccess) {
      setCurrentStep("success");
      setTimeout(() => {
        router.push("/settings/profile");
      }, 2000);
    }
  }, [faceScanMutation.isSuccess, router]);

  useEffect(() => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      if (!hasPermission) {
        requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (noFaceTimeoutRef.current) {
        clearTimeout(noFaceTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

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

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: "accurate",
    landmarkMode: "all",
    contourMode: "none",
    classificationMode: "all",
    trackingEnabled: true,
    windowWidth: SCREEN_WIDTH,
    windowHeight: CAMERA_HEIGHT,
  }).current;

  const checkNoFaceTimeout = () => {
    if (noFaceTimeoutRef.current) {
      clearTimeout(noFaceTimeoutRef.current);
    }

    noFaceTimeoutRef.current = setTimeout(() => {
      Alert.alert(
        "Hết thời gian",
        "Không phát hiện khuôn mặt sau 2 phút. Vui lòng thử lại sau.",
        [
          {
            text: "OK",
            onPress: () => {
              stopRecording();
              router.push("/settings/profile");
            },
          },
        ]
      );
    }, NO_FACE_TIMEOUT);
  };

  const handleFacesDetection = (faces: Face[]) => {
    try {
      if (faces?.length > 0) {
        const face = faces[0];

        const isValidFace =
          face.leftEyeOpenProbability > 0.7 &&
          face.rightEyeOpenProbability > 0.7 &&
          Math.abs(face.yawAngle) < 15 &&
          Math.abs(face.pitchAngle) < 15;

        setFaceDetected(isValidFace);

        if (isValidFace) {
          lastFaceTimeRef.current = Date.now();

          if (currentStep === "preparing") {
            startRecording();
          } else if (currentStep === "recording" && isPaused) {
            setIsPaused(false);
          }
        } else if (currentStep === "recording" && !isPaused) {
          setIsPaused(true);
        }
      } else {
        setFaceDetected(false);
        if (currentStep === "recording" && !isPaused) {
          setIsPaused(true);
        }
      }
    } catch (error) {
      setFaceDetected(false);
    }
  };

  const startPreparation = () => {
    setCurrentStep("preparing");
    checkNoFaceTimeout();
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setCurrentStep("recording");
      setIsRecording(true);
      setIsPaused(false);
      recordingTimeRef.current = 0;
      setRecordingProgress(0);

      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          setIsRecording(false);
          handleSubmit(video.path);
        },
        onRecordingError: (error) => {
          Alert.alert("Lỗi", "Không thể ghi hình. Vui lòng thử lại.", [
            { text: "Đóng" },
          ]);
          setIsRecording(false);
          setCurrentStep("instruction");
        },
      });

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      recordingIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          recordingTimeRef.current += 100;

          const progress = Math.min(
            (recordingTimeRef.current / RECORDING_DURATION) * 100,
            100
          );
          setRecordingProgress(progress);

          if (recordingTimeRef.current >= RECORDING_DURATION) {
            stopRecording();
          }
        }
      }, 100);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể bắt đầu ghi hình. Vui lòng thử lại.", [
        { text: "Đóng" },
      ]);
      setIsRecording(false);
      setCurrentStep("instruction");
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (noFaceTimeoutRef.current) {
        clearTimeout(noFaceTimeoutRef.current);
      }

      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      setIsRecording(false);
    }
  };

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
      const formData = new FormData();

      formData.append("user_id", user.id.toString());

      formData.append("video", {
        uri:
          Platform.OS === "android"
            ? videoPath
            : videoPath.replace("file://", ""),
        type: "video/mp4",
        name: `face_scan_${Date.now()}.mp4`,
      } as any);

      formData.append("cmnd", {
        uri:
          Platform.OS === "android"
            ? ocrData.cccd_front
            : ocrData.cccd_front.replace("file://", ""),
        type: "image/jpeg",
        name: `cmnd_${Date.now()}.jpg`,
      } as any);

      await faceScanMutation.mutateAsync(formData as any);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý video. Vui lòng thử lại.", [
        {
          text: "Thử lại",
          onPress: () => {
            setCurrentStep("instruction");
          },
        },
      ]);
    }
  };

  const cancelScan = () => {
    if (isRecording) {
      stopRecording();
    }
    if (noFaceTimeoutRef.current) {
      clearTimeout(noFaceTimeoutRef.current);
    }
    router.back();
  };

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
                  Nếu mất khuôn mặt, video sẽ tạm dừng
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Button
          size="lg"
          bg={colors.primary}
          onPress={startPreparation}
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

  const renderCameraScreen = () => (
    <Box flex={1} bg={colors.background}>
      <Box bg="rgba(0,0,0,0.9)" p="$4" pt="$12">
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
            {currentStep === "preparing" ? "Chuẩn bị..." : "Đang quay video"}
          </Text>
          <Button size="sm" variant="link" onPress={cancelScan}>
            <ButtonIcon as={X} color={colors.text} />
          </Button>
        </HStack>
      </Box>

      <Box
        height={CAMERA_HEIGHT}
        width={SCREEN_WIDTH}
        position="relative"
        overflow="hidden"
      >
        <FaceCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          device={device}
          isActive={true}
          video={true}
          audio={false}
          faceDetectionCallback={handleFacesDetection}
          faceDetectionOptions={faceDetectionOptions}
        />

        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          bg="rgba(0,0,0,0.3)"
        >
          {currentStep === "preparing" && !faceDetected && (
            <Box
              position="absolute"
              zIndex={10}
              bg="rgba(0,0,0,0.8)"
              borderRadius="$lg"
              p="$6"
              alignItems="center"
            >
              <Spinner size="large" color={colors.primary} />
              <Text
                fontSize="$md"
                color={colors.text}
                mt="$4"
                textAlign="center"
              >
                Đang tìm khuôn mặt...
              </Text>
            </Box>
          )}

          <Box mb="$4" px="$6">
            <Text
              fontSize="$md"
              color={colors.text}
              textAlign="center"
              fontWeight="$semibold"
            >
              {!faceDetected
                ? "Đưa khuôn mặt vào trong khung"
                : isPaused
                ? "Giữ khuôn mặt trong khung"
                : "Tuyệt vời! Đang ghi hình..."}
            </Text>
          </Box>

          <Box
            width={FACE_FRAME_WIDTH}
            height={FACE_FRAME_HEIGHT}
            borderWidth={4}
            borderColor={
              faceDetected && !isPaused ? colors.success : colors.warning
            }
            borderRadius={999}
            position="relative"
          >
            <Box
              position="absolute"
              top={20}
              left={20}
              width={30}
              height={30}
              borderTopWidth={5}
              borderLeftWidth={5}
              borderColor={
                faceDetected && !isPaused ? colors.success : colors.warning
              }
              borderTopLeftRadius="$full"
            />
            <Box
              position="absolute"
              top={20}
              right={20}
              width={30}
              height={30}
              borderTopWidth={5}
              borderRightWidth={5}
              borderColor={
                faceDetected && !isPaused ? colors.success : colors.warning
              }
              borderTopRightRadius="$full"
            />
            <Box
              position="absolute"
              bottom={20}
              left={20}
              width={30}
              height={30}
              borderBottomWidth={5}
              borderLeftWidth={5}
              borderColor={
                faceDetected && !isPaused ? colors.success : colors.warning
              }
              borderBottomLeftRadius="$full"
            />
            <Box
              position="absolute"
              bottom={20}
              right={20}
              width={30}
              height={30}
              borderBottomWidth={5}
              borderRightWidth={5}
              borderColor={
                faceDetected && !isPaused ? colors.success : colors.warning
              }
              borderBottomLeftRadius="$full"
            />
          </Box>

          {isPaused && currentStep === "recording" && (
            <Box mt="$4" bg="rgba(255,193,7,0.9)" px="$4" py="$2" borderRadius="$md">
              <Text fontSize="$sm" color={colors.background} fontWeight="$bold">
                ⏸ Tạm dừng - Vui lòng giữ khuôn mặt trong khung
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {currentStep === "recording" && (
        <Box px="$6" py="$4" bg={colors.background}>
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
              <ProgressFilledTrack
                bg={isPaused ? colors.warning : colors.success}
              />
            </Progress>
            <Text fontSize="$xs" color={colors.textSecondary} textAlign="center">
              {isPaused
                ? "Đang tạm dừng - Vui lòng giữ mặt trong khung"
                : "Đang ghi hình - Giữ nguyên tư thế"}
            </Text>
          </VStack>
        </Box>
      )}

      {currentStep === "preparing" && (
        <Box px="$6" py="$4" bg={colors.background}>
          <Text fontSize="$sm" color={colors.text} textAlign="center">
            Đưa khuôn mặt vào khung để bắt đầu
          </Text>
        </Box>
      )}
    </Box>
  );

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

  switch (currentStep) {
    case "instruction":
      return renderInstructionScreen();
    case "preparing":
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

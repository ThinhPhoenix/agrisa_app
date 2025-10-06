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
import {
  cacheDirectory,
  copyAsync,
  deleteAsync,
  documentDirectory,
} from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { Camera, CheckCircle2, User, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Constants
const FACE_FRAME_WIDTH = SCREEN_WIDTH * 0.7;
const FACE_FRAME_HEIGHT = FACE_FRAME_WIDTH * 1.3;
const CAMERA_HEIGHT = FACE_FRAME_HEIGHT + 200;

const RECORDING_DURATION = 10000; // 10 giây
const NO_FACE_TIMEOUT = 120000; // 2 phút
const FACE_DETECTION_INTERVAL = 500; // Kiểm tra mỗi 500ms
const MAX_NO_FACE_PAUSE = 3000; // Cảnh báo sau 3 giây không có face

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

  // Camera hooks
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");

  // Refs
  const cameraRef = useRef<VisionCamera>(null);
  const recordingTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastFaceDetectedTimeRef = useRef<number>(Date.now());
  const faceDetectionCallCountRef = useRef<number>(0);
  const isFaceDetectionWorkingRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const recordedVideoPathRef = useRef<string | null>(null);
  const currentlyPausedRef = useRef<boolean>(false); // Track pause state trong ref

  // Timeout refs
  const noFaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const faceDetectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // States
  const [currentStep, setCurrentStep] = useState<ScanStep>("instruction");
  const [faceDetected, setFaceDetected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<
    "working" | "error" | "checking"
  >("checking");

  // Face Detection Options
  const faceDetectionOptions = useMemo<FaceDetectionOptions>(
    () => ({
      performanceMode: "accurate",
      landmarkMode: "all",
      contourMode: "none",
      classificationMode: "all",
      trackingEnabled: true,
      windowWidth: SCREEN_WIDTH,
      windowHeight: CAMERA_HEIGHT,
    }),
    []
  );

  // ==================== CLEANUP FUNCTIONS ====================

  const cleanupRecording = useCallback(() => {
    console.log("🧹 Cleaning up recording...");

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (noFaceTimeoutRef.current) {
      clearTimeout(noFaceTimeoutRef.current);
      noFaceTimeoutRef.current = null;
    }
    if (faceDetectionCheckIntervalRef.current) {
      clearInterval(faceDetectionCheckIntervalRef.current);
      faceDetectionCheckIntervalRef.current = null;
    }
    if (pauseCheckIntervalRef.current) {
      clearInterval(pauseCheckIntervalRef.current);
      pauseCheckIntervalRef.current = null;
    }

    recordingTimeRef.current = 0;
    pausedTimeRef.current = 0;
    isRecordingRef.current = false;
    recordedVideoPathRef.current = null;
    isFaceDetectionWorkingRef.current = false;
    faceDetectionCallCountRef.current = 0;
    currentlyPausedRef.current = false;
  }, []);

  const resetToInitialState = useCallback(() => {
    console.log("🔄 Resetting to initial state...");
    cleanupRecording();
    setCurrentStep("instruction");
    setFaceDetected(false);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingProgress(0);
    setFaceDetectionStatus("checking");
  }, [cleanupRecording]);

  // ==================== FACE DETECTION HEALTH CHECK ====================

  const startFaceDetectionCheck = useCallback(() => {
    console.log("🔍 Starting face detection health check...");

    if (faceDetectionCheckIntervalRef.current) {
      clearInterval(faceDetectionCheckIntervalRef.current);
    }

    let checkCount = 0;
    const maxChecks = 10; // 5 giây

    faceDetectionCheckIntervalRef.current = setInterval(() => {
      checkCount++;
      console.log(
        `🔍 Check ${checkCount}/${maxChecks}, callbacks: ${faceDetectionCallCountRef.current}`
      );

      if (faceDetectionCallCountRef.current >= 3) {
        console.log("✅ Face detection is working!");
        isFaceDetectionWorkingRef.current = true;
        setFaceDetectionStatus("working");

        if (faceDetectionCheckIntervalRef.current) {
          clearInterval(faceDetectionCheckIntervalRef.current);
          faceDetectionCheckIntervalRef.current = null;
        }
        return;
      }

      if (checkCount >= maxChecks) {
        console.warn("⚠️ Face detection NOT working! Using auto mode.");
        isFaceDetectionWorkingRef.current = false;
        setFaceDetectionStatus("error");

        if (faceDetectionCheckIntervalRef.current) {
          clearInterval(faceDetectionCheckIntervalRef.current);
          faceDetectionCheckIntervalRef.current = null;
        }

        Alert.alert(
          "Thông báo",
          "Không thể sử dụng tính năng phát hiện khuôn mặt. Hệ thống sẽ tự động ghi hình 10 giây.\n\nVui lòng giữ khuôn mặt trong khung trong suốt quá trình.",
          [
            {
              text: "Tiếp tục",
              onPress: () => {
                setTimeout(() => {
                  startRecording();
                }, 1000);
              },
            },
            {
              text: "Hủy",
              style: "cancel",
              onPress: () => resetToInitialState(),
            },
          ]
        );
      }
    }, FACE_DETECTION_INTERVAL);
  }, [resetToInitialState]);

  // ==================== FACE DETECTION CALLBACK ====================

  const handleFacesDetection = useCallback(
    (faces: Face[]) => {
      try {
        faceDetectionCallCountRef.current++;

        const hasValidFace =
          faces?.length > 0 &&
          (() => {
            const face = faces[0];
            return (
              face.leftEyeOpenProbability > 0.7 &&
              face.rightEyeOpenProbability > 0.7 &&
              Math.abs(face.yawAngle) < 15 &&
              Math.abs(face.pitchAngle) < 15
            );
          })();

        setFaceDetected(hasValidFace);

        // CHỈ xử lý khi đang recording và face detection hoạt động
        if (currentStep === "recording" && isFaceDetectionWorkingRef.current) {
          if (hasValidFace) {
            lastFaceDetectedTimeRef.current = Date.now();

            // Resume nếu đang pause
            if (currentlyPausedRef.current) {
              console.log("😊 Face detected, RESUMING...");
              currentlyPausedRef.current = false;
              setIsPaused(false);
              pausedTimeRef.current = 0;
            }
          } else {
            // Pause nếu không có face
            if (!currentlyPausedRef.current) {
              console.log("😟 No face detected, PAUSING...");
              currentlyPausedRef.current = true;
              setIsPaused(true);
            }
          }
        }
        // Nếu đang preparing và detect được face -> start recording
        else if (
          currentStep === "preparing" &&
          hasValidFace &&
          isFaceDetectionWorkingRef.current
        ) {
          console.log("👤 Face detected in preparing, starting recording...");
          startRecording();
        }
      } catch (error) {
        console.error("❌ Face detection error:", error);
        setFaceDetected(false);
      }
    },
    [currentStep]
  );

  // ==================== RECORDING FUNCTIONS ====================

  const startPreparation = useCallback(() => {
    console.log("🎬 Starting preparation...");

    cleanupRecording();
    setFaceDetected(false);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingProgress(0);
    setFaceDetectionStatus("checking");

    setCurrentStep("preparing");
    startFaceDetectionCheck();

    noFaceTimeoutRef.current = setTimeout(() => {
      console.error("⏰ No face timeout");
      Alert.alert(
        "Hết thời gian",
        "Không phát hiện khuôn mặt sau 2 phút. Vui lòng thử lại.",
        [
          {
            text: "OK",
            onPress: () => {
              if (isRecordingRef.current) {
                stopRecording();
              }
              resetToInitialState();
            },
          },
        ]
      );
    }, NO_FACE_TIMEOUT);
  }, [cleanupRecording, startFaceDetectionCheck, resetToInitialState]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecordingRef.current) {
      console.log("⚠️ Cannot start recording");
      return;
    }

    try {
      console.log("🎥 Starting recording...");

      setCurrentStep("recording");
      setIsRecording(true);
      isRecordingRef.current = true;
      currentlyPausedRef.current = false; // Reset pause state
      setIsPaused(false);
      recordingTimeRef.current = 0;
      pausedTimeRef.current = 0;
      setRecordingProgress(0);

      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          console.log("✅ Recording finished:", video.path);
          recordedVideoPathRef.current = video.path;
          isRecordingRef.current = false;
          setIsRecording(false);

          if (recordingTimeRef.current >= RECORDING_DURATION) {
            handleSubmit(video.path);
          }
        },
        onRecordingError: (error) => {
          console.error("❌ Recording error:", error);
          isRecordingRef.current = false;
          setIsRecording(false);

          Alert.alert("Lỗi", "Không thể ghi hình. Vui lòng thử lại.", [
            {
              text: "Thử lại",
              onPress: () => resetToInitialState(),
            },
          ]);
        },
      });

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      // Interval cập nhật progress - CHỈ tăng khi KHÔNG pause
      recordingIntervalRef.current = setInterval(() => {
        const shouldPause =
          isFaceDetectionWorkingRef.current && currentlyPausedRef.current;

        if (!shouldPause) {
          // Tăng recording time
          recordingTimeRef.current += 100;

          const progress = Math.min(
            (recordingTimeRef.current / RECORDING_DURATION) * 100,
            100
          );
          setRecordingProgress(progress);

          console.log(
            `📊 Recording: ${recordingTimeRef.current}ms (${progress.toFixed(1)}%) - Paused: ${shouldPause}`
          );

          if (recordingTimeRef.current >= RECORDING_DURATION) {
            console.log("✅ Recording duration reached");
            stopRecording();
          }
        } else {
          // Tăng paused time
          pausedTimeRef.current += 100;
          console.log(`⏸️ Paused: ${pausedTimeRef.current}ms`);
        }
      }, 100);

      // Interval kiểm tra pause quá lâu
      if (isFaceDetectionWorkingRef.current) {
        if (pauseCheckIntervalRef.current) {
          clearInterval(pauseCheckIntervalRef.current);
        }

        pauseCheckIntervalRef.current = setInterval(() => {
          if (currentlyPausedRef.current) {
            const timeSinceLastFace =
              Date.now() - lastFaceDetectedTimeRef.current;

            if (timeSinceLastFace > MAX_NO_FACE_PAUSE) {
              console.warn("⚠️ Paused too long");

              if (pauseCheckIntervalRef.current) {
                clearInterval(pauseCheckIntervalRef.current);
                pauseCheckIntervalRef.current = null;
              }

              Alert.alert(
                "Cảnh báo",
                "Không phát hiện khuôn mặt trong 3 giây. Vui lòng đưa khuôn mặt vào khung.",
                [
                  {
                    text: "Tiếp tục",
                    onPress: () => {
                      lastFaceDetectedTimeRef.current = Date.now();
                      pausedTimeRef.current = 0;
                    },
                  },
                  {
                    text: "Bắt đầu lại",
                    onPress: () => {
                      stopRecording();
                      resetToInitialState();
                    },
                  },
                ]
              );
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Start recording error:", error);
      isRecordingRef.current = false;
      setIsRecording(false);

      Alert.alert("Lỗi", "Không thể bắt đầu ghi hình. Vui lòng thử lại.", [
        {
          text: "Thử lại",
          onPress: () => resetToInitialState(),
        },
      ]);
    }
  }, [resetToInitialState]);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecordingRef.current) {
      console.log("⚠️ Already stopped or not recording");
      return;
    }

    try {
      console.log("🛑 Stopping recording...");

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      if (noFaceTimeoutRef.current) {
        clearTimeout(noFaceTimeoutRef.current);
        noFaceTimeoutRef.current = null;
      }
      if (pauseCheckIntervalRef.current) {
        clearInterval(pauseCheckIntervalRef.current);
        pauseCheckIntervalRef.current = null;
      }

      await cameraRef.current.stopRecording();
      console.log("✅ Recording stopped");
    } catch (error) {
      console.error("❌ Stop recording error:", error);
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  }, []);

  // ==================== SUBMIT ====================

  const handleSubmit = useCallback(
    async (videoPath: string) => {
      console.log("📤 Submitting video...");
      console.log("Original video path:", videoPath);

      if (!user?.id || !ocrData.cccd_front) {
        Alert.alert(
          "Lỗi",
          "Thiếu thông tin xác thực. Vui lòng quay lại và thực hiện lại từ đầu.",
          [{ text: "Đóng", onPress: () => router.back() }]
        );
        return;
      }

      setCurrentStep("processing");

      try {
        const formData = new FormData();
        formData.append("user_id", user.id.toString());

        // ✅ FIX: Sử dụng legacy API - ổn định và dễ maintain
        let finalVideoUri = videoPath;

        if (Platform.OS === "android") {
          // Android: Copy file sang document directory để có đường dẫn stable
          const fileName = `face_scan_${Date.now()}.mp4`;

          // ✅ Sử dụng documentDirectory từ legacy import
          if (!documentDirectory) {
            console.warn("⚠️ documentDirectory not available, using cache");
            const newPath = `${cacheDirectory}${fileName}`;

            try {
              // ✅ Sử dụng copyAsync từ legacy import
              await copyAsync({
                from: videoPath,
                to: newPath,
              });

              console.log("✅ Video copied to cache:", newPath);
              finalVideoUri = newPath;
            } catch (copyError) {
              console.error("❌ Error copying video:", copyError);
              // Fallback: Sử dụng path gốc
              finalVideoUri = videoPath.startsWith("file://")
                ? videoPath
                : `file://${videoPath}`;
            }
          } else {
            const newPath = `${documentDirectory}${fileName}`;

            try {
              // ✅ Sử dụng copyAsync từ legacy import
              await copyAsync({
                from: videoPath,
                to: newPath,
              });

              console.log("✅ Video copied to:", newPath);
              finalVideoUri = newPath;
            } catch (copyError) {
              console.error("❌ Error copying video:", copyError);
              // Fallback: Sử dụng path gốc
              finalVideoUri = videoPath.startsWith("file://")
                ? videoPath
                : `file://${videoPath}`;
            }
          }
        } else {
          // iOS: Đảm bảo có file:// prefix
          finalVideoUri = videoPath.startsWith("file://")
            ? videoPath
            : `file://${videoPath}`;
        }

        console.log("Final video URI:", finalVideoUri);

        // Append video vào FormData
        formData.append("video", {
          uri: finalVideoUri,
          type: "video/mp4",
          name: `face_scan_${Date.now()}.mp4`,
        } as any);

        // ✅ FIX: Chuẩn hóa CCCD path
        let cccdUri = ocrData.cccd_front;

        if (Platform.OS === "android") {
          cccdUri = cccdUri.startsWith("file://")
            ? cccdUri
            : `file://${cccdUri}`;
        } else {
          cccdUri = cccdUri.startsWith("file://")
            ? cccdUri
            : `file://${cccdUri}`;
        }

        console.log("CCCD URI:", cccdUri);

        formData.append("cmnd", {
          uri: cccdUri,
          type: "image/jpeg",
          name: `cmnd_${Date.now()}.jpg`,
        } as any);

        console.log("🚀 Calling mutation...");
        await faceScanMutation.mutateAsync(formData as any);
        console.log("✅ Mutation successful");

        // ✅ Cleanup: Xóa file tạm nếu đã copy - dùng deleteAsync từ legacy
        if (Platform.OS === "android" && finalVideoUri !== videoPath) {
          try {
            await deleteAsync(finalVideoUri, { idempotent: true });
            console.log("🗑️ Cleaned up temp video file");
          } catch (deleteError) {
            console.warn("⚠️ Could not delete temp file:", deleteError);
          }
        }
      } catch (error) {
        console.error("❌ Submit error:", error);

        // Reset step để user có thể thử lại
        setCurrentStep("instruction");

        Alert.alert(
          "Lỗi xác thực",
          "Không thể gửi video xác thực. Vui lòng kiểm tra kết nối mạng và thử lại.",
          [
            {
              text: "Thử lại",
              onPress: () => {
                faceScanMutation.reset();
                resetToInitialState();
              },
            },
            {
              text: "Hủy",
              style: "cancel",
              onPress: () => {
                faceScanMutation.reset();
                router.back();
              },
            },
          ]
        );
      }
    },
    [user, ocrData, router, faceScanMutation, resetToInitialState]
  );

  const cancelScan = useCallback(() => {
    console.log("❌ Canceling...");
    if (isRecordingRef.current) {
      stopRecording();
    }
    cleanupRecording();
    router.back();
  }, [stopRecording, cleanupRecording, router]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (faceScanMutation.isSuccess) {
      console.log("✅ Success");
      setCurrentStep("success");
      const timeout = setTimeout(() => {
        router.push("/settings/profile");
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (faceScanMutation.isError) {
      console.error("❌ Error:", faceScanMutation.error);
      Alert.alert(
        "Lỗi xác thực",
        faceScanMutation.error?.message ||
          "Không thể xác thực khuôn mặt. Vui lòng thử lại.",
        [
          {
            text: "Thử lại",
            onPress: () => {
              faceScanMutation.reset();
              resetToInitialState();
            },
          },
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => {
              faceScanMutation.reset();
              router.back();
            },
          },
        ]
      );
    }
  }, [
    faceScanMutation.isSuccess,
    faceScanMutation.isError,
    router,
    resetToInitialState,
  ]);

  useEffect(() => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      if (!hasPermission) {
        requestPermission();
      }
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting");
      cleanupRecording();
    };
  }, [cleanupRecording]);

  // ==================== RENDER CHECKS ====================

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

  // ==================== RENDER SCREENS ====================

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
                  Video sẽ ghi đủ 10 giây khi phát hiện khuôn mặt
                </Text>
              </HStack>
              <HStack space="sm" alignItems="flex-start">
                <Text color={colors.primary}>•</Text>
                <Text fontSize="$xs" color={colors.textSecondary} flex={1}>
                  Nếu mất khuôn mặt, quá trình sẽ tạm dừng
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
          <VStack>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
              {currentStep === "preparing" ? "Chuẩn bị..." : "Đang quay video"}
            </Text>
            {faceDetectionStatus === "error" && (
              <Text fontSize="$xs" color={colors.warning}>
                ⚠️ Chế độ tự động
              </Text>
            )}
            {faceDetectionStatus === "working" && isPaused && (
              <Text fontSize="$xs" color={colors.warning}>
                ⏸️ Đã tạm dừng
              </Text>
            )}
          </VStack>
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
          isActive={currentStep === "preparing" || currentStep === "recording"}
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
          {currentStep === "preparing" &&
            !faceDetected &&
            faceDetectionStatus === "checking" && (
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
                  Đang kiểm tra camera...
                </Text>
              </Box>
            )}

          {currentStep === "preparing" &&
            faceDetectionStatus === "working" &&
            !faceDetected && (
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
              {faceDetectionStatus === "error"
                ? "Vui lòng giữ khuôn mặt trong khung"
                : !faceDetected
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
              borderBottomRightRadius="$full"
            />
          </Box>

          {isPaused && currentStep === "recording" && (
            <Box
              mt="$4"
              bg="rgba(255,193,7,0.9)"
              px="$4"
              py="$2"
              borderRadius="$md"
            >
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
            <Text
              fontSize="$xs"
              color={colors.textSecondary}
              textAlign="center"
            >
              {isPaused
                ? "Đang tạm dừng - Vui lòng giữ mặt trong khung"
                : recordingProgress >= 99
                  ? "Đang xử lý video..."
                  : "Đang ghi hình - Giữ nguyên tư thế"}
            </Text>
            {pausedTimeRef.current > 0 && isPaused && (
              <Text fontSize="$xs" color={colors.warning} textAlign="center">
                Đã tạm dừng: {Math.round(pausedTimeRef.current / 1000)}s
              </Text>
            )}
          </VStack>
        </Box>
      )}

      {currentStep === "preparing" && (
        <Box px="$6" py="$4" bg={colors.background}>
          <Text fontSize="$sm" color={colors.text} textAlign="center">
            {faceDetectionStatus === "checking"
              ? "Đang kiểm tra camera..."
              : faceDetectionStatus === "error"
                ? "Sẵn sàng ghi hình tự động"
                : "Đưa khuôn mặt vào khung để bắt đầu"}
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

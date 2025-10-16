import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
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
import { Camera, CheckCircle2, ScanFace, Video, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet } from "react-native";
import Svg, { Defs, Ellipse, Mask, Rect } from "react-native-svg";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// ✅ Constants - Tăng kích thước khung face
const FACE_OVAL_WIDTH = SCREEN_WIDTH * 0.75; // Tăng từ 0.65 lên 0.75
const FACE_OVAL_HEIGHT = FACE_OVAL_WIDTH * 1.35; // Giảm tỷ lệ từ 1.4 xuống 1.35 để cân đối hơn

const RECORDING_DURATION = 10000; // 10 giây
const NO_FACE_TIMEOUT = 120000; // 2 phút
const FACE_DETECTION_INTERVAL = 500; // Kiểm tra mỗi 500ms
const MAX_NO_FACE_PAUSE = 3000; // Cảnh báo sau 3 giây không có face

// Loading ring constants
const RING_STROKE_WIDTH = 6;
const RING_GAP = 12; // Giảm gap từ 15 xuống 12

type ScanStep =
| "instruction"
| "preparing"
| "recording"
| "processing"
| "success";

export const FaceScanScreen = () => {
  const insets = useSafeAreaInsets();
  const CAMERA_HEIGHT = useMemo(() => {
    return SCREEN_HEIGHT - insets.top - insets.bottom;
  }, [insets.top, insets.bottom]);
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
  const currentlyPausedRef = useRef<boolean>(false);

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
    [CAMERA_HEIGHT]
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
    const maxChecks = 10;

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

        if (currentStep === "recording" && isFaceDetectionWorkingRef.current) {
          if (hasValidFace) {
            lastFaceDetectedTimeRef.current = Date.now();

            if (currentlyPausedRef.current) {
              console.log("😊 Face detected, RESUMING...");
              currentlyPausedRef.current = false;
              setIsPaused(false);
              pausedTimeRef.current = 0;
            }
          } else {
            if (!currentlyPausedRef.current) {
              console.log("😟 No face detected, PAUSING...");
              currentlyPausedRef.current = true;
              setIsPaused(true);
            }
          }
        } else if (
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
      stopRecording();
      Alert.alert(
        "Hết thời gian",
        "Không phát hiện khuôn mặt. Vui lòng thử lại.",
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
      currentlyPausedRef.current = false;
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
          stopRecording();

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

      recordingIntervalRef.current = setInterval(() => {
        const shouldPause =
          isFaceDetectionWorkingRef.current && currentlyPausedRef.current;

        if (!shouldPause) {
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
          pausedTimeRef.current += 100;
          console.log(`⏸️ Paused: ${pausedTimeRef.current}ms`);
        }
      }, 100);

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
                stopRecording();

              if (pauseCheckIntervalRef.current) {
                clearInterval(pauseCheckIntervalRef.current);
                pauseCheckIntervalRef.current = null;
                stopRecording();
              }
              
              Alert.alert(
                "Cảnh báo",
                "Không phát hiện khuôn mặt. Vui lòng đưa khuôn mặt vào khung.",
                [
                  {
                    text: "Tiếp tục",
                    onPress: () => {
                      lastFaceDetectedTimeRef.current = Date.now();
                      pausedTimeRef.current = 0;
                      startRecording();
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
      stopRecording();

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
        stopRecording();

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

        let finalVideoUri = videoPath;

        if (Platform.OS === "android") {
          const fileName = `face_scan_${Date.now()}.mp4`;

          if (!documentDirectory) {
            console.warn("⚠️ documentDirectory not available, using cache");
            const newPath = `${cacheDirectory}${fileName}`;

            try {
              await copyAsync({
                from: videoPath,
                to: newPath,
              });

              console.log("✅ Video copied to cache:", newPath);
              finalVideoUri = newPath;
            } catch (copyError) {
              console.error("❌ Error copying video:", copyError);
              finalVideoUri = videoPath.startsWith("file://")
                ? videoPath
                : `file://${videoPath}`;
            }
          } else {
            const newPath = `${documentDirectory}${fileName}`;

            try {
              await copyAsync({
                from: videoPath,
                to: newPath,
              });

              console.log("✅ Video copied to:", newPath);
              finalVideoUri = newPath;
            } catch (copyError) {
              console.error("❌ Error copying video:", copyError);
              finalVideoUri = videoPath.startsWith("file://")
                ? videoPath
                : `file://${videoPath}`;
            }
          }
        } else {
          finalVideoUri = videoPath.startsWith("file://")
            ? videoPath
            : `file://${videoPath}`;
        }

        console.log("Final video URI:", finalVideoUri);

        formData.append("video", {
          uri: finalVideoUri,
          type: "video/mp4",
          name: `face_scan_${Date.now()}.mp4`,
        } as any);

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

        setCurrentStep("instruction");
              stopRecording();

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
            stopRecording();

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

  // ==================== RENDER COMPONENTS ====================

  // ✅ Component vẽ nền trắng với lỗ oval ở giữa
  const OvalMaskOverlay = () => {
    const centerX = SCREEN_WIDTH / 2;
    const centerY = CAMERA_HEIGHT / 2;
    const radiusX = FACE_OVAL_WIDTH / 2;
    const radiusY = FACE_OVAL_HEIGHT / 2;

    return (
      <Svg
        width={SCREEN_WIDTH}
        height={CAMERA_HEIGHT}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <Mask id="oval-mask">
            {/* Nền trắng toàn màn hình */}
            <Rect width={SCREEN_WIDTH} height={CAMERA_HEIGHT} fill="white" />
            {/* Lỗ oval ở giữa (màu đen để tạo lỗ trong mask) */}
            <Ellipse
              cx={centerX}
              cy={centerY}
              rx={radiusX}
              ry={radiusY}
              fill="black"
            />
          </Mask>
        </Defs>
        {/* Apply mask lên nền trắng */}
        <Rect
          width={SCREEN_WIDTH}
          height={CAMERA_HEIGHT}
          fill="white"
          opacity={1}
          mask="url(#oval-mask)"
        />
      </Svg>
    );
  };

  // ✅ Component vẽ vòng loading xung quanh oval
  const OvalLoadingRing = ({ progress }: { progress: number }) => {
    const centerX = SCREEN_WIDTH / 2;
    const centerY = CAMERA_HEIGHT / 2;
    const radiusX = FACE_OVAL_HEIGHT / 2 + RING_GAP;
    const radiusY = FACE_OVAL_WIDTH / 2 + RING_GAP;

    // Tính circumference của ellipse (công thức Ramanujan xấp xỉ)
    const h = Math.pow(radiusX - radiusY, 2) / Math.pow(radiusX + radiusY, 2);
    const circumference =
      Math.PI *
      (radiusX + radiusY) *
      (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

    const strokeDashoffset = circumference - (circumference * progress) / 100;

    return (
      <Svg
        width={SCREEN_WIDTH}
        height={CAMERA_HEIGHT}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Background ring (màu xám mờ) */}
        <Ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusY}
          ry={radiusX}
          fill="none"
          stroke="rgba(200,200,200,0.3)"
          strokeWidth={RING_STROKE_WIDTH}
        />
        <Ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke={isPaused ? colors.warning : colors.primary}
          strokeWidth={RING_STROKE_WIDTH}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${centerX} ${centerY})`}
        />
      </Svg>
    );
  };

  // ✅ Component vẽ viền oval
  const OvalBorder = () => {
    const centerX = SCREEN_WIDTH / 2;
    const centerY = CAMERA_HEIGHT / 2;
    const radiusX = FACE_OVAL_WIDTH / 2;
    const radiusY = FACE_OVAL_HEIGHT / 2;

    return (
      <Svg
        width={SCREEN_WIDTH}
        height={CAMERA_HEIGHT}
        style={StyleSheet.absoluteFillObject}
      >
        <Ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke={faceDetected && !isPaused ? colors.success : colors.warning}
          strokeWidth={3}
        />
      </Svg>
    );
  };

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
    <Box flex={1} bg={colors.background} justifyContent="center" px="$6">
      <VStack space="2xl" alignItems="center">
        <ScanFace size={80} color={colors.primary} />

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
              <Text fontSize="$xs" color={colors.textSecondary}>
                • Đặt khuôn mặt vào trong khung oval
              </Text>
              <Text fontSize="$xs" color={colors.textSecondary}>
                • Nhìn thẳng vào camera và giữ nguyên tư thế
              </Text>
              <Text fontSize="$xs" color={colors.textSecondary}>
                • Đảm bảo có đủ ánh sáng, tránh ngược sáng
              </Text>
              <Text fontSize="$xs" color={colors.textSecondary}>
                • Nếu không tìm thấy khuôn mặt, quá trình sẽ tạm dừng
              </Text>
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
      </VStack>
    </Box>
  );

  const renderCameraScreen = () => (
    <Box flex={1} bg={colors.background}>
      {/* Header */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        zIndex={20}
        bg="$white"
        p="$4"
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack flex={1}>
            <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
              {currentStep === "preparing"
                ? "Chuẩn bị..."
                : "Xác thực khuôn mặt"}
            </Text>
            {faceDetectionStatus === "error" && (
              <Text fontSize="$xs" color={colors.warning}>
                Có lỗi khi quay hình, hãy huỷ và bắt đầu lại
              </Text>
            )}
          </VStack>
          <Button size="sm" variant="link" onPress={cancelScan}>
            <ButtonIcon as={X} color={colors.text} />
          </Button>
        </HStack>
      </Box>

      <Box
        position="absolute"
        top={insets.top}
        overflow="hidden"
        left={0}
        right={0}
        bottom={insets.bottom + 60}
      >
        {/* Camera view */}
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

        {/* Nền trắng với lỗ oval */}
        <OvalMaskOverlay />

        {/* Viền oval */}
        <OvalBorder />

        {/* Vòng loading xung quanh oval */}
        {currentStep === "recording" && (
          <OvalLoadingRing progress={recordingProgress} />
        )}

        {/* Status messages phía trên khung */}
        <Box
          position="absolute"
          top={120}
          left={0}
          right={0}
          alignItems="center"
          px="$6"
        >
          {currentStep === "preparing" &&
            !faceDetected &&
            faceDetectionStatus === "checking" && (
              <Box
                bg="rgba(0,0,0,0.7)"
                borderRadius="$lg"
                p="$4"
                alignItems="center"
              >
                <Spinner size="small" color={colors.primary} />
                <Text fontSize="$sm" color="white" mt="$2" textAlign="center">
                  Đang kiểm tra camera...
                </Text>
              </Box>
            )}

          {currentStep === "preparing" &&
            faceDetectionStatus === "working" &&
            !faceDetected && (
              <Box
                bg="rgba(0,0,0,0.2)"
                borderRadius="$lg"
                p="$4"
                alignItems="center"
              >
                <Spinner size="small" color={colors.primary} />
                <Text fontSize="$sm" color="white" mt="$2" textAlign="center">
                  Đang tìm khuôn mặt...
                </Text>
              </Box>
            )}
          {currentStep === "recording" && (
            <Box borderRadius="$lg" p="$4" alignItems="center" bg="$red600">
              <HStack space="sm" alignItems="center" px="$4">
                <ButtonIcon
                  as={Video}
                  color={colors.textWhiteButton}
                  size="lg"
                />
                <Text
                  color={colors.textWhiteButton}
                  fontWeight="$bold"
                  fontSize="$md"
                >
                  {isPaused ? "Đã tạm dừng" : "Đang quay"}
                </Text>
              </HStack>
            </Box>
          )}
        </Box>

        {/* Text hướng dẫn ở giữa (phía dưới khung oval) */}
        <Box
          position="absolute"
          bottom={CAMERA_HEIGHT / 2 - FACE_OVAL_HEIGHT / 2 - 70}
          left={0}
          right={0}
          px="$6"
        >
          <Text
            fontSize="$lg"
            color={colors.text}
            textAlign="center"
            fontWeight="$bold"
            p="$3"
            borderRadius="$lg"
          >
            {currentStep === "preparing" && !faceDetected
              ? "Đặt khuôn mặt vào khung"
              : currentStep === "recording"
                ? isPaused
                  ? "Giữ khuôn mặt trong khung"
                  : "Đang quét..."
                : "Đặt khuôn mặt vào khung"}
          </Text>
        </Box>
      </Box>
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

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/common/custom-button.tsx";
import usePushNoti from "@/domains/shared/hooks/usePushNoti";
import { Box, Text } from "@gluestack-ui/themed";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { ScanText, X, Upload } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const DEBUGGING = false;

const WINDOW_HEIGHT = Dimensions.get("window").height;
const DRAWER_HEIGHT = 100;

export interface OcrScannerProps {
  onResult?: (result: { text: string; uris: string[] }) => void;
  buttonLabel?: string;
  prompt?: string;
  multiple?: boolean; // Tính năng mới
}

const OcrScanner: React.FC<OcrScannerProps> = ({
  onResult,
  buttonLabel,
  prompt,
  multiple = false,
}) => {
  const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;

  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const [imageUris, setImageUris] = useState<string[]>([]);
  const [ocrText, setOcrText] = useState<string>("");
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendNotification = usePushNoti();

  const openDrawer = () => {
    setOpen(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  const performOCR = async (uris: string[]) => {
    try {
      setLoading(true);
      setOcrText("");

      // Convert all images to base64
      const base64Images = await Promise.all(
        uris.map((uri) =>
          FileSystem.readAsStringAsync(uri, { encoding: "base64" })
        )
      );

      if (!GEMINI_API_KEY)
        console.warn("No API key provided to OcrScanner component");

      // Build parts array with text prompt and all images
      const parts: any[] = [
        {
          text: `Vui lòng trích xuất và chỉ trả về nội dung văn bản từ ${
            uris.length > 1 ? "các" : ""
          } hình ảnh này. ${
            uris.length > 1
              ? "Nếu có nhiều ảnh, hãy ghép nội dung theo thứ tự."
              : ""
          } Không thêm bất kỳ lời giải thích hoặc bình luận nào. ${
            prompt ? `Thông tin bổ sung: ${prompt}` : ""
          }`,
        },
      ];

      // Add all images
      base64Images.forEach((base64) => {
        parts.push({
          inline_data: { mime_type: "image/jpeg", data: base64 },
        });
      });

      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
          }),
        }
      );

      if (!geminiResp.ok) {
        const text = await geminiResp.text();
        console.error("Gemini API error response:", geminiResp.status, text);
        Alert.alert("Lỗi OCR", `Lỗi từ server OCR: ${geminiResp.status}`);
        return;
      }

      const gdata = await geminiResp.json();
      setRawResponse(gdata);
      console.log("Gemini response:", gdata);

      if (gdata.candidates && gdata.candidates[0]?.content?.parts) {
        const text = gdata.candidates[0].content.parts[0].text;
        setOcrText(text);
        onResult && onResult({ text, uris });

        try {
          await sendNotification({
            title: "OCR thành công",
            body: `Đã nhận dạng văn bản từ ${uris.length} ảnh`,
          });
        } catch (notifErr) {
          console.warn("Failed to send OCR notification", notifErr);
        }
      } else {
        console.warn("No OCR text in Gemini response", gdata);
        Alert.alert("Lỗi", "Không thể trích xuất text từ ảnh");
      }
    } catch (err) {
      console.error("OCR error:", err);
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const chooseFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted")
        return Alert.alert(
          "Quyền truy cập bị từ chối",
          "Cần cấp quyền truy cập thư viện ảnh"
        );

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsMultipleSelection: multiple,
      });

      const cancelled = (result as any).canceled ?? (result as any).cancelled;

      if (!cancelled) {
        // Handle multiple selection
        const assets = (result as any).assets;
        const uris = assets
          ? assets.map((a: any) => a.uri)
          : [(result as any).uri];

        if (multiple) {
          // Add to existing images
          setImageUris((prev) => [...prev, ...uris]);
          closeDrawer();
        } else {
          // Single mode - process immediately
          setImageUris(uris);
          closeDrawer();
          await performOCR(uris);
        }
      } else {
        closeDrawer();
      }
    } catch (err) {
      console.warn("Image pick error", err);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
      closeDrawer();
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted")
        return Alert.alert(
          "Quyền truy cập bị từ chối",
          "Cần cấp quyền truy cập camera"
        );

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      const cancelled = (result as any).canceled ?? (result as any).cancelled;
      const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri;

      if (!cancelled && uri) {
        if (multiple) {
          // Add to collection
          setImageUris((prev) => [...prev, uri]);
          closeDrawer();
        } else {
          // Single mode - process immediately
          setImageUris([uri]);
          closeDrawer();
          await performOCR([uri]);
        }
      } else {
        closeDrawer();
      }
    } catch (err) {
      console.warn("Camera error", err);
      Alert.alert("Lỗi", "Không thể mở camera");
      closeDrawer();
    }
  };

  const removeImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (imageUris.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một ảnh");
      return;
    }
    await performOCR(imageUris);
  };

  const clearImages = () => {
    setImageUris([]);
    setOcrText("");
    setRawResponse(null);
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [WINDOW_HEIGHT, 0],
  });
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box alignItems="center" justifyContent="center" padding={20}>
          <PrimaryButton
            onPress={openDrawer}
            style={{ width: "100%" }}
            loading={loading}
            disabled={loading}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <ScanText color="#fff" size={18} />
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {buttonLabel ?? (multiple ? "Chọn ảnh" : "Chọn ảnh")}
              </Text>
            </View>
          </PrimaryButton>

          {/* Preview selected images in multiple mode */}
          {multiple && imageUris.length > 0 && (
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  Đã chọn {imageUris.length} ảnh
                </Text>
                <TouchableOpacity onPress={clearImages}>
                  <Text style={styles.clearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imageList}>
                  {imageUris.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(index)}
                      >
                        <X color="#fff" size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <PrimaryButton
                onPress={processImages}
                style={{ width: "100%", marginTop: 12 }}
                loading={loading}
                disabled={loading}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Upload color="#fff" size={18} />
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Gửi {imageUris.length} ảnh để OCR
                  </Text>
                </View>
              </PrimaryButton>
            </View>
          )}

          {DEBUGGING && (imageUris.length > 0 || ocrText || rawResponse) ? (
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>Debug OCR</Text>

              {imageUris.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {imageUris.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={styles.debugImage}
                      />
                    ))}
                  </View>
                </ScrollView>
              ) : null}

              {loading ? (
                <Text style={styles.debugStatus}>Đang xử lý ảnh...</Text>
              ) : null}

              {ocrText ? (
                <View style={styles.resultBox}>
                  <Text style={styles.resultTitle}>Kết quả OCR:</Text>
                  <Text style={styles.resultText}>{ocrText}</Text>
                </View>
              ) : null}

              {rawResponse ? (
                <View style={styles.rawBox}>
                  <Text style={styles.resultTitle}>Raw response</Text>
                  <Text style={styles.rawText}>
                    {JSON.stringify(rawResponse, null, 2)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </Box>
      </ScrollView>

      {/* Modal Drawer */}
      <Modal
        visible={open}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "black", opacity: backdropOpacity },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.drawer,
            { height: DRAWER_HEIGHT, transform: [{ translateY }] },
          ]}
        >
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <SecondaryButton onPress={chooseFromLibrary}>
                <Text>
                  {multiple ? "Chọn từ thư viện" : "Chọn từ thư viện"}
                </Text>
              </SecondaryButton>
            </View>

            <View style={{ flex: 1 }}>
              <PrimaryButton onPress={takePhoto}>
                <Text color="$white">Chụp ảnh</Text>
              </PrimaryButton>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 12,
    backgroundColor: "#fff",
  },
  previewContainer: {
    marginTop: 16,
    width: "100%",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  clearText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  imageList: {
    flexDirection: "row",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: "100%",
  },
  resultTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  resultText: { fontSize: 14, lineHeight: 20 },
  debugBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  debugTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  debugImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  debugStatus: { fontSize: 13, color: "#374151", marginBottom: 8 },
  rawBox: { marginTop: 8, maxHeight: 160, overflow: "hidden" },
  rawText: { fontSize: 12, fontFamily: "monospace", color: "#111827" },
});

export default OcrScanner;

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/common/custom-button.tsx";
import { Box, Text } from "@gluestack-ui/themed";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { ScanText } from "lucide-react-native";
import React, { useRef, useState } from "react";
import usePushNoti from "@/domains/shared/hooks/usePushNoti";
import {
  // ActivityIndicator is used inside buttons; keep import for clarity (PrimaryButton uses it)
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const DEBUGGING = false;

const WINDOW_HEIGHT = Dimensions.get("window").height;
const DRAWER_HEIGHT = 100;

export interface OcrScannerProps {
  onResult?: (text: string) => void;
  buttonLabel?: string;
  prompt?: string;
}

const OcrScanner: React.FC<OcrScannerProps> = ({
  onResult,
  buttonLabel,
  prompt,
}) => {
  const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;

  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const [imageUri, setImageUri] = useState<string | null>(null);
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

  const performOCR = async (uri: string) => {
    try {
      setLoading(true);
      setOcrText("");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      if (!GEMINI_API_KEY)
        console.warn("No API key provided to OcrScanner component");

      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Vui lòng trích xuất và chỉ trả về nội dung văn bản từ hình ảnh này. Không thêm bất kỳ lời giải thích hoặc bình luận nào. ${
                      prompt ? `Thông tin bổ sung: ${prompt}` : ""
                    }`,
                  },
                  { inline_data: { mime_type: "image/jpeg", data: base64 } },
                ],
              },
            ],
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
      // keep a copy of raw response for debugging UI when DEBUGGING=true
      setRawResponse(gdata);
      console.log("Gemini response:", gdata);

      if (gdata.candidates && gdata.candidates[0]?.content?.parts) {
        const text = gdata.candidates[0].content.parts[0].text;
        setOcrText(text);
        onResult && onResult(text);
        // Send a push notification with a short snippet of the recognized text
        try {
          await sendNotification({ title: "OCR thành công", body: "Đã nhận dạng văn bản từ ảnh" });
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
      });
      const cancelled = (result as any).canceled ?? (result as any).cancelled;
      const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
      if (!cancelled && uri) {
        setImageUri(uri);
        // close drawer immediately so the user sees the sheet hide, then run OCR
        closeDrawer();
        await performOCR(uri);
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
        setImageUri(uri);
        // hide drawer immediately before processing
        closeDrawer();
        await performOCR(uri);
      } else {
        closeDrawer();
      }
    } catch (err) {
      console.warn("Camera error", err);
      Alert.alert("Lỗi", "Không thể mở camera");
      closeDrawer();
    }
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    // move the drawer fully off-screen when closed (use window height)
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
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <ScanText color="#fff" size={18} />
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {buttonLabel ?? "Chọn ảnh"}
              </Text>
            </View>
          </PrimaryButton>

          {DEBUGGING && (imageUri || ocrText || rawResponse) ? (
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>Debug OCR</Text>

              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.debugImage} />
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

      {open && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "black", opacity: backdropOpacity },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          styles.drawer,
          { height: DRAWER_HEIGHT, transform: [{ translateY }] },
        ]}
      >
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <SecondaryButton onPress={chooseFromLibrary}>
              <Text>Chọn từ thư viện</Text>
            </SecondaryButton>
          </View>

          <View style={{ flex: 1 }}>
            <PrimaryButton onPress={takePhoto}>
              <Text color="$white">Chụp ảnh</Text>
            </PrimaryButton>
          </View>
        </View>
      </Animated.View>
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
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: "100%",
  },
  resultTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  resultText: { fontSize: 14, lineHeight: 20 },
  // debug styles
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
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover" as any,
  },
  debugStatus: { fontSize: 13, color: "#374151", marginBottom: 8 },
  rawBox: { marginTop: 8, maxHeight: 160, overflow: "hidden" as any },
  rawText: { fontSize: 12, fontFamily: "monospace" as any, color: "#111827" },
});

export default OcrScanner;

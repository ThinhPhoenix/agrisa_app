import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import useLocalNoti from "@/domains/shared/hooks/use-local-noti";
import {
    Box,
    Button,
    ButtonSpinner,
    ButtonText,
    Text,
} from "@gluestack-ui/themed";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Sparkles, Upload, X } from "lucide-react-native";
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
    imageUris?: string[]; // Nhận ảnh từ bên ngoài (nếu có)
}

const OcrScanner: React.FC<OcrScannerProps> = ({
    onResult,
    buttonLabel,
    prompt,
    multiple = false,
    imageUris: externalImageUris, // Nhận từ props
}) => {
    const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;
    const { mode } = useAgrisaColors();
    const themeColors = AgrisaColors[mode];

    const [open, setOpen] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const [imageUris, setImageUris] = useState<string[]>([]);
    const [ocrText, setOcrText] = useState<string>("");
    const [rawResponse, setRawResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Processing OCR
    const [isUploading, setIsUploading] = useState(false); // Uploading images

    const sendNotification = useLocalNoti();

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
            setIsProcessing(true);
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
                console.error(
                    "Gemini API error response:",
                    geminiResp.status,
                    text
                );
                Alert.alert(
                    "Lỗi OCR",
                    `Lỗi từ server OCR: ${geminiResp.status}`
                );
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
            setIsProcessing(false);
        }
    };

    const chooseFromLibrary = async () => {
        try {
            setIsUploading(true);
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

            const cancelled =
                (result as any).canceled ?? (result as any).cancelled;

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
        } finally {
            setIsUploading(false);
        }
    };

    const takePhoto = async () => {
        try {
            setIsUploading(true);
            const { status } =
                await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted")
                return Alert.alert(
                    "Quyền truy cập bị từ chối",
                    "Cần cấp quyền truy cập camera"
                );

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                quality: 0.8,
            });

            const cancelled =
                (result as any).canceled ?? (result as any).cancelled;
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
        } finally {
            setIsUploading(false);
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

    // Nếu có ảnh từ props, chỉ hiển thị nút xác nhận
    const urisToProcess =
        externalImageUris && externalImageUris.length > 0
            ? externalImageUris
            : imageUris;
    const isExternalMode = externalImageUris && externalImageUris.length > 0;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Box alignItems="center" justifyContent="center" padding={20}>
                    <Button
                        onPress={
                            isExternalMode
                                ? () => performOCR(externalImageUris)
                                : openDrawer
                        }
                        isDisabled={
                            isUploading ||
                            isProcessing ||
                            (isExternalMode && externalImageUris.length === 0)
                        }
                        style={{
                            width: "100%",
                            backgroundColor: isExternalMode
                                ? themeColors.success
                                : themeColors.primary,
                            borderRadius: 12,
                            minHeight: 56,
                            paddingVertical: 16,
                        }}
                    >
                        {(isUploading || isProcessing) && (
                            <ButtonSpinner
                                mr="$2"
                                color={themeColors.primary_white_text}
                            />
                        )}
                        <Sparkles
                            color={themeColors.primary_white_text}
                            size={20}
                        />
                        <ButtonText
                            ml="$2"
                            style={{
                                color: themeColors.primary_white_text,
                                fontWeight: "700",
                                fontSize: 16,
                            }}
                        >
                            {isProcessing
                                ? "Đang xử lý..."
                                : isExternalMode
                                  ? (buttonLabel ?? "Xác nhận và quét")
                                  : (buttonLabel ?? "Chọn ảnh")}
                        </ButtonText>
                    </Button>

                    {/* Preview selected images in multiple mode - chỉ hiển thị khi không có ảnh từ props */}
                    {!isExternalMode && multiple && imageUris.length > 0 && (
                        <View style={styles.previewContainer}>
                            <View style={styles.previewHeader}>
                                <Text style={styles.previewTitle}>
                                    Đã chọn {imageUris.length} ảnh
                                </Text>
                                <TouchableOpacity onPress={clearImages}>
                                    <Text style={styles.clearText}>
                                        Xóa tất cả
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                <View style={styles.imageList}>
                                    {imageUris.map((uri, index) => (
                                        <View
                                            key={index}
                                            style={styles.imageWrapper}
                                        >
                                            <Image
                                                source={{ uri }}
                                                style={styles.previewImage}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() =>
                                                    removeImage(index)
                                                }
                                            >
                                                <X color="#fff" size={16} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>

                            <Button
                                onPress={processImages}
                                isDisabled={isProcessing}
                                style={{
                                    width: "100%",
                                    marginTop: 12,
                                    backgroundColor: themeColors.primary,
                                    borderRadius: 8,
                                    minHeight: 52,
                                }}
                            >
                                {isProcessing && <ButtonSpinner mr="$2" />}
                                <Upload
                                    color={themeColors.primary_white_text}
                                    size={18}
                                />
                                <ButtonText
                                    ml="$2"
                                    style={{
                                        color: themeColors.primary_white_text,
                                        fontWeight: "600",
                                        fontSize: 15,
                                    }}
                                >
                                    Tải lên {imageUris.length} ảnh để xử lý
                                </ButtonText>
                            </Button>
                        </View>
                    )}

                    {DEBUGGING &&
                    (imageUris.length > 0 || ocrText || rawResponse) ? (
                        <View style={styles.debugBox}>
                            <Text style={styles.debugTitle}>Debug OCR</Text>

                            {imageUris.length > 0 ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <View
                                        style={{ flexDirection: "row", gap: 8 }}
                                    >
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

                            {isProcessing ? (
                                <Text style={styles.debugStatus}>
                                    Đang xử lý ảnh...
                                </Text>
                            ) : null}

                            {ocrText ? (
                                <View style={styles.resultBox}>
                                    <Text style={styles.resultTitle}>
                                        Kết quả OCR:
                                    </Text>
                                    <Text style={styles.resultText}>
                                        {ocrText}
                                    </Text>
                                </View>
                            ) : null}

                            {rawResponse ? (
                                <View style={styles.rawBox}>
                                    <Text style={styles.resultTitle}>
                                        Raw response
                                    </Text>
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
                            {
                                backgroundColor: "black",
                                opacity: backdropOpacity,
                            },
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
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 12,
                            marginBottom: 12,
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Button
                                onPress={chooseFromLibrary}
                                variant="outline"
                                isDisabled={isUploading}
                                style={{
                                    borderRadius: 8,
                                    borderWidth: 2,
                                    borderColor: themeColors.primary,
                                    backgroundColor: "transparent",
                                    minHeight: 48,
                                }}
                            >
                                {isUploading && (
                                    <ButtonSpinner
                                        mr="$1"
                                        color={themeColors.primary}
                                    />
                                )}
                                <ButtonText
                                    style={{
                                        color: themeColors.primary,
                                        fontWeight: "600",
                                        fontSize: 14,
                                    }}
                                >
                                    {multiple
                                        ? "Chọn từ thư viện"
                                        : "Chọn từ thư viện"}
                                </ButtonText>
                            </Button>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Button
                                onPress={takePhoto}
                                isDisabled={isUploading}
                                style={{
                                    borderRadius: 8,
                                    backgroundColor: themeColors.primary,
                                    minHeight: 48,
                                }}
                            >
                                {isUploading && <ButtonSpinner mr="$1" />}
                                <ButtonText
                                    style={{
                                        color: themeColors.primary_white_text,
                                        fontWeight: "600",
                                        fontSize: 14,
                                    }}
                                >
                                    Chụp ảnh
                                </ButtonText>
                            </Button>
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

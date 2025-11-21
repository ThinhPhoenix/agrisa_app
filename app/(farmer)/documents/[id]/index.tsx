import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, FileCheck, X } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, Image, Modal, StyleSheet } from "react-native";

/**
 * Màn hình chi tiết giấy tờ chứng nhận quyền sử dụng đất
 * Chỉ hiển thị ảnh giấy tờ, không có thông tin khác
 */
export default function DocumentsDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDetailFarm } = useFarm();
  const { data, isLoading, error } = getDetailFarm(id || "");

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const farm = data?.success ? data.data : null;

  // Helper: Fix photo URL by adding https:// if missing
  const getPhotoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // Helper: Parse land_certificate_url (split by |)
  const parseCertificateUrls = (urlString: string): string[] => {
    if (!urlString) return [];
    return urlString.split("|").filter((url) => url.trim() !== "");
  };

  const certificateUrls = parseCertificateUrls(farm?.land_certificate_url || "");

  // Open fullscreen image viewer
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Close fullscreen image viewer
  const closeImageViewer = () => {
    setSelectedImageIndex(null);
  };

  return (
    <Box flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title={farm?.farm_name || "Giấy tờ nông trại"}
        onBack={() => router.back()}
      />

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Box p="$4">
          {/* Loading */}
          {isLoading && (
            <Box py="$8" alignItems="center">
              <Spinner size="large" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text} mt="$4">
                Đang tải giấy tờ...
              </Text>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Box
              bg={colors.error + "20"}
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor={colors.error}
            >
              <HStack space="sm" alignItems="center">
                <AlertCircle size={20} color={colors.error} strokeWidth={2} />
                <Text fontSize="$sm" color={colors.error} flex={1}>
                  Không thể tải giấy tờ. Vui lòng thử lại.
                </Text>
              </HStack>
            </Box>
          )}

          {/* Empty state */}
          {!isLoading && certificateUrls.length === 0 && (
            <Box py="$8" alignItems="center">
              <AlertCircle
                size={64}
                color={colors.secondary_text}
                strokeWidth={1}
              />
              <Text
                fontSize="$md"
                fontWeight="$semibold"
                color={colors.primary_text}
                mt="$4"
              >
                Chưa có giấy tờ
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
                mt="$2"
              >
                Nông trại này chưa có giấy tờ chứng nhận
              </Text>
            </Box>
          )}

          {/* Document Images Grid */}
          {certificateUrls.length > 0 && (
            <VStack space="md">
              {/* Document info */}
              <VStack space="sm">
                <Box
                  bg={colors.primary + "20"}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={1}
                  borderColor={colors.primary}
                >
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary}
                    textAlign="center"
                  >
                    Tổng cộng: {certificateUrls.length} tài liệu
                  </Text>
                </Box>

                {/* Certificate info */}
                {farm?.land_certificate_number && (
                  <Box
                    bg={colors.background}
                    borderRadius="$lg"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <VStack space="xs">
                      <HStack space="sm" alignItems="center">
                        <FileCheck
                          size={16}
                          color={colors.primary}
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          fontWeight="$semibold"
                          color={colors.primary_text}
                        >
                          Số GCN: {farm.land_certificate_number}
                        </Text>
                      </HStack>

                      {farm.land_ownership_verified && (
                        <Box
                          bg={colors.success + "20"}
                          borderRadius="$sm"
                          px="$2"
                          py="$1"
                          alignSelf="flex-start"
                        >
                          <Text
                            fontSize="$xs"
                            fontWeight="$semibold"
                            color={colors.success}
                          >
                            ✓ Đã xác minh quyền sở hữu
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>

              {/* Document Images */}
              {certificateUrls.map((url: string, index: number) => (
                <Pressable key={index} onPress={() => openImageViewer(index)}>
                  <Box
                    borderRadius="$xl"
                    overflow="hidden"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <Image
                      source={{ uri: getPhotoUrl(url) }}
                      style={{
                        width: "100%",
                        aspectRatio: 16 / 9,
                      }}
                      resizeMode="cover"
                    />

                    {/* Image number badge */}
                    <Box
                      position="absolute"
                      bottom="$3"
                      right="$3"
                      bg="rgba(0,0,0,0.7)"
                      borderRadius="$md"
                      px="$3"
                      py="$1"
                    >
                      <Text
                        fontSize="$xs"
                        fontWeight="$semibold"
                        color={colors.primary_white_text}
                      >
                        {index + 1}/{certificateUrls.length}
                      </Text>
                    </Box>
                  </Box>
                </Pressable>
              ))}
            </VStack>
          )}
        </Box>
      </ScrollView>

      {/* Fullscreen Image Viewer Modal */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
        statusBarTranslucent
      >
        <Pressable style={styles.modalContainer} onPress={closeImageViewer}>
          <Box
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            {selectedImageIndex !== null && certificateUrls[selectedImageIndex] && (
              <>
                <Image
                  source={{
                    uri: getPhotoUrl(certificateUrls[selectedImageIndex]),
                  }}
                  style={{
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height * 0.8,
                  }}
                  resizeMode="contain"
                />

                {/* Close button */}
                <Pressable
                  onPress={closeImageViewer}
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.error },
                  ]}
                >
                  <X
                    size={24}
                    color={colors.primary_white_text}
                    strokeWidth={2}
                  />
                </Pressable>

                {/* Image counter */}
                <Box
                  position="absolute"
                  bottom={50}
                  bg="rgba(0,0,0,0.7)"
                  borderRadius="$lg"
                  px="$4"
                  py="$2"
                >
                  <Text
                    fontSize="$md"
                    fontWeight="$semibold"
                    color={colors.primary_white_text}
                  >
                    {selectedImageIndex + 1} / {certificateUrls.length}
                  </Text>
                </Box>
              </>
            )}
          </Box>
        </Pressable>
      </Modal>
    </Box>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

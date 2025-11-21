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
import { AlertCircle, X } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, Image, Modal, StyleSheet } from "react-native";

/**
 * Màn hình chi tiết ảnh vệ tinh
 * Chỉ hiển thị ảnh vệ tinh, không có thông tin khác
 */
export default function SatelliteDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDetailFarm } = useFarm();
  const { data, isLoading, error } = getDetailFarm(id || "");

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const farm = data?.success ? data.data : null;
  const photos = farm?.farm_photos || [];

  // Helper: Fix photo URL by adding https:// if missing
  const getPhotoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

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
        title={farm?.farm_name || "Ảnh vệ tinh"}
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
                Đang tải ảnh...
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
                  Không thể tải ảnh. Vui lòng thử lại.
                </Text>
              </HStack>
            </Box>
          )}

          {/* Empty state */}
          {!isLoading && photos.length === 0 && (
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
                Chưa có ảnh vệ tinh
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
                mt="$2"
              >
                Nông trại này chưa có ảnh vệ tinh
              </Text>
            </Box>
          )}

          {/* Satellite Images Grid */}
          {photos.length > 0 && (
            <VStack space="md">
              {/* Photo count info */}
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
                  Tổng cộng: {photos.length} ảnh vệ tinh
                </Text>
              </Box>

              {photos.map((photo: any, index: number) => (
                <Pressable
                  key={photo.id}
                  onPress={() => openImageViewer(index)}
                >
                  <Box
                    borderRadius="$xl"
                    overflow="hidden"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <Image
                      source={{ uri: getPhotoUrl(photo.photo_url) }}
                      style={{
                        width: '100%',
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
                        {index + 1}/{photos.length}
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
        <Pressable
          style={styles.modalContainer}
          onPress={closeImageViewer}
        >
          <Box
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            {selectedImageIndex !== null && photos[selectedImageIndex] && (
              <>
                <Image
                  source={{ uri: getPhotoUrl(photos[selectedImageIndex].photo_url) }}
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
                  <X size={24} color={colors.primary_white_text} strokeWidth={2} />
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
                    {selectedImageIndex + 1} / {photos.length}
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

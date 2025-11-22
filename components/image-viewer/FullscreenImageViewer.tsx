import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, Pressable, Text } from "@gluestack-ui/themed";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, Image, Modal, StyleSheet } from "react-native";

interface FullscreenImageViewerProps {
  /**
   * Danh sách URL của các ảnh
   */
  images: string[];

  /**
   * Index của ảnh đang được chọn (null = đóng modal)
   */
  selectedIndex: number | null;

  /**
   * Callback khi đóng modal
   */
  onClose: () => void;

  /**
   * Callback khi thay đổi ảnh (optional)
   */
  onIndexChange?: (index: number) => void;
}

/**
 * Component hiển thị ảnh fullscreen với khả năng navigate
 * Sử dụng cho cả satellite và documents
 */
export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  images,
  selectedIndex,
  onClose,
  onIndexChange,
}) => {
  const { colors } = useAgrisaColors();
  const [currentIndex, setCurrentIndex] = useState(selectedIndex ?? 0);

  // Update currentIndex when selectedIndex changes
  React.useEffect(() => {
    if (selectedIndex !== null) {
      setCurrentIndex(selectedIndex);
    }
  }, [selectedIndex]);

  // Navigate to previous image
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  };

  // Navigate to next image
  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  };

  const isVisible = selectedIndex !== null;
  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <Box
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          {isVisible && currentImage && (
            <>
              {/* Main Image */}
              <Pressable
                onPress={(e) => e.stopPropagation()}
                style={{ width: "100%", height: "80%" }}
              >
                <Image
                  source={{ uri: currentImage }}
                  style={{
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height * 0.8,
                  }}
                  resizeMode="contain"
                />
              </Pressable>

              {/* Close button */}
              <Pressable
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: colors.error }]}
              >
                <X
                  size={24}
                  color={colors.primary_white_text}
                  strokeWidth={2}
                />
              </Pressable>

              {/* Previous button */}
              {currentIndex > 0 && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  style={[
                    styles.navButton,
                    styles.leftButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <ChevronLeft
                    size={32}
                    color={colors.primary_white_text}
                    strokeWidth={2}
                  />
                </Pressable>
              )}

              {/* Next button */}
              {currentIndex < images.length - 1 && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  style={[
                    styles.navButton,
                    styles.rightButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <ChevronRight
                    size={32}
                    color={colors.primary_white_text}
                    strokeWidth={2}
                  />
                </Pressable>
              )}

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
                  {currentIndex + 1} / {images.length}
                </Text>
              </Box>
            </>
          )}
        </Box>
      </Pressable>
    </Modal>
  );
};

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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navButton: {
    position: "absolute",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  leftButton: {
    left: 20,
    top: "50%",
    marginTop: -30,
  },
  rightButton: {
    right: 20,
    top: "50%",
    marginTop: -30,
  },
});

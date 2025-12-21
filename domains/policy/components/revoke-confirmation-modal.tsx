import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { AlertTriangle, XCircle } from "lucide-react-native";
import React from "react";

interface RevokeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Modal xác nhận hủy yêu cầu hủy hợp đồng
 */
export const RevokeConfirmationModal: React.FC<
  RevokeConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const { colors } = useAgrisaColors();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent bg={colors.card_surface} maxWidth="$full" mx="$4">
        {/* Header */}
        <ModalHeader
          borderBottomWidth={1}
          borderColor={colors.frame_border}
          pb="$3"
        >
          <VStack space="xs" width="100%">
            <HStack space="sm" alignItems="center">
              <AlertTriangle
                size={20}
                color={colors.warning}
                strokeWidth={2.5}
              />
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
                flex={1}
              >
                Xác nhận hủy
              </Text>
            </HStack>
          </VStack>
        </ModalHeader>

        {/* Body */}
        <ModalBody pt="$4" pb="$3">
          <VStack space="md">
            {/* Warning message */}
            <Box
              bg={colors.warningSoft}
              borderRadius="$lg"
              p="$3.5"
              borderWidth={1}
              borderColor={colors.warning}
            >
              <VStack space="sm">
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                >
                  Bạn có chắc chắn muốn hủy đơn yêu cầu hủy hợp đồng này?
                </Text>
                <Text
                  fontSize="$xs"
                  color={colors.secondary_text}
                  lineHeight="$md"
                >
                  Sau khi huỷ đơn, hợp đồng của bạn sẽ trở về trạng thái hoạt
                  động trước khi gửi đơn yêu cầu.
                </Text>
              </VStack>
            </Box>

            {/* Info note */}
            <Box
              bg={colors.infoSoft}
              borderRadius="$md"
              p="$3"
              borderWidth={1}
              borderColor={colors.info}
            >
              <Text
                fontSize="$2xs"
                color={colors.primary_text}
                lineHeight="$xs"
              >
                <Text fontWeight="$bold">Lưu ý:</Text> Hành động này không thể
                hoàn tác. Nếu bạn thay đổi ý định, bạn cần tạo yêu cầu hủy hợp
                đồng mới.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        {/* Footer */}
        <ModalFooter
          borderTopWidth={1}
          borderColor={colors.frame_border}
          pt="$3"
          pb="$4"
        >
          <HStack space="sm" width="100%">
            <Button
              flex={1}
              size="md"
              variant="outline"
              onPress={onClose}
              borderColor={colors.frame_border}
              isDisabled={isLoading}
              bg={colors.background}
            >
              <Text
                color={colors.secondary_text}
                fontWeight="$semibold"
                fontSize="$sm"
              >
                Huỷ bỏ
              </Text>
            </Button>

            <Button
              flex={1}
              size="md"
              onPress={onConfirm}
              bg={colors.error}
              isDisabled={isLoading}
            >
              {isLoading ? (
                <HStack space="xs" alignItems="center">
                  <Spinner size="small" color={colors.primary_white_text} />
                  <Text
                    color={colors.primary_white_text}
                    fontWeight="$bold"
                    fontSize="$sm"
                  >
                    Đang xử lý...
                  </Text>
                </HStack>
              ) : (
                <HStack space="xs" alignItems="center">
                  <XCircle
                    size={16}
                    color={colors.primary_white_text}
                    strokeWidth={2.5}
                  />
                  <Text
                    color={colors.primary_white_text}
                    fontWeight="$bold"
                    fontSize="$sm"
                  >
                    Xác nhận
                  </Text>
                </HStack>
              )}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
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
    Textarea,
    TextareaInput,
    VStack,
    Box
} from "@gluestack-ui/themed";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react-native";
import React, { useState } from "react";

interface ResolveDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewNotes: string, finalDecision: "approved" | "denied") => void;
  isApproving: boolean; // true = đang xử lý chấp nhận, false = đang xử lý từ chối
  isLoading?: boolean;
}

/**
 * Modal để giải quyết tranh chấp hủy hợp đồng
 */
export const ResolveDisputeModal: React.FC<ResolveDisputeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isApproving,
  isLoading = false,
}) => {
  const { colors } = useAgrisaColors();
  const [reviewNotes, setReviewNotes] = useState("");

  const handleSubmit = () => {
    if (reviewNotes.trim() === "") {
      // TODO: Có thể hiển thị toast warning
      return;
    }
    onSubmit(reviewNotes, isApproving ? "approved" : "denied");
  };

  const handleClose = () => {
    setReviewNotes("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
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
              <AlertTriangle size={20} color={colors.warning} strokeWidth={2.5} />
              <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text} flex={1}>
                Giải quyết tranh chấp
              </Text>
            </HStack>
            
            
          </VStack>
        </ModalHeader>

        {/* Body */}
        <ModalBody pt="$4" pb="$3">
          <VStack space="md">
            {/* Textarea */}
            <VStack space="xs">
              <HStack space="xs" alignItems="center">
                <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
                  Ghi chú giải quyết
                </Text>
                <Text fontSize="$xs" color={colors.error}>*</Text>
              </HStack>
              <Textarea
                size="md"
                borderRadius="$lg"
                borderWidth={1}
                borderColor={reviewNotes.trim() ? (isApproving ? colors.success : colors.error) : colors.frame_border}
                bg={colors.background}
                minHeight={120}
              >
                <TextareaInput
                  placeholder={isApproving 
                    ? "Nhập lý do chấp nhận giải quyết tranh chấp..." 
                    : "Nhập lý do từ chối tranh chấp..."
                  }
                  value={reviewNotes}
                  onChangeText={setReviewNotes}
                  color={colors.primary_text}
                  placeholderTextColor={colors.secondary_text}
                  multiline
                />
              </Textarea>
              
              <Text fontSize="$2xs" color={colors.secondary_text}>
                Ghi chú này sẽ được ghi lại trong hệ thống và có thể được các bên liên quan xem.
              </Text>
            </VStack>
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
              onPress={handleClose}
              borderColor={colors.frame_border}
              isDisabled={isLoading}
              bg={colors.background}
            >
              <Text color={colors.secondary_text} fontWeight="$semibold" fontSize="$sm">
                Hủy bỏ
              </Text>
            </Button>

            <Button
              flex={2}
              size="md"
              onPress={handleSubmit}
              bg={isApproving ? colors.success : colors.error}
              isDisabled={reviewNotes.trim() === "" || isLoading}
            >
              {isLoading ? (
                <HStack space="xs" alignItems="center">
                  <Spinner size="small" color={colors.primary_white_text} />
                  <Text color={colors.primary_white_text} fontWeight="$bold" fontSize="$sm">
                    Đang xử lý...
                  </Text>
                </HStack>
              ) : (
                <HStack space="xs" alignItems="center">
                  {isApproving ? (
                    <CheckCircle2 size={16} color={colors.primary_white_text} strokeWidth={2.5} />
                  ) : (
                    <XCircle size={16} color={colors.primary_white_text} strokeWidth={2.5} />
                  )}
                  <Text color={colors.primary_white_text} fontWeight="$bold" fontSize="$sm">
                    {isApproving ? "Chấp nhận giải quyết" : "Từ chối giải quyết"}
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

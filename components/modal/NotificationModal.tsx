import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import {
    Box,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import {
    AlertCircle,
    CheckCircle,
    Info,
    LucideIcon,
    X,
} from "lucide-react-native";
import React from "react";

/**
 * Loại thông báo
 */
export type NotificationType = "success" | "error" | "info";

/**
 * Config cho NotificationModal
 */
export interface NotificationConfig {
  type: NotificationType;
  title?: string;
  content: string;
  closeText?: string;
  onClose?: () => void;
}

interface NotificationModalProps extends NotificationConfig {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Component Modal thông báo có thể tái sử dụng
 * 
 * @example
 * ```tsx
 * <NotificationModal
 *   isOpen={isOpen}
 *   type="success"
 *   title="Thành công"
 *   content="Đăng ký nông trại thành công!"
 *   closeText="Đóng"
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 */
export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  title,
  content,
  closeText = "Đã hiểu!",
  onClose,
}) => {
  const { colors } = useAgrisaColors();

  // Cấu hình icon và màu sắc theo loại thông báo
  const getNotificationStyle = (): {
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    defaultTitle: string;
  } => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: AgrisaColors.light.success,
          bgColor: AgrisaColors.light.successSoft,
          defaultTitle: "Thành công",
        };
      case "error":
        return {
          icon: X,
          iconColor: AgrisaColors.light.error,
          bgColor: AgrisaColors.light.errorSoft,
          defaultTitle: "Lỗi",
        };
      case "info":
        return {
          icon: Info,
          iconColor: AgrisaColors.light.info,
          bgColor: AgrisaColors.light.infoSoft,
          defaultTitle: "Thông báo",
        };
    }
  };

  const { icon: Icon, iconColor, bgColor, defaultTitle } = getNotificationStyle();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent
        bg={colors.background}
        borderRadius={20}
        maxWidth={360}
        mx="$4"
      >
        <ModalBody p="$0">
          {/* Close Button */}
          <Box position="absolute" top="$3" right="$3" zIndex={10}>
            <Button
              variant="link"
              size="sm"
              onPress={onClose}
              p="$2"
            >
              <X size={20} color={colors.muted_text} strokeWidth={2} />
            </Button>
          </Box>

          <VStack space="lg" p="$6" pt="$5" alignItems="center">
            {/* Icon */}
            <Box
              bg={bgColor}
              borderRadius="$full"
              p="$5"
              mb="$2"
            >
              <Icon size={48} color={iconColor} strokeWidth={2} />
            </Box>

            {/* Title */}
            <Text
              fontSize={20}
              fontWeight="700"
              color={colors.primary_text}
              textAlign="center"
            >
              {title || defaultTitle}
            </Text>

            {/* Content */}
            <Text
              fontSize={15}
              color={colors.secondary_text}
              textAlign="center"
              lineHeight={22}
              px="$2"
            >
              {content}
            </Text>

            {/* Close Button */}
            <Button
              bg={iconColor}
              borderRadius={12}
              size="lg"
              w="$full"
              mt="$2"
              onPress={onClose}
            >
              <ButtonText
                color={colors.primary_white_text}
                fontWeight="700"
                fontSize={16}
              >
                {closeText}
              </ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

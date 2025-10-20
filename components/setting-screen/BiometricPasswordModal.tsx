import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
    Box,
    Button,
    ButtonText,
    Input,
    InputField,
    InputSlot,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pressable,
    Text
} from "@gluestack-ui/themed";
import { CheckCircle2, Eye, EyeOff, Fingerprint, Lock } from "lucide-react-native";
import React, { useState } from "react";

interface BiometricPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  biometricType: string;
}

export const BiometricPasswordModal: React.FC<BiometricPasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  biometricType,
}) => {
  const { colors } = useAgrisaColors();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = () => {
    if (!password.trim()) {
      return;
    }
    onConfirm(password);
    setPassword("");
    setShowPassword(false);
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalBackdrop bg="rgba(0,0,0,0.55)" />
      <ModalContent
        bg={colors.card}
        maxWidth="$96"
        borderRadius="$2xl"
        shadowColor="rgba(0,0,0,0.45)"
        shadowOffset={{ width: 0, height: 16 }}
        shadowOpacity={0.25}
        shadowRadius={28}
        elevation={18}
        px="$4"
      >
        <ModalHeader
          borderBottomWidth={0}
          pb="$0"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg="rgba(22,163,74,0.12)"
            borderRadius="$full"
            w="$12"
            h="$12"
            alignItems="center"
            justifyContent="center"
          >
            <Fingerprint size={32} color={colors.success} strokeWidth={2.5} />
          </Box>
        </ModalHeader>

        <ModalBody pt="$4" pb="$6" px="$2">
          <Text
            fontSize="$lg"
            fontWeight="$bold"
            color={colors.text}
            textAlign="center"
            mb="$2"
          >
            Bật đăng nhập bằng {biometricType}
          </Text>
          <Text
            fontSize="$sm"
            color={colors.textSecondary}
            textAlign="center"
            mb="$6"
          >
            Nhập mật khẩu để xác nhận quyền truy cập và kích hoạt đăng nhập bằng {biometricType}.
          </Text>

          <Box>
            <Text
              fontSize="$xs"
              fontWeight="$semibold"
              color={colors.textSecondary}
              mb="$1"
            >
              Mật khẩu
            </Text>
            <Input
              variant="outline"
              size="lg"
              borderWidth={1.5}
              borderRadius="$xl"
              borderColor={colors.border}
              bg={colors.surface}
              $focus={{
                borderColor: colors.success,
                borderWidth: 2,
              }}
            >
              <InputSlot pl="$4">
                <Lock size={20} color={colors.success} strokeWidth={2.4} />
              </InputSlot>
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu của bạn"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                pr="$10"
                fontSize="$sm"
                fontWeight="$medium"
                color={colors.text}
              />
              <InputSlot pr="$4">
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textMuted} strokeWidth={2.5} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} strokeWidth={2.5} />
                  )}
                </Pressable>
              </InputSlot>
            </Input>
          </Box>
        </ModalBody>

        <ModalFooter
          borderTopWidth={0}
          pt="$0"
          px="$2"
          columnGap="$3"
        >
          <Button
            variant="outline"
            onPress={handleClose}
            flex={1}
            borderColor={colors.border}
            $active={{ opacity: 0.7 }}
          >
            <ButtonText color={colors.textSecondary}>Hủy</ButtonText>
          </Button>
          <Button
            onPress={handleConfirm}
            flex={1}
            bg={colors.success}
            isDisabled={!password.trim()}
            $active={{ opacity: 0.85 }}
          >
            <ButtonText color="$white">Xác nhận</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
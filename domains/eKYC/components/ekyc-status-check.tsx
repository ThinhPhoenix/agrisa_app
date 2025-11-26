import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import {
    Box,
    Center,
    HStack,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { CheckCircle, IdCard, ScanFace, User } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";
import { useEkyc } from "../hooks/use-ekyc";

/**
 * 🎯 Component hiển thị tiến trình xác thực eKYC
 * - Hiển thị 3 bước: Định danh tài khoản (/me), OCR CCCD, Xác thực khuôn mặt
 * - Progress bar với icon hiển thị ngang
 * - Màu xanh khi hoàn thành, xám khi chưa hoàn thành
 */

interface StepIconProps {
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  label: string;
}

const StepIcon: React.FC<StepIconProps> = ({
  icon: Icon,
  isCompleted,
  label,
}) => {
  const { colors } = useAgrisaColors();

  return (
    <VStack space="xs" alignItems="center" flex={1}>
      <Box
        width={48}
        height={48}
        borderRadius="$full"
        backgroundColor={isCompleted ? colors.success : colors.frame_border}
        justifyContent="center"
        alignItems="center"
      >
        <Icon
          size={24}
          color={isCompleted ? colors.primary_white_text : colors.muted_text}
        />
      </Box>
      <Text
        fontSize="$xs"
        color={isCompleted ? colors.primary_text : colors.muted_text}
        textAlign="center"
        numberOfLines={2}
      >
        {label}
      </Text>
    </VStack>
  );
};

export const EKYCStatusCheck: React.FC = () => {
  const { colors } = useAgrisaColors();
  const { user } = useAuthStore();
  const { geteKYCStatusQuery } = useEkyc();
  const { data: meData, refetch: refetchMe } = useAuthMe();

  // Fetch eKYC status
  const { data, isLoading, isError } = geteKYCStatusQuery(user?.id || "");

  const ekycData = data?.data;
  const userData = meData;

  // Kiểm tra định danh tài khoản từ /me (có đủ thông tin cơ bản)
  const isAccountIdentified = !!(
    userData?.full_name &&
    userData?.phone_number &&
    userData?.email
  );

  // Tính số bước hoàn thành (3 bước)
  const calculateCompletedSteps = () => {
    let completed = 0;
    if (isAccountIdentified) completed += 1;
    if (ekycData?.is_ocr_done) completed += 1;
    if (ekycData?.is_face_verified) completed += 1;
    return completed;
  };

  const completedSteps = calculateCompletedSteps();
  const totalSteps = 3;
  const progress = (completedSteps / totalSteps) * 100;

  // Refetch /me khi các bước hoàn thành
  React.useEffect(() => {
    if (ekycData?.is_ocr_done || ekycData?.is_face_verified) {
      refetchMe();
    }
  }, [ekycData?.is_ocr_done, ekycData?.is_face_verified]);

  if (isLoading) {
    return (
      <Center flex={1} backgroundColor={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text marginTop={16} color={colors.secondary_text}>
          Đang tải trạng thái xác thực...
        </Text>
      </Center>
    );
  }

  if (isError || !ekycData) {
    return (
      <Center flex={1} backgroundColor={colors.background} padding={20}>
        <Text fontSize="$lg" color={colors.error} textAlign="center">
          ⚠️ Không thể tải trạng thái xác thực
        </Text>
        <Text fontSize="$sm" color={colors.secondary_text} marginTop={8} textAlign="center">
          Vui lòng thử lại sau
        </Text>
      </Center>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <VStack space="lg">        
        {/* CIC Number Card - Hiển thị đầu tiên */}
        {ekycData?.cic_no && (
          <Center>
            <VStack space="xs" alignItems="center">
              <Text fontSize="$sm" fontWeight="$medium" color={colors.secondary_text}>
                Số định danh CCCD
              </Text>
              <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary}>
                {ekycData.cic_no ? ekycData.cic_no : "Chưa cập nhật"}
              </Text>
            </VStack>
          </Center>
        )}

        {/* Progress Bar Card với Steps ngang */}
        <Box
          backgroundColor={colors.card_surface}
          borderRadius="$xl"
          padding={20}
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="lg">
            {/* Header tiến độ */}
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                Tiến độ hoàn thành
              </Text>
              <Text fontSize="$xl" fontWeight="$bold" color={colors.success}>
                {completedSteps}/{totalSteps} bước
              </Text>
            </HStack>

            {/* Progress Bar */}
            <Box
              height={12}
              backgroundColor={colors.frame_border}
              borderRadius="$full"
              overflow="hidden"
            >
              <Box
                height="100%"
                width={`${progress}%`}
                backgroundColor={colors.success}
                borderRadius="$full"
              />
            </Box>

            {/* 3 Steps Icons - Layout ngang */}
            <HStack space="sm" justifyContent="space-between" paddingTop={8}>
              {/* Step 1: Account Identification from /me */}
              <StepIcon
                icon={User}
                isCompleted={isAccountIdentified}
                label="Định danh tài khoản"
              />

              {/* Step 2: OCR Identity Card */}
              <StepIcon
                icon={IdCard}
                isCompleted={ekycData?.is_ocr_done || false}
                label="Xác thực CCCD"
              />

              {/* Step 3: Face Verification */}
              <StepIcon
                icon={ScanFace}
                isCompleted={ekycData?.is_face_verified || false}
                label="Xác thực khuôn mặt"
              />
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import {
  Box,
  Button,
  ButtonText,
  Center,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { IdCard, RotateCcw, ScanFace, User } from "lucide-react-native";
import React from "react";
import { Alert, ScrollView } from "react-native";
import { useEkyc } from "../hooks/use-ekyc";
import { useEkycStore } from "../stores/ekyc.store";

/**
 * ============================================
 * 🎯 KIỂM TRA TRẠNG THÁI XÁC THỰC EKYC
 * ============================================
 * Màn hình hiển thị tiến trình xác thực danh tính điện tử (eKYC)
 * 
 * Các tính năng:
 * - Hiển thị 3 bước xác thực: Định danh tài khoản, Quét CCCD, Xác thực khuôn mặt
 * - Thanh tiến độ với biểu tượng trực quan cho từng bước
 * - Màu xanh lá khi hoàn thành, màu xám khi chưa thực hiện
 * - Nút làm lại toàn bộ quy trình khi cần thiết
 */

interface StepIconProps {
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  label: string;
}

/**
 * Biểu tượng hiển thị trạng thái từng bước xác thực
 */
const StepIcon: React.FC<StepIconProps> = ({
  icon: Icon,
  isCompleted,
  label,
}) => {
  const { colors } = useAgrisaColors();

  return (
    <VStack space="xs" alignItems="center" flex={1}>
      <Box
        width={56}
        height={56}
        borderRadius="$full"
        backgroundColor={isCompleted ? colors.success : colors.card_surface}
        borderWidth={2}
        borderColor={isCompleted ? colors.success : colors.frame_border}
        justifyContent="center"
        alignItems="center"
        shadowColor={isCompleted ? colors.success : "transparent"}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.2}
        shadowRadius={4}
      >
        <Icon
          size={28}
          color={isCompleted ? colors.primary_white_text : colors.muted_text}
        />
      </Box>
      <Text
        fontSize="$xs"
        fontWeight={isCompleted ? "$semibold" : "$normal"}
        color={isCompleted ? colors.success : colors.muted_text}
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
  const { user, isAuthenticated } = useAuthStore();
  const { geteKYCStatusQuery, resetEkycMutation } = useEkyc();
  const { data: meData, refetch: refetchMe } = useAuthMe();
  const { resetEkyc } = useEkycStore();

  // Xác thực userId trước khi tải dữ liệu
  const validUserId = isAuthenticated && user ? user.id : null;

  console.log("🔍 [Kiểm tra trạng thái xác thực]", {
    userId: validUserId,
    isAuthenticated,
    rawUserId: user?.id,
  });

  // Chỉ tải dữ liệu khi có validUserId
  const { data, isLoading, isError } = geteKYCStatusQuery(user?.id || "");

  const ekycData = data?.data;
  const userData = meData;

  console.log(userData);
  

  // Kiểm tra đã hoàn thành định danh tài khoản (có đủ thông tin cơ bản)
  const isAccountIdentified = !!(
    userData?.data.full_name &&
    userData?.data.phone_number &&
    userData?.data.email
  );

  // Tính tổng số bước đã hoàn thành (tối đa 3 bước)
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

  // Tự động làm mới thông tin người dùng khi hoàn thành các bước xác thực
  React.useEffect(() => {
    if (ekycData?.is_ocr_done || ekycData?.is_face_verified) {
      refetchMe();
    }
  }, [ekycData?.is_ocr_done, ekycData?.is_face_verified]);

  // Xử lý khi người dùng muốn làm lại quy trình xác thực
  const handleResetEkyc = () => {
    Alert.alert(
      "⚠️ Xác nhận làm lại",
      "Bạn có chắc muốn xóa toàn bộ dữ liệu xác thực và bắt đầu lại từ đầu?\n\nThao tác này không thể hoàn tác.",
      [
        {
          text: "Hủy bỏ",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: async () => {
            try {
              await resetEkycMutation.mutateAsync();
              resetEkyc();
            } catch (error) {
              console.error("Lỗi khi làm lại xác thực:", error);
            }
          },
        },
      ]
    );
  };

  // Hiển thị nút làm lại khi đã hoàn thành ít nhất một bước (quét CCCD hoặc xác thực khuôn mặt)
  const shouldShowResetButton =
    ekycData?.is_ocr_done || ekycData?.is_face_verified;

  // Không hiển thị nếu người dùng chưa đăng nhập
  if (!isAuthenticated || !validUserId) {
    return (
      <Center flex={1} backgroundColor={colors.background} padding={20}>
        <Text fontSize="$lg" fontWeight="$semibold" color={colors.error} textAlign="center">
          ⚠️ Vui lòng đăng nhập để xem trạng thái xác thực
        </Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center flex={1} backgroundColor={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text marginTop={16} color={colors.secondary_text} fontWeight="$medium">
          Đang tải thông tin xác thực...
        </Text>
      </Center>
    );
  }

  if (isError || !ekycData) {
    return (
      <Center flex={1} backgroundColor={colors.background} padding={20}>
        <Text fontSize="$lg" fontWeight="$semibold" color={colors.error} textAlign="center">
          ⚠️ Không thể tải thông tin xác thực
        </Text>
        <Text
          fontSize="$sm"
          color={colors.secondary_text}
          marginTop={8}
          textAlign="center"
        >
          Vui lòng kiểm tra kết nối và thử lại
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
        {/* Hiển thị số định danh công dân */}
        {ekycData?.cic_no && (
          <Box
            borderRadius="$2xl"
            padding={20}
            borderWidth={1}
            borderColor={colors.primary}
          >
            <VStack space="xs" alignItems="center">
              <Text
                fontSize="$sm"
                fontWeight="$medium"
                color={colors.primary}
              >
                Số căn cước công dân
              </Text>
              <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary} letterSpacing={1}>
                {ekycData.cic_no}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Thẻ tiến độ với các bước xác thực */}
        <Box
          backgroundColor={colors.card_surface}
          borderRadius="$2xl"
          padding={24}
          borderWidth={1}
          borderColor={colors.frame_border}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.05}
          shadowRadius={8}
        >
          <VStack space="xl">
            {/* Tiêu đề và số bước hoàn thành */}
            <HStack justifyContent="space-between" alignItems="center">
              <VStack space="xs">
                <Text
                  fontSize="$lg"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Tiến độ xác thực
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Hoàn thành tất cả các bước để kích hoạt tài khoản
                </Text>
              </VStack>
              <VStack alignItems="flex-end">
                <Text fontSize="$2xl" fontWeight="$bold" color={colors.success}>
                  {completedSteps}/{totalSteps}
                </Text>
                <Text fontSize="$xs" color={colors.secondary_text}>
                  bước
                </Text>
              </VStack>
            </HStack>

            {/* Thanh tiến độ */}
            <Box
              height={16}
              backgroundColor={colors.frame_border}
              borderRadius="$full"
              overflow="hidden"
            >
              <Box
                height="100%"
                width={`${progress}%`}
                backgroundColor={colors.success}
                borderRadius="$full"
                style={{
                  transition: "width 0.3s ease",
                }}
              />
            </Box>

            {/* Các bước xác thực - hiển thị ngang */}
            <HStack space="sm" justifyContent="space-between" paddingTop={8}>
              <StepIcon
                icon={User}
                isCompleted={isAccountIdentified}
                label="Định danh tài khoản"
              />

              <StepIcon
                icon={IdCard}
                isCompleted={ekycData?.is_ocr_done || false}
                label="Quét thẻ CCCD"
              />

              <StepIcon
                icon={ScanFace}
                isCompleted={ekycData?.is_face_verified || false}
                label="Xác thực khuôn mặt"
              />
            </HStack>
          </VStack>
        </Box>

        {/* Nút làm lại xác thực - chỉ hiển thị khi cần */}
        {shouldShowResetButton && (
          <Box
            borderRadius="$2xl"
            padding={20}
            borderWidth={1.5}
            borderColor="#f59e0b"
            backgroundColor="#fffbeb"
          >
            <VStack space="md">
              <HStack space="sm" alignItems="flex-start">
                <Box
                  backgroundColor="#fef3c7"
                  borderRadius="$full"
                  padding={8}
                  marginTop={2}
                >
                  <RotateCcw size={20} color="#f59e0b" />
                </Box>
                <VStack space="xs" flex={1}>
                  <Text fontSize="$md" fontWeight="$bold" color="#92400e">
                    Làm lại toàn bộ xác thực
                  </Text>
                  <Text fontSize="$xs" color="#78350f" lineHeight={18}>
                    Xóa toàn bộ dữ liệu đã thực hiện và bắt đầu lại quy trình từ đầu.
                    Chỉ sử dụng khi cần chụp lại ảnh giấy tờ hoặc quét lại khuôn mặt.
                  </Text>
                </VStack>
              </HStack>

              <Button
                size="lg"
                variant="solid"
                backgroundColor="#f59e0b"
                onPress={handleResetEkyc}
                isDisabled={resetEkycMutation.isPending}
                borderRadius="$xl"
                pressStyle={{
                  backgroundColor: "#d97706",
                }}
              >
                <HStack space="sm" alignItems="center">
                  {resetEkycMutation.isPending ? (
                    <Spinner size="small" color="#ffffff" />
                  ) : (
                    <RotateCcw size={18} color="#ffffff" />
                  )}
                  <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$md">
                    {resetEkycMutation.isPending
                      ? "Đang xử lý..."
                      : "Bắt đầu làm lại"}
                  </ButtonText>
                </HStack>
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </ScrollView>
  );
};
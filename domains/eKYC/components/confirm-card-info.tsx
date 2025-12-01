/**
 * ============================================
 * 📄 CONFIRM CARD INFO SCREEN
 * ============================================
 * Màn hình hiển thị thông tin từ CCCD sau khi quét
 * và yêu cầu xác nhận để cập nhật vào profile
 * 
 * Flow:
 * 1. Load thông tin CCCD từ getCardInfo
 * 2. Hiển thị thông tin đầy đủ
 * 3. Xác nhận → Update profile → Hoàn tất eKYC
 */

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import {
    Box,
    Button,
    ButtonText,
    Center,
    Heading,
    HStack,
    Image,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    CreditCard,
    Home,
    IdCard,
    MapPin,
    RefreshCw,
    User,
    XCircle,
} from "lucide-react-native";
import { useEffect } from "react";

export default function ConfirmCardInfoScreen() {
  const { colors } = useAgrisaColors();
  const { getCardInfo, confirmCardInfoMutation, isConfirming } = useEkyc();

  // Fetch card info
  const {
    data: cardInfoData,
    isLoading,
    isError,
    error,
    refetch,
  } = getCardInfo();

  const cardInfo = cardInfoData && "data" in cardInfoData ? cardInfoData.data : null;

  // Auto-fetch khi component mount
  useEffect(() => {
    console.log("🎴 [Confirm Card Info] Component mounted - Fetching card info...");
    refetch();
  }, []);

  // Handle confirm
  const handleConfirm = async () => {
    if (!cardInfo) return;

    console.log("✅ [Confirm Card Info] Confirming card info...");
    await confirmCardInfoMutation.mutateAsync(cardInfo);
  };

  // Handle edit (quay lại face scan để quét lại)
  const handleEdit = () => {
    console.log("✏️ [Confirm Card Info] User wants to edit - Going back to face scan");
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.secondary_text}>
          Đang tải thông tin CCCD...
        </Text>
      </Center>
    );
  }

  // Error state
  if (isError || !cardInfo) {
    return (
      <Center flex={1} bg={colors.background} px="$6">
        <VStack space="lg" alignItems="center">
          <XCircle size={80} color={colors.error} />
          <Heading size="xl" color={colors.primary_text} textAlign="center">
            Không thể tải thông tin
          </Heading>
          <Text color={colors.secondary_text} textAlign="center">
            {error instanceof Error ? error.message : "Vui lòng thử lại sau."}
          </Text>

          <Button
            mt="$4"
            bg={colors.primary}
            onPress={() => refetch()}
          >
            <HStack space="sm" alignItems="center">
              <RefreshCw size={16} color={colors.primary_white_text} />
              <ButtonText color={colors.primary_white_text}>
                Thử lại
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="xl" p="$6" pb="$8">
          {/* Header */}
          <VStack space="md" alignItems="center">
            <Box
              bg={colors.primary}
              borderRadius="$full"
              p="$4"
              w={80}
              h={80}
              alignItems="center"
              justifyContent="center"
              shadowColor={colors.shadow}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={8}
              elevation={4}
            >
              <IdCard
                size={44}
                color={colors.primary_white_text}
                strokeWidth={2.5}
              />
            </Box>

            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Xác nhận thông tin
            </Text>

            <Text fontSize="$sm" color={colors.secondary_text} textAlign="center">
              Vui lòng kiểm tra thông tin từ CCCD của bạn
            </Text>
          </VStack>

          {/* Alert */}
          <Box
            bg={colors.infoSoft}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.info}
          >
            <HStack space="sm" alignItems="flex-start">
              <AlertCircle size={20} color={colors.info} />
              <Text fontSize="$xs" color={colors.info} flex={1}>
                Thông tin này sẽ được cập nhật vào hồ sơ cá nhân của bạn. Vui lòng kiểm tra kỹ trước khi xác nhận.
              </Text>
            </HStack>
          </Box>

          {/* CCCD Images */}
          {(cardInfo.image_front || cardInfo.image_back) && (
            <VStack space="md">
              <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
                Ảnh CCCD
              </Text>

              <HStack space="md">
                {cardInfo.image_front && (
                  <Box flex={1}>
                    <Text fontSize="$xs" color={colors.secondary_text} mb="$2">
                      Mặt trước
                    </Text>
                    <Image
                      source={{ uri: `https://${cardInfo.image_front}` }}
                      alt="CCCD mặt trước"
                      w="$full"
                      h={120}
                      borderRadius="$lg"
                      borderWidth={1}
                      borderColor={colors.frame_border}
                    />
                  </Box>
                )}

                {cardInfo.image_back && (
                  <Box flex={1}>
                    <Text fontSize="$xs" color={colors.secondary_text} mb="$2">
                      Mặt sau
                    </Text>
                    <Image
                      source={{ uri: `https://${cardInfo.image_back}` }}
                      alt="CCCD mặt sau"
                      w="$full"
                      h={120}
                      borderRadius="$lg"
                      borderWidth={1}
                      borderColor={colors.frame_border}
                    />
                  </Box>
                )}
              </HStack>
            </VStack>
          )}

          {/* Thông tin cơ bản */}
          <VStack space="md">
            <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
              Thông tin cơ bản
            </Text>

            {/* Số CCCD */}
            <InfoRow
              icon={<CreditCard size={20} color={colors.primary} />}
              label="Số CCCD"
              value={cardInfo.national_id}
              colors={colors}
            />

            {/* Họ tên */}
            <InfoRow
              icon={<User size={20} color={colors.primary} />}
              label="Họ và tên"
              value={cardInfo.name}
              colors={colors}
            />

            {/* Ngày sinh */}
            <InfoRow
              icon={<Calendar size={20} color={colors.primary} />}
              label="Ngày sinh"
              value={cardInfo.dob}
              colors={colors}
            />

            {/* Giới tính */}
            <InfoRow
              icon={<User size={20} color={colors.primary} />}
              label="Giới tính"
              value={cardInfo.sex}
              colors={colors}
            />

            {/* Quốc tịch */}
            <InfoRow
              icon={<MapPin size={20} color={colors.primary} />}
              label="Quốc tịch"
              value={cardInfo.nationality}
              colors={colors}
            />
          </VStack>

          {/* Địa chỉ */}
          <VStack space="md">
            <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
              Địa chỉ
            </Text>

            {/* Thường trú */}
            <InfoRow
              icon={<Home size={20} color={colors.primary} />}
              label="Thường trú"
              value={cardInfo.home}
              colors={colors}
              isMultiline
            />

            {/* Hiện tại */}
            <InfoRow
              icon={<MapPin size={20} color={colors.primary} />}
              label="Hiện tại"
              value={cardInfo.address}
              colors={colors}
              isMultiline
            />
          </VStack>

          {/* Thông tin CCCD */}
          <VStack space="md">
            <Text fontSize="$md" fontWeight="$semibold" color={colors.primary_text}>
              Thông tin CCCD
            </Text>

            {/* Ngày cấp */}
            <InfoRow
              icon={<Calendar size={20} color={colors.primary} />}
              label="Ngày cấp"
              value={cardInfo.issue_date}
              colors={colors}
            />

            {/* Ngày hết hạn */}
            <InfoRow
              icon={<Calendar size={20} color={colors.primary} />}
              label="Ngày hết hạn"
              value={cardInfo.doe}
              colors={colors}
            />

            {/* Nơi cấp */}
            <InfoRow
              icon={<MapPin size={20} color={colors.primary} />}
              label="Nơi cấp"
              value={cardInfo.issue_loc}
              colors={colors}
              isMultiline
            />

            {/* Đặc điểm nhận dạng */}
            {cardInfo.features && (
              <InfoRow
                icon={<AlertCircle size={20} color={colors.primary} />}
                label="Đặc điểm"
                value={cardInfo.features}
                colors={colors}
                isMultiline
              />
            )}
          </VStack>

          {/* Action Buttons */}
          <VStack space="md" mt="$4">
            {/* Confirm Button */}
            <Button
              bg={colors.success}
              borderRadius="$xl"
              h="$14"
              onPress={handleConfirm}
              isDisabled={isConfirming}
              shadowColor={colors.shadow}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
              elevation={2}
            >
              <HStack space="sm" alignItems="center">
                {isConfirming ? (
                  <Spinner size="small" color={colors.primary_white_text} />
                ) : (
                  <CheckCircle2 size={20} color={colors.primary_white_text} />
                )}
                <ButtonText
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_white_text}
                >
                  {isConfirming ? "Đang xử lý..." : "Xác nhận thông tin"}
                </ButtonText>
              </HStack>
            </Button>

            {/* Edit Button */}
            <Button
              variant="outline"
              borderColor={colors.frame_border}
              borderRadius="$xl"
              h="$14"
              onPress={handleEdit}
              isDisabled={isConfirming}
            >
              <ButtonText
                fontSize="$md"
                fontWeight="$semibold"
                color={colors.secondary_text}
              >
                Quét lại
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

/**
 * Component hiển thị một dòng thông tin
 */
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: any;
  isMultiline?: boolean;
}

function InfoRow({ icon, label, value, colors, isMultiline = false }: InfoRowProps) {
  return (
    <Box
      bg={colors.card_surface}
      borderRadius="$xl"
      p="$4"
      borderWidth={1}
      borderColor={colors.frame_border}
    >
      <HStack space="md" alignItems={isMultiline ? "flex-start" : "center"}>
        <Box
          bg={colors.primarySoft}
          borderRadius="$lg"
          p="$2"
          w={40}
          h={40}
          alignItems="center"
          justifyContent="center"
        >
          {icon}
        </Box>

        <VStack flex={1}>
          <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
            {label}
          </Text>
          <Text
            fontSize="$sm"
            fontWeight="$semibold"
            color={colors.primary_text}
            numberOfLines={isMultiline ? undefined : 1}
          >
            {value}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}

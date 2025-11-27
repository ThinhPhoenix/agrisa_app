import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Farm } from "@/domains/farm/models/farm.models";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  Calendar,
  CheckCircle2,
  Coffee,
  Edit3,
  FileCheck,
  MapPin,
  Shield,
  Sprout,
  Wheat,
  XCircle,
} from "lucide-react-native";
import React from "react";

interface DetailFarmProps {
  /**
   * Thông tin farm cần hiển thị
   */
  farm: Farm;

  /**
   * Callback khi click nút Edit
   */
  onEdit?: () => void;

  /**
   * Loading state khi đang fetch data
   */
  isLoading?: boolean;
}

/**
 * Component hiển thị chi tiết nông trại
 *
 * Features:
 * - Thông tin đầy đủ về farm
 * - Verification badges
 * - Quick actions (Edit)
 * - Responsive layout
 */
export const DetailFarm: React.FC<DetailFarmProps> = ({
  farm,
  onEdit,
  isLoading = false,
}) => {
  /**
   * Get crop icon và config theo loại cây
   */
  const { colors } = useAgrisaColors();
  const getCropConfig = (cropType: string) => {
    switch (cropType) {
      case "rice":
        return {
          icon: Wheat,
          color: colors.success,
          label: "Lúa",
          bg: colors.successSoft,
        };
      case "coffee":
        return {
          icon: Coffee,
          color: "#8B4513",
          label: "Cà phê",
          bg: "#FFF8DC",
        };
      default:
        return {
          icon: Sprout,
          color: "#8B4513",
          label: "Cây trồng khác",
          bg: "#FFF8DC",
        };
    }
  };

  const cropConfig = getCropConfig(farm.crop_type);
  const CropIcon = cropConfig.icon;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bg={colors.background}
    >
      <VStack space="md" p="$4" pb="$24">
        {/* ===== HEADER CARD ===== */}
        <Box
          bg={cropConfig.bg}
          borderRadius={20}
          borderWidth={1}
          borderColor={colors.frame_border}
          overflow="hidden"
        >
          {/* Header Section */}
          <Box p="$4" pb="$3">
            <HStack
              justifyContent="space-between"
              alignItems="flex-start"
              mb="$2"
            >
              <VStack flex={1} mr="$3">
                <Text
                  color={colors.primary_text}
                  fontSize={22}
                  fontWeight="700"
                  numberOfLines={2}
                  mb="$2"
                >
                  {farm.farm_name}
                </Text>
                <HStack space="xs" alignItems="center">
                  <MapPin
                    size={16}
                    color={colors.secondary_text}
                    strokeWidth={2}
                  />
                  <Text color={colors.secondary_text} fontSize={13}>
                    {farm.district}, {farm.province}
                  </Text>
                </HStack>
              </VStack>

              {/* Crop Icon */}
              <Box
                bg={cropConfig.color}
                borderRadius="$full"
                p="$3"
                shadowColor={cropConfig.color}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.3}
                shadowRadius={4}
              >
                <CropIcon
                  size={28}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
            </HStack>
          </Box>

          {/* Stats Grid */}
          <Box bg={colors.background} p="$4">
            <HStack space="md">
              <VStack flex={1}>
                <Text
                  color={colors.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Diện tích
                </Text>
                <Text
                  color={colors.primary_text}
                  fontSize={18}
                  fontWeight="700"
                >
                  {(farm.area_sqm)} ha
                </Text>
                <Text
                  color={colors.secondary_text}
                  fontSize={10}
                  mt="$0.5"
                >
                  {farm.area_sqm * 10000} m²
                </Text>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} alignItems="center">
                <Text
                  color={colors.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Cây trồng
                </Text>
                <Text color={cropConfig.color} fontSize={18} fontWeight="700">
                  {cropConfig.label}
                </Text>
              </VStack>

              <Box width={1} bg={colors.frame_border} />

              <VStack flex={1} alignItems="flex-end">
                <Text
                  color={colors.muted_text}
                  fontSize={11}
                  mb="$1"
                  fontWeight="500"
                >
                  Loại đất
                </Text>
                <Text
                  color={colors.primary_text}
                  fontSize={16}
                  fontWeight="700"
                >
                  {farm.soil_type}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>

        {/* ===== ĐỊA CHỈ CHI TIẾT ===== */}
        <Box
          bg={colors.background}
          borderRadius={16}
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$4"
        >
          <HStack alignItems="center" space="xs" mb="$3">
            <MapPin
              size={18}
              color={colors.secondary_text}
              strokeWidth={2}
            />
            <Text
              fontSize={16}
              fontWeight="700"
              color={colors.primary_text}
            >
              Địa chỉ
            </Text>
          </HStack>

          <VStack space="sm">
            <InfoRow label="Tỉnh/Thành" value={farm.province} />
            <InfoRow label="Quận/Huyện" value={farm.district} />
            <InfoRow label="Phường/Xã" value={farm.commune} />

            <Box
              bg={colors.card_surface}
              borderRadius={12}
              p="$3"
              mt="$2"
            >
              <Text
                fontSize={13}
                color={colors.primary_text}
                lineHeight={20}
              >
                {farm.address}
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* ===== THÔNG TIN CANH TÁC ===== */}
        <Box
          bg={colors.background}
          borderRadius={16}
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$4"
        >
          <HStack alignItems="center" space="xs" mb="$3">
            <Calendar
              size={18}
              color={colors.secondary_text}
              strokeWidth={2}
            />
            <Text
              fontSize={16}
              fontWeight="700"
              color={colors.primary_text}
            >
              Thông tin canh tác
            </Text>
          </HStack>

          <VStack space="sm">
            <InfoRow
              label="Ngày gieo trồng"
              value={Utils.formatDateForMS(farm.planting_date)}
            />
            <InfoRow
              label="Ngày thu hoạch dự kiến"
              value={Utils.formatDateForMS(farm.expected_harvest_date)}
            />
            <InfoRow
              label="Loại đất canh tác"
              value={`${farm.soil_type}`}
            />
          </VStack>
        </Box>

        {/* ===== GIẤY TỜ PHÁP LÝ ===== */}
        <Box
          bg={colors.background}
          borderRadius={16}
          borderWidth={1}
          borderColor={colors.frame_border}
          p="$4"
        >
          <HStack alignItems="center" space="xs" mb="$3">
            <FileCheck
              size={18}
              color={colors.secondary_text}
              strokeWidth={2}
            />
            <Text
              fontSize={16}
              fontWeight="700"
              color={colors.primary_text}
            >
              Giấy tờ pháp lý
            </Text>
          </HStack>

          <VStack space="sm">
            {/* Certificate Number */}
            <HStack justifyContent="space-between" alignItems="center" py="$2">
              <VStack flex={1}>
                <Text
                  fontSize={12}
                  color={colors.muted_text}
                  fontWeight="500"
                  mb="$1"
                >
                  Số giấy chứng nhận
                </Text>
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={colors.primary_text}
                >
                  {farm.land_certificate_number}
                </Text>
              </VStack>
              {farm.land_ownership_verified && (
                <Shield
                  size={24}
                  color={colors.success}
                  strokeWidth={2.5}
                />
              )}
            </HStack>

            <Box height={1} bg={colors.frame_border} my="$2" />

            {/* Verification Status */}
            <VStack space="xs">
              <HStack
                justifyContent="space-between"
                alignItems="center"
                py="$1"
              >
                <Text fontSize={13} color={colors.muted_text}>
                  Quyền sử dụng đất
                </Text>
                <HStack space="xs" alignItems="center">
                  {farm.land_ownership_verified ? (
                    <>
                      <CheckCircle2
                        size={16}
                        color={colors.success}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color={colors.success}
                      >
                        Đã xác minh
                      </Text>
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={16}
                        color={colors.error}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color={colors.error}
                      >
                        Chờ xác minh
                      </Text>
                    </>
                  )}
                </HStack>
              </HStack>

              <HStack
                justifyContent="space-between"
                alignItems="center"
                py="$1"
              >
                <Text fontSize={13} color={colors.muted_text}>
                  Loại cây trồng
                </Text>
                <HStack space="xs" alignItems="center">
                  {farm.crop_type_verified ? (
                    <>
                      <CheckCircle2
                        size={16}
                        color={colors.success}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color={colors.success}
                      >
                        Đã xác minh
                      </Text>
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={16}
                        color={colors.error}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color={colors.error}
                      >
                        Chờ xác minh
                      </Text>
                    </>
                  )}
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* ===== THỜI GIAN ===== */}
        <Box
          bg={colors.card_surface}
          borderRadius={12}
          p="$3"
          borderWidth={1}
          borderColor={colors.frame_border}
        >
          <VStack space="xs">
            <HStack justifyContent="space-between">
              <Text fontSize={11} color={colors.muted_text}>
                Ngày tạo:
              </Text>
              <Text
                fontSize={11}
                color={colors.secondary_text}
                fontWeight="600"
              >
                {new Date(farm.created_at).toLocaleDateString("vi-VN")}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize={11} color={colors.muted_text}>
                Cập nhật gần nhất:
              </Text>
              <Text
                fontSize={11}
                color={colors.secondary_text}
                fontWeight="600"
              >
                {new Date(farm.updated_at).toLocaleDateString("vi-VN")}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* ===== ACTION BUTTON ===== */}
        <Button
          bg={colors.primary}
          borderRadius={16}
          size="lg"
          onPress={onEdit}
          shadowColor={colors.primary}
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
        >
          <HStack space="sm" alignItems="center">
            <Edit3
              size={20}
              color={colors.primary_white_text}
              strokeWidth={2.5}
            />
            <ButtonText
              color={colors.primary_white_text}
              fontWeight="700"
              fontSize={16}
            >
              Chỉnh sửa thông tin
            </ButtonText>
          </HStack>
        </Button>
      </VStack>
    </ScrollView>
  );
};

/**
 * Helper Component - Info Row
 */
const InfoRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {

  const { colors } = useAgrisaColors();
  
  return (
    <HStack justifyContent="space-between" alignItems="center" py="$1">
      <Text
        fontSize={12}
        color={colors.muted_text}
        fontWeight="500"
      >
        {label}
      </Text>
      <Text
        fontSize={13}
        fontWeight="600"
        color={colors.primary_text}
        textAlign="right"
        flex={1}
        ml="$3"
      >
        {value}
      </Text>
    </HStack>
  );
};

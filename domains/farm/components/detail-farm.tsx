import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { Farm } from '@/domains/farm/models/farm.models';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    ScrollView,
    Text,
    VStack
} from '@gluestack-ui/themed';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Coffee,
    Droplets,
    Edit3,
    FileText,
    MapPin,
    Mountain,
    Wheat,
} from 'lucide-react-native';
import React from 'react';

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
  const { colors } = useAgrisaColors();

  /**
   * Get crop icon và config theo loại cây
   */
  const getCropConfig = (cropType: string) => {
    switch (cropType) {
      case 'rice':
        return {
          icon: Wheat,
          color: '#F59E0B',
          label: 'Lúa',
          bg: '#FEF3C7',
        };
      case 'coffee':
        return {
          icon: Coffee,
          color: '#78350F',
          label: 'Cà phê',
          bg: '#FDE68A',
        };
      default:
        return {
          icon: Wheat,
          color: colors.success,
          label: 'Cây trồng khác',
          bg: colors.primarySoft,
        };
    }
  };

  const cropConfig = getCropConfig(farm.crop_type);
  const CropIcon = cropConfig.icon;

  /**
   * Format Unix timestamp to DD/MM/YYYY
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Format area từ m² sang hecta
   */
  const formatArea = (areaSqm: number): string => {
    const hectares = areaSqm / 10000;
    return `${hectares.toFixed(2)} ha (${areaSqm.toLocaleString('vi-VN')} m²)`;
  };

  /**
   * Get irrigation type label
   */
  const getIrrigationLabel = (type: string): string => {
    const labels: Record<string, string> = {
      canal: 'Kênh mương',
      drip: 'Nhỏ giọt',
      sprinkler: 'Phun mưa',
      pump: 'Máy bơm',
      rain_fed: 'Nước mưa',
      none: 'Không có',
    };
    return labels[type] || type;
  };

  /**
   * Get soil type label
   */
  const getSoilTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      alluvial: 'Đất phù sa',
      clay: 'Đất sét',
      sandy: 'Đất cát',
      loam: 'Đất thịt',
      peat: 'Đất than bùn',
      other: 'Khác',
    };
    return labels[type] || type;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <VStack space="lg" px="$4" py="$4">
        {/* ===== HEADER CARD ===== */}
        <Box
          bg={cropConfig.bg}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={cropConfig.color}
          sx={{
            shadowColor: cropConfig.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <VStack space="md">
            {/* Crop Type Badge */}
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" space="sm">
                <Box bg={cropConfig.color} borderRadius="$full" p="$2">
                  <CropIcon size={20} color="#fff" strokeWidth={2.5} />
                </Box>
                <VStack>
                  <Text fontSize="$xs" color={colors.textSecondary} fontWeight="$medium">
                    {cropConfig.label}
                  </Text>
                  <Text fontSize="$md" color={cropConfig.color} fontWeight="$bold">
                    {farm.farm_code}
                  </Text>
                </VStack>
              </HStack>

              {/* Status Badge */}
              <Box
                bg={farm.status === 'active' ? colors.success : colors.textSecondary}
                borderRadius="$full"
                px="$3"
                py="$1"
              >
                <Text fontSize="$xs" color="#fff" fontWeight="$bold">
                  {farm.status === 'active' ? '✓ Hoạt động' : 'Không hoạt động'}
                </Text>
              </Box>
            </HStack>

            {/* Farm Name */}
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.text}>
              {farm.farm_name}
            </Text>

            {/* Quick Stats */}
            <HStack space="md" flexWrap="wrap">
              <HStack alignItems="center" space="xs" flex={1} minWidth="45%">
                <Mountain size={16} color={cropConfig.color} strokeWidth={2} />
                <VStack>
                  <Text fontSize="$xs" color={colors.textSecondary}>
                    Diện tích
                  </Text>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.text}>
                    {formatArea(farm.area_sqm)}
                  </Text>
                </VStack>
              </HStack>

              <HStack alignItems="center" space="xs" flex={1} minWidth="45%">
                <Calendar size={16} color={cropConfig.color} strokeWidth={2} />
                <VStack>
                  <Text fontSize="$xs" color={colors.textSecondary}>
                    Ngày gieo
                  </Text>
                  <Text fontSize="$sm" fontWeight="$bold" color={colors.text}>
                    {formatDate(farm.planting_date)}
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* ===== THÔNG TIN ĐỊA CHỈ ===== */}
        <Box
          bg={colors.card}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="xs">
              <MapPin size={18} color={colors.success} strokeWidth={2} />
              <Text fontSize="$md" fontWeight="$bold" color={colors.text}>
                Địa chỉ
              </Text>
            </HStack>

            <VStack space="sm">
              <InfoRow label="Tỉnh/Thành phố" value={farm.province} />
              <InfoRow label="Quận/Huyện" value={farm.district} />
              <InfoRow label="Phường/Xã" value={farm.commune} />
              <Box
                bg={colors.primarySoft}
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor={colors.success}
              >
                <Text fontSize="$sm" color={colors.text} lineHeight="$md">
                  {farm.address}
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Box>

        {/* ===== THÔNG TIN CANH TÁC ===== */}
        <Box
          bg={colors.card}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="xs">
              <Wheat size={18} color={colors.success} strokeWidth={2} />
              <Text fontSize="$md" fontWeight="$bold" color={colors.text}>
                Thông tin canh tác
              </Text>
            </HStack>

            <VStack space="sm">
              <InfoRow
                label="Ngày gieo trồng"
                value={formatDate(farm.planting_date)}
                icon={<Calendar size={14} color={colors.textSecondary} />}
              />
              <InfoRow
                label="Ngày thu hoạch dự kiến"
                value={formatDate(farm.expected_harvest_date)}
                icon={<Calendar size={14} color={colors.textSecondary} />}
              />
              <InfoRow
                label="Loại đất"
                value={getSoilTypeLabel(farm.soil_type)}
                icon={<Mountain size={14} color={colors.textSecondary} />}
              />

              {/* Tưới tiêu */}
              <Box
                bg={farm.has_irrigation ? colors.primarySoft : colors.background}
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor={farm.has_irrigation ? colors.success : colors.border}
              >
                <HStack alignItems="center" space="xs">
                  <Droplets
                    size={16}
                    color={farm.has_irrigation ? colors.success : colors.textSecondary}
                    strokeWidth={2}
                  />
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.textSecondary}>
                      Hệ thống tưới tiêu
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={farm.has_irrigation ? colors.success : colors.text}
                    >
                      {farm.has_irrigation
                        ? getIrrigationLabel(farm.irrigation_type || 'none')
                        : 'Không có hệ thống tưới'}
                    </Text>
                  </VStack>
                  {farm.has_irrigation && (
                    <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
                  )}
                </HStack>
              </Box>
            </VStack>
          </VStack>
        </Box>

        {/* ===== THÔNG TIN SỔ ĐỎ ===== */}
        <Box
          bg={colors.card}
          borderRadius="$xl"
          p="$4"
          borderWidth={1}
          borderColor={colors.border}
        >
          <VStack space="md">
            <HStack alignItems="center" space="xs">
              <FileText size={18} color={colors.success} strokeWidth={2} />
              <Text fontSize="$md" fontWeight="$bold" color={colors.text}>
                Thông tin sổ đỏ
              </Text>
            </HStack>

            <VStack space="sm">
              <Box
                bg={colors.primarySoft}
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor={colors.success}
              >
                <Text fontSize="$xs" color={colors.textSecondary} mb="$1">
                  Số giấy chứng nhận
                </Text>
                <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
                  {farm.land_certificate_number}
                </Text>
              </Box>

              {/* Verification Status */}
              <HStack space="sm">
                <VerificationBadge
                  label="Quyền sử dụng đất"
                  isVerified={farm.land_ownership_verified}
                />
                <VerificationBadge
                  label="Loại cây trồng"
                  isVerified={farm.crop_type_verified}
                />
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* ===== THỜI GIAN TẠO/CẬP NHẬT ===== */}
        <Box
          bg={colors.background}
          borderRadius="$lg"
          p="$3"
          borderWidth={1}
          borderColor={colors.border}
        >
          <VStack space="xs">
            <Text fontSize="$xs" color={colors.textSecondary}>
              Ngày tạo: {new Date(farm.created_at).toLocaleString('vi-VN')}
            </Text>
            <Text fontSize="$xs" color={colors.textSecondary}>
              Cập nhật gần nhất: {new Date(farm.updated_at).toLocaleString('vi-VN')}
            </Text>
          </VStack>
        </Box>

        {/* ===== ACTION BUTTONS ===== */}
        <HStack space="sm">
          <Button
            flex={1}
            bg={colors.success}
            onPress={onEdit}
            sx={{
              shadowColor: colors.success,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <HStack space="xs" alignItems="center">
              <Edit3 size={18} color="#fff" strokeWidth={2} />
              <ButtonText color="#fff" fontWeight="$bold" fontSize="$md">
                Chỉnh sửa thông tin
              </ButtonText>
            </HStack>
          </Button>
        </HStack>
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
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  const { colors } = useAgrisaColors();

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack alignItems="center" space="xs">
        {icon}
        <Text fontSize="$sm" color={colors.textSecondary}>
          {label}
        </Text>
      </HStack>
      <Text fontSize="$sm" fontWeight="$semibold" color={colors.text} textAlign="right" flex={1} ml="$2">
        {value}
      </Text>
    </HStack>
  );
};

/**
 * Helper Component - Verification Badge
 */
const VerificationBadge: React.FC<{
  label: string;
  isVerified: boolean;
}> = ({ label, isVerified }) => {
  const { colors } = useAgrisaColors();

  return (
    <Box
      flex={1}
      bg={isVerified ? colors.success + '20' : colors.warning + '20'}
      borderRadius="$lg"
      p="$2"
      borderWidth={1}
      borderColor={isVerified ? colors.success : colors.warning}
    >
      <HStack alignItems="center" space="xs" justifyContent="center">
        {isVerified ? (
          <CheckCircle2 size={14} color={colors.success} strokeWidth={2} />
        ) : (
          <AlertCircle size={14} color={colors.warning} strokeWidth={2} />
        )}
        <VStack flex={1}>
          <Text
            fontSize="$xs"
            fontWeight="$bold"
            color={isVerified ? colors.success : colors.warning}
            numberOfLines={1}
          >
            {label}
          </Text>
          <Text
            fontSize="$xs"
            color={isVerified ? colors.success : colors.warning}
            numberOfLines={1}
          >
            {isVerified ? '✓ Đã xác minh' : '⏳ Chờ xác minh'}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};
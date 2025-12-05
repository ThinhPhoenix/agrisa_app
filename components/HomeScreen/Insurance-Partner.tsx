import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { InsurancePartnerResponse } from "@/domains/insurance-partner/models/insurance-partner.model";
import {
    Box,
    HStack,
    Image,
    Pressable,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
    AlertCircle,
    Building2,
    ChevronRight,
    Star,
} from "lucide-react-native";
import React from "react";

/**
 * Component hiển thị danh sách các công ty bảo hiểm trên Home
 * Bấm vào sẽ chuyển sang trang chi tiết của partner đó
 */
export const InsurancePartners: React.FC = () => {
  const { colors } = useAgrisaColors();
  const { getInsurancePartner } = useInsurancePartner();
  const { data, isLoading, error } = getInsurancePartner();

  // Lấy danh sách partners từ response
  const partners: InsurancePartnerResponse[] = React.useMemo(() => {
    if (!data?.success || !Array.isArray(data.data)) {
      return [];
    }
    return data.data;
  }, [data]);

  // Navigate đến trang chi tiết partner
  const handlePartnerPress = (partnerId: string) => {
    router.push({
      pathname: "/partner/[id]",
      params: { id: partnerId },
    });
  };

  if (isLoading) {
    return (
      <Box py="$4" alignItems="center">
        <Spinner size="small" color={colors.primary} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg={colors.errorSoft}
        borderRadius="$lg"
        p="$3"
        mx="$4"
        borderWidth={1}
        borderColor={colors.error}
      >
        <HStack space="xs" alignItems="center">
          <AlertCircle size={16} color={colors.error} />
          <Text fontSize="$xs" color={colors.error} flex={1}>
            Không thể tải dữ liệu công ty bảo hiểm
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <VStack space="sm" px="$2" pt="$3" pb="$4">
      {/* Header */}
      <HStack alignItems="center" justifyContent="space-between" px="$4">
        <HStack alignItems="center" space="xs">
          <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
            Đối tác bảo hiểm của Agrisa
          </Text>
        </HStack>
      </HStack>

      {/* Empty State */}
      {partners.length === 0 ? (
        <Box py="$6" px="$4" alignItems="center">
          <Building2 size={40} color={colors.muted_text} />
          <Text fontSize="$sm" color={colors.secondary_text} mt="$2" textAlign="center">
            Các đối tác bảo hiểm sẽ hiển thị ở đây
          </Text>
        </Box>
      ) : (
      /* Partner List - Horizontal Scroll */
      <Box px="$4">
        <HStack space="md" flexWrap="wrap">
          {partners.map((partner) => (
            <Pressable
              key={partner.partner_id}
              onPress={() => handlePartnerPress(partner.partner_id)}
              flex={1}
              minWidth="45%"
              maxWidth="48%"
              mb="$3"
            >
              <Box
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.frame_border}
                alignItems="center"
                sx={{
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Logo */}
                <Box
                  w={80}
                  h={80}
                  borderRadius="$lg"
                  overflow="hidden"
                  bg={colors.background}
                  mb="$2"
                  alignItems="center"
                  justifyContent="center"
                >
                  {partner.partner_logo_url ? (
                    <Image
                      source={{ uri: partner.partner_logo_url }}
                      alt={partner.partner_display_name}
                      w="100%"
                      h="100%"
                      resizeMode="contain"
                    />
                  ) : (
                    <Building2 size={40} color={colors.muted_text} />
                  )}
                </Box>

                {/* Tên công ty */}
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={colors.primary_text}
                  textAlign="center"
                  numberOfLines={2}
                  lineHeight={18}
                >
                  {partner.partner_display_name}
                </Text>

                {/* Rating */}
                {partner.partner_rating_score > 0 && (
                  <HStack space="xs" alignItems="center" mt="$1">
                    <Star size={12} color={colors.warning} fill={colors.warning} />
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      {partner.partner_rating_score.toFixed(1)}
                    </Text>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      ({partner.partner_rating_count})
                    </Text>
                  </HStack>
                )}

                {/* Xem chi tiết */}
                <HStack space="xs" alignItems="center" mt="$2">
                  <Text fontSize="$xs" color={colors.primary}>
                    Xem chi tiết
                  </Text>
                  <ChevronRight size={14} color={colors.primary} />
                </HStack>
              </Box>
            </Pressable>
          ))}
        </HStack>
      </Box>
      )}
    </VStack>
  );
};

export default InsurancePartners;

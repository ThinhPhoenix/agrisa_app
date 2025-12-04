import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import {
    Box,
    HStack,
    Image,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import {
    AlertCircle,
    Building2,
    Calendar,
    Clock,
    Globe,
    Mail,
    MapPin,
    Phone,
    Star,
    Users,
} from "lucide-react-native";
import React from "react";
import { Linking, Pressable, RefreshControl } from "react-native";

/**
 * Trang chi tiết công ty bảo hiểm
 * Hiển thị đầy đủ thông tin về partner
 */
export default function PartnerDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getInsurancePartnerDetail } = useInsurancePartner();
  const { data, isLoading, error, refetch, isRefetching } =
    getInsurancePartnerDetail(id || "");

  const partner = data?.success ? data.data : null;

  // Mở link
  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url.startsWith("http") ? url : `https://${url}`);
    }
  };

  // Gọi điện
  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  // Gửi email
  const handleEmail = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Chi tiết đối tác" showBackButton />
        <Box flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary} />
          <Text fontSize="$sm" color={colors.secondary_text} mt="$4">
            Đang tải thông tin...
          </Text>
        </Box>
      </Box>
    );
  }

  if (error || !partner) {
    return (
      <Box flex={1} bg={colors.background}>
        <AgrisaHeader title="Chi tiết đối tác" showBackButton />
        <Box flex={1} alignItems="center" justifyContent="center" px="$4">
          <AlertCircle size={48} color={colors.error} />
          <Text
            fontSize="$md"
            fontWeight="$semibold"
            color={colors.error}
            mt="$4"
            textAlign="center"
          >
            Không thể tải thông tin đối tác
          </Text>
          <Text
            fontSize="$sm"
            color={colors.secondary_text}
            mt="$2"
            textAlign="center"
          >
            Vui lòng thử lại sau
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Chi tiết đối tác" showBackButton />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Cover Photo */}
        {partner.cover_photo_url && (
          <Box h={180} w="100%">
            <Image
              source={{ uri: partner.cover_photo_url }}
              alt="Cover"
              w="100%"
              h="100%"
              resizeMode="cover"
            />
          </Box>
        )}

        {/* Logo & Tên */}
        <Box px="$4" mt={partner.cover_photo_url ? -40 : "$4"}>
          <HStack space="md" alignItems="center">
            {/* Logo */}
            <Box
              w={80}
              h={80}
              borderRadius="$xl"
              overflow="hidden"
              bg={colors.card_surface}
              borderWidth={3}
              borderColor={colors.background}
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              sx={{
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
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

            {/* Tên & Rating & Tagline */}
            <VStack flex={1} space="xs">
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
                flexWrap="wrap"
              >
                {partner.partner_display_name}
              </Text>

              {/* Rating */}
              {partner.partner_rating_score > 0 && (
                <HStack space="xs" alignItems="center">
                  <Star
                    size={14}
                    color={colors.warning}
                    fill={colors.warning}
                  />
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    {partner.partner_rating_score.toFixed(1)}
                  </Text>
                  <Text fontSize="$xs" color={colors.muted_text}>
                    ({partner.partner_rating_count} đánh giá)
                  </Text>
                </HStack>
              )}

              {partner.partner_tagline && (
                <Text
                  fontSize="$xs"
                  color={colors.secondary_text}
                  fontStyle="italic"
                  numberOfLines={2}
                >
                  "{partner.partner_tagline}"
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>

        {/* Thông tin chính */}
        <VStack space="md" px="$4" mt="$4">
          {/* Mô tả */}
          {partner.partner_description && (
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <Text
                fontSize="$md"
                fontWeight="$semibold"
                color={colors.primary_text}
                mb="$2"
              >
                Giới thiệu
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                lineHeight={22}
              >
                {partner.partner_description}
              </Text>
            </Box>
          )}

          {/* Thông tin liên hệ */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={colors.primary_text}
              mb="$3"
            >
              Thông tin liên hệ
            </Text>

            <VStack space="md">
              {/* Hotline */}
              {partner.customer_service_hotline && (
                <Pressable
                  onPress={() => handleCall(partner.customer_service_hotline)}
                >
                  <HStack space="md" alignItems="center">
                    <Box bg={colors.successSoft} p="$2" borderRadius="$lg">
                      <Phone size={18} color={colors.success} />
                    </Box>
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Hotline CSKH
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary}
                      >
                        {partner.customer_service_hotline}
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
              )}

              {/* Email */}
              {partner.partner_official_email && (
                <Pressable
                  onPress={() => handleEmail(partner.partner_official_email)}
                >
                  <HStack space="md" alignItems="center">
                    <Box bg={colors.infoSoft} p="$2" borderRadius="$lg">
                      <Mail size={18} color={colors.info} />
                    </Box>
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Email
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary}
                      >
                        {partner.partner_official_email}
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
              )}

              {/* Website */}
              {partner.partner_website && (
                <Pressable
                  onPress={() => handleOpenLink(partner.partner_website)}
                >
                  <HStack space="md" alignItems="center">
                    <Box bg={colors.warningSoft} p="$2" borderRadius="$lg">
                      <Globe size={18} color={colors.warning} />
                    </Box>
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Website
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary}
                      >
                        {partner.partner_website}
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
              )}

              {/* Địa chỉ */}
              {partner.head_office_address && (
                <HStack space="md" alignItems="flex-start">
                  <Box bg={colors.errorSoft} p="$2" borderRadius="$lg">
                    <MapPin size={18} color={colors.error} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Trụ sở chính
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={colors.secondary_text}
                      lineHeight={20}
                    >
                      {partner.head_office_address}
                    </Text>
                  </VStack>
                </HStack>
              )}

              {/* Giờ hỗ trợ */}
              {partner.support_hours && (
                <HStack space="md" alignItems="center">
                  <Box bg={colors.successSoft} p="$2" borderRadius="$lg">
                    <Clock size={18} color={colors.success} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Giờ hỗ trợ
                    </Text>
                    <Text fontSize="$sm" color={colors.secondary_text}>
                      {partner.support_hours}
                    </Text>
                  </VStack>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Thống kê */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={colors.primary_text}
              mb="$3"
            >
              Thống kê hoạt động
            </Text>

            <HStack flexWrap="wrap" justifyContent="space-between">
              {/* Năm thành lập */}
              {partner.year_established > 0 && (
                <HStack w="48%" mb="$3" space="sm" alignItems="center">
                  <Box
                    bg={colors.primarySoft}
                    p="$2"
                    borderRadius="$lg"
                    flexShrink={0}
                  >
                    <Calendar size={16} color={colors.primary} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Năm thành lập
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.year_established}
                    </Text>
                  </VStack>
                </HStack>
              )}

              {/* Số năm kinh nghiệm */}
              {partner.trust_metric_experience > 0 && (
                <HStack w="48%" mb="$3" space="sm" alignItems="center">
                  <Box
                    bg={colors.successSoft}
                    p="$2"
                    borderRadius="$lg"
                    flexShrink={0}
                  >
                    <Building2 size={16} color={colors.success} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Kinh nghiệm
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.trust_metric_experience} năm
                    </Text>
                  </VStack>
                </HStack>
              )}

              {/* Số khách hàng */}
              {partner.trust_metric_clients > 0 && (
                <HStack w="48%" mb="$3" space="sm" alignItems="center">
                  <Box
                    bg={colors.infoSoft}
                    p="$2"
                    borderRadius="$lg"
                    flexShrink={0}
                  >
                    <Users size={16} color={colors.info} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Khách hàng
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.trust_metric_clients.toLocaleString()}+
                    </Text>
                  </VStack>
                </HStack>
              )}

              {/* Tỷ lệ claim */}
              {partner.trust_metric_claim_rate > 0 && (
                <HStack w="48%" mb="$3" space="sm" alignItems="center">
                  <Box
                    bg={colors.warningSoft}
                    p="$2"
                    borderRadius="$lg"
                    flexShrink={0}
                  >
                    <Star size={16} color={colors.warning} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Tỷ lệ bồi thường
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.trust_metric_claim_rate}%
                    </Text>
                  </VStack>
                </HStack>
              )}
            </HStack>

            {/* Thông tin bổ sung */}
            <VStack space="sm" mt="$2">
              {partner.total_payouts && (
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Tổng chi trả:
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.success}
                  >
                    {partner.total_payouts}
                  </Text>
                </VStack>
              )}
              {partner.average_payout_time && (
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Thời gian chi trả TB:
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {partner.average_payout_time}
                  </Text>
                </VStack>
              )}
              {partner.coverage_areas && (
                <VStack space="xs">
                  <Text fontSize="$xs" color={colors.muted_text}>
                    Vùng phủ sóng:
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color={colors.primary_text}
                  >
                    {partner.coverage_areas}
                  </Text>
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>

        {/* Bottom spacing */}
        <Box h={40} />
      </ScrollView>
    </Box>
  );
}

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
  Award,
  Building2,
  Calendar,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  TrendingUp,
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

        {/* Logo & Tên - Simple Style */}
        <Box px="$4" mt="$4" alignItems="center">
          {/* Logo tròn */}
          <Box
            w={80}
            h={80}
            borderRadius="$full"
            overflow="hidden"
            bg={colors.card_surface}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={colors.frame_border}
            mt={partner.cover_photo_url ? -50 : 0}
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
          <VStack space="xs" alignItems="center" mt="$3">
            <Text
              fontSize="$xl"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
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
                  color={colors.warning}
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
                fontSize="$sm"
                color={colors.secondary_text}
                fontStyle="italic"
                textAlign="center"
                px="$4"
              >
                "{partner.partner_tagline}"
              </Text>
            )}
          </VStack>
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
              <HStack space="sm" alignItems="center" mb="$3">
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Giới thiệu
                </Text>
              </HStack>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                lineHeight={22}
              >
                {partner.partner_description}
              </Text>
            </Box>
          )}

          {/* Thống kê nhanh - Grid 2x2 */}
          <HStack space="sm" flexWrap="wrap">
            {/* Năm thành lập */}
            {partner.year_established > 0 && (
              <Box
                w="48%"
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.frame_border}
                mb="$2"
              >
                <HStack space="sm" alignItems="center">
                  <Calendar size={20} color={colors.primary} />
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Thành lập
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.year_established}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Số năm kinh nghiệm */}
            {partner.trust_metric_experience > 0 && (
              <Box
                w="48%"
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.frame_border}
                mb="$2"
              >
                <HStack space="sm" alignItems="center">
                  <Award size={20} color={colors.primary} />
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Kinh nghiệm
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.trust_metric_experience} năm
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Số khách hàng */}
            {partner.trust_metric_clients > 0 && (
              <Box
                w="48%"
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.frame_border}
                mb="$2"
              >
                <HStack space="sm" alignItems="center">
                  <Users size={20} color={colors.primary} />
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Khách hàng
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.trust_metric_clients.toLocaleString()}+
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Tỷ lệ bồi thường */}
            {partner.trust_metric_claim_rate > 0 && (
              <Box
                w="48%"
                bg={colors.card_surface}
                borderRadius="$xl"
                p="$3"
                borderWidth={1}
                borderColor={colors.frame_border}
                mb="$2"
              >
                <HStack space="sm" alignItems="center">
                  <TrendingUp size={20} color={colors.primary} />
                  <VStack flex={1}>
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Tỷ lệ bồi thường
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.primary_text}
                    >
                      {partner.trust_metric_claim_rate}%
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </HStack>

          {/* Thông tin bồi thường */}
          {(partner.total_payouts || partner.average_payout_time) && (
            <Box
              bg={colors.card_surface}
              borderRadius="$xl"
              p="$4"
              borderWidth={1}
              borderColor={colors.frame_border}
            >
              <HStack space="sm" alignItems="center" mb="$3">
                <Text
                  fontSize="$md"
                  fontWeight="$bold"
                  color={colors.primary_text}
                >
                  Cam kết bồi thường
                </Text>
              </HStack>
              <HStack justifyContent="space-around">
                {partner.total_payouts && (
                  <VStack alignItems="center">
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Tổng đã chi trả
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.success}
                    >
                      {partner.total_payouts}
                    </Text>
                  </VStack>
                )}
                {partner.average_payout_time && (
                  <VStack alignItems="center">
                    <Text fontSize="$xs" color={colors.muted_text}>
                      Thời gian chi trả TB
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color={colors.success}
                    >
                      {partner.average_payout_time}
                    </Text>
                  </VStack>
                )}
              </HStack>
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
            <HStack space="sm" alignItems="center" mb="$3">
              <Text
                fontSize="$md"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Liên hệ
              </Text>
            </HStack>

            <VStack space="md">
              {/* Hotline */}
              {partner.customer_service_hotline && (
                <Pressable
                  onPress={() => handleCall(partner.customer_service_hotline)}
                >
                  <HStack space="md" alignItems="center">
                    <Phone size={18} color={colors.primary} />
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Hotline CSKH
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
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
                    <Mail size={18} color={colors.primary} />
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
                    <Globe size={18} color={colors.primary} />
                    <VStack flex={1}>
                      <Text fontSize="$xs" color={colors.muted_text}>
                        Website
                      </Text>
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={colors.primary}
                        numberOfLines={1}
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
                  <MapPin size={18} color={colors.primary} />
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
                  <Clock size={18} color={colors.primary} />
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
        </VStack>

        {/* Bottom spacing */}
        <Box h={40} />
      </ScrollView>
    </Box>
  );
} 

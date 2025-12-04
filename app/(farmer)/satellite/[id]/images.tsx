import { AgrisaHeader } from "@/components/Header";
import { FullscreenImageViewer } from "@/components/image-viewer";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Utils } from "@/libs/utils/utils";
import {
    Box,
    HStack,
    Image,
    Pressable,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import {
    AlertCircle,
    Calendar,
    ImageIcon,
    MapPin,
    Satellite,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { RefreshControl } from "react-native";

/**
 * Màn hình hiển thị gallery hình ảnh vệ tinh của nông trại
 * Hỗ trợ cả farm mode và policy mode
 */
export default function SatelliteImagesScreen() {
  const { colors } = useAgrisaColors();
  const { id, policy_id, mode } = useLocalSearchParams<{
    id: string;
    policy_id?: string;
    mode?: "farm" | "policy";
  }>();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  // Xác định mode: nếu có policy_id hoặc mode=policy thì là policy mode
  const viewMode = mode || (policy_id ? "policy" : "farm");

  // Get policy detail để lấy farm_id (chỉ khi ở policy mode)
  const { getRegisteredPolicyDetail } = usePolicy();
  const {
    data: policyData,
    isLoading: isPolicyLoading,
    error: policyError,
  } = getRegisteredPolicyDetail(policy_id || "", {
    enabled: viewMode === "policy" && !!policy_id,
  });

  const registeredPolicy = policyData?.success ? policyData.data : null;
  const farmIdFromPolicy = registeredPolicy?.farm_id;

  // Get farm detail
  const { getDetailFarm } = useFarm();
  const farmIdToFetch = viewMode === "farm" ? id : farmIdFromPolicy;
  const {
    data: farmData,
    isLoading: isFarmLoading,
    error: farmError,
    refetch,
  } = getDetailFarm(farmIdToFetch || "", {
    enabled: !!farmIdToFetch,
  });

  const farmDetail = farmData?.success ? farmData.data : null;

  // Lấy danh sách ảnh vệ tinh từ farm_photos
  const satelliteImages = useMemo(() => {
    if (!farmDetail?.farm_photos) return [];
    return farmDetail.farm_photos
      .filter((photo) => photo.photo_url && photo.photo_url.trim())
      .map((photo) => ({
        url: photo.photo_url.startsWith("http")
          ? photo.photo_url
          : `https://${photo.photo_url}`,
        takenAt: photo.taken_at,
        type: photo.photo_type,
        id: photo.id,
      }));
  }, [farmDetail]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const isLoading =
    viewMode === "policy" ? isPolicyLoading || isFarmLoading : isFarmLoading;
  const hasError = viewMode === "policy" ? policyError || farmError : farmError;

  return (
    <Box flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title="Hình ảnh vệ tinh"
        onBack={() => router.back()}
      />

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <VStack space="lg" p="$4">
          {/* Loading */}
          {isLoading && (
            <Box py="$8" alignItems="center">
              <Spinner size="large" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text} mt="$4">
                Đang tải hình ảnh vệ tinh...
              </Text>
            </Box>
          )}

          {/* Error */}
          {hasError && (
            <Box
              bg={colors.error + "20"}
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor={colors.error}
            >
              <HStack space="sm" alignItems="center">
                <AlertCircle size={20} color={colors.error} strokeWidth={2} />
                <Text fontSize="$sm" color={colors.error} flex={1}>
                  Không thể tải dữ liệu. Vui lòng thử lại.
                </Text>
              </HStack>
            </Box>
          )}

          {!isLoading && !hasError && (
            <>
              {/* Farm info banner */}
              {farmDetail && (
                <Box
                  bg={colors.card_surface}
                  borderRadius="$lg"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <HStack space="sm" alignItems="center">
                    <Box
                      bg={colors.primary + "15"}
                      p="$2"
                      borderRadius="$full"
                    >
                      <Satellite
                        size={20}
                        color={colors.primary}
                        strokeWidth={2}
                      />
                    </Box>
                    <VStack flex={1}>
                      <Text
                        fontSize="$md"
                        fontWeight="$bold"
                        color={colors.primary_text}
                      >
                        {farmDetail.farm_name}
                      </Text>
                      <HStack space="xs" alignItems="center">
                        <MapPin
                          size={12}
                          color={colors.secondary_text}
                          strokeWidth={2}
                        />
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          {farmDetail.district}, {farmDetail.province}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {/* Images count info */}
              <HStack
                justifyContent="space-between"
                alignItems="center"
                px="$1"
              >
                <HStack space="sm" alignItems="center">
                  <ImageIcon
                    size={18}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$md"
                    fontWeight="$bold"
                    color={colors.primary_text}
                  >
                    Tổng số ảnh
                  </Text>
                </HStack>
                <Box
                  bg={colors.primary}
                  borderRadius="$full"
                  px="$3"
                  py="$1"
                >
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_white_text}
                  >
                    {satelliteImages.length}
                  </Text>
                </Box>
              </HStack>

              {/* Images Gallery */}
              {satelliteImages.length === 0 ? (
                <Box py="$8" px="$4" alignItems="center">
                  <Box
                    bg={colors.card_surface}
                    p="$8"
                    borderRadius="$2xl"
                    mb="$4"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <ImageIcon
                      size={48}
                      color={colors.secondary_text}
                      strokeWidth={1.5}
                    />
                  </Box>
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    color={colors.primary_text}
                    textAlign="center"
                    mb="$2"
                  >
                    Chưa có hình ảnh
                  </Text>
                  <Text
                    fontSize="$sm"
                    color={colors.secondary_text}
                    textAlign="center"
                    lineHeight={20}
                    maxWidth={280}
                  >
                    Hình ảnh vệ tinh sẽ được cập nhật khi có dữ liệu mới từ hệ
                    thống
                  </Text>
                </Box>
              ) : (
                <VStack space="md">
                  {/* Grid hiển thị ảnh */}
                  <HStack flexWrap="wrap" mx={-6}>
                    {satelliteImages.map((image, index) => (
                      <Pressable
                        key={image.id || index}
                        onPress={() => setSelectedImageIndex(index)}
                        style={{
                          width: "50%",
                          padding: 6,
                        }}
                      >
                        <Box
                          borderRadius="$xl"
                          overflow="hidden"
                          borderWidth={1}
                          borderColor={colors.frame_border}
                          bg={colors.card_surface}
                        >
                          {/* Image */}
                          <Box aspectRatio={4 / 3}>
                            <Image
                              source={{ uri: image.url }}
                              alt={`Ảnh vệ tinh ${index + 1}`}
                              w="100%"
                              h="100%"
                              resizeMode="cover"
                            />
                            {/* Overlay số thứ tự */}
                            <Box
                              position="absolute"
                              top={8}
                              left={8}
                              bg="rgba(0,0,0,0.6)"
                              borderRadius="$full"
                              px="$2"
                              py="$0.5"
                            >
                              <Text
                                fontSize="$2xs"
                                fontWeight="$bold"
                                color={colors.primary_white_text}
                              >
                                #{index + 1}
                              </Text>
                            </Box>
                          </Box>

                          {/* Image info */}
                          <VStack p="$2" space="xs">
                            {image.type && (
                              <Text
                                fontSize="$2xs"
                                fontWeight="$semibold"
                                color={colors.primary}
                                numberOfLines={1}
                              >
                                {image.type}
                              </Text>
                            )}
                            {image.takenAt && (
                              <HStack space="xs" alignItems="center">
                                <Calendar
                                  size={10}
                                  color={colors.secondary_text}
                                />
                                <Text
                                  fontSize="$2xs"
                                  color={colors.secondary_text}
                                >
                                  {Utils.formatDateForMS(image.takenAt)}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>

                  {/* Hướng dẫn */}
                  <Box
                    bg={colors.card_surface}
                    borderRadius="$lg"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <HStack space="sm" alignItems="center">
                      <ImageIcon
                        size={14}
                        color={colors.secondary_text}
                        strokeWidth={2}
                      />
                      <Text
                        fontSize="$xs"
                        color={colors.secondary_text}
                        flex={1}
                      >
                        Nhấn vào ảnh để xem toàn màn hình và điều hướng qua các
                        ảnh khác
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              )}
            </>
          )}
        </VStack>
      </ScrollView>

      {/* Fullscreen Image Viewer */}
      <FullscreenImageViewer
        images={satelliteImages.map((img) => img.url)}
        selectedIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        onIndexChange={(index) => setSelectedImageIndex(index)}
      />
    </Box>
  );
}

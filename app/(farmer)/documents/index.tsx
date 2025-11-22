import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { AlertCircle, FileText, MapPin } from "lucide-react-native";
import React from "react";
import { Image, RefreshControl } from "react-native";

/**
 * Màn hình danh sách giấy tờ chứng nhận quyền sử dụng đất
 * Hiển thị preview giấy tờ của từng farm
 */
export default function DocumentsListScreen() {
  const { colors } = useAgrisaColors();
  const { getListFarm } = useFarm();
  const { data, isLoading, error, refetch } = getListFarm();
  const [refreshing, setRefreshing] = React.useState(false);

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Helper: Fix photo URL by adding https:// if missing
  const getPhotoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // Helper: Parse land_certificate_url (split by |)
  const parseCertificateUrls = (urlString: string): string[] => {
    if (!urlString) return [];
    return urlString.split("|").filter((url) => url.trim() !== "");
  };

  // Filter farms có giấy tờ
  const farms = data?.success ? data.data : [];
  const farmsWithDocuments = farms?.filter(
    (farm: any) =>
      farm.land_certificate_url && farm.land_certificate_url.trim() !== ""
  );

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Giấy tờ nông trại" />

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
        <VStack space="md" p="$4">
          {/* Loading */}
          {isLoading && (
            <Box py="$8" alignItems="center">
              <Spinner size="large" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text} mt="$4">
                Đang tải dữ liệu...
              </Text>
            </Box>
          )}

          {/* Error */}
          {error && (
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

          {/* Empty state */}
          {!isLoading && farmsWithDocuments?.length === 0 && (
            <Box py="$8" alignItems="center">
              <FileText
                size={64}
                color={colors.secondary_text}
                strokeWidth={1}
              />
              <Text
                fontSize="$md"
                fontWeight="$semibold"
                color={colors.primary_text}
                mt="$4"
              >
                Chưa có giấy tờ
              </Text>
              <Text
                fontSize="$sm"
                color={colors.secondary_text}
                textAlign="center"
                mt="$2"
              >
                Các nông trại của bạn chưa có giấy tờ chứng nhận
              </Text>
            </Box>
          )}

          {/* Farm list with documents */}
          {farmsWithDocuments?.map((farm: any) => {
            const certificateUrls = parseCertificateUrls(
              farm.land_certificate_url
            );
            const previewUrl = certificateUrls[0] || "";

            return (
              <Pressable
                key={farm.id}
                onPress={() => router.push(`/(farmer)/documents/${farm.id}`)}
              >
                <Box
                  bg={colors.background}
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                  overflow="hidden"
                >
                  {/* Document Image Preview */}
                  <Box width="100%" aspectRatio={16 / 9} bg={colors.overlay}>
                    {previewUrl ? (
                      <Image
                        source={{ uri: getPhotoUrl(previewUrl) }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Box
                        flex={1}
                        justifyContent="center"
                        alignItems="center"
                        bg={colors.overlay}
                      >
                        <FileText
                          size={48}
                          color={colors.secondary_text}
                          strokeWidth={1}
                        />
                      </Box>
                    )}

                    {/* Document count badge */}
                    {certificateUrls.length > 1 && (
                      <Box
                        position="absolute"
                        top="$3"
                        right="$3"
                        bg="rgba(0,0,0,0.7)"
                        borderRadius="$md"
                        px="$3"
                        py="$1"
                      >
                        <Text
                          fontSize="$xs"
                          fontWeight="$semibold"
                          color={colors.primary_white_text}
                        >
                          {certificateUrls.length} tài liệu
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* Farm info */}
                  <Box p="$4">
                    <VStack space="xs">
                      <Text
                        fontSize="$lg"
                        fontWeight="$bold"
                        color={colors.primary_text}
                        numberOfLines={1}
                      >
                        {farm.farm_name}
                      </Text>

                      <HStack space="xs" alignItems="center">
                        <MapPin
                          size={14}
                          color={colors.secondary_text}
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          color={colors.secondary_text}
                          numberOfLines={1}
                          flex={1}
                        >
                          {farm.province}
                        </Text>
                      </HStack>

                      <HStack space="xs" alignItems="center" mt="$2">
                        <Box
                          bg={colors.info + "20"}
                          borderRadius="$sm"
                          px="$2"
                          py="$1"
                        >
                          <Text
                            fontSize="$xs"
                            fontWeight="$semibold"
                            color={colors.info}
                          >
                            Số GCN: {farm.land_certificate_number || "N/A"}
                          </Text>
                        </Box>
                        {farm.land_ownership_verified && (
                          <Box
                            bg={colors.success + "20"}
                            borderRadius="$sm"
                            px="$2"
                            py="$1"
                          >
                            <Text
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color={colors.success}
                            >
                              ✓ Đã xác minh
                            </Text>
                          </Box>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </Box>
  );
}

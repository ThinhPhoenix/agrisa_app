import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  HStack,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  AlertCircle,
  BarChart3,
  Info,
  Leaf,
  MapPin,
  ReceiptText,
  Satellite,
} from "lucide-react-native";
import React, { useState } from "react";
import { Animated, ImageBackground, RefreshControl } from "react-native";

type ViewMode = "farm" | "policy";

/**
 * Màn hình danh sách để theo dõi dữ liệu vệ tinh
 * 2 tabs: Xem theo Farm hoặc xem theo Policy
 */
export default function SatelliteListScreen() {
  const { colors } = useAgrisaColors();
  const [viewMode, setViewMode] = useState<ViewMode>("farm");
  const [refreshing, setRefreshing] = React.useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  // Get farms
  const { getListFarm } = useFarm();
  const {
    data: farmsData,
    isLoading: isFarmsLoading,
    error: farmsError,
    refetch: refetchFarms,
  } = getListFarm();

  // Get policies
  const { getRegisteredPolicy } = usePolicy();
  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
    error: policiesError,
    refetch: refetchPolicies,
  } = getRegisteredPolicy();

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (viewMode === "farm") {
      await refetchFarms();
    } else {
      await refetchPolicies();
    }
    setRefreshing(false);
  }, [viewMode, refetchFarms, refetchPolicies]);

  // Parse data
  const farms = farmsData?.success ? farmsData.data : [];
  const policies = policiesData?.success ? policiesData.data.policies : [];

  // Lọc policies có thể xem monitor data
  const activePolicies = policies?.filter(
    (policy: any) =>
      Utils.shouldShowMonitorData(policy.underwriting_status) &&
      policy.status === "active"
  );

  // Helper: Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.success;
      case "pending_payment":
        return colors.warning;
      case "pending_review":
        return colors.info;
      default:
        return colors.secondary_text;
    }
  };

  // Helper: Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "pending_payment":
        return "Chờ thanh toán";
      case "pending_review":
        return "Chờ duyệt";
      case "expired":
        return "Hết hạn";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const isLoading = viewMode === "farm" ? isFarmsLoading : isPoliciesLoading;
  const error = viewMode === "farm" ? farmsError : policiesError;
  const isEmpty =
    viewMode === "farm"
      ? !farms || farms.length === 0
      : !activePolicies || activePolicies.length === 0;

  // Cover Image Component with Parallax Effect
  const CoverImage = () => {
    const imageScale = scrollY.interpolate({
      inputRange: [-200, 0],
      outputRange: [1.3, 1.0],
      extrapolate: "clamp",
    });

    return (
      <Box overflow="hidden" mb="$4" mx={-16} position="relative">
        <Animated.View
          style={{
            transform: [{ scale: imageScale }],
            width: "100%",
          }}
        >
          <ImageBackground
            source={require("@/assets/images/Cover/Agrisa-Cover-Satellite.png")}
            style={{ width: "100%", aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Overlay Text */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          justifyContent="flex-end"
          p="$4"
        >
          <VStack space="xs">
            <Box flexDirection="row" alignItems="center" mb="$1">
              <Box
                bg={colors.primary}
                p="$1.5"
                borderRadius="$sm"
                alignItems="center"
                justifyContent="center"
              >
                <Info
                  size={14}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_white_text}
                ml="$2"
              >
                Theo dõi chỉ số vệ tinh
              </Text>
            </Box>
            <Text
              fontSize="$xs"
              color={colors.primary_white_text}
              lineHeight="$md"
            >
              Xem biểu đồ và phân tích các chỉ số NDVI, NDMI, NDWI... của nông
              trại được theo dõi bởi vệ tinh 24/7
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };

  // Render content based on state
  const renderContent = () => {
    return (
      <VStack space="lg">
        {/* Cover Image với Parallax */}
        <CoverImage />

        {/* Tabs */}
        <HStack space="sm">
          <Pressable flex={1} onPress={() => setViewMode("farm")}>
            {({ pressed }) => (
              <Box
                bg={viewMode === "farm" ? colors.primary : colors.card_surface}
                borderWidth={1}
                borderColor={
                  viewMode === "farm" ? colors.primary : colors.frame_border
                }
                borderRadius="$xl"
                px="$4"
                py="$3"
                opacity={pressed ? 0.7 : 1}
              >
                <HStack space="sm" alignItems="center" justifyContent="center">
                  <Leaf
                    size={18}
                    color={
                      viewMode === "farm"
                        ? colors.primary_white_text
                        : colors.secondary_text
                    }
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={
                      viewMode === "farm"
                        ? colors.primary_white_text
                        : colors.secondary_text
                    }
                  >
                    Theo Nông trại
                  </Text>
                </HStack>
              </Box>
            )}
          </Pressable>

          <Pressable flex={1} onPress={() => setViewMode("policy")}>
            {({ pressed }) => (
              <Box
                bg={
                  viewMode === "policy" ? colors.primary : colors.card_surface
                }
                borderWidth={1}
                borderColor={
                  viewMode === "policy" ? colors.primary : colors.frame_border
                }
                borderRadius="$xl"
                px="$4"
                py="$3"
                opacity={pressed ? 0.7 : 1}
              >
                <HStack space="sm" alignItems="center" justifyContent="center">
                  <ReceiptText
                    size={18}
                    color={
                      viewMode === "policy"
                        ? colors.primary_white_text
                        : colors.secondary_text
                    }
                    strokeWidth={2}
                  />
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={
                      viewMode === "policy"
                        ? colors.primary_white_text
                        : colors.secondary_text
                    }
                  >
                    Theo Hợp đồng
                  </Text>
                </HStack>
              </Box>
            )}
          </Pressable>
        </HStack>

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
        {!isLoading && !error && isEmpty && (
          <Box py="$12" px="$6" alignItems="center">
            <Box bg={colors.success} p="$6" borderRadius="$full" mb="$4">
              <Satellite size={64} color={colors.primary_white_text} strokeWidth={1.5} />
            </Box>
            <Text
              fontSize="$xl"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
              mb="$2"
            >
              Chưa có dữ liệu theo dõi
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
              lineHeight={22}
              mb="$6"
            >
              {viewMode === "farm"
                ? "Bạn chưa có nông trại nào. Hãy đăng ký nông trại để bắt đầu theo dõi."
                : "Bạn chưa có hợp đồng bảo hiểm nào đang hoạt động. Đăng ký bảo hiểm để bắt đầu theo dõi dữ liệu vệ tinh."}
            </Text>
          </Box>
        )}

        {/* Farm list */}
        {!isLoading &&
          !error &&
          viewMode === "farm" &&
          farms &&
          farms.length > 0 && (
            <VStack space="md">
              {farms.map((farm: any) => (
              <Pressable
                key={farm.id}
                onPress={() =>
                  router.push(`/(farmer)/satellite/${farm.id}?mode=farm`)
                }
              >
                {({ pressed }) => (
                  <Box
                    bg={colors.card_surface}
                    borderRadius="$xl"
                    borderWidth={2}
                    borderColor={colors.frame_border}
                    overflow="hidden"
                    opacity={pressed ? 0.7 : 1}
                  >
                    {/* Header */}
                    <Box
                      bg={colors.success + "10"}
                      px="$4"
                      py="$3"
                      borderBottomWidth={1}
                      borderBottomColor={colors.frame_border}
                    >
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <HStack space="sm" alignItems="center" flex={1}>
                          <Leaf
                            size={20}
                            color={colors.success}
                            strokeWidth={2}
                          />
                          <Text
                            fontSize="$sm"
                            fontWeight="$bold"
                            color={colors.success}
                            numberOfLines={1}
                            flex={1}
                          >
                            {farm.farm_name}
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>

                    {/* Body */}
                    <VStack space="sm" p="$4">
                      {/* Farm info */}
                      <HStack space="xs" alignItems="center">
                        <MapPin
                          size={14}
                          color={colors.secondary_text}
                          strokeWidth={2}
                        />
                        <Text
                          fontSize="$sm"
                          color={colors.secondary_text}
                          flex={1}
                        >
                          {farm.province}
                        </Text>
                      </HStack>

                      <HStack justifyContent="space-between">
                        <VStack flex={1}>
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Diện tích
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {farm.area_sqm} ha
                          </Text>
                        </VStack>
                        <VStack flex={1} alignItems="flex-end">
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Loại cây
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {Utils.getCropLabel(farm.crop_type)}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Footer - View data button */}
                      <Box
                        bg={colors.success}
                        borderRadius="$lg"
                        px="$4"
                        py="$3"
                        mt="$2"
                      >
                        <HStack
                          space="sm"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Satellite
                            size={16}
                            color={colors.primary_white_text}
                            strokeWidth={2}
                          />
                          <Text
                            fontSize="$sm"
                            fontWeight="$bold"
                            color={colors.primary_white_text}
                          >
                            Xem dữ liệu theo dõi
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>
                )}
              </Pressable>
            ))}
          </VStack>
        )}

        {/* Policy list */}
        {!isLoading &&
          !error &&
          viewMode === "policy" &&
          activePolicies &&
          activePolicies.length > 0 && (
            <VStack space="md">
              {activePolicies.map((policy: any) => (
                <Pressable
                  key={policy.id}
                  onPress={() =>
                    router.push(
                      `/(farmer)/satellite/${policy.farm_id}?mode=policy&policy_id=${policy.id}`
                    )
                  }
                >
                  {({ pressed }) => (
                    <Box
                      bg={colors.card_surface}
                      borderRadius="$xl"
                      borderWidth={2}
                      borderColor={colors.frame_border}
                      overflow="hidden"
                      opacity={pressed ? 0.7 : 1}
                    >
                      {/* Header */}
                      <Box
                        bg={colors.primary + "10"}
                        px="$4"
                        py="$3"
                        borderBottomWidth={1}
                        borderBottomColor={colors.frame_border}
                      >
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <HStack space="sm" alignItems="center" flex={1}>
                            <BarChart3
                              size={20}
                              color={colors.primary}
                              strokeWidth={2}
                            />
                            <Text
                              fontSize="$sm"
                              fontWeight="$bold"
                              color={colors.primary}
                              numberOfLines={1}
                              flex={1}
                            >
                              {policy.policy_number}
                            </Text>
                          </HStack>
                          <Box
                            bg={getStatusColor(policy.status) + "20"}
                            px="$2"
                            py="$1"
                            borderRadius="$md"
                          >
                            <Text
                              fontSize="$xs"
                              fontWeight="$bold"
                              color={getStatusColor(policy.status)}
                            >
                              {getStatusLabel(policy.status)}
                            </Text>
                          </Box>
                        </HStack>
                      </Box>

                      {/* Body */}
                      <VStack space="sm" p="$4">
                        {/* Coverage info */}
                        <HStack justifyContent="space-between">
                          <VStack flex={1}>
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Bắt đầu
                            </Text>
                            <Text
                              fontSize="$sm"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              {Utils.formatDateForMS(policy.coverage_start_date)}
                            </Text>
                          </VStack>
                          <VStack flex={1} alignItems="center">
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Kết thúc
                            </Text>
                            <Text
                              fontSize="$sm"
                              fontWeight="$semibold"
                              color={colors.primary_text}
                            >
                              {Utils.formatDateForMS(policy.coverage_end_date)}
                            </Text>
                          </VStack>
                          <VStack flex={1} alignItems="flex-end">
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Giá trị BH
                            </Text>
                            <Text
                              fontSize="$sm"
                              fontWeight="$bold"
                              color={colors.success}
                            >
                              {Utils.formatCurrency(policy.coverage_amount)}
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Footer - View data button */}
                        <Box
                          bg={colors.primary}
                          borderRadius="$lg"
                          px="$4"
                          py="$3"
                          mt="$2"
                        >
                          <HStack
                            space="sm"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Satellite
                              size={16}
                              color={colors.primary_white_text}
                              strokeWidth={2}
                            />
                            <Text
                              fontSize="$sm"
                              fontWeight="$bold"
                              color={colors.primary_white_text}
                            >
                              Xem dữ liệu theo dõi
                            </Text>
                          </HStack>
                        </Box>
                      </VStack>
                    </Box>
                  )}
                </Pressable>
              ))}
            </VStack>
          )}
      </VStack>
    );
  };

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Theo dõi chỉ số vệ tinh" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderContent()}
      </Animated.ScrollView>
    </Box>
  );
}

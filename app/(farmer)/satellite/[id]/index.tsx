import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { MonitorChart } from "@/domains/farm-data-monitor/components/MonitorChart";
import { ParameterFilter } from "@/domains/farm-data-monitor/components/ParameterFilter";
import {
  getTimeRangeTimestamps,
  TimeRange,
  TimeRangeSelector,
} from "@/domains/farm-data-monitor/components/TimeRangeSelector";
import { useDataMonitor } from "@/domains/farm-data-monitor/hooks/use-data-monitor";
import { MonitoringDataItem } from "@/domains/farm-data-monitor/models/data-monitor.model";
import {
  getParameterColor,
  getParameterLabel,
} from "@/domains/farm-data-monitor/utils/parameterUtils";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { usePolicy } from "@/domains/policy/hooks/use-policy";
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";
import { Utils } from "@/libs/utils/utils";
import {
  Box,
  Divider,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
  Droplets,
  FileText,
  ImageIcon,
  Info,
  MapPin,
  Mountain,
  Satellite,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { RefreshControl } from "react-native";

import { RegisteredPolicyStatus } from "@/domains/policy/enums/policy-status.enum";

/**
 * Màn hình chi tiết theo dõi dữ liệu vệ tinh
 * Hiển thị biểu đồ chỉ số theo phong cách chứng khoán
 */
export default function SatelliteDetailScreen() {
  const { colors } = useAgrisaColors();
  const { id, policy_id, mode } = useLocalSearchParams<{
    id: string;
    policy_id?: string;
    mode?: "farm" | "policy";
  }>();

  const [selectedParameter, setSelectedParameter] = useState<string | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const [refreshing, setRefreshing] = useState(false);
  const bottomPadding = useBottomInsets();

  // Xác định mode: nếu có policy_id hoặc mode=policy thì là policy mode
  const viewMode = mode || (policy_id ? "policy" : "farm");

  // Get policy detail để lấy data source info và farm_id (chỉ khi ở policy mode)
  const {
    getRegisteredPolicyDetail,
    getDetailBasePolicy,
    getRegisteredPolicy,
  } = usePolicy();

  // Get all registered policies for farm mode
  const { data: allPoliciesData, isLoading: isAllPoliciesLoading } =
    getRegisteredPolicy();
  const {
    data: policyData,
    isLoading: isPolicyLoading,
    error: policyError,
  } = getRegisteredPolicyDetail(policy_id || "", {
    enabled: viewMode === "policy" && !!policy_id,
  });

  const registeredPolicy = policyData?.success ? policyData.data : null;
  const basePolicyId = registeredPolicy?.base_policy_id;
  const farmIdFromPolicy = registeredPolicy?.farm_id;

  // Get farm detail
  // - Farm mode: id chính là farm_id
  // - Policy mode: lấy farm_id từ registered policy
  const { getDetailFarm } = useFarm();
  const farmIdToFetch = viewMode === "farm" ? id : farmIdFromPolicy;
  const {
    data: farmData,
    isLoading: isFarmLoading,
    error: farmError,
  } = getDetailFarm(farmIdToFetch || "", {
    enabled: !!farmIdToFetch,
  });

  const farmDetail = farmData?.success ? farmData.data : null;

  // Đếm số lượng ảnh vệ tinh từ farm_photos
  const satelliteImagesCount = useMemo(() => {
    if (!farmDetail?.farm_photos) return 0;
    return farmDetail.farm_photos.filter(
      (photo) => photo.photo_url && photo.photo_url.trim()
    ).length;
  }, [farmDetail]);

  const {
    data: basePolicyData,
    isLoading: isBasePolicyLoading,
    error: basePolicyError,
  } = getDetailBasePolicy(basePolicyId || "", {
    enabled: viewMode === "policy" && !!basePolicyId,
  });

  const basePolicy = basePolicyData?.success ? basePolicyData.data : null;

  // Kiểm tra policy mode: chỉ cho phép xem data nếu status là active hoặc pending_cancel
  const isPolicyStatusValid = useMemo(() => {
    if (viewMode !== "policy" || !registeredPolicy) {
      return true; // Farm mode luôn valid (sẽ check ở phần khác)
    }

    return (
      registeredPolicy.status === RegisteredPolicyStatus.ACTIVE ||
      registeredPolicy.status === RegisteredPolicyStatus.PENDING_CANCEL
    );
  }, [viewMode, registeredPolicy]);

  // Get monitoring data
  const timeRangeParams = getTimeRangeTimestamps(timeRange);
  const { getPolicyDataMonitor } = useDataMonitor();

  // Build params dựa trên mode
  const monitorParams = useMemo(() => {
    // Farm mode: cho phép filter theo parameter đã chọn
    if (viewMode === "farm") {
      return {
        parameter_name: selectedParameter || undefined,
        ...timeRangeParams,
      };
    }

    // Policy mode: không filter vì đã được base policy xác định
    return {
      ...timeRangeParams,
    };
  }, [viewMode, selectedParameter, timeRangeParams]);

  const {
    data: monitorData,
    isLoading: isMonitorLoading,
    error: monitorError,
    refetch,
  } = getPolicyDataMonitor(id || "", monitorParams);

  const monitoringData = monitorData?.success ? monitorData.data : null;

  // Lấy danh sách data_source_id từ base policy (farm mode)
  const allowedDataSourceIds = useMemo(() => {
    if (viewMode !== "farm" || !allPoliciesData?.success || !farmIdToFetch) {
      return null;
    }

    // Filter policies: chỉ lấy active hoặc pending_cancel cho farm này
    const validPolicies = allPoliciesData.data.policies.filter(
      (p: any) =>
        p.farm_id === farmIdToFetch &&
        (p.status === RegisteredPolicyStatus.ACTIVE ||
          p.status === RegisteredPolicyStatus.PENDING_CANCEL)
    );

    // Không có policy hợp lệ -> không có data source
    if (validPolicies.length === 0) {
      return [];
    }

    // TODO: Cần lấy data_source_id từ base policy của các registered policies
    // Tạm thời return null để cho phép hiện tất cả data
    return null;
  }, [viewMode, allPoliciesData, farmIdToFetch]);

  // Group data by parameter
  const groupedData = useMemo(() => {
    if (!monitoringData?.monitoring_data) return {};

    // Policy mode: kiểm tra status trước
    if (viewMode === "policy" && !isPolicyStatusValid) {
      return {};
    }

    // Farm mode: chỉ hiện data nếu có policy active/pending_cancel
    if (viewMode === "farm" && allowedDataSourceIds !== null) {
      // Nếu allowedDataSourceIds là empty array -> không có policy hợp lệ
      if (allowedDataSourceIds.length === 0) {
        return {};
      }
      // TODO: Filter theo data_source_id khi có thông tin đầy đủ từ base policy
    }

    const grouped: Record<string, MonitoringDataItem[]> = {};

    monitoringData.monitoring_data.forEach((item) => {
      const param = item.parameter_name;
      if (!grouped[param]) {
        grouped[param] = [];
      }
      grouped[param].push(item);
    });

    return grouped;
  }, [monitoringData, viewMode, allowedDataSourceIds, isPolicyStatusValid]);

  // Get data for selected parameter or all
  const displayData = useMemo(() => {
    if (selectedParameter && groupedData[selectedParameter]) {
      return { [selectedParameter]: groupedData[selectedParameter] };
    }
    return groupedData;
  }, [selectedParameter, groupedData]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const isLoading =
    (viewMode === "policy"
      ? isPolicyLoading || isBasePolicyLoading || isFarmLoading
      : isFarmLoading) || isMonitorLoading;
  const hasError =
    (viewMode === "policy"
      ? policyError || basePolicyError || farmError
      : farmError) || monitorError;

  return (
    <Box flex={1} bg={colors.background}>
      {/* Header */}
      <AgrisaHeader
        title={
          viewMode === "farm"
            ? "Dữ liệu vệ tinh nông trại"
            : "Dữ liệu vệ tinh hợp đồng"
        }
        onBack={() => router.back()}
      />

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}
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
                Đang tải dữ liệu vệ tinh...
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
              {/* Info banner */}
              {farmDetail && (
                <Text
                  fontSize="$sm"
                  color={colors.secondary_text}
                  textAlign="center"
                >
                  {viewMode === "policy"
                    ? `Bạn đang xem dữ liệu vệ tinh của nông trại ${farmDetail.farm_name}`
                    : `Bạn đang xem dữ liệu vệ tinh của nông trại ${farmDetail.farm_name}`}
                </Text>
              )}

              {/* Time range selector */}
              <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />

              {/* Parameter filter - CHỈ hiện khi ở FARM mode để chọn parameter */}
              {viewMode === "farm" && Object.keys(groupedData).length > 0 && (
                <ParameterFilter
                  selected={selectedParameter}
                  onSelect={setSelectedParameter}
                  options={Object.keys(groupedData).map((param) => ({
                    value: param,
                    label: getParameterLabel(param),
                    color: getParameterColor(param, colors.primary),
                  }))}
                />
              )}

              {/* Hướng dẫn sử dụng */}
              {Object.keys(displayData).length > 0 && (
                <Box
                  bg={colors.card_surface}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <HStack space="sm" alignItems="center">
                    <Info
                      size={14}
                      color={colors.secondary_text}
                      strokeWidth={2}
                    />
                    <Text fontSize="$xs" color={colors.secondary_text} flex={1}>
                      Nhấn vào điểm trên biểu đồ để xem chi tiết dữ liệu đo
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* Charts */}
              {Object.keys(displayData).length === 0 ? (
                <Box py="$8" px="$4" alignItems="center">
                  <Box
                    bg={colors.card_surface}
                    p="$8"
                    borderRadius="$2xl"
                    mb="$4"
                    borderWidth={1}
                    borderColor={colors.frame_border}
                  >
                    <Satellite
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
                    {viewMode === "farm" &&
                    allowedDataSourceIds !== null &&
                    allowedDataSourceIds.length === 0
                      ? "Không có dữ liệu"
                      : viewMode === "policy" && !isPolicyStatusValid
                        ? "Không thể xem dữ liệu"
                        : "Chưa có dữ liệu"}
                  </Text>
                  <Text
                    fontSize="$sm"
                    color={colors.secondary_text}
                    textAlign="center"
                    lineHeight={20}
                    maxWidth={280}
                  >
                    {viewMode === "farm" &&
                    allowedDataSourceIds !== null &&
                    allowedDataSourceIds.length === 0
                      ? "Nông trại này chưa có hợp đồng bảo hiểm đang hoạt động. Vui lòng đăng ký bảo hiểm để xem dữ liệu vệ tinh."
                      : viewMode === "policy" && !isPolicyStatusValid
                        ? "Hợp đồng bảo hiểm này không ở trạng thái hoạt động. Chỉ có thể xem dữ liệu vệ tinh khi hợp đồng đang hoạt động hoặc chờ xử lý hủy."
                        : "Đang cập nhật dữ liệu vệ tinh cho nông trại của bạn. Vui lòng quay lại sau."}
                  </Text>
                </Box>
              ) : (
                <VStack space="xl">
                  {Object.entries(displayData).map(([param, items]) => {
                    // Tìm unit từ item đầu tiên
                    const unit = items[0]?.unit || "";

                    return (
                      <Box key={param}>
                        <MonitorChart
                          data={items}
                          parameterName={param}
                          unit={unit}
                        />
                      </Box>
                    );
                  })}
                </VStack>
              )}

              {/* Farm info - Hiện ở dưới cùng */}
              {farmDetail && (
                <Box
                  bg={colors.card_surface}
                  borderRadius="$lg"
                  p="$4"
                  borderWidth={1}
                  borderColor={colors.frame_border}
                >
                  <VStack space="md">
                    {/* Heading H1 */}
                    <Heading size="lg" color={colors.primary_text}>
                      Thông tin nông trại
                    </Heading>

                    {/* Divider */}
                    <Divider bg={colors.frame_border} />

                    {/* Farm name */}
                    <HStack space="sm" alignItems="center">
                      <VStack flex={1}>
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          Tên nông trại
                        </Text>
                        <Text
                          fontSize="$md"
                          fontWeight="$bold"
                          color={colors.primary_text}
                        >
                          {farmDetail.farm_name}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Farm details grid */}
                    <VStack space="sm">
                      <HStack space="xs" alignItems="center">
                        <MapPin
                          size={14}
                          color={colors.secondary_text}
                          strokeWidth={2}
                        />
                        <Text fontSize="$sm" color={colors.secondary_text}>
                          {farmDetail.province}, {farmDetail.district}
                        </Text>
                      </HStack>

                      <HStack space="md">
                        <VStack flex={1}>
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Diện tích
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {farmDetail.area_sqm} ha
                          </Text>
                        </VStack>
                        <VStack flex={1}>
                          <Text fontSize="$xs" color={colors.secondary_text}>
                            Loại cây
                          </Text>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {Utils.getCropLabel(farmDetail.crop_type)}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Thông tin ngày trồng và thu hoạch */}
                      <HStack space="md">
                        <VStack flex={1}>
                          <HStack space="xs" alignItems="center" mb="$1">
                            <Calendar size={12} color={colors.secondary_text} />
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Ngày dự kiến gieo trồng
                            </Text>
                          </HStack>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {farmDetail.planting_date
                              ? Utils.formatDateForMS(farmDetail.planting_date)
                              : "Chưa cập nhật"}
                          </Text>
                        </VStack>
                        <VStack flex={1}>
                          <HStack space="xs" alignItems="center" mb="$1">
                            <Calendar size={12} color={colors.secondary_text} />
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Dự kiến thu hoạch
                            </Text>
                          </HStack>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {farmDetail.expected_harvest_date
                              ? Utils.formatDateForMS(
                                  farmDetail.expected_harvest_date
                                )
                              : "Chưa cập nhật"}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Thông tin hệ thống tưới và loại đất */}
                      <HStack space="md">
                        <VStack flex={1}>
                          <HStack space="xs" alignItems="center" mb="$1">
                            <Droplets size={12} color={colors.secondary_text} />
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Hệ thống tưới
                            </Text>
                          </HStack>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {farmDetail.has_irrigation
                              ? farmDetail.irrigation_type
                              : "Không có"}
                          </Text>
                        </VStack>
                        <VStack flex={1}>
                          <HStack space="xs" alignItems="center" mb="$1">
                            <Mountain size={12} color={colors.secondary_text} />
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              Loại đất
                            </Text>
                          </HStack>
                          <Text
                            fontSize="$sm"
                            fontWeight="$semibold"
                            color={colors.primary_text}
                          >
                            {farmDetail.soil_type}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Registered policies for farm mode */}
                    {viewMode === "farm" && allPoliciesData?.success && (
                      <>
                        <Divider bg={colors.frame_border} my="$3" />

                        <VStack space="sm">
                          <HStack space="xs" alignItems="center">
                            <FileText
                              size={16}
                              color={colors.primary}
                              strokeWidth={2}
                            />
                            <Text
                              fontSize="$sm"
                              fontWeight="$bold"
                              color={colors.primary_text}
                            >
                              Bảo hiểm đã đăng ký (
                              {
                                allPoliciesData.data.policies.filter(
                                  (p: any) =>
                                    p.farm_id === farmDetail.id &&
                                    p.status === "active"
                                ).length
                              }
                              )
                            </Text>
                          </HStack>

                          {allPoliciesData.data.policies
                            .filter(
                              (p: any) =>
                                p.farm_id === farmDetail.id &&
                                p.status === "active"
                            )
                            .map((policy: any) => (
                              <Box
                                key={policy.id}
                                bg={colors.background}
                                borderRadius="$md"
                                p="$3"
                                borderWidth={1}
                                borderColor={colors.frame_border}
                              >
                                <VStack space="xs">
                                  <HStack justifyContent="space-between">
                                    <Text
                                      fontSize="$xs"
                                      color={colors.secondary_text}
                                    >
                                      Mã hợp đồng:
                                    </Text>
                                    <Text
                                      fontSize="$xs"
                                      fontWeight="$bold"
                                      color={colors.primary}
                                    >
                                      {policy.policy_number}
                                    </Text>
                                  </HStack>
                                  <HStack justifyContent="space-between">
                                    <Text
                                      fontSize="$xs"
                                      color={colors.secondary_text}
                                    >
                                      Trạng thái:
                                    </Text>
                                    <Text
                                      fontSize="$xs"
                                      fontWeight="$semibold"
                                      color={colors.success}
                                    >
                                      Đang có hiệu lực
                                    </Text>
                                  </HStack>
                                  {Object.keys(groupedData).length > 0 && (
                                    <VStack space="xs" mt="$1">
                                      <Text
                                        fontSize="$2xs"
                                        color={colors.secondary_text}
                                      >
                                        Chỉ số theo dõi:
                                      </Text>
                                      <HStack flexWrap="wrap" gap="$1">
                                        {Object.keys(groupedData).map(
                                          (param) => (
                                            <Box
                                              key={param}
                                              bg={
                                                getParameterColor(
                                                  param,
                                                  colors.primary
                                                ) + "15"
                                              }
                                              px="$2"
                                              py="$1"
                                              borderRadius="$sm"
                                            >
                                              <Text
                                                fontSize="$2xs"
                                                fontWeight="$semibold"
                                                color={getParameterColor(
                                                  param,
                                                  colors.primary
                                                )}
                                              >
                                                {getParameterLabel(param)}
                                              </Text>
                                            </Box>
                                          )
                                        )}
                                      </HStack>
                                    </VStack>
                                  )}
                                </VStack>
                              </Box>
                            ))}
                        </VStack>
                      </>
                    )}

                    {/* Policy info if in policy mode */}
                    {viewMode === "policy" &&
                      registeredPolicy &&
                      basePolicy && (
                        <>
                          <Divider bg={colors.frame_border} my="$3" />

                          <VStack space="sm">
                            <HStack space="xs" alignItems="center">
                              <Building2
                                size={16}
                                color={colors.primary}
                                strokeWidth={2}
                              />
                              <Text
                                fontSize="$sm"
                                fontWeight="$bold"
                                color={colors.primary_text}
                              >
                                Thông tin hợp đồng
                              </Text>
                            </HStack>

                            <Box
                              bg={colors.background}
                              borderRadius="$md"
                              p="$3"
                              borderWidth={1}
                              borderColor={colors.primary + "30"}
                            >
                              <VStack space="xs">
                                <HStack justifyContent="space-between">
                                  <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                  >
                                    Mã hợp đồng:
                                  </Text>
                                  <Text
                                    fontSize="$xs"
                                    fontWeight="$bold"
                                    color={colors.primary}
                                  >
                                    {registeredPolicy.policy_number}
                                  </Text>
                                </HStack>
                                <HStack justifyContent="space-between">
                                  <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                  >
                                    Tên bảo hiểm:
                                  </Text>
                                  <Text
                                    fontSize="$xs"
                                    fontWeight="$semibold"
                                    color={colors.primary_text}
                                  >
                                    {basePolicy.base_policy.product_name}
                                  </Text>
                                </HStack>
                                <HStack justifyContent="space-between">
                                  <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                  >
                                    Nhà bảo hiểm:
                                  </Text>
                                  <Text
                                    fontSize="$xs"
                                    fontWeight="$semibold"
                                    color={colors.primary_text}
                                  >
                                    {
                                      basePolicy.base_policy
                                        .insurance_provider_id
                                    }
                                  </Text>
                                </HStack>
                                <HStack justifyContent="space-between">
                                  <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                  >
                                    Trạng thái:
                                  </Text>
                                  <Text
                                    fontSize="$xs"
                                    fontWeight="$semibold"
                                    color={
                                      registeredPolicy.status === "active"
                                        ? colors.success
                                        : registeredPolicy.status ===
                                              "pending_review" ||
                                            registeredPolicy.status ===
                                              "pending_payment"
                                          ? colors.warning
                                          : colors.error
                                    }
                                  >
                                    {registeredPolicy.status === "active"
                                      ? "Đang có hiệu lực"
                                      : registeredPolicy.status ===
                                          "pending_review"
                                        ? "Chờ xét duyệt"
                                        : registeredPolicy.status ===
                                            "pending_payment"
                                          ? "Chờ thanh toán"
                                          : registeredPolicy.status ===
                                              "rejected"
                                            ? "Từ chối"
                                            : registeredPolicy.status ===
                                                "cancelled"
                                              ? "Đã hủy"
                                              : "Hết hạn"}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          </VStack>
                        </>
                      )}

                    {/* Section Hình ảnh vệ tinh - Dẫn đến trang riêng */}
                    <Divider bg={colors.frame_border} my="$3" />

                    <Pressable
                      onPress={() => {
                        router.push({
                          pathname: "/(farmer)/satellite/[id]/images",
                          params: {
                            id: farmIdToFetch || id,
                            policy_id: policy_id || "",
                            mode: viewMode,
                          },
                        });
                      }}
                    >
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                        bg={colors.background}
                        borderRadius="$lg"
                        p="$4"
                        borderWidth={1}
                        borderColor={colors.frame_border}
                      >
                        <HStack space="sm" alignItems="center" flex={1}>
                          <Box
                            bg={colors.primary + "15"}
                            p="$2"
                            borderRadius="$full"
                          >
                            <ImageIcon
                              size={20}
                              color={colors.primary}
                              strokeWidth={2}
                            />
                          </Box>
                          <VStack flex={1}>
                            <Text
                              fontSize="$sm"
                              fontWeight="$bold"
                              color={colors.primary_text}
                            >
                              Hình ảnh vệ tinh
                            </Text>
                            <Text fontSize="$xs" color={colors.secondary_text}>
                              {satelliteImagesCount > 0
                                ? `${satelliteImagesCount} ảnh có sẵn`
                                : "Chưa có ảnh"}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack space="sm" alignItems="center">
                          {satelliteImagesCount > 0 && (
                            <Box
                              bg={colors.primary}
                              borderRadius="$full"
                              px="$2"
                              py="$0.5"
                            >
                              <Text
                                fontSize="$2xs"
                                fontWeight="$bold"
                                color={colors.primary_white_text}
                              >
                                {satelliteImagesCount}
                              </Text>
                            </Box>
                          )}
                          <ChevronRight
                            size={20}
                            color={colors.secondary_text}
                            strokeWidth={2}
                          />
                        </HStack>
                      </HStack>
                    </Pressable>
                  </VStack>
                </Box>
              )}
            </>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Utils } from "@/libs/utils/utils";
import { Box, Divider, HStack, Text, VStack } from "@gluestack-ui/themed";
import { Clock } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MonitoringDataItem } from "../models/data-monitor.model";
import {
  analyzeCloudCover,
  analyzeConfidence,
  analyzeDataQuality,
  analyzeMeasurementSource,
  analyzeRange,
} from "../utils/dataAnalysisUtils";
import { getParameterColor, getParameterLabel } from "../utils/parameterUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface MonitorChartProps {
  data: MonitoringDataItem[];
  parameterName: string;
  unit: string;
}

/**
 * Component hiển thị biểu đồ monitor data theo phong cách chứng khoán
 */
export const MonitorChart: React.FC<MonitorChartProps> = ({
  data,
  parameterName,
  unit,
}) => {
  const { colors } = useAgrisaColors();
  const [selectedPoint, setSelectedPoint] = useState<MonitoringDataItem | null>(
    null
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Sắp xếp data theo thời gian
  const sortedData = [...data].sort(
    (a, b) => a.measurement_timestamp - b.measurement_timestamp
  );

  // Lấy giá trị cho chart
  const values = sortedData.map((item) => item.measured_value);
  const labels = sortedData.map((item) =>
    Utils.formatDateForMS(item.measurement_timestamp)
  );

  // Tính toán thống kê
  const currentValue = values[values.length - 1] || 0;
  const previousValue = values[values.length - 2] || currentValue;
  const change = currentValue - previousValue;
  const changePercent =
    previousValue !== 0 ? ((change / previousValue) * 100).toFixed(2) : "0";
  const isPositive = change >= 0;

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(
    2
  );
  const rangeValue = (maxValue - minValue).toFixed(2);
  const rangeAnalysis = analyzeRange(maxValue, minValue, parseFloat(avgValue));
  const lastUpdate = sortedData[sortedData.length - 1]?.measurement_timestamp;

  // Lấy màu và label cho parameter
  const parameterColor = getParameterColor(parameterName, colors.success);
  const parameterLabel = getParameterLabel(parameterName);

  // Config cho chart
  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.card_surface,
    backgroundGradientTo: colors.card_surface,
    decimalPlaces: 2,
    color: (opacity = 1) => {
      // Convert hex to rgba
      const hex = parameterColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => colors.secondary_text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "3",
      stroke: parameterColor,
      fill: colors.card_surface,
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // Solid lines
      stroke: colors.frame_border,
      strokeWidth: 1,
    },
  };

  const handleDataPointClick = (data: any) => {
    const index = data.index;
    if (sortedData[index]) {
      setSelectedPoint(sortedData[index]);
      setSelectedIndex(index);
    }
  };

  return (
    <VStack space="md">
      {/* Thông tin chung - Header và Stats */}
      <Box
        bg={colors.card_surface}
        borderRadius="$lg"
        p="$4"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <VStack space="sm">
          {/* Header với tên parameter và timestamp */}
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Text fontSize="$md" fontWeight="$bold" color={colors.primary_text}>
                {parameterLabel}
              </Text>
              <Box
                bg={colors.primary + "15"}
                px="$2"
                py="$1"
                borderRadius="$sm"
              >
                <Text fontSize="$2xs" fontWeight="$semibold" color={colors.primary}>
                  {unit}
                </Text>
              </Box>
            </HStack>
            {lastUpdate && (
              <HStack space="xs" alignItems="center">
                <Clock size={12} color={colors.secondary_text} />
                <Text fontSize="$2xs" color={colors.secondary_text}>
                  {Utils.formatDateTimeForMS(lastUpdate)}
                </Text>
              </HStack>
            )}
          </HStack>

          <Divider bg={colors.frame_border} my="$2" />
          
          {/* Stats ngang - 4 cột */}
          <HStack space="md" mt="$1">
            <VStack flex={1} alignItems="center">
              <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
                Cao nhất
              </Text>
              <Text fontSize="$md" fontWeight="$bold" color={colors.success}>
                {maxValue}
              </Text>
            </VStack>
            
            <VStack flex={1} alignItems="center">
              <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
                Trung bình
              </Text>
              <Text fontSize="$md" fontWeight="$bold" color={colors.primary}>
                {avgValue}
              </Text>
            </VStack>
            
            <VStack flex={1} alignItems="center">
              <Text fontSize="$xs" color={colors.secondary_text} mb="$1">
                Thấp nhất
              </Text>
              <Text fontSize="$md" fontWeight="$bold" color={colors.error}>
                {minValue}
              </Text>
            </VStack>
            
            <VStack alignItems="center">
              <Text fontSize="$xs" color={colors.secondary_text} mb="$1" textAlign="center">
                Mức độ đồng đều
              </Text>
              <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text} textAlign="center">
                {rangeAnalysis}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* Biểu đồ - Ở GIỮA */}
      <Box
        bg={colors.card_surface}
        borderRadius="$lg"
        overflow="hidden"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels:
                labels.length > 12
                  ? labels.filter((_, i) => i % Math.ceil(labels.length / 12) === 0)
                  : labels,
              datasets: [
                {
                  data: values,
                  color: (opacity = 1) => colors.success,
                  strokeWidth: 3,
                },
              ],
            }}
            width={Math.max(SCREEN_WIDTH, values.length * 120)}
            height={320}
            chartConfig={chartConfig}
            bezier
            style={{
              borderRadius: 12,
              marginLeft: -20, // Bỏ padding trái
            }}
            withVerticalLines={true}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            onDataPointClick={handleDataPointClick}
            formatYLabel={(value) => parseFloat(value).toFixed(1)}
            getDotColor={(dataPoint, dataPointIndex) => {
              // Highlight điểm được chọn
              return dataPointIndex === selectedIndex ? colors.warning : parameterColor;
            }}
            getDotProps={(dataPoint, index) => {
              // Làm to điểm được chọn
              if (index === selectedIndex) {
                return {
                  r: "10",
                  strokeWidth: "4",
                  stroke: colors.warning,
                  fill: colors.card_surface,
                };
              }
              return {
                r: "6",
                strokeWidth: "3",
                stroke: parameterColor,
                fill: colors.card_surface,
              };
            }}
          />
        </ScrollView>

        {/* Tooltip khi chọn điểm - CÓ PHÂN TÍCH VIỆT HÓA */}
        {selectedPoint && (
          <Box
            bg={colors.background}
            p="$4"
            borderTopWidth={1}
            borderTopColor={colors.frame_border}
          >
            <VStack space="sm">
              {/* Thời gian */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Thời gian đo:
                </Text>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
                  {Utils.formatDateTimeForMS(selectedPoint.measurement_timestamp)}
                </Text>
              </HStack>

              {/* Giá trị */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>
                  Giá trị đo:
                </Text>
                <Text fontSize="$lg" fontWeight="$bold" color={colors.primary}>
                  {selectedPoint.measured_value.toFixed(3)} {unit}
                </Text>
              </HStack>

             

              {/* Thống kê vùng đo - Phân tích */}
              <Box
                bg={colors.primary + "10"}
                p="$3"
                borderRadius="$md"
                borderWidth={1}
                borderColor={colors.primary + "30"}
              >
                <Text fontSize="$xs" fontWeight="$bold" color={colors.primary} mb="$2">
                  Tình trạng {parameterLabel} theo chỉ số:
                </Text>
                
                <VStack space="xs">
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Cao nhất:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.primary_text}>
                      {selectedPoint.component_data.statistics.max.toFixed(3)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Trung vị:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.primary_text}>
                      {selectedPoint.component_data.statistics.median.toFixed(3)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Thấp nhất:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.primary_text}>
                      {selectedPoint.component_data.statistics.min.toFixed(3)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Độ lệch:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.primary_text}>
                      {selectedPoint.component_data.statistics.stddev.toFixed(3)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Divider bg={colors.frame_border} my="$2" />

              {/* Chất lượng dữ liệu - Có phân tích */}
              <Box
                bg={colors.success + "10"}
                p="$3"
                borderRadius="$md"
                borderWidth={1}
                borderColor={colors.success + "30"}
              >
                <Text fontSize="$xs" fontWeight="$bold" color={colors.success} mb="$2">
                  Đánh giá dữ liệu:
                </Text>
                <Divider bg={colors.frame_border + "50"} mb="$2" />
                <VStack space="xs">
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Chất lượng:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.success}>
                      {analyzeDataQuality(selectedPoint.data_quality)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Độ tin cậy:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.success}>
                      {(selectedPoint.confidence_score * 100).toFixed(0)}% ({analyzeConfidence(selectedPoint.confidence_score)})
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Mây che phủ:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.warning}>
                      {selectedPoint.cloud_cover_percentage.toFixed(0)}% ({analyzeCloudCover(selectedPoint.cloud_cover_percentage)})
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      - Nguồn dữ liệu:
                    </Text>
                    <Text fontSize="$xs" fontWeight="$semibold" color={colors.primary}>
                      {analyzeMeasurementSource(selectedPoint.measurement_source)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}
      </Box>
    </VStack>
  );
};

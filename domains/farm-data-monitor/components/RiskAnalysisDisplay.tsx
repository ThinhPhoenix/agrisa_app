import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useRiskAnalyze } from "@/domains/farm-data-monitor/hooks/use-risk-analyze";
import { RiskAnalysisHelper } from "@/domains/farm-data-monitor/utils/risk-analysis-helper";
import {
    Box,
    HStack,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import {
    Activity,
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Search,
    Shield,
    ShieldCheck,
    XCircle
} from "lucide-react-native";
import React from "react";

interface RiskAnalysisDisplayProps {
  policyId: string;
  policyStatus: string;
  underwritingStatus: string;
}

/**
 * Component hiển thị Risk Analysis
 * Thay thế phần "Giám sát và phân tích" trong detail-registered-policy
 */
export const RiskAnalysisDisplay: React.FC<RiskAnalysisDisplayProps> = ({
  policyId,
  policyStatus,
  underwritingStatus,
}) => {
  const { colors } = useAgrisaColors();
  const { getRiskAnalyzeByPolicy } = useRiskAnalyze();

  // Fetch risk analysis data
  const { data, isLoading } = getRiskAnalyzeByPolicy(policyId, {
    enabled: RiskAnalysisHelper.shouldDisplayRiskAnalysis(
      policyStatus,
      underwritingStatus
    ),
  });

  // Không hiển thị nếu không thỏa điều kiện
  if (
    !RiskAnalysisHelper.shouldDisplayRiskAnalysis(
      policyStatus,
      underwritingStatus
    )
  ) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        bg={colors.card_surface}
        borderRadius="$2xl"
        p="$5"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <HStack space="sm" alignItems="center" justifyContent="center">
          <Spinner size="small" color={colors.primary} />
          <Text fontSize="$sm" color={colors.secondary_text}>
            Đang tải phân tích rủi ro...
          </Text>
        </HStack>
      </Box>
    );
  }

  // No data hoặc risk_analyses là null
  if (!data?.success || !data.data?.risk_analyses) {
    return (
      <Box
        bg={colors.card_surface}
        borderRadius="$2xl"
        p="$5"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <VStack space="md" alignItems="center">
          <Box
            bg={colors.background}
            borderRadius="$full"
            p="$4"
            alignItems="center"
            justifyContent="center"
          >
            <AlertCircle size={32} color={colors.muted_text} strokeWidth={2} />
          </Box>
          <VStack space="xs" alignItems="center">
            <Text
              fontSize="$md"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Chưa có phân tích rủi ro
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
              lineHeight="$lg"
              px="$4"
            >
              Hệ thống chưa thực hiện phân tích rủi ro cho hợp đồng này. Thông
              tin sẽ được cập nhật sau.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // risk_analyses có data nhưng là mảng rỗng
  if (data.data.risk_analyses.length === 0) {
    return (
      <Box
        bg={colors.card_surface}
        borderRadius="$2xl"
        p="$5"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <VStack space="md" alignItems="center">
          <Box
            bg={colors.background}
            borderRadius="$full"
            p="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Clock size={32} color={colors.pending} strokeWidth={2} />
          </Box>
          <VStack space="xs" alignItems="center">
            <Text
              fontSize="$md"
              fontWeight="$bold"
              color={colors.primary_text}
              textAlign="center"
            >
              Đang chờ phân tích
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
              lineHeight="$lg"
              px="$4"
            >
              Hợp đồng của bạn đang trong quá trình phân tích rủi ro. Vui lòng
              quay lại sau để xem kết quả.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Lấy analysis mới nhất
  const latestAnalysis = RiskAnalysisHelper.getLatestAnalysis(
    data.data.risk_analyses
  );

  if (!latestAnalysis) return null;

  // Lấy summary
  const summary = RiskAnalysisHelper.getAnalysisSummary(latestAnalysis);
  if (!summary) return null;

  // Icon cho status
  const StatusIconMap = {
    "check-circle": CheckCircle2,
    "x-circle": XCircle,
    clock: Clock,
    search: Search,
  };

  const statusIconName = RiskAnalysisHelper.getAnalysisStatusIcon(
    latestAnalysis.analysis_status
  );
  const StatusIcon = StatusIconMap[statusIconName as keyof typeof StatusIconMap];

  // Icon cho risk level
  const RiskIconMap = {
    "shield-check": ShieldCheck,
    shield: Shield,
    "alert-triangle": AlertTriangle,
    "alert-circle": AlertCircle,
    "alert-octagon": AlertOctagon,
  };

  const riskIconName = RiskAnalysisHelper.getRiskLevelIcon(
    latestAnalysis.overall_risk_level
  );
  const RiskIcon = RiskIconMap[riskIconName as keyof typeof RiskIconMap];

  const riskColor =
    colors[
      RiskAnalysisHelper.getRiskLevelColor(
        latestAnalysis.overall_risk_level
      ) as keyof typeof colors
    ];

  const statusColor =
    latestAnalysis.analysis_status === "passed"
      ? colors.success
      : latestAnalysis.analysis_status === "failed"
        ? colors.error
        : colors.pending;

  return (
    <Box
      bg={colors.card_surface}
      borderRadius="$2xl"
      borderWidth={1}
      borderColor={colors.frame_border}
      p="$5"
    >
      <VStack space="md">
        {/* Header */}
        <HStack alignItems="center" space="sm" justifyContent="center">
          <Activity size={16} color={colors.info} strokeWidth={2} />
          <Text fontSize="$lg" fontWeight="$bold" color={colors.primary_text}>
            Phân tích Rủi ro Bảo hiểm
          </Text>
        </HStack>

        <Box height={1} bg={colors.frame_border} width="100%" />

        {/* Thông tin cơ bản */}
        <VStack space="sm">
          {/* Nguồn phân tích */}
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$xs" color={colors.secondary_text}>
              Nguồn phân tích
            </Text>
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
              flex={1}
              textAlign="right"
            >
              {summary.type === "manual" ? "Đánh giá thủ công" : "AI Analyzer"}
            </Text>
          </HStack>

          {/* Thời gian */}
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$xs" color={colors.secondary_text}>
              Thời gian phân tích
            </Text>
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              {summary.timestamp}
            </Text>
          </HStack>

          {/* Trạng thái và Mức độ rủi ro */}
          <HStack space="sm">
            <Box
              flex={1}
              bg={colors.background}
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor={statusColor}
            >
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <StatusIcon size={14} color={statusColor} strokeWidth={2} />
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Trạng thái phân tích
                  </Text>
                </HStack>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={statusColor}
                  textAlign="center"
                >
                  {summary.status}
                </Text>
              </VStack>
            </Box>

            <Box
              flex={1}
              bg={colors.background}
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor={riskColor}
            >
              <VStack space="xs" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <RiskIcon size={14} color={riskColor} strokeWidth={2} />
                  <Text fontSize="$xs" color={colors.secondary_text}>
                    Rủi ro
                  </Text>
                </HStack>
                <Text
                  fontSize="$sm"
                  fontWeight="$bold"
                  color={riskColor}
                  textAlign="center"
                >
                  {summary.riskLevel}
                </Text>
              </VStack>
            </Box>
          </HStack>

          {/* Điểm rủi ro tổng thể */}
          <Box
            bg={colors.background}
            borderRadius="$lg"
            p="$3"
            borderWidth={1}
            borderColor={riskColor}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$sm" color={colors.secondary_text}>
                Điểm rủi ro tổng thể
              </Text>
              <Text fontSize="$xl" fontWeight="$bold" color={riskColor}>
                {summary.riskScore}
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Phần đặc biệt cho AI Analysis */}
        {summary.type === "ai" && (
          <>
            <Box height={1} bg={colors.frame_border} width="100%" />

            {/* Quyết định underwriting */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Quyết định:
              </Text>
              <Box bg={colors.background} borderRadius="$lg" p="$3">
                <VStack space="xs">
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Khuyến nghị
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      color={
                        summary.decision.recommendation === "Phê duyệt"
                          ? colors.success
                          : summary.decision.recommendation === "Từ chối"
                            ? colors.error
                            : colors.warning
                      }
                    >
                      {summary.decision.recommendation}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="$xs" color={colors.secondary_text}>
                      Độ tin cậy
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color={colors.primary_text}
                    >
                      {summary.decision.confidence}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Lý do */}
              <Box bg={colors.background} borderRadius="$lg" p="$3">
                <Text
                  fontSize="$xs"
                  color={colors.primary_text}
                  lineHeight="$lg"
                >
                  {summary.decision.reasoning}
                </Text>
              </Box>
            </VStack>

            {/* Điểm số chi tiết */}
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Phân tích chi tiết:
              </Text>
              <VStack space="xs">
                {[
                  { label: "Đặc điểm nông trại", score: summary.farmScore },
                  { label: "Rủi ro gian lận", score: summary.fraudScore },
                  {
                    label: "Hiệu suất lịch sử",
                    score: summary.performanceScore,
                  },
                  {
                    label: "Cấu hình điều kiện",
                    score: summary.triggerScore,
                  },
                ].map((item, index) => {
                  const scoreColor =
                    item.score < 30
                      ? colors.success
                      : item.score < 60
                        ? colors.warning
                        : colors.error;

                  return (
                    <Box
                      key={index}
                      bg={colors.background}
                      borderRadius="$lg"
                      p="$2"
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="$xs" color={colors.secondary_text}>
                          {item.label}
                        </Text>
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color={scoreColor}
                        >
                          {RiskAnalysisHelper.formatScoreValue(item.score)}
                        </Text>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </VStack>
          </>
        )}

        {/* Hành động đề xuất */}
        {summary.actions.length > 0 && (
          <>
            <Box height={1} bg={colors.frame_border} width="100%" />
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Đề xuất:
              </Text>
              {summary.actions.map((action, index) => (
                <Box
                  key={index}
                  bg={colors.background}
                  borderRadius="$lg"
                  p="$3"
                >
                  <HStack space="xs" alignItems="flex-start">
                    
                    <Text
                      fontSize="$xs"
                      color={colors.primary_text}
                      lineHeight="$lg"
                      flex={1}
                    >
                      {action}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </>
        )}

        {/* Ghi chú */}
        {summary.notes && (
          <>
            <Box height={1} bg={colors.frame_border} width="100%" />
            <VStack space="xs">
              <Text
                fontSize="$sm"
                fontWeight="$bold"
                color={colors.primary_text}
              >
                Ghi chú:
              </Text>
              <Box bg={colors.background} borderRadius="$lg" p="$3">
                <Text
                  fontSize="$xs"
                  color={colors.secondary_text}
                  lineHeight="$lg"
                >
                  {summary.notes}
                </Text>
              </Box>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

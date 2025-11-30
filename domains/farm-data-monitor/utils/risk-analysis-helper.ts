import {
    AIIdentifiedRisks,
    AIRecommendations,
    ANALYSIS_STATUS_LABELS,
    isAIAnalysis,
    isManualAnalysis,
    ManualIdentifiedRisks,
    ManualRecommendations,
    OverallRiskLevel,
    RISK_LEVEL_COLORS,
    RISK_LEVEL_LABELS,
    RiskAnalysis,
    RiskLevel,
    UNDERWRITING_DECISION_LABELS,
} from "../models/risk-analyze.model";

/**
 * Helper class để xử lý và format Risk Analysis data
 */
export class RiskAnalysisHelper {
  /**
   * Lấy màu sắc tương ứng với mức độ rủi ro
   */
  static getRiskLevelColor(level: RiskLevel | OverallRiskLevel): string {
    return RISK_LEVEL_COLORS[level];
  }

  /**
   * Lấy nhãn tiếng Việt cho mức độ rủi ro
   */
  static getRiskLevelLabel(level: RiskLevel | OverallRiskLevel): string {
    return RISK_LEVEL_LABELS[level];
  }

  /**
   * Lấy nhãn tiếng Việt cho trạng thái phân tích
   */
  static getAnalysisStatusLabel(
    status: "passed" | "failed" | "pending" | "under_review"
  ): string {
    return ANALYSIS_STATUS_LABELS[status];
  }

  /**
   * Format điểm rủi ro (0-1) thành phần trăm
   */
  static formatRiskScore(score: number): string {
    return `${(score * 100).toFixed(1)}%`;
  }

  /**
   * Format timestamp thành ngày giờ
   */
  static formatAnalysisTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Kiểm tra xem có nên hiển thị risk analysis không
   * Chỉ hiển thị khi:
   * - Status là pending_payment, rejected, active
   * - Underwriting status là approved hoặc rejected
   */
  static shouldDisplayRiskAnalysis(
    policyStatus: string,
    underwritingStatus: string
  ): boolean {
    const validPolicyStatuses = ["pending_payment", "rejected", "active"];
    const validUnderwritingStatuses = ["approved", "rejected"];

    return (
      validPolicyStatuses.includes(policyStatus) &&
      validUnderwritingStatuses.includes(underwritingStatus)
    );
  }

  /**
   * Lấy phân tích mới nhất từ danh sách
   */
  static getLatestAnalysis(analyses: RiskAnalysis[]): RiskAnalysis | null {
    if (!analyses || analyses.length === 0) return null;

    return analyses.reduce((latest, current) => {
      return current.analysis_timestamp > latest.analysis_timestamp
        ? current
        : latest;
    });
  }

  /**
   * Tạo summary cho Manual Analysis
   */
  static getManualAnalysisSummary(analysis: RiskAnalysis): {
    type: "manual";
    source: string;
    status: string;
    riskLevel: string;
    riskScore: string;
    timestamp: string;
    notes?: string;
    actions: string[];
  } | null {
    if (!isManualAnalysis(analysis)) return null;

    const risks = analysis.identified_risks as ManualIdentifiedRisks;
    const recommendations = analysis.recommendations as ManualRecommendations;

    return {
      type: "manual",
      source: analysis.analysis_source,
      status: this.getAnalysisStatusLabel(analysis.analysis_status),
      riskLevel: this.getRiskLevelLabel(analysis.overall_risk_level),
      riskScore: this.formatRiskScore(analysis.overall_risk_score),
      timestamp: this.formatAnalysisTimestamp(analysis.analysis_timestamp),
      notes: analysis.analysis_notes,
      actions: recommendations.suggested_actions || [],
    };
  }

  /**
   * Tạo summary cho AI Analysis
   */
  static getAIAnalysisSummary(analysis: RiskAnalysis): {
    type: "ai";
    source: string;
    status: string;
    riskLevel: string;
    riskScore: string;
    timestamp: string;
    notes?: string;
    decision: {
      recommendation: string;
      reasoning: string;
      confidence: string;
    };
    actions: string[];
    verifications?: string[];
    farmScore: number;
    fraudScore: number;
    performanceScore: number;
    triggerScore: number;
  } | null {
    if (!isAIAnalysis(analysis)) return null;

    const risks = analysis.identified_risks as AIIdentifiedRisks;
    const recommendations = analysis.recommendations as AIRecommendations;
    const rawOutput = analysis.raw_output;

    return {
      type: "ai",
      source: analysis.analysis_source,
      status: this.getAnalysisStatusLabel(analysis.analysis_status),
      riskLevel: this.getRiskLevelLabel(analysis.overall_risk_level),
      riskScore: this.formatRiskScore(analysis.overall_risk_score),
      timestamp: this.formatAnalysisTimestamp(analysis.analysis_timestamp),
      notes: analysis.analysis_notes,
      decision: {
        recommendation:
          UNDERWRITING_DECISION_LABELS[
            recommendations.underwriting_decision.recommendation
          ],
        reasoning: recommendations.underwriting_decision.reasoning,
        confidence: `${recommendations.underwriting_decision.confidence}%`,
      },
      actions: recommendations.suggested_actions,
      verifications: recommendations.required_verifications,
      farmScore: rawOutput?.farm_characteristics_score || 0,
      fraudScore: rawOutput?.fraud_risk_score || 0,
      performanceScore: rawOutput?.historical_performance_score || 0,
      triggerScore: rawOutput?.trigger_risk_score || 0,
    };
  }

  /**
   * Tạo summary chung cho bất kỳ loại analysis nào
   */
  static getAnalysisSummary(analysis: RiskAnalysis) {
    if (isManualAnalysis(analysis)) {
      return this.getManualAnalysisSummary(analysis);
    } else if (isAIAnalysis(analysis)) {
      return this.getAIAnalysisSummary(analysis);
    }
    return null;
  }

  /**
   * Lấy danh sách các rủi ro chính từ AI Analysis
   */
  static getMainRisksFromAI(analysis: RiskAnalysis): Array<{
    category: string;
    level: RiskLevel;
    score: number;
    description: string;
  }> {
    if (!isAIAnalysis(analysis)) return [];

    const risks = analysis.identified_risks as AIIdentifiedRisks;
    const mainRisks = [];

    // Farm Characteristics
    if (risks.farm_characteristics.factors.length > 0) {
      const topFactor = risks.farm_characteristics.factors.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      mainRisks.push({
        category: "Đặc điểm nông trại",
        level: topFactor.level,
        score: topFactor.score,
        description: topFactor.description,
      });
    }

    // Fraud Risk
    if (risks.fraud_risk.factors.length > 0) {
      const topFactor = risks.fraud_risk.factors.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      mainRisks.push({
        category: "Rủi ro gian lận",
        level: topFactor.level,
        score: topFactor.score,
        description: topFactor.description,
      });
    }

    // Historical Performance
    if (risks.historical_performance.factors.length > 0) {
      const topFactor = risks.historical_performance.factors.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      mainRisks.push({
        category: "Hiệu suất lịch sử",
        level: topFactor.level,
        score: topFactor.score,
        description: topFactor.description,
      });
    }

    // Trigger Risk
    if (risks.trigger_risk.factors.length > 0) {
      const topFactor = risks.trigger_risk.factors.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      mainRisks.push({
        category: "Cấu hình điều kiện",
        level: topFactor.level,
        score: topFactor.score,
        description: topFactor.description,
      });
    }

    return mainRisks;
  }

  /**
   * Kiểm tra xem có rủi ro nghiêm trọng không
   */
  static hasCriticalRisk(analysis: RiskAnalysis): boolean {
    return (
      analysis.overall_risk_level === "critical" ||
      analysis.analysis_status === "failed"
    );
  }

  /**
   * Lấy icon name cho analysis status
   */
  static getAnalysisStatusIcon(
    status: "passed" | "failed" | "pending" | "under_review"
  ): string {
    const iconMap = {
      passed: "check-circle",
      failed: "x-circle",
      pending: "clock",
      under_review: "search",
    };
    return iconMap[status];
  }

  /**
   * Lấy icon name cho risk level
   */
  static getRiskLevelIcon(level: RiskLevel | OverallRiskLevel): string {
    const iconMap = {
      low: "shield-check",
      moderate: "shield",
      medium: "alert-triangle",
      high: "alert-circle",
      critical: "alert-octagon",
    };
    return iconMap[level];
  }

  /**
   * Format số điểm (0-100) cho UI
   */
  static formatScoreValue(score: number): string {
    return score.toFixed(1);
  }

  /**
   * Lấy màu cho confidence level
   */
  static getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return "success";
    if (confidence >= 60) return "warning";
    return "error";
  }
}

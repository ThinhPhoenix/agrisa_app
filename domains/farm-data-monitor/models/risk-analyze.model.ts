// ============= RISK ANALYSIS MODELS =============

/**
 * Trạng thái phân tích rủi ro
 */
export type AnalysisStatus = "passed" | "failed" | "pending" | "under_review";

/**
 * Loại phân tích
 */
export type AnalysisType = "manual" | "ai_model";

/**
 * Mức độ rủi ro tổng thể
 */
export type OverallRiskLevel = "low" | "moderate" | "high" | "critical";

/**
 * Mức độ rủi ro cho từng yếu tố
 */
export type RiskLevel = "low" | "medium" | "high" | "critical";

// ============= MANUAL ANALYSIS MODELS =============

/**
 * Các rủi ro đã xác định (Manual Analysis)
 * Dùng cho phân tích thủ công bởi đối tác
 */
export type ManualIdentifiedRisks = {
  crop_health?: "excellent" | "good" | "fair" | "poor" | "critical";
  historical_claims?: "low" | "moderate" | "high" | "very_high";
  weather_risk?: "low" | "moderate" | "high" | "extreme";
  [key: string]: any; // Cho phép thêm các trường tùy chỉnh
};

/**
 * Khuyến nghị (Manual Analysis)
 */
export type ManualRecommendations = {
  monitoring_frequency?: "daily" | "weekly" | "bi-weekly" | "monthly";
  suggested_actions?: string[]; // Danh sách các hành động đề xuất
  [key: string]: any;
};

// ============= AI ANALYSIS MODELS =============

/**
 * Yếu tố rủi ro chi tiết (AI Analysis)
 */
export type RiskFactor = {
  factor: string; // Tên yếu tố (Geographic Risk, Infrastructure Quality, ...)
  description: string; // Mô tả chi tiết
  level: RiskLevel; // Mức độ rủi ro
  score: number; // Điểm số (0-100)
};

/**
 * Đặc điểm nông trại (AI Analysis)
 */
export type FarmCharacteristics = {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
};

/**
 * Rủi ro gian lận (AI Analysis)
 */
export type FraudRisk = {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
};

/**
 * Thống kê tham số
 */
export type ParameterStatistics = {
  count: number;
  max: number;
  mean: number;
  median: number;
  min: number;
  std_dev: number;
};

/**
 * Phân tích tham số
 */
export type ParameterAnalysis = {
  parameter: string; // ndmi, ndvi, rainfall, etc.
  statistics: ParameterStatistics;
  trend_analysis: string; // Phân tích xu hướng
  anomaly_detection: string; // Phát hiện bất thường
  data_quality_assessment: string; // Đánh giá chất lượng dữ liệu
};

/**
 * Hiệu suất lịch sử (AI Analysis)
 */
export type HistoricalPerformance = {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
  parameter_analysis?: ParameterAnalysis[]; // Chi tiết phân tích các tham số
};

/**
 * Kết quả mô phỏng trigger
 */
export type TriggerSimulationResult = {
  condition_id: string; // ID của điều kiện
  parameter_name: string; // Tên tham số (ndmi, ndvi, ...)
  historical_breaches: number; // Số lần vi phạm trong lịch sử
  breach_dates: string[]; // Ngày vi phạm
  proximity_to_threshold: string; // Khoảng cách đến ngưỡng
  assessment: string; // Đánh giá tổng thể
};

/**
 * Rủi ro trigger (AI Analysis)
 */
export type TriggerRisk = {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
  simulation_results: TriggerSimulationResult[];
};

/**
 * Các rủi ro đã xác định (AI Analysis)
 */
export type AIIdentifiedRisks = {
  farm_characteristics: FarmCharacteristics;
  fraud_risk: FraudRisk;
  historical_performance: HistoricalPerformance;
  trigger_risk: TriggerRisk;
};

/**
 * Điều chỉnh trigger được đề xuất
 */
export type TriggerAdjustment = {
  condition_id: string;
  recommendation: string;
};

/**
 * Quyết định underwriting (AI Analysis)
 */
export type UnderwritingDecision = {
  recommendation: "approve" | "reject" | "review";
  reasoning: string;
  confidence: number; // 0-100
};

/**
 * Khuyến nghị giám sát (AI Analysis)
 */
export type MonitoringRecommendations = {
  frequency_adjustment?: string;
  additional_parameters?: string[];
};

/**
 * Điều chỉnh phí bảo hiểm (AI Analysis)
 */
export type PremiumAdjustment = {
  recommendation: string;
  justification: string;
};

/**
 * Khuyến nghị (AI Analysis)
 */
export type AIRecommendations = {
  underwriting_decision: UnderwritingDecision;
  suggested_actions: string[];
  required_verifications?: string[];
  trigger_adjustments?: TriggerAdjustment[];
  monitoring_recommendations?: MonitoringRecommendations;
  premium_adjustment?: PremiumAdjustment;
};

/**
 * Điểm số trọng số (AI Raw Output)
 */
export type WeightedScores = {
  farm: number;
  fraud: number;
  performance: number;
  trigger: number;
};

/**
 * Mô phỏng trigger (AI Raw Output)
 */
export type TriggerSimulation = {
  [conditionId: string]: {
    breaches_found: number;
    notes: string;
  };
};

/**
 * Raw output từ AI model
 */
export type AIRawOutput = {
  farm_characteristics_score: number;
  fraud_risk_score: number;
  historical_performance_score: number;
  trigger_risk_score: number;
  final_risk_score: number;
  weighted_scores: WeightedScores;
  parameter_statistics?: {
    [parameterName: string]: ParameterStatistics & {
      data_completeness: string;
      unit_error?: string;
    };
  };
  trigger_simulation?: TriggerSimulation;
};

// ============= UNIFIED RISK ANALYSIS MODEL =============

/**
 * Model chính cho Risk Analysis
 * Hỗ trợ cả Manual và AI analysis
 */
export type RiskAnalysis = {
  id: string;
  registered_policy_id: string;
  analysis_status: AnalysisStatus;
  analysis_type: AnalysisType;
  analysis_source: string; // "Đối tác đánh giá thủ công" hoặc "Agricultural Risk AI Analyzer v2.0 - Multi-Parameter"
  analysis_timestamp: number; // Unix timestamp
  overall_risk_score: number; // 0-1 scale
  overall_risk_level: OverallRiskLevel;

  // Conditional fields based on analysis_type
  identified_risks: ManualIdentifiedRisks | AIIdentifiedRisks;
  recommendations: ManualRecommendations | AIRecommendations;

  // Optional AI-specific field
  raw_output?: AIRawOutput;

  // Common fields
  analysis_notes?: string;
  created_at: string; // ISO timestamp
};

/**
 * Response cho danh sách Risk Analyses của một policy
 */
export type RiskAnalysesResponse = {
  count: number;
  registered_policy_id: string;
  risk_analyses: RiskAnalysis[];
};

// ============= TYPE GUARDS =============

/**
 * Type guard để kiểm tra xem có phải Manual Analysis không
 */
export const isManualAnalysis = (
  analysis: RiskAnalysis
): analysis is RiskAnalysis & {
  identified_risks: ManualIdentifiedRisks;
  recommendations: ManualRecommendations;
} => {
  return analysis.analysis_type === "manual";
};

/**
 * Type guard để kiểm tra xem có phải AI Analysis không
 */
export const isAIAnalysis = (
  analysis: RiskAnalysis
): analysis is RiskAnalysis & {
  identified_risks: AIIdentifiedRisks;
  recommendations: AIRecommendations;
  raw_output: AIRawOutput;
} => {
  return analysis.analysis_type === "ai_model";
};

// ============= HELPER TYPES =============

/**
 * Type cho API Response hoàn chỉnh
 */
export type RiskAnalysisApiResponse = ApiSuccessResponse<RiskAnalysesResponse>;

/**
 * Màu sắc cho mức độ rủi ro (dùng cho UI)
 */
export const RISK_LEVEL_COLORS = {
  low: "success" as const,
  moderate: "pending" as const,
  medium: "warning" as const,
  high: "error" as const,
  critical: "error" as const,
};

/**
 * Nhãn tiếng Việt cho mức độ rủi ro
 */
export const RISK_LEVEL_LABELS = {
  low: "Thấp",
  moderate: "Trung bình",
  medium: "Cao",
  high: "Rất cao",
  critical: "Nghiêm trọng",
};

/**
 * Nhãn tiếng Việt cho trạng thái phân tích
 */
export const ANALYSIS_STATUS_LABELS = {
  passed: "Đạt yêu cầu",
  failed: "Không đạt yêu cầu",
  pending: "Đang chờ",
  under_review: "Đang xem xét",
};

/**
 * Nhãn tiếng Việt cho quyết định underwriting
 */
export const UNDERWRITING_DECISION_LABELS = {
  approve: "Phê duyệt",
  reject: "Từ chối",
  review: "Cần xem xét thêm",
};

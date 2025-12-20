// ============= INSURANCE PRODUCT MODELS =============

/**
 * Loại cây trồng được hỗ trợ bảo hiểm
 */
export type CropType = "rice" | "coffee";

/**
 * Trạng thái của sản phẩm bảo hiểm
 */
export type ProductStatus = "active" | "inactive" | "pending" | "suspended";

/**
 * Trạng thái xác thực tài liệu
 */
export type DocumentValidationStatus =
  | "passed"
  | "failed"
  | "pending"
  | "under_review";

/**
 * Đơn vị tiền tệ
 */
export type CurrencyCode = "VND" | "USD";

// /**
//  * Thông tin bổ sung quan trọng của sản phẩm
//  */
// export type ImportantAdditionalInformation = {
//   notes?: string; // Ghi chú đặc biệt
//   special_conditions?: string[]; // Các điều kiện đặc biệt
//   [key: string]: any; // Cho phép thêm các trường tùy chỉnh
// };

/**
 * Model chính cho Sản phẩm Bảo hiểm Nông nghiệp
 */
export type PublicBasePolicyResponse = {
  id: string; // UUID của sản phẩm
  insurance_provider_id: string; // Mã nhà cung cấp bảo hiểm
  product_name: string; // Tên sản phẩm
  product_code: string; // Mã sản phẩm (duy nhất)
  product_description: string; // Mô tả chi tiết sản phẩm
  crop_type: CropType; // Loại cây trồng được bảo hiểm

  // Thông tin phí bảo hiểm (Premium)
  coverage_currency: CurrencyCode; // Đơn vị tiền tệ
  coverage_duration_days: number; // Thời hạn bảo hiểm (ngày)
  fix_premium_amount: number; // Số tiền phí cố định
  is_per_hectare: boolean; // Phí tính theo hecta hay không
  premium_base_rate: number; // Tỷ lệ phí cơ bản (0.05 = 5%)
  max_premium_payment_prolong: number; // Thời gian gia hạn thanh toán tối đa (giây)

  // Thông tin chi trả bồi thường (Payout)
  fix_payout_amount: number; // Số tiền chi trả cố định
  is_payout_per_hectare: boolean; // Chi trả tính theo hecta
  over_threshold_multiplier: number; // Hệ số nhân khi vượt ngưỡng
  payout_base_rate: number; // Tỷ lệ chi trả cơ bản (0.8 = 80%)
  payout_cap: number; // Giới hạn chi trả tối đa

  // Chính sách hủy và gia hạn
  cancel_premium_rate: number; // Tỷ lệ hoàn phí khi hủy
  enrollment_start_day: number; // Ngày bắt đầu đăng ký (từ ngày nào trong chu kỳ)
  enrollment_end_day: number; // Ngày kết thúc đăng ký
  auto_renewal: boolean; // Tự động gia hạn
  renewal_discount_rate: number; // Tỷ lệ giảm giá khi gia hạn (0.1 = 10%)

  // Thời hạn hiệu lực bảo hiểm
  insurance_valid_from_day: number; // Ngày bắt đầu hiệu lực
  insurance_valid_to_day: number; // Ngày kết thúc hiệu lực

  // Trạng thái và xác thực
  status: ProductStatus; // Trạng thái sản phẩm
  document_validation_status: DocumentValidationStatus; // Trạng thái xác thực tài liệu
  document_tags?: Record<string, any>; // Thẻ tài liệu bổ sung
  // Thông tin bổ sung
  important_additional_information: string;

  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  created_by: string; // ID người tạo
};

/**
 * Đơn vị tần suất theo dõi
 */
export type MonitorFrequencyUnit = "hour" | "day" | "week" | "month";

/**
 * Toán tử logic kết hợp các điều kiện
 */
export type LogicalOperator = "AND" | "OR";

/**
 * Toán tử so sánh ngưỡng
 */
export type ThresholdOperator = "<" | "<=" | ">" | ">=" | "==" | "!=";

/**
 * Hàm tổng hợp dữ liệu
 */
export type AggregationFunction = "avg" | "min" | "max" | "sum" | "median";

/**
 * Thời gian cấm kích hoạt (Blackout Period)
 */
export type BlackoutPeriod = {
  start: string; // Format: "MM-DD"
  end: string; // Format: "MM-DD"
};

export type BlackoutPeriods = {
  periods: BlackoutPeriod[];
};

/**
 * Điều kiện kích hoạt bảo hiểm (Policy Condition)
 */
export type PolicyCondition = {
  id: string;
  base_policy_trigger_id: string;
  data_source_id: string;
  threshold_operator: ThresholdOperator;
  threshold_value: number;
  early_warning_threshold: number | null;
  aggregation_function: AggregationFunction;
  aggregation_window_days: number;
  consecutive_required: boolean;
  include_component: boolean;
  baseline_window_days: number | null;
  baseline_function: AggregationFunction | null;
  validation_window_days: number | null;
  condition_order: number;
  base_cost: number;
  category_multiplier: number;
  tier_multiplier: number;
  calculated_cost: number;
  created_at: string;
};

/**
 * Trigger kích hoạt bảo hiểm (Policy Trigger)
 */
export type PolicyTrigger = {
  id: string;
  base_policy_id: string;
  logical_operator: LogicalOperator;
  growth_stage: string;
  monitor_interval: number;
  monitor_frequency_unit: MonitorFrequencyUnit;
  blackout_periods: BlackoutPeriods | null;
  created_at: string;
  updated_at: string;
  conditions: PolicyCondition[];
};

export type PolicyDocument = {
  has_document: boolean;
  document_url: string;
  presigned_url: string;
  presigned_url_expiry: string;
  bucket_name: string;
  object_name: string;
  content_type: string;
  file_size_bytes: number;
};

/**
 * Metadata thống kê policy detail
 */
export type PolicyDetailMetadata = {
  total_triggers: number;
  total_conditions: number;
  total_data_cost: number;
  data_source_count: number;
  retrieved_at: string;
};

/**
 * Chi tiết đầy đủ của một sản phẩm bảo hiểm
 */
export type PolicyDetailResponse = {
  base_policy: PublicBasePolicyResponse;
  document: PolicyDocument;
  triggers: PolicyTrigger[];
  metadata: PolicyDetailMetadata;
};

export type RegisterPolicyPayload = {
  registered_policy: {
    base_policy_id: string;
    insurance_provider_id: string;
    farmer_id: string;
    planting_date: number;
    area_multiplier: number;
    total_farmer_premium: number;
    total_data_cost: number;
    coverage_amount: number;
  };
  farm: {
    id: string;
  };
  policy_tags?: Record<string, any>; // Dynamic data từ document_tags
};

// ============= REGISTERED POLICY MODELS =============

/**
 * Trạng thái của policy đã đăng ký
 */
export type RegisteredPolicyStatus =
  | "draft" // Bản nháp
  | "pending_review" // Chờ xét duyệt
  | "pending_payment" // Chờ thanh toán
  | "active" // Đang hoạt động
  | "payout" // Đang chi trả
  | "expired" // Hết hạn
  | "pending_cancel" // Chờ xử lý hủy
  | "cancelled" // Đã hủy
  | "rejected" // Bị từ chối
  | "dispute"; // Tranh chấp

/**
 * Trạng thái underwriting (thẩm định)
 */
export type UnderwritingStatus =
  | "pending" // Đang chờ thẩm định
  | "approved" // Đã duyệt
  | "rejected"; // Từ chối

/**
 * Model cho một policy đã đăng ký
 */
export type RegisteredPolicy = {
  id: string;
  policy_number: string;
  base_policy_id: string;
  insurance_provider_id: string;
  farm_id: string;
  farmer_id: string;
  coverage_amount: number;
  coverage_start_date: number; // Ngày bắt đầu bảo hiểm (timestamp)
  coverage_end_date: number;
  planting_date: number;
  area_multiplier: number;
  total_farmer_premium: number;
  total_data_cost: number;
  premium_paid_by_farmer: boolean; // Đã thanh toán phí bảo hiểm chưa
  status: RegisteredPolicyStatus;
  underwriting_status: UnderwritingStatus;
  signed_policy_document_url: string;
  created_at: string;
  updated_at: string;
};

/**
 * Response danh sách policies đã đăng ký
 */
export type RegisteredPoliciesResponse = {
  count: number;
  farmer_id: string;
  policies: RegisteredPolicy[];
};

/**
 * Response chi tiết policy đã đăng ký
 */
export type RegisteredPolicyDetailResponse = RegisteredPolicy & {
  base_policy?: PublicBasePolicyResponse;
  farm?: any; // TODO: Add Farm type
};

export interface UnderwritingData {
  id: string;
  registered_policy_id: string;
  validation_timestamp: number;
  underwriting_status: string;
  recommendations: Recommendations;
  reason: string;
  reason_evidence: ReasonEvidence;
  validated_by: string;
  validation_notes: string;
  created_at: string; // ISO timestamp
}

export interface ReasonEvidence {
  farm_history: string;
  risk_level: string;
  risk_score: number;
}

export interface Recommendations {
  premium_adjustment: "none" | "increase" | "decrease";
  suggested_coverage: "full" | "partial" | "minimal";
}

/**
 * Response API cho underwriting data
 */
export interface UnderwritingDataResponse {
  data: UnderwritingData[];
}

/**
 * Loại yêu cầu hủy hợp đồng
 */
export type CancelRequestType = "contract_violation" | "other";

/**
 * Ảnh bằng chứng trong evidence
 */
export interface EvidenceImage {
  url: string; // URL của ảnh
}

/**
 * Payload yêu cầu hủy hợp đồng bảo hiểm
 * evidence sử dụng cấu trúc: text description + array of image URLs
 */
export interface CancelRequestPayload {
  cancel_request_type: CancelRequestType; // Loại hủy: vi phạm hợp đồng hoặc lý do khác
  reason: string; // Lý do chi tiết (mô tả văn bản)
  compensate_amount: number; // Số tiền đề nghị bồi thường
  evidence: {
    description: string; // Mô tả bằng chứng (text)
    images: EvidenceImage[]; // Danh sách ảnh bằng chứng (chỉ URL)
  };
}

/**
 * Trạng thái yêu cầu hủy hợp đồng
 */
export type CancelRequestStatus = "pending" | "approved" | "rejected" | "pending_review" | "cancelled";

/**
 * Model cho yêu cầu hủy hợp đồng bảo hiểm
 */
export interface CancelRequest {
  id: string;
  registered_policy_id: string;
  cancel_request_type: CancelRequestType;
  reason: string;
  evidence: {
    description: string;
    images: EvidenceImage[];
  };
  status: CancelRequestStatus;
  requested_by: string;
  requested_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  compensate_amount?: number; // Số tiền dự kiến bồi thường (optional)
}

/**
 * Response API cho danh sách cancel requests
 */
export interface CancelRequestsResponse {
  claims: CancelRequest[];
  count: number;
  farmer_id: string;
}

/**
 * Payload để review (phê duyệt/từ chối) yêu cầu hủy hợp đồng
 */
export interface ReviewCancelRequestPayload {
  review_notes: string; // Ghi chú khi phê duyệt/từ chối
  approved: boolean; // true = chấp nhận, false = từ chối
}

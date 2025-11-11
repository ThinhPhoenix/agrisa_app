// ============= INSURANCE PRODUCT MODELS =============

/**
 * Loại cây trồng được hỗ trợ bảo hiểm
 */
export type CropType =
  | "rice"
  | "coffee";


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
  start_day: number;
  end_day: number;
  reason: string;
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
  blackout_periods: BlackoutPeriod | null;
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
// ============= CLAIM EVENT MODELS =============

import {
  ClaimStatus,
  ClaimGenerationMethod,
} from "../enums/claim-status.enum";

// Re-export enums để backward compatible
export { ClaimStatus, ClaimGenerationMethod };

/**
 * Điều kiện kích hoạt trong evidence
 */
export type ClaimEvidenceCondition = {
  condition_id: string;
  parameter: string; // ndmi, ndvi, etc.
  operator: string; // <, >, <=, >=, ==
  threshold_value: number;
  measured_value: number;
  baseline_value: number;
  early_warning_threshold: number;
  is_early_warning: boolean;
  timestamp: number; // Unix timestamp
};

/**
 * Tóm tắt bằng chứng claim
 */
export type ClaimEvidenceSummary = {
  conditions: ClaimEvidenceCondition[];
  conditions_count: number;
  generation_method: ClaimGenerationMethod;
  triggered_at: number; // Unix timestamp
};

/**
 * Model cho một claim event
 */
export type ClaimEvent = {
  id: string;
  claim_number: string;
  registered_policy_id: string;
  base_policy_id: string;
  farm_id: string;
  base_policy_trigger_id: string;
  trigger_timestamp: number; // Unix timestamp
  over_threshold_value: number;
  calculated_fix_payout: number;
  calculated_threshold_payout: number;
  claim_amount: number;
  status: ClaimStatus;
  auto_generated: boolean;
  auto_approval_deadline: number | null; // Unix timestamp - hạn tự động duyệt
  auto_approved: boolean; // Đã được tự động duyệt chưa
  // Thông tin xét duyệt từ đối tác bảo hiểm
  partner_decision: string | null; // Quyết định: chấp nhận/từ chối
  partner_notes: string | null; // Ghi chú từ đối tác
  reviewed_by: string | null; // ID người xét duyệt
  evidence_summary: ClaimEvidenceSummary;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

// ============= RESPONSE MODELS =============

/**
 * Response danh sách claims của farmer (read-own/list)
 */
export type FarmerClaimsListResponse = {
  claims: ClaimEvent[];
  count: number;
  farmer_id: string;
};

/**
 * Response chi tiết claim (read-own/detail/:id)
 * Trả về trực tiếp object ClaimEvent
 */
export type ClaimDetailResponse = ClaimEvent;

/**
 * Response danh sách claims theo policy (read-own/by-policy/:policyId)
 */
export type ClaimsByPolicyResponse = {
  claims: ClaimEvent[];
  count: number;
  policy_id: string;
};

/**
 * Response danh sách claims theo farm (read-own/by-farm/:farmId)
 */
export type ClaimsByFarmResponse = {
  claims: ClaimEvent[];
  count: number;
  farm_id: string;
};

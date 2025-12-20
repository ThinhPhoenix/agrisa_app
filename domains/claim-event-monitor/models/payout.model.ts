// ============= PAYOUT MODELS =============

/**
 * Trạng thái của payout
 */
export type PayoutStatus = "processing" | "completed" | "failed" | "cancelled";

/**
 * Model cho một payout record
 * Thông tin về việc chi trả tiền bồi thường
 */
export type Payout = {
  id: string;
  claim_id: string;
  registered_policy_id: string;
  farm_id: string;
  farmer_id: string;
  payout_amount: number;
  currency: string; // VND, USD, etc.
  status: PayoutStatus;
  initiated_at: number; // Unix timestamp - thời điểm khởi tạo chi trả
  farmer_confirmed: boolean; // Nông dân đã xác nhận nhận tiền chưa
  created_at: string; // ISO timestamp
};

/**
 * Payload cho API xác nhận nhận tiền bồi thường
 * Gửi lên server với payout_id
 */
export type ConfirmPayoutPayload = {
  farmer_confirmed: boolean;
  farmer_rating?: number; // 1-5 sao (optional)
  farmer_feedback?: string; // Phản hồi từ nông dân (optional)
};

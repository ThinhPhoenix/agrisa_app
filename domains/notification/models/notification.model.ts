/**
 * Model cho Notification - Thông báo
 */

/**
 * Số lượng thông báo chưa đọc
 */
export interface NotificationCount {
  success: boolean;
  count: number;
}

/**
 * Một item thông báo
 */
export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>; // Dữ liệu bổ sung (VD: url, customField, etc.)
  type: string;
  status: string;
  error_message: string | null;
  created_at: string; // ISO timestamp
}

/**
 * Response danh sách thông báo
 */
export interface NotificationHistoryResponse {
  data: NotificationItem[];
}

/**
 * Helper để map notification type sang UI display
 */
export const getNotificationDisplayType = (
  type: string
): "success" | "error" | "warning" | "info" => {
  switch (type) {
    case "payment_success":
    case "policy_approved":
    case "claim_approved":
    case "payout_completed":
    case "ekyc_approved":
    case "farm_verified":
      return "success";
    case "payment_failed":
    case "policy_rejected":
    case "claim_rejected":
    case "ekyc_rejected":
      return "error";
    case "weather_warning":
    case "payout_processing":
      return "warning";
    case "claim_created":
    case "system_alert":
    case "ekyc_required":
    case "general":
    case "broadcast":
    default:
      return "info";
  }
};
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
 * Loại thông báo
 */
export type NotificationType = 
  | "payment_success"      // Thanh toán thành công
  | "payment_failed"       // Thanh toán thất bại
  | "policy_approved"      // Hợp đồng được duyệt
  | "policy_rejected"      // Hợp đồng bị từ chối
  | "claim_created"        // Yêu cầu bồi thường được tạo
  | "claim_approved"       // Yêu cầu bồi thường được duyệt
  | "claim_rejected"       // Yêu cầu bồi thường bị từ chối
  | "payout_processing"    // Đang xử lý chi trả
  | "payout_completed"     // Chi trả hoàn tất
  | "weather_warning"      // Cảnh báo thời tiết
  | "system_alert"         // Thông báo hệ thống
  | "ekyc_required"        // Yêu cầu xác thực eKYC
  | "ekyc_approved"        // eKYC được duyệt
  | "ekyc_rejected"        // eKYC bị từ chối
  | "farm_verified"        // Nông trại được xác minh
  | "general";             // Thông báo chung

/**
 * Một item thông báo
 */
export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>; // Dữ liệu bổ sung (VD: policy_id, claim_id, etc.)
  is_read: boolean;
  created_at: string; // ISO timestamp
  read_at?: string | null; // ISO timestamp - thời điểm đọc
}

/**
 * Response danh sách thông báo
 */
export interface NotificationHistoryResponse {
  notifications: NotificationItem[];
}

/**
 * Helper để map notification type sang UI display
 */
export const getNotificationDisplayType = (type: NotificationType): "success" | "error" | "warning" | "info" => {
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
    default:
      return "info";
  }
};
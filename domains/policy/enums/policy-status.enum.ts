/**
 * Policy Status Enums - Agrisa Platform
 * 
 * Định nghĩa các trạng thái của policy và underwriting
 */

/**
 * Trạng thái của policy đã đăng ký
 */
export enum RegisteredPolicyStatus {
  PENDING_REVIEW = "pending_review",   // Chờ xét duyệt
  ACTIVE = "active",                    // Đang hoạt động
  EXPIRED = "expired",                  // Hết hạn
  CANCELLED = "cancelled",              // Đã hủy
  REJECTED = "rejected",                // Bị từ chối
  SUSPENDED = "suspended",              // Tạm ngưng
}

/**
 * Trạng thái underwriting (thẩm định)
 */
export enum UnderwritingStatus {
  PENDING = "pending", // Đang chờ
  APPROVED = "approved", // Đã duyệt
  REJECTED = "rejected", // Từ chối
  UNDER_REVIEW = "under_review", // Đang xem xét
}

/**
 * Trạng thái sản phẩm bảo hiểm
 */
export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

/**
 * Label hiển thị cho RegisteredPolicyStatus
 */
export const RegisteredPolicyStatusLabels: Record<RegisteredPolicyStatus, string> = {
  [RegisteredPolicyStatus.PENDING_REVIEW]: "Chờ xét duyệt",
  [RegisteredPolicyStatus.ACTIVE]: "Đang hoạt động",
  [RegisteredPolicyStatus.EXPIRED]: "Hết hạn",
  [RegisteredPolicyStatus.CANCELLED]: "Đã hủy",
  [RegisteredPolicyStatus.REJECTED]: "Bị từ chối",
  [RegisteredPolicyStatus.SUSPENDED]: "Tạm ngưng",
};

/**
 * Label hiển thị cho UnderwritingStatus
 */
export const UnderwritingStatusLabels: Record<UnderwritingStatus, string> = {
  [UnderwritingStatus.PENDING]: "Chờ duyệt",
  [UnderwritingStatus.APPROVED]: "Đã duyệt",
  [UnderwritingStatus.REJECTED]: "Từ chối",
  [UnderwritingStatus.UNDER_REVIEW]: "Đang xem xét",
};

/**
 * Màu sắc cho các trạng thái (dùng với theme colors)
 */
export const PolicyStatusColors = {
  [RegisteredPolicyStatus.PENDING_REVIEW]: "pending",
  [RegisteredPolicyStatus.ACTIVE]: "success",
  [RegisteredPolicyStatus.EXPIRED]: "muted_text",
  [RegisteredPolicyStatus.CANCELLED]: "error",
  [RegisteredPolicyStatus.REJECTED]: "error",
  [RegisteredPolicyStatus.SUSPENDED]: "warning",
  
  [UnderwritingStatus.PENDING]: "pending",
  [UnderwritingStatus.APPROVED]: "success",
  [UnderwritingStatus.UNDER_REVIEW]: "info",
} as const;

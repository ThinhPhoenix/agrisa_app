/**
 * Policy Status Enums - Agrisa Platform
 * 
 * Định nghĩa các trạng thái của policy và underwriting
 */

/**
 * Trạng thái của policy đã đăng ký
 * Theo backend: draft, pending_review, pending_payment, active, payout, expired, pending_cancel, cancelled, rejected, dispute
 */
export enum RegisteredPolicyStatus {
  DRAFT = "draft", // Bản nháp - chưa submit
  PENDING_REVIEW = "pending_review", // Chờ xét duyệt/thẩm định
  PENDING_PAYMENT = "pending_payment", // Chờ thanh toán (đã duyệt)
  ACTIVE = "active", // Đang hoạt động
  PAYOUT = "payout", // Đã chi trả
  EXPIRED = "expired", // Hết hạn
  PENDING_CANCEL = "pending_cancel", // Chờ xử lý hủy
  CANCELLED = "cancelled", // Đã hủy
  REJECTED = "rejected", // Bị từ chối
  DISPUTE = "dispute", // Tranh chấp
}

/**
 * Trạng thái underwriting (thẩm định)
 * Theo backend: pending, approved, rejected
 */
export enum UnderwritingStatus {
  PENDING = "pending", // Đang chờ thẩm định
  APPROVED = "approved", // Đã duyệt
  REJECTED = "rejected", // Từ chối
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
export const RegisteredPolicyStatusLabels: Record<
  RegisteredPolicyStatus,
  string
> = {
  [RegisteredPolicyStatus.DRAFT]: "Bản nháp",
  [RegisteredPolicyStatus.PENDING_REVIEW]: "Chờ xét duyệt",
  [RegisteredPolicyStatus.PENDING_PAYMENT]: "Chờ thanh toán",
  [RegisteredPolicyStatus.ACTIVE]: "Đang hoạt động",
  [RegisteredPolicyStatus.PAYOUT]: "Đang chi trả",
  [RegisteredPolicyStatus.EXPIRED]: "Hết hạn",
  [RegisteredPolicyStatus.PENDING_CANCEL]: "Chờ xử lý hủy",
  [RegisteredPolicyStatus.CANCELLED]: "Đã hủy",
  [RegisteredPolicyStatus.REJECTED]: "Bị từ chối",
  [RegisteredPolicyStatus.DISPUTE]: "Tranh chấp",
};

/**
 * Label hiển thị cho UnderwritingStatus
 */
export const UnderwritingStatusLabels: Record<UnderwritingStatus, string> = {
  [UnderwritingStatus.PENDING]: "Chờ duyệt",
  [UnderwritingStatus.APPROVED]: "Đã duyệt",
  [UnderwritingStatus.REJECTED]: "Từ chối",
};

/**
 * Màu sắc cho các trạng thái (dùng với theme colors)
 */
export const PolicyStatusColors = {
  [RegisteredPolicyStatus.DRAFT]: "muted_text",
  [RegisteredPolicyStatus.PENDING_REVIEW]: "pending",
  [RegisteredPolicyStatus.PENDING_PAYMENT]: "warning",
  [RegisteredPolicyStatus.ACTIVE]: "success",
  [RegisteredPolicyStatus.PAYOUT]: "info",
  [RegisteredPolicyStatus.EXPIRED]: "muted_text",
  [RegisteredPolicyStatus.PENDING_CANCEL]: "warning",
  [RegisteredPolicyStatus.CANCELLED]: "error",
  [RegisteredPolicyStatus.REJECTED]: "error",
  [RegisteredPolicyStatus.DISPUTE]: "error",
  [UnderwritingStatus.PENDING]: "pending",
  [UnderwritingStatus.APPROVED]: "success",
} as const;

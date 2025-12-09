/**
 * Enum cho trạng thái của Claim Event
 * Mapping với backend claim status
 */
export enum ClaimStatus {
  /** Đã tạo */
  GENERATED = "generated",
  /** Chờ đối tác bảo hiểm xét duyệt */
  PENDING_PARTNER_REVIEW = "pending_partner_review",
  /** Đã duyệt */
  APPROVED = "approved",
  /** Từ chối */
  REJECTED = "rejected",
  /** Đã chi trả */
  PAID = "paid",
}

/**
 * Phương thức tạo claim
 */
export enum ClaimGenerationMethod {
  /** Tự động từ hệ thống giám sát */
  AUTOMATIC = "automatic",
  /** Thủ công bởi người dùng */
  MANUAL = "manual",
}

/**
 * Mapping label tiếng Việt cho ClaimStatus
 */
export const ClaimStatusLabel: Record<ClaimStatus, string> = {
  [ClaimStatus.GENERATED]: "Đã tạo",
  [ClaimStatus.PENDING_PARTNER_REVIEW]: "Chờ xét duyệt",
  [ClaimStatus.APPROVED]: "Đã duyệt",
  [ClaimStatus.REJECTED]: "Từ chối",
  [ClaimStatus.PAID]: "Đã chi trả",
};

/**
 * Interface cho tab item
 */
export interface ClaimStatusTabItem {
  value: string;
  label: string;
}

/**
 * Tab filter options cho danh sách claims
 * Giữ các status quan trọng nhất (giống history.tsx)
 */
export const ClaimStatusTabs: ClaimStatusTabItem[] = [
  { value: "all", label: "Tất cả" },
  { value: ClaimStatus.GENERATED, label: "Đã tạo" },
  { value: ClaimStatus.PENDING_PARTNER_REVIEW, label: "Chờ duyệt" },
  { value: ClaimStatus.APPROVED, label: "Đã duyệt" },
  { value: ClaimStatus.REJECTED, label: "Từ chối" },
  { value: ClaimStatus.PAID, label: "Đã trả" },
];

export type ClaimStatusTabKey = "all" | ClaimStatus;

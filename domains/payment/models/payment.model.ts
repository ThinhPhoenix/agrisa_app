/**
 * 💳 Payment Models - Agrisa Platform
 *
 * Models cho payment flow với PayOS
 */

/**
 * Payment Response từ PayOS API
 */
export interface PaymentResponse {
    bin: string; // Mã ngân hàng (VD: "970452")
    checkout_url: string; // URL checkout trên web PayOS
    account_number: string; // Số tài khoản nhận tiền
    account_name: string; // Tên chủ tài khoản
    amount: number; // Số tiền thanh toán (VNĐ)
    description: string; // Mô tả giao dịch
    order_code: number; // Mã đơn hàng
    qr_code: string; // Chuỗi QR code (format VietQR)
    expired_at: string; // Thời gian hết hạn (ISO 8601)
}

/**
 * Payment Item - Thông tin item trong đơn hàng
 */
export interface PaymentItem {
    item_id: string; // ID của policy
    name: string; // Tên sản phẩm bảo hiểm
    price: number; // Giá (VNĐ)
    quantity: number; // Số lượng (luôn = 1 cho bảo hiểm)
}

/**
 * Payment Request Body
 */
export interface CreatePaymentRequest {
    amount: number; // Tổng tiền
    description: string; // Mô tả
    return_url: string; // URL success
    cancel_url: string; // URL cancel
    type: string; // Loại: "hopdong"
    items: PaymentItem[]; // Danh sách items
}

/**
 * Payment Status
 */
export enum PaymentStatus {
    PENDING = "pending", // Chờ thanh toán
    PAID = "paid", // Đã thanh toán
    CANCELLED = "cancelled", // Đã hủy
    EXPIRED = "expired", // Hết hạn
}

/**
 * Payment Method
 */
export enum PaymentMethod {
    QR_CODE = "qr_code", // Quét QR
    BANK_TRANSFER = "bank_transfer", // Chuyển khoản thủ công
    CHECKOUT_URL = "checkout_url", // Thanh toán web
}

/**
 * Payment Transaction Item - Giao dịch thanh toán
 */
export interface PaymentTransaction {
    id: string;
    amount: number;
    description: string;
    status: PaymentTransactionStatus;
    user_id: string;
    checkout_url: string | null;
    type: PaymentType;
    order_code: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
    deleted_at: string | null; // ISO timestamp
    paid_at: string | null; // ISO timestamp
    expired_at: string; // ISO timestamp
}

/**
 * Trạng thái giao dịch thanh toán
 */
export interface PaymentTransactionStatus {
    code: PaymentStatusCode;
    label: string;
}

/**
 * Mã trạng thái thanh toán
 */
export enum PaymentStatusCode {
    COMPLETED = "completed",
    EXPIRED = "expired",
    PENDING = "pending",
    CANCELLED = "cancelled",
}

/**
 * Loại thanh toán
 */
export enum PaymentType {
    POLICY_REGISTRATION = "policy_registration_payment",
    CONTRACT = "hopdong",
}

/**
 * Metadata phân trang
 */
export interface PaymentListMetadata {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    next: boolean;
    previous: boolean;
    timestamp: string; // ISO timestamp
}

/**
 * Response danh sách giao dịch thanh toán
 */
export interface PaymentListResponse {
    payments: PaymentTransaction[];
    payouts: PaymentTransaction[];
}

export interface PaymentDetailResponse {
    id: string;
    amount: string;
    description: string;
    status: string;
    user_id: string;
    checkout_url: string;
    order_code: string;
    type: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    paid_at: string;
    expired_at: string;
    orderItems: OrderItem[];
}

export interface OrderItem {
    id: string;
    item_id: string;
    name: string;
    price: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
}

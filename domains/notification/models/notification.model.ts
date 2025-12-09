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
    notificationId: string;
    title: string;
    body: string;
    data?: Record<string, any> | null;
    platform: string;
    status: string;
    createdAt: string;
}

/**
 * Response danh sách thông báo
 */
export interface NotificationHistoryResponse {
    data: NotificationItem[];
    unread: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

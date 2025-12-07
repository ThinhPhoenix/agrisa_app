import useAxios from "@/config/useAxios.config";
import { NotificationCount, NotificationHistoryResponse } from "../models/notification.model";

export const notificationService = {
  post: {},

  get: {
    /**
     * Lấy lịch sử thông báo
     */
    getNotificationHistory: async (): Promise<
      ApiResponse<NotificationHistoryResponse>
    > => {
      return useAxios.get(`/push-noti/protected/history`);
    },
    /**
     * Lấy số lượng thông báo chưa đọc
     */
    getNotificationCount: async (): Promise<NotificationCount> => {
      return useAxios.get(`/push-noti/protected/unread-count`);
    },
  },
};

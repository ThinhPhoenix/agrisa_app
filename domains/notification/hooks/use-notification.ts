import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";

export const useNotification = () => {
  const getNotifcationList = () => {
    return useQuery({
      queryKey: [QueryKey.NOTIFICATION.GET_ALL],
      queryFn: () => notificationService.get.getNotificationHistory(),
      enabled: true,
    });
  };

  const getNotificationCount = () => {
    return useQuery({
      queryKey: [QueryKey.NOTIFICATION.GET_COUNT],
      queryFn: () => notificationService.get.getNotificationCount(),
      enabled: true,
    });
  };

  return {
    getNotifcationList,
    getNotificationCount,
  };
};

import { useCallback } from "react";
import { scheduleTestNotification } from "../utils/notificationService";

interface UsePushNotiParams {
    title?: string;
    body?: string;
}

export default function usePushNoti({ title, body }: UsePushNotiParams = {}) {
  const sendNotification = useCallback(async () => {
    await scheduleTestNotification({ title, body });
  }, [title, body]);

  return sendNotification;
}

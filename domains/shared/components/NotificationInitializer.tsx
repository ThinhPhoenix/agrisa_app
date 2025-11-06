import { useEffect } from "react";
import { initializeNotifications } from "../utils/notificationService";

export default function NotificationInitializer() {
  useEffect(() => {
    // Initialize notifications
    const subscription = initializeNotifications();

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return null;
}

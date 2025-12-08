import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { wsService } from "@/domains/noti/services/websocket.service";
import { useEffect } from "react";

export const useWebSocketNotifications = () => {
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            console.log(
                "[useWebSocketNotifications] Connecting for user:",
                user.id
            );
            wsService.connect(user.id);

            return () => {
                console.log("[useWebSocketNotifications] Disconnecting");
                wsService.disconnect();
            };
        }
    }, [user?.id]);

    return {
        isConnected: wsService.isConnected(),
    };
};

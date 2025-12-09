import { useWebSocketNotifications } from "@/domains/noti/hooks/use-websocket-notifications";

export default function WebSocketInitializer() {
    useWebSocketNotifications();
    return null;
}

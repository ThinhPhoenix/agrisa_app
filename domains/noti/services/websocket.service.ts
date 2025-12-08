import { scheduleTestNotification } from "@/domains/shared/utils/notificationService";
import Constants from "expo-constants";

const WS_URL =
    Constants.expoConfig?.extra?.apiUrl
        ?.replace("https://", "wss://")
        .replace("http://", "ws://") || "wss://agrisa-api.phrimp.io.vn";

class WebSocketService {
    private ws: WebSocket | null = null;
    private userId: string | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000; // 3 seconds

    connect(userId: string) {
        if (this.ws?.readyState === WebSocket.OPEN && this.userId === userId) {
            console.log("[WebSocket] Already connected");
            return;
        }

        this.disconnect();
        this.userId = userId;

        try {
            const wsUrl = `${WS_URL}/noti/public/ws?user_id=${userId}`;
            console.log("[WebSocket] Connecting to:", wsUrl);

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log("[WebSocket] Connected successfully");
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("[WebSocket] Message received:", data);

                    // Show local notification
                    await scheduleTestNotification({
                        title: data.title || "Agrisa",
                        body:
                            data.body || data.message || "Bạn có thông báo mới",
                    });
                } catch (error) {
                    console.error("[WebSocket] Error parsing message:", error);
                }
            };

            this.ws.onerror = (error) => {
                console.error("[WebSocket] Error:", error);
            };

            this.ws.onclose = (event) => {
                console.log(
                    "[WebSocket] Disconnected:",
                    event.code,
                    event.reason
                );
                this.attemptReconnect();
            };
        } catch (error) {
            console.error("[WebSocket] Connection error:", error);
            this.attemptReconnect();
        }
    }

    private attemptReconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log("[WebSocket] Max reconnect attempts reached");
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;

        console.log(
            `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        this.reconnectTimeout = setTimeout(() => {
            if (this.userId) {
                this.connect(this.userId);
            }
        }, delay);
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.userId = null;
        this.reconnectAttempts = 0;
        console.log("[WebSocket] Disconnected");
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const wsService = new WebSocketService();

import { useCallback } from "react";
import { scheduleTestNotification } from "../utils/notificationService";

interface UsePushNotiParams {
    title?: string;
    body?: string;
}

// Returns a function that can be called to send a notification.
// The returned function accepts an optional overrides object so callers
// can pass dynamic title/body at call time.
export default function useLocalNoti({ title, body }: UsePushNotiParams = {}) {
    const sendNotification = useCallback(
        async (overrides?: UsePushNotiParams) => {
            const payload = {
                title: overrides?.title ?? title,
                body: overrides?.body ?? body,
            };

            await scheduleTestNotification(payload);
        },
        [title, body]
    );

    return sendNotification;
}

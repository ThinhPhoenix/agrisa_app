import useAxios from "@/config/useAxios.config";
import { scheduleTestNotification } from "@/domains/shared/utils/notificationService";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

const BACKGROUND_FETCH_TASK = "background-notification-fetch";

// Background task definition
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        console.log("[Background Task] Starting notification fetch...");

        // Get user from secure storage
        const userStr = await secureStorage.getUser();
        if (!userStr) {
            console.log("[Background Task] No user found");
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        const user = JSON.parse(userStr);
        if (!user?.id) {
            console.log("[Background Task] Invalid user data");
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Fetch notifications from backend
        const response = await useAxios.get("/noti/public/pull/ios", {
            params: {
                user_id: user.id,
                limit: 10,
            },
        });

        const notifications = response?.data || [];

        if (notifications.length === 0) {
            console.log("[Background Task] No new notifications");
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Send local notifications for each new notification
        for (const notification of notifications) {
            await scheduleTestNotification({
                title: notification.title || "Agrisa",
                body:
                    notification.body ||
                    notification.message ||
                    "Bạn có thông báo mới",
            });
        }

        console.log(
            `[Background Task] Sent ${notifications.length} notifications`
        );
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error("[Background Task] Error:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Register background task
export async function registerBackgroundFetchAsync() {
    // Only run on iOS
    if (Platform.OS !== "ios") {
        console.log("[Background Task] Skipping registration - iOS only");
        return;
    }

    try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 60 * 15, // 15 minutes
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log("[Background Task] Registered successfully");
    } catch (error) {
        console.error("[Background Task] Registration failed:", error);
    }
}

// Unregister background task
export async function unregisterBackgroundFetchAsync() {
    // Only run on iOS
    if (Platform.OS !== "ios") {
        console.log("[Background Task] Skipping unregister - iOS only");
        return;
    }

    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
        console.log("[Background Task] Unregistered successfully");
    } catch (error) {
        console.error("[Background Task] Unregister failed:", error);
    }
}

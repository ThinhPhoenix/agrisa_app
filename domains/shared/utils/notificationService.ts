import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const initializeNotifications = () => {
  // Set up notification channel for Android
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      showBadge: false,
    });
  }

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Add listener for foreground notifications
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received in foreground:", notification);
      // Just log, don't show toast
    }
  );

  return subscription;
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Notification permissions not granted");
    return false;
  }
  return true;
};

export const scheduleTestNotification = async ({ title, body }: any) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || "n/a",
      body: body || "n/a",
      ...(Platform.OS === "android" && { channelId: "default" }),
    },
    trigger: null,
  });
};

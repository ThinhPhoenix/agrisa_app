import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * 🔔 Notification Settings - Cài đặt thông báo cho nông dân
 *
 * Features:
 * - Nhận thông báo (bật/tắt tổng thể)
 * - Thông báo thời tiết (dự báo mưa, nắng nóng...)
 * - Thông báo tình trạng thửa ruộng (từ vệ tinh)
 * - Thông báo yêu cầu bồi thường
 * - Thông báo khuyến mãi/ưu đãi
 * - Thông báo hệ thống
 */
interface NotificationSettings {
  enabled: boolean; // Nhận thông báo tổng thể
  weather: boolean; // Thông báo thời tiết
  farmStatus: boolean; // Tình trạng thửa ruộng
  claims: boolean; // Yêu cầu chi trả
  promotions: boolean; // Khuyến mãi/ưu đãi
  system: boolean; // Thông báo hệ thống
}

/**
 * 🔐 Security Settings - Cài đặt bảo mật
 */
interface SecuritySettings {
    biometricEnabled: boolean; // Face ID / Vân tay
    autoLockTimeout: number; // Tự động khóa sau X phút (0 = tắt)
}

interface SettingsState {
    notifications: NotificationSettings;
    security: SecuritySettings;

    // Actions
    toggleNotification: (key: keyof NotificationSettings) => void;
    toggleBiometric: () => void;
    setAutoLockTimeout: (minutes: number) => void;
    resetToDefault: () => void;
}

const DEFAULT_SETTINGS = {
    notifications: {
        enabled: false,
        weather: true,
        farmStatus: true,
        claims: true,
        promotions: false,
        system: true,
    },
    security: {
        biometricEnabled: false,
        autoLockTimeout: 5, // 5 phút
    },
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_SETTINGS,

            toggleNotification: (key) =>
                set((state) => ({
                    notifications: {
                        ...state.notifications,
                        [key]: !state.notifications[key],
                    },
                })),

            toggleBiometric: () =>
                set((state) => ({
                    security: {
                        ...state.security,
                        biometricEnabled: !state.security.biometricEnabled,
                    },
                })),

            setAutoLockTimeout: (minutes) =>
                set((state) => ({
                    security: {
                        ...state.security,
                        autoLockTimeout: minutes,
                    },
                })),

            resetToDefault: () => set(DEFAULT_SETTINGS),
        }),
        {
            name: "agrisa-settings-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

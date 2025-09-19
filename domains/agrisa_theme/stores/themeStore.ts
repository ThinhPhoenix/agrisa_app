import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// Key để lưu theme trong AsyncStorage
const THEME_STORAGE_KEY = "agrisa_theme";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  isInitialized: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // State mặc định
  mode: "light", // Mặc định Light Mode cho nông dân
  isInitialized: false,

  // Thay đổi theme và lưu vào storage
  setTheme: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ mode });
      console.log(`🎨 [Agrisa] Theme đã chuyển sang: ${mode}`);
    } catch (error) {
      console.error("❌ [Agrisa] Lỗi khi lưu theme:", error);
    }
  },

  // Toggle giữa Light và Dark mode
  toggleTheme: async () => {
    const currentMode = get().mode;
    const newMode = currentMode === "light" ? "dark" : "light";
    await get().setTheme(newMode);
  },

  // Khởi tạo theme từ storage khi app khởi động
  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme === "light" || savedTheme === "dark") {
        set({ mode: savedTheme, isInitialized: true });
        console.log(`🎨 [Agrisa] Theme đã load từ storage: ${savedTheme}`);
      } else {
        // Nếu chưa có theme được lưu, sử dụng mặc định
        set({ mode: "light", isInitialized: true });
        console.log("🎨 [Agrisa] Sử dụng theme mặc định: light");
      }
    } catch (error) {
      console.error("❌ [Agrisa] Lỗi khi load theme từ storage:", error);
      // Fallback về light mode nếu có lỗi
      set({ mode: "light", isInitialized: true });
    }
  },
}));

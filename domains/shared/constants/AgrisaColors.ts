/**
 * 🎨 Hệ thống màu sắc Agrisa
 */

export const AgrisaColors = {
  light: {
    // Background colors
    primary: "#059669",
    background: "#ffffff", // Nền trắng tinh khiết
    card_surface: "#f8f9fa", // Bề mặt cards nhạt

    // Text colors (tối để dễ đọc trên nền sáng)
    primary_text: "#1a1a1a", // Text chính đen
    secondary_text: "#4a5568", // Text phụ xám
    muted_text: "#718096", // Text mờ
    white_button_text: "#f7fafc",

    // Brand colors Agrisa
    success: "#059669",
    warning: "#ea580c", // Cam cảnh báo
    error: "#dc2626", // Đỏ lỗi
    info: "#0ea5e9", // Xanh thông tin
    pending: "#f59e0b", // Màu chờ

    // Soft backgrounds cho badges/pills
    primarySoft: "#fef3c7",
    successSoft: "#d1fae5",
    warningSoft: "#fed7aa",
    errorSoft: "#fee2e2",
    infoSoft: "#dbeafe",

    // UI elements
    frame_border: "#e5e7eb", // Viền nhạt
    shadow: "rgba(0,0,0,0.1)", // Bóng nhẹ
    overlay: "rgba(0,0,0,0.5)",

    // Status colors
    online: "#10b981",
    offline: "#6b7280",
  },

  // 🌙 DARK MODE
  dark: {
    // Background colors
    primary: "#059669",
    background: "#ffffff", // Nền trắng tinh khiết
    card_surface: "#f8f9fa", // Bề mặt cards nhạt

    // Text colors (tối để dễ đọc trên nền sáng)
    primary_text: "#1a1a1a", // Text chính đen
    secondary_text: "#4a5568", // Text phụ xám
    muted_text: "#718096", // Text mờ
    white_button_text: "#f7fafc",

    // Brand colors Agrisa
    success: "#059669",
    warning: "#ea580c", // Cam cảnh báo
    error: "#dc2626", // Đỏ lỗi
    info: "#0ea5e9", // Xanh thông tin
    pending: "#f59e0b", // Màu chờ

    // Soft backgrounds cho badges/pills
    primarySoft: "#fef3c7",
    successSoft: "#d1fae5",
    warningSoft: "#fed7aa",
    errorSoft: "#fee2e2",
    infoSoft: "#dbeafe",

    // UI elements
    frame_border: "#e5e7eb", // Viền nhạt
    shadow: "rgba(0,0,0,0.1)", // Bóng nhẹ
    overlay: "rgba(0,0,0,0.5)",

    // Status colors
    online: "#10b981",
    offline: "#6b7280",
  },
};

export type ColorKey = keyof typeof AgrisaColors.light;

// ✅ Export theme mặc định
export const DEFAULT_THEME: "light" | "dark" = "light";

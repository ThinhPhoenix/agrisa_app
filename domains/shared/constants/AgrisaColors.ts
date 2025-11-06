/**
 * 🎨 Hệ thống màu sắc Agrisa
 */

export const AgrisaColors = {
  // 🌞 LIGHT MODE - Theme mặc định cho nông dân
  light: {
    // Background colors
    primary: "#fbe9a8", // Vàng nhạt - dễ nhìn ngoài trời
    background: "#ffffff", // Nền trắng tinh khiết
    surface: "#f8f9fa", // Bề mặt cards nhạt
    card: "#F8FAFC", // Cards trắng

    // Text colors (tối để dễ đọc trên nền sáng)
    text: "#1a1a1a", // Text chính đen
    textSecondary: "#4a5568", // Text phụ xám
    textMuted: "#718096", // Text mờ
    textWhiteButton: "#f7fafc",

    // Brand colors Agrisa
    success: "#059669", // Xanh lá đặc trưng
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
    border: "#4a5568", // Viền nhạt
    borderActive: "#059669", // Viền active
    shadow: "rgba(0,0,0,0.1)", // Bóng nhẹ
    overlay: "rgba(0,0,0,0.5)",

    // Status colors
    online: "#10b981",
    offline: "#6b7280",
  },

  // 🌙 DARK MODE
  dark: {
    // Background colors
    primary: "#262624", // Xám đen chuyên nghiệp
    background: "#1a1a1a", // Nền đen
    surface: "#2d2d2b", // Bề mặt cards
    card: "#363634", // Cards tối

    // Text colors (sáng để dễ đọc trên nền tối)
    text: "#f7fafc", // Text chính trắng
    textSecondary: "#cbd5e0", // Text phụ xám sáng
    textMuted: "#a0aec0", // Text mờ
    textWhiteButton: "#f7fafc",

    // Brand colors
    success: "#10b981", // Xanh lá sáng hơn
    warning: "#f97316", // Cam sáng hơn
    error: "#f87171", // Đỏ sáng hơn
    info: "#38bdf8", // Xanh sáng hơn
    pending: "#fbbf24", // Màu chờ sáng hơn

    // Soft backgrounds cho badges/pills
    primarySoft: "#3f3f1e",
    successSoft: "#064e3b",
    warningSoft: "#7c2d12",
    errorSoft: "#7f1d1d",
    infoSoft: "#164e63",

    // UI elements
    border: "#4a5568", // Viền tối
    borderActive: "#10b981", // Viền active
    shadow: "rgba(0,0,0,0.3)", // Bóng đậm hơn
    overlay: "rgba(0,0,0,0.7)",

    // Status colors
    online: "#34d399",
    offline: "#9ca3af",
  },
};

export type ColorKey = keyof typeof AgrisaColors.light;

// ✅ Export theme mặc định
export const DEFAULT_THEME: "light" | "dark" = "light";

/**
 * Utilities cho việc xử lý parameter names trong monitoring data
 */

// Mapping từ data_source_id sang tên hiển thị
export const PARAMETER_LABELS: Record<string, string> = {
  ndvi: "NDVI - Sức khỏe thực vật",
  ndmi: "NDMI - Độ ẩm thực vật",
  ndwi: "NDWI - Độ ẩm đất",
  evi: "EVI - Chỉ số thực vật nâng cao",
  savi: "SAVI - Chỉ số thực vật điều chỉnh",
  lai: "LAI - Chỉ số diện tích lá",
  gci: "GCI - Chỉ số xanh lá",
  msavi: "MSAVI - SAVI cải tiến",
};

// Mapping màu sắc cho từng parameter (để dễ phân biệt trên chart)
export const PARAMETER_COLORS: Record<string, string> = {
  ndvi: "#22c55e", // green
  ndmi: "#3b82f6", // blue
  ndwi: "#06b6d4", // cyan
  evi: "#10b981", // emerald
  savi: "#84cc16", // lime
  lai: "#eab308", // yellow
  gci: "#14b8a6", // teal
  msavi: "#6366f1", // indigo
};

/**
 * Lấy label hiển thị cho parameter
 */
export const getParameterLabel = (parameterId: string): string => {
  const normalized = parameterId.toLowerCase();
  return PARAMETER_LABELS[normalized] || parameterId.toUpperCase();
};

/**
 * Lấy màu cho parameter
 */
export const getParameterColor = (
  parameterId: string,
  defaultColor: string = "#6b7280"
): string => {
  const normalized = parameterId.toLowerCase();
  return PARAMETER_COLORS[normalized] || defaultColor;
};

/**
 * Lấy short label (chỉ phần viết tắt)
 */
export const getParameterShortLabel = (parameterId: string): string => {
  const normalized = parameterId.toLowerCase();
  return normalized.toUpperCase();
};

/**
 * Utilities để phân tích dữ liệu monitoring cho farmer
 */

/**
 * Phân tích data quality
 */
export const analyzeDataQuality = (quality: string): string => {
  const qualityMap: Record<string, string> = {
    excellent: "Xuất sắc - Dữ liệu rất chính xác",
    good: "Tốt - Dữ liệu đáng tin cậy",
    acceptable: "Chấp nhận được - Dữ liệu ổn định",
    poor: "Kém - Cần kiểm tra lại",
    unavailable: "Không khả dụng",
  };
  
  return qualityMap[quality.toLowerCase()] || quality;
};

/**
 * Phân tích confidence score
 */
export const analyzeConfidence = (score: number): string => {
  if (score >= 0.9) return "Rất tin cậy";
  if (score >= 0.75) return "Tin cậy";
  if (score >= 0.6) return "Khá tin cậy";
  if (score >= 0.4) return "Trung bình";
  return "Cần xem xét";
};

/**
 * Phân tích cloud cover
 */
export const analyzeCloudCover = (percentage: number): string => {
  if (percentage < 10) return "Rất tốt - Ít mây";
  if (percentage < 30) return "Tốt - Ít ảnh hưởng";
  if (percentage < 50) return "Khá - Có ảnh hưởng nhỏ";
  if (percentage < 70) return "Trung bình - Ảnh hưởng vừa";
  return "Kém - Mây nhiều";
};

/**
 * Phân tích biên độ (range) của giá trị
 */
export const analyzeRange = (max: number, min: number, avg: number): string => {
  const range = max - min;
  const rangePercent = avg !== 0 ? (range / Math.abs(avg)) * 100 : 0;
  
  if (rangePercent < 10) return "Rất ổn định";
  if (rangePercent < 25) return "Ổn định";
  if (rangePercent < 50) return "Biến động vừa";
  if (rangePercent < 75) return "Biến động nhiều";
  return "Rất biến động";
};

/**
 * Phân tích measurement source
 */
export const analyzeMeasurementSource = (source: string): string => {
  const sourceMap: Record<string, string> = {
    "sentinel-2": "Vệ tinh Sentinel-2 (ESA)",
    "landsat-8": "Vệ tinh Landsat-8 (NASA)",
    "modis": "Vệ tinh MODIS (NASA)",
    "satellite": "Vệ tinh quan sát Trái Đất",
  };
  
  const normalized = source.toLowerCase();
  return sourceMap[normalized] || source;
};

/**
 * Format số liệu thống kê
 */
export const formatStatValue = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

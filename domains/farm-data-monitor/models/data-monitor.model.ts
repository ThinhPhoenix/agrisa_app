/**
 * Model cho Farm Monitoring Data - Dữ liệu giám sát nông trại
 */

/**
 * Component data statistics - Thống kê dữ liệu thành phần
 */
export interface ComponentDataStatistics {
  max: number;
  median: number;
  min: number;
  stddev: number;
}

/**
 * Component data - Dữ liệu thành phần chi tiết
 */
export interface ComponentData {
  statistics: ComponentDataStatistics;
}

/**
 * Monitoring data item - Mục dữ liệu giám sát
 * Dữ liệu được liên kết với data_source_id từ trigger condition của base policy
 */
export interface MonitoringDataItem {
  id: string;
  farm_id: string;
  data_source_id: string; // ID của nguồn dữ liệu (liên kết với trigger condition trong base policy)
  parameter_name: string; // Tên tham số giám sát (ndmi, ndvi, etc.)
  measured_value: number;
  unit: string;
  measurement_timestamp: number; // Unix timestamp - thời điểm đo
  component_data: ComponentData;
  data_quality: string; // good, fair, poor
  confidence_score: number; // 0-1
  measurement_source: string; // Nguồn đo (Google Earth Engine, etc.)
  cloud_cover_percentage: number; // Độ che phủ mây (%)
  created_at: string; // ISO timestamp
  registered_policy_id: string; // ID của policy đã đăng ký liên quan
  policy_status: string; // Trạng thái policy (pending_payment, active, etc.)
  policy_number: string; // Mã hợp đồng policy
}

/**
 * Monitoring data response - Response chứa danh sách dữ liệu giám sát
 */
export interface MonitoringDataResponse {
  count: number;
  farm_id: string;
  monitoring_data: MonitoringDataItem[];
}

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
 */
export interface MonitoringDataItem {
  id: string;
  farm_id: string;
  base_policy_trigger_condition_id: string;
  parameter_name: string;
  measured_value: number;
  unit: string;
  measurement_timestamp: number;
  component_data: ComponentData;
  data_quality: string;
  confidence_score: number;
  measurement_source: string;
  cloud_cover_percentage: number;
  created_at: string;
  registered_policy_id: string;
  policy_status: string;
  policy_number: string;
}

/**
 * Monitoring data response - Response chứa danh sách dữ liệu giám sát
 */
export interface MonitoringDataResponse {
  count: number;
  farm_id: string;
  monitoring_data: MonitoringDataItem[];
}

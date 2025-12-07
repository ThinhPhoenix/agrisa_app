/**
 * Model cho Data Source - Nguồn dữ liệu giám sát nông trại
 */
export interface DataSource {
  id: string;
  data_source: string;
  parameter_name: string;
  parameter_type: string;
  unit: string;
  support_component: boolean;
  display_name_vi: string;
  description_vi: string;
  min_value: number;
  max_value: number;
  update_frequency: string;
  spatial_resolution: string;
  accuracy_rating: number;
  base_cost: number;
  data_tier_id: string;
  data_provider: string;
  api_endpoint: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

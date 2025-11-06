/**
 * Farm Models - Agrisa Platform
 *
 * Mô tả các models liên quan đến quản lý nông trại trong hệ thống Agrisa
 */

// ============= GEOJSON TYPES =============

/**
 * Point geometry - Tọa độ điểm (center của farm)
 * Format: [longitude, latitude]
 */
export interface PointGeometry {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

/**
 * Polygon geometry - Ranh giới nông trại
 * Coordinates là array của rings (outer ring + holes)
 * Mỗi ring là array của points [lng, lat]
 */
export interface PolygonGeometry {
  type: "Polygon";
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
}

// ============= ENUMS =============

/**
 * Loại cây trồng được hỗ trợ bảo hiểm
 */
export enum CropType {
  RICE = "rice",
  CORN = "corn",
  COFFEE = "coffee",
  PEPPER = "pepper",
  DRAGON_FRUIT = "dragon_fruit",
  DURIAN = "durian",
  OTHER = "other",
}

/**
 * Trạng thái nông trại
 */
export enum FarmStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING_VERIFICATION = "pending_verification",
  ARCHIVED = "archived",
}

/**
 * Loại hệ thống tưới tiêu
 */
export enum IrrigationType {
  CANAL = "canal",
  DRIP = "drip",
  SPRINKLER = "sprinkler",
  PUMP = "pump",
  RAIN_FED = "rain_fed",
  NONE = "none",
}

/**
 * Loại đất
 */
export enum SoilType {
  ALLUVIAL = "alluvial",
  CLAY = "clay",
  SANDY = "sandy",
  LOAM = "loam",
  PEAT = "peat",
  OTHER = "other",
}

// ============= MAIN INTERFACE =============

/**
 * Farm Model - Thông tin nông trại
 *
 * Mapping chính xác với response từ backend
 */
export interface Farm {
  /**
   * ID unique của farm (UUID)
   * @example "60f1ba11-c37d-40d3-97e2-0f2ac2ae20e8"
   */
  id: string;

  /**
   * Tên nông trại
   * @example "Trang trại lúa Đồng Tháp"
   */
  farm_name: string;

  /**
   * Mã code unique của farm
   * @example "dEA671o57D"
   */
  farm_code: string;

  /**
   * Ranh giới nông trại (GeoJSON Polygon)
   */
  boundary: PolygonGeometry;

  /**
   * Tọa độ trung tâm nông trại (GeoJSON Point)
   */
  center_location: PointGeometry;

  /**
   * Diện tích nông trại (m²)
   * @example 50000
   */
  area_sqm: number;

  /**
   * Tỉnh/Thành phố
   * @example "Đồng Tháp"
   */
  province: string;

  /**
   * Quận/Huyện
   * @example "Cao Lãnh"
   */
  district: string;

  /**
   * Phường/Xã
   * @example "Mỹ Hội"
   */
  commune: string;

  /**
   * Địa chỉ đầy đủ
   * @example "Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh, tỉnh Đồng Tháp"
   */
  address: string;

  /**
   * Loại cây trồng chính
   * @example "rice"
   */
  crop_type: string;

  /**
   * Ngày gieo trồng (Unix timestamp - giây)
   * @example 1704067200
   */
  planting_date: number;

  /**
   * Ngày thu hoạch dự kiến (Unix timestamp - giây)
   * @example 1714521600
   */
  expected_harvest_date: number;

  /**
   * Cây trồng đã được xác minh chưa
   */
  crop_type_verified: boolean;

  /**
   * Số giấy chứng nhận quyền sử dụng đất
   * @example "SH-2024-001234"
   */
  land_certificate_number: string;

  /**
   * Quyền sở hữu đất đai đã được xác minh chưa
   */
  land_ownership_verified: boolean;

  /**
   * Có hệ thống tưới tiêu không
   */
  has_irrigation: boolean;

  /**
   * Loại hệ thống tưới tiêu
   * @example "canal"
   */
  irrigation_type: string;

  /**
   * Loại đất
   * @example "alluvial"
   */
  soil_type: string;

  /**
   * Trạng thái nông trại
   * @example "active"
   */
  status: string;

  /**
   * Ngày tạo (ISO 8601 string)
   * @example "2025-11-06T13:20:58.742857687+07:00"
   */
  created_at: string;

  /**
   * Ngày cập nhật gần nhất (ISO 8601 string)
   * @example "2025-11-06T13:20:58.742857846+07:00"
   */
  updated_at: string;
}

// ============= DTO (Data Transfer Objects) =============

/**
 * DTO để tạo farm mới
 */
export interface FarmModel {
  farm_name: string;
  boundary: PolygonGeometry;
  center_location: PointGeometry;
  area_sqm: number;
  province: string;
  district: string;
  commune: string;
  address: string;
  crop_type: string;
  planting_date: number;
  expected_harvest_date: number;
  land_certificate_number: string;
  has_irrigation: boolean;
  irrigation_type: string;
  soil_type: string;
}

/**
 * DTO để cập nhật thông tin farm
 */
export interface FormFarmDTO {
  farm_name?: string;
  boundary?: PolygonGeometry;
  center_location?: PointGeometry;
  area_sqm?: number;
  province?: string;
  district?: string;
  commune?: string;
  address?: string;
  crop_type?: string;
  planting_date?: number;
  expected_harvest_date?: number;
  land_certificate_number?: string;
  has_irrigation?: boolean;
  irrigation_type?: string;
  soil_type?: string;
  status?: string;
}


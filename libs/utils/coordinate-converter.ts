import proj4 from "proj4";
import { convertVn2000ToWgs84Api, getCentralMeridianFromProvince } from "@/domains/shared/services/vn2000-api.service";

/**
 * Coordinate Converter Utility
 * Chuyển đổi tọa độ giữa các hệ quy chiếu khác nhau
 * 
 * Hỗ trợ:
 * - VN2000 -> WGS84 (qua API https://vn2000.vn)
 * - WGS84 -> VN2000 (qua proj4 - fallback)
 */

// ===== ĐỊNH NGHĨA CÁC HỆ TỌA ĐỘ =====

// WGS84 - Hệ tọa độ quốc tế (GPS, Google Maps, OpenStreetMap)
const WGS84 = "EPSG:4326";

// VN2000 - Hệ tọa độ quốc gia Việt Nam
// Sử dụng 3-degree Transverse Mercator zones theo tiêu chuẩn TCVN 9899-3:2014
// Reference: https://epsg.io/ và Tiều chuẩn quốc gia Việt Nam

// Hệ VN2000 3° zones (phổ biến nhất trên sổ đỏ)
const VN2000_3TM_105 = "+proj=tmerc +lat_0=0 +lon_0=105 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +units=m +no_defs"; // EPSG:9212 - Zone 3, 105°E (Hà Nội, Bắc Bộ)
const VN2000_3TM_106 = "+proj=tmerc +lat_0=0 +lon_0=106 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +units=m +no_defs"; // Múi 106°E (Thanh Hoá, Nghệ An)
const VN2000_3TM_107 = "+proj=tmerc +lat_0=0 +lon_0=107 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +units=m +no_defs"; // EPSG:9213 - Zone 4, 107°E (Huế, Đà Nẵng)
const VN2000_3TM_108 = "+proj=tmerc +lat_0=0 +lon_0=108 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +units=m +no_defs"; // EPSG:9214 - Zone 5, 108°E (Lâm Đồng, Khánh Hòa)
const VN2000_3TM_109 = "+proj=tmerc +lat_0=0 +lon_0=109 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +units=m +no_defs"; // EPSG:9215 - Zone 6, 109°E (Đồng Nai, Bình Dương)

// Mapping zone number sang projection (theo sổ đỏ VN)
const ZONE_TO_PROJECTION: Record<number, string> = {
  3: VN2000_3TM_105,  // Múi 105°E - Bắc Bộ
  4: VN2000_3TM_107,  // Múi 107°E - Bắc Trung Bộ
  5: VN2000_3TM_108,  // Múi 108°E - Nam Trung Bộ, Tây Nguyên
  6: VN2000_3TM_109,  // Múi 109°E - Đông Nam Bộ
};

// Mapping tỉnh thành sang zone (dựa trên quy định của Bộ Tài nguyên Môi trường)
const PROVINCE_TO_ZONE: Record<string, number> = {
  // Zone 3 (105°E) - Bắc Bộ
  "Hà Nội": 3, "Hải Phòng": 3, "Quảng Ninh": 3, "Bắc Giang": 3,
  "Bắc Ninh": 3, "Hà Nam": 3, "Hưng Yên": 3, "Nam Định": 3,
  "Thái Bình": 3, "Vĩnh Phúc": 3, "Phú Thọ": 3,
  
  // Zone 4 (107°E) - Bắc Trung Bộ
  "Thanh Hóa": 4, "Nghệ An": 4, "Hà Tĩnh": 4, "Quảng Bình": 4,
  "Quảng Trị": 4, "Thừa Thiên Huế": 4,
  
  // Zone 5 (108°E) - Nam Trung Bộ, Tây Nguyên  
  "Đà Nẵng": 5, "Quảng Nam": 5, "Quảng Ngãi": 5, "Bình Định": 5,
  "Phú Yên": 5, "Khánh Hòa": 5, "Ninh Thuận": 5, "Bình Thuận": 5,
  "Kon Tum": 5, "Gia Lai": 5, "Đắc Lắc": 5, "Lâm Đồng": 5, // ⭐ Lâm Đồng dùng 108°E
  
  // Zone 6 (109°E) - Đông Nam Bộ
  "Bình Phước": 6, "Tây Ninh": 6, "Bình Dương": 6, "Đồng Nai": 6,
  "Bà Rịa - Vũng Tàu": 6, "TP. Hồ Chí Minh": 6, "Long An": 6,
  "Tiền Giang": 6, "Bến Tre": 6, "Trà Vinh": 6, "Vĩnh Long": 6,
  "Đồng Tháp": 6, "An Giang": 6, "Kiên Giang": 6, "Cần Thơ": 6,
  "Hậu Giang": 6, "Sóc Trăng": 6, "Bạc Liêu": 6, "Cà Mau": 6,
};

/**
 * Xác định múi chiếu VN2000 dựa trên zone number hoặc province
 */
function getVN2000ZoneProjection(zone?: number, province?: string): string {
  // Nếu có province, ưu tiên dùng để detect zone
  if (province) {
    const detectedZone = PROVINCE_TO_ZONE[province];
    if (detectedZone && ZONE_TO_PROJECTION[detectedZone]) {
      console.log(`🗺️ Auto-detected zone ${detectedZone} from province: ${province}`);
      return ZONE_TO_PROJECTION[detectedZone];
    }
  }
  
  // Nếu có zone number, dùng trực tiếp
  if (zone && ZONE_TO_PROJECTION[zone]) {
    return ZONE_TO_PROJECTION[zone];
  }
  
  // Default: 108°E (phổ biến nhất cho Tây Nguyên và miền Nam)
  console.log("⚠️ Using default zone 5 (108°E)");
  return VN2000_3TM_108;
}

/**
 * Xác định zone number từ province name
 */
export function detectZoneFromProvince(province?: string): number | undefined {
  if (!province) return undefined;
  return PROVINCE_TO_ZONE[province];
}

// ===== INTERFACE =====

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface VN2000Coordinate {
  easting: number; // Tọa độ X (Đông)
  northing: number; // Tọa độ Y (Bắc)
}

export interface BoundaryPolygon {
  type: "Polygon";
  coordinates: number[][][]; // GeoJSON format
}

// ===== COORDINATE CONVERTER =====

export class CoordinateConverter {
  /**
   * Chuyển đổi từ VN2000 sang WGS84 (Async - sử dụng API)
   * 
   * ⚠️ LƯU Ý QUAN TRỌNG: Trong sổ đỏ Việt Nam:
   * - Cột X = Northing (tọa độ Bắc) 
   * - Cột Y = Easting (tọa độ Đông)
   * 
   * @param x - Tọa độ X từ sổ đỏ (Northing) - ví dụ: 1325726.543
   * @param y - Tọa độ Y từ sổ đỏ (Easting) - ví dụ: 540472.728
   * @param province - Tên tỉnh/thành (VD: "Lâm Đồng") để tự động xác định central meridian
   * @returns Promise<Coordinate> trong hệ WGS84 (lat/lng)
   */
  static async vn2000ToWgs84(
    x: number,
    y: number,
    province?: string
  ): Promise<Coordinate> {
    try {
      // Validate input
      if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
        throw new Error(`Invalid VN2000 coordinates: X=${x}, Y=${y}`);
      }

      // Sử dụng API VN2000 để convert
      const { lat, lng } = await convertVn2000ToWgs84Api(x, y, province);

      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.error("❌ Error converting VN2000 to WGS84:", error);
      throw new Error("Không thể chuyển đổi tọa độ VN2000 sang WGS84");
    }
  }

  /**
   * Chuyển đổi từ WGS84 sang VN2000
   * @param latitude - Vĩ độ (WGS84)
   * @param longitude - Kinh độ (WGS84)
   * @param zone - Múi chiếu VN2000 (tùy chọn)
   * @returns VN2000Coordinate với x=Northing, y=Easting (theo convention sổ đỏ VN)
   */
  static wgs84ToVn2000(
    latitude: number,
    longitude: number,
    zone?: number
  ): VN2000Coordinate {
    try {
      const vn2000Proj = getVN2000ZoneProjection(zone);
      const [easting, northing] = proj4(WGS84, vn2000Proj, [
        longitude,
        latitude,
      ]);

      // Trả về theo convention sổ đỏ VN: x=Northing, y=Easting
      return { 
        easting: northing,  // X trong sổ đỏ = Northing
        northing: easting   // Y trong sổ đỏ = Easting
      };
    } catch (error) {
      console.error("❌ Error converting WGS84 to VN2000:", error);
      throw new Error("Không thể chuyển đổi tọa độ WGS84 sang VN2000");
    }
  }

  /**
   * Chuyển đổi boundary polygon từ VN2000 sang WGS84 (Async - sử dụng API)
   * 
   * ⚠️ LƯU Ý: Tọa độ trong boundary array theo format sổ đỏ VN:
   * [X, Y] = [Northing, Easting]
   * 
   * @param boundary - GeoJSON Polygon với tọa độ VN2000 [X, Y]
   * @param province - Tên tỉnh/thành để auto-detect central meridian
   * @returns Promise<GeoJSON Polygon> với tọa độ WGS84 [lng, lat]
   */
  static async convertBoundaryVn2000ToWgs84(
    boundary: BoundaryPolygon,
    province?: string
  ): Promise<BoundaryPolygon> {
    try {
      if (!boundary?.coordinates?.[0]) {
        throw new Error("Invalid boundary format");
      }

      // Convert từng điểm: [X, Y] (sổ đỏ) → [lng, lat] (WGS84)
      const convertedCoords = await Promise.all(
        boundary.coordinates[0].map(async ([x, y]) => {
          // Validate coordinates
          if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
            console.error(`❌ Invalid coordinate: X=${x}, Y=${y}`);
            throw new Error(`Invalid VN2000 coordinate: X=${x}, Y=${y}`);
          }
          
          const { latitude, longitude } = await this.vn2000ToWgs84(x, y, province);
          return [longitude, latitude]; // GeoJSON format: [lng, lat]
        })
      );

      return {
        type: "Polygon",
        coordinates: [convertedCoords],
      };
    } catch (error) {
      console.error("❌ Error converting boundary VN2000 to WGS84:", error);
      throw new Error("Không thể chuyển đổi ranh giới từ VN2000 sang WGS84");
    }
  }

  /**
   * Chuyển đổi boundary polygon từ WGS84 sang VN2000
   * @param boundary - GeoJSON Polygon với tọa độ WGS84
   * @returns GeoJSON Polygon với tọa độ VN2000
   */
  static convertBoundaryWgs84ToVn2000(
    boundary: BoundaryPolygon
  ): BoundaryPolygon {
    try {
      if (!boundary?.coordinates?.[0]) {
        throw new Error("Invalid boundary format");
      }

      const convertedCoords = boundary.coordinates[0].map(([lng, lat]) => {
        const { easting, northing } = this.wgs84ToVn2000(lat, lng);
        return [easting, northing];
      });

      return {
        type: "Polygon",
        coordinates: [convertedCoords],
      };
    } catch (error) {
      console.error("❌ Error converting boundary WGS84 to VN2000:", error);
      throw new Error("Không thể chuyển đổi ranh giới từ WGS84 sang VN2000");
    }
  }

  /**
   * Tính trung tâm của polygon (WGS84)
   */
  static getPolygonCenter(boundary: BoundaryPolygon): Coordinate {
    try {
      if (!boundary?.coordinates?.[0]) {
        throw new Error("Invalid boundary format");
      }

      const coords = boundary.coordinates[0];
      const sumLng = coords.reduce((sum, [lng]) => sum + lng, 0);
      const sumLat = coords.reduce((sum, [, lat]) => sum + lat, 0);

      return {
        latitude: sumLat / coords.length,
        longitude: sumLng / coords.length,
      };
    } catch (error) {
      console.error("❌ Error calculating polygon center:", error);
      throw new Error("Không thể tính trung tâm polygon");
    }
  }

  /**
   * Validate tọa độ WGS84 có hợp lệ không
   */
  static isValidWgs84(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Validate tọa độ có nằm trong Việt Nam không
   */
  static isInVietnam(latitude: number, longitude: number): boolean {
    // Phạm vi Việt Nam: 8°N - 24°N, 102°E - 110°E
    return (
      latitude >= 8 &&
      latitude <= 24 &&
      longitude >= 102 &&
      longitude <= 110
    );
  }

  /**
   * Format tọa độ WGS84 thành string hiển thị
   */
  static formatWgs84(latitude: number, longitude: number): string {
    const latDir = latitude >= 0 ? "N" : "S";
    const lngDir = longitude >= 0 ? "E" : "W";
    return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lngDir}`;
  }
}

// ===== EXPORT =====
export default CoordinateConverter;

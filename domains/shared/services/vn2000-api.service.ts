/**
 * VN2000 API Service
 * Service để gọi API chuyển đổi tọa độ VN2000 sang WGS84
 * API: https://vn2000.vn
 */

import axios from 'axios';
import Constants from "expo-constants";
import vnMeridiansData from "../constants/vn-merdians.json";

// ===== TYPES =====

interface VN2000ApiResponse {
  success: boolean;
  message: string;
  data: {
    lat: number;
    lng: number;
  };
}

interface ProvinceInfo {
  code: number;
  name: string;
  meridian: number;
  merged: boolean;
  merged_provinces?: Array<{
    name: string;
    meridian: number;
  }>;
}

// ===== CONSTANTS =====

const VN2000_API_BASE_URL =
  Constants.expoConfig?.extra?.vn2000ApiUrl;
const DEFAULT_ZONE_WIDTH = 3; // Zone width luôn là 3 theo tiêu chuẩn VN2000

// ===== PROVINCE MAPPING =====

/**
 * Lấy central meridian từ tên tỉnh
 */
export function getCentralMeridianFromProvince(
  provinceName: string
): number | null {
  if (!provinceName) return null;

  // Normalize province name (remove accents, lowercase)
  const normalizedInput = provinceName.toLowerCase().trim();

  // Tìm province trong data
  const province = vnMeridiansData.provinces.find((p: ProvinceInfo) => {
    const normalizedProvinceName = p.name.toLowerCase();

    // Check exact match
    if (normalizedProvinceName === normalizedInput) {
      return true;
    }

    // Check partial match (e.g., "Lâm Đồng" matches "Lam Dong")
    if (
      normalizedProvinceName.includes(normalizedInput) ||
      normalizedInput.includes(normalizedProvinceName)
    ) {
      return true;
    }

    // Check merged provinces nếu có
    if (p.merged && p.merged_provinces) {
      return p.merged_provinces.some(
        (mp) =>
          mp.name.toLowerCase() === normalizedInput ||
          mp.name.toLowerCase().includes(normalizedInput) ||
          normalizedInput.includes(mp.name.toLowerCase())
      );
    }

    return false;
  });

  if (province) {
    console.log(`🗺️ Found meridian for ${provinceName}: ${province.meridian}°`);
    return province.meridian;
  }

  console.warn(
    `⚠️ Province not found in mapping: ${provinceName}, using default 107.75°`
  );
  return 107.75; // Default meridian cho Lâm Đồng
}

/**
 * Lấy tất cả provinces từ data
 */
export function getAllProvinces(): ProvinceInfo[] {
  return vnMeridiansData.provinces;
}

// ===== API SERVICE =====

/**
 * Chuyển đổi tọa độ VN2000 sang WGS84 qua API
 *
 * @param x - Tọa độ X từ sổ đỏ (Northing)
 * @param y - Tọa độ Y từ sổ đỏ (Easting)
 * @param province - Tên tỉnh/thành (VD: "Lâm Đồng")
 * @param centralMeridian - Central meridian (optional, auto-detect từ province nếu không có)
 * @returns Promise<{lat: number, lng: number}>
 */
export async function convertVn2000ToWgs84Api(
  x: number,
  y: number,
  province?: string,
  centralMeridian?: number
): Promise<{ lat: number; lng: number }> {
  try {
    // Validate input
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
      throw new Error(`Invalid VN2000 coordinates: X=${x}, Y=${y}`);
    }

    // Xác định central meridian
    let meridian = centralMeridian;
    if (!meridian && province) {
      const provinceMeridian = getCentralMeridianFromProvince(province);
      if (provinceMeridian !== null) {
        meridian = provinceMeridian;
      }
    }

    if (!meridian) {
      console.warn("⚠️ No meridian provided, using default 107.75°");
      meridian = 107.75;
    }

    // Gọi API
    const url = `${VN2000_API_BASE_URL}/vn2000towgs84`;
    const params = {
      x: x.toString(),
      y: y.toString(),
      zone_width: DEFAULT_ZONE_WIDTH.toString(),
      central_meridian: meridian.toString(),
    };

    console.log(`🌐 Calling VN2000 API:`, params);

    const response = await axios.get<VN2000ApiResponse>(url, { params });

    if (!response.data.success) {
      throw new Error(`API error: ${response.data.message}`);
    }

    const { lat, lng } = response.data.data;

    console.log(
      `✅ VN2000 → WGS84 (API): X=${x}, Y=${y}, meridian=${meridian}° → [${lng.toFixed(6)}°E, ${lat.toFixed(6)}°N]`
    );

    return { lat, lng };
  } catch (error: any) {
    console.error("❌ VN2000 API conversion error:", error);

    // Re-throw với message rõ ràng hơn
    if (axios.isAxiosError(error)) {
      throw new Error(`VN2000 API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Chuyển đổi nhiều điểm VN2000 sang WGS84
 */
export async function convertMultipleVn2000ToWgs84(
  coordinates: Array<[number, number]>,
  province?: string,
  centralMeridian?: number
): Promise<Array<{ lat: number; lng: number }>> {
  const meridian = centralMeridian || (province ? getCentralMeridianFromProvince(province) : null) || 107.75;
  
  console.log(`🌐 Converting ${coordinates.length} coordinates with meridian ${meridian}°`);

  // Convert từng điểm (có thể optimize bằng batch API nếu có)
  const results = await Promise.all(
    coordinates.map(([x, y]) => 
      convertVn2000ToWgs84Api(x, y, province, meridian)
    )
  );

  return results;
}

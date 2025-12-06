/**
 * ============================================
 * 🎴 CARD INFO UTILITIES
 * ============================================
 * Utilities để xử lý thông tin từ CCCD/CMND
 * - Parse địa chỉ thành province/district/ward
 * - Map CardInfo sang UserProfile
 */

import { UserProfile } from "@/domains/auth/models/auth.models";
import { CardInfoResponse } from "../models/ekyc.models";

/**
 * Interface cho parsed address
 */
export interface ParsedAddress {
  street?: string; // Số nhà, đường (phần đầu tiên)
  ward_name: string;
  district_name: string;
  province_name: string;
}

/**
 * Cắt địa chỉ từ CCCD thành các thành phần
 * 
 * Format địa chỉ CCCD: "Số nhà/Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
 * 
 * @example
 * Input: "633/35 KHU 9, PHÚ LỢI, THỦ DẦU MỘT, BÌNH DƯƠNG"
 * Output: {
 *   street: "633/35 KHU 9",
 *   ward_name: "PHÚ LỢI",
 *   district_name: "THỦ DẦU MỘT",
 *   province_name: "BÌNH DƯƠNG"
 * }
 * 
 * @param address - Địa chỉ từ CCCD
 * @returns ParsedAddress object
 */
export const parseAddress = (address: string): ParsedAddress => {
  // Loại bỏ khoảng trắng thừa và split bằng dấu phẩy
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  // Trường hợp thiếu thông tin
  if (parts.length < 3) {
    return {
      street: parts[0] || "",
      ward_name: parts[1] || "",
      district_name: parts[2] || "",
      province_name: "",
    };
  }

  // Trường hợp đầy đủ: Số nhà, Phường, Quận, Tỉnh
  if (parts.length >= 4) {
    return {
      street: parts[0],
      ward_name: parts[1],
      district_name: parts[2],
      province_name: parts[3],
    };
  }

  // Trường hợp 3 phần: Phường, Quận, Tỉnh (không có số nhà)
  return {
    ward_name: parts[0],
    district_name: parts[1],
    province_name: parts[2],
  };
};

/**
 * Map giới tính từ text sang code
 * @param sex - "NAM" hoặc "NỮ" từ CCCD
 * @returns "M" hoặc "F"
 */
export const mapGender = (sex: string): "M" | "F" => {
  const normalizedSex = sex.toUpperCase().trim();
  return normalizedSex === "NAM" ? "M" : "F";
};

/**
 * Map thông tin từ CCCD sang UserProfile để update
 * 
 * @param cardInfo - Response từ API getCardInfo
 * @returns Partial<UserProfile> - Chỉ các field cần update từ CCCD
 */
export const mapCardInfoToProfile = (
  cardInfo: CardInfoResponse
): Partial<UserProfile> => {
  // Parse địa chỉ hiện tại
  const parsedCurrentAddress = parseAddress(cardInfo.address);

  return {
    // Thông tin cơ bản từ CCCD
    full_name: cardInfo.name,
    date_of_birth: formatDateForBackend(cardInfo.dob),
    gender: mapGender(cardInfo.sex),
    nationality: cardInfo.nationality,

    // Địa chỉ thường trú (home)
    permanent_address: cardInfo.home,

    // Địa chỉ hiện tại (address) + parsed components
    current_address: cardInfo.address,
    ward_name: parsedCurrentAddress.ward_name,
    district_name: parsedCurrentAddress.district_name,
    province_name: parsedCurrentAddress.province_name,
  };
};

/**
 * Format lại ngày tháng từ dd/mm/yyyy sang yyyy-mm-dd (nếu backend yêu cầu)
 * @param dateStr - Ngày tháng format dd/mm/yyyy
 * @returns Ngày tháng format yyyy-mm-dd hoặc giữ nguyên
 */
export const formatDateForBackend = (dateStr: string): string => {
  // Nếu đã đúng format yyyy-mm-dd rồi thì return luôn
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Convert từ dd/mm/yyyy sang yyyy-mm-dd
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }

  // Giữ nguyên nếu không match format nào
  return dateStr;
};

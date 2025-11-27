import { UserProfile } from "../models/auth.models";

/**
 * Helper kiểm tra xem UserProfile đã đầy đủ thông tin bắt buộc cho eKYC chưa
 * 
 * @param profile - UserProfile object từ API /auth/me
 * @returns true nếu đã đầy đủ thông tin, false nếu thiếu
 */
export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;

  // Kiểm tra tất cả các field bắt buộc theo schema
  const requiredFields = [
    profile.full_name,
    profile.display_name,
    profile.date_of_birth,
    profile.gender,
    profile.nationality,
    profile.primary_phone,
    profile.permanent_address,
    profile.current_address,
    profile.province_code,
    profile.province_name,
    profile.district_code,
    profile.district_name,
    profile.ward_code,
    profile.ward_name,
  ];

  // Kiểm tra không có field nào null, undefined, hoặc empty string
  return requiredFields.every(
    (field) => field !== null && field !== undefined && field.trim() !== ""
  );
};

/**
 * Lấy danh sách các field còn thiếu
 * 
 * @param profile - UserProfile object
 * @returns Mảng tên các field còn thiếu
 */
export const getMissingFields = (profile: UserProfile | null): string[] => {
  if (!profile) return ["Toàn bộ thông tin cá nhân"];

  const missingFields: string[] = [];

  if (!profile.full_name?.trim()) missingFields.push("Họ và tên");
  if (!profile.display_name?.trim()) missingFields.push("Tên hiển thị");
  if (!profile.date_of_birth?.trim()) missingFields.push("Ngày sinh");
  if (!profile.gender?.trim()) missingFields.push("Giới tính");
  if (!profile.nationality?.trim()) missingFields.push("Quốc tịch");
  if (!profile.primary_phone?.trim()) missingFields.push("Số điện thoại chính");
  if (!profile.permanent_address?.trim()) missingFields.push("Địa chỉ thường trú");
  if (!profile.current_address?.trim()) missingFields.push("Địa chỉ hiện tại");
  if (!profile.province_code?.trim()) missingFields.push("Mã tỉnh/thành phố");
  if (!profile.province_name?.trim()) missingFields.push("Tên tỉnh/thành phố");
  if (!profile.district_code?.trim()) missingFields.push("Mã quận/huyện");
  if (!profile.district_name?.trim()) missingFields.push("Tên quận/huyện");
  if (!profile.ward_code?.trim()) missingFields.push("Mã phường/xã");
  if (!profile.ward_name?.trim()) missingFields.push("Tên phường/xã");

  return missingFields;
};

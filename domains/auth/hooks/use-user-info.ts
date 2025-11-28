import { useAuthStore } from "../stores/auth.store";

/**
 * 🌾 Hook để lấy thông tin user ưu tiên từ UserProfile
 * 
 * Fallback logic:
 * - Ưu tiên lấy từ UserProfile (chi tiết từ /me)
 * - Nếu không có, fallback về AuthUser (dữ liệu cơ bản từ auth)
 * 
 * @example
 * ```tsx
 * const { fullName, email, phone } = useUserInfo();
 * ```
 */
export const useUserInfo = () => {
  const { user, userProfile } = useAuthStore();

  return {
    // ============================================
    // 📦 RAW DATA
    // ============================================
    user,
    userProfile,

    // ============================================
    // 👤 THÔNG TIN CƠ BẢN
    // ============================================
    
    /** Tên đầy đủ - Ưu tiên từ userProfile */
    fullName: userProfile?.full_name || null,
    
    /** Tên hiển thị - Ưu tiên từ userProfile */
    displayName: userProfile?.display_name || userProfile?.full_name || user?.email?.split("@")[0] || "Người dùng",
    
    /** Email - Ưu tiên từ userProfile */
    email: userProfile?.email || user?.email || null,
    
    /** Số điện thoại chính - Ưu tiên từ userProfile */
    phone: userProfile?.primary_phone || user?.phone_number || null,
    
    /** Số điện thoại phụ - Chỉ có trong userProfile */
    alternatePhone: userProfile?.alternate_phone || null,

    // ============================================
    // 🎂 THÔNG TIN CÁ NHÂN
    // ============================================
    
    /** Ngày sinh - Chỉ có trong userProfile */
    dateOfBirth: userProfile?.date_of_birth || null,
    
    /** Giới tính - Chỉ có trong userProfile */
    gender: userProfile?.gender || null,
    
    /** Quốc tịch - Chỉ có trong userProfile */
    nationality: userProfile?.nationality || null,

    // ============================================
    // 📍 ĐỊA CHỈ
    // ============================================
    
    /** Địa chỉ thường trú - Chỉ có trong userProfile */
    permanentAddress: userProfile?.permanent_address || null,
    
    /** Địa chỉ hiện tại - Chỉ có trong userProfile */
    currentAddress: userProfile?.current_address || null,
    
    /** Tỉnh/Thành phố - Chỉ có trong userProfile */
    province: {
      code: userProfile?.province_code || null,
      name: userProfile?.province_name || null,
    },
    
    /** Quận/Huyện - Chỉ có trong userProfile */
    district: {
      code: userProfile?.district_code || null,
      name: userProfile?.district_name || null,
    },
    
    /** Phường/Xã - Chỉ có trong userProfile */
    ward: {
      code: userProfile?.ward_code || null,
      name: userProfile?.ward_name || null,
    },
    
    /** Mã bưu chính - Chỉ có trong userProfile */
    postalCode: userProfile?.postal_code || null,

    // ============================================
    // ✅ TRẠNG THÁI
    // ============================================
    
    /** Trạng thái KYC - Từ AuthUser */
    isKycVerified: user?.kyc_verified || false,
    
    /** Trạng thái xác thực phone - Từ AuthUser */
    isPhoneVerified: user?.phone_verified || false,
    
    /** Trạng thái account - Từ AuthUser */
    accountStatus: user?.status || null,

    // ============================================
    // 🔍 CHECKS
    // ============================================
    
    /** Có UserProfile chi tiết hay không */
    hasDetailedProfile: !!userProfile,
    
    /** Có thông tin cơ bản hay không */
    hasBasicInfo: !!user,
  };
};

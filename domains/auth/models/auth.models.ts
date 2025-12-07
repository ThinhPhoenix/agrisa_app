export type SignInPayload = {
    email?: string;
    phone?: string;
    password: string;
};


export interface SignUpPayload {
  phone: string;
  email: string;
  password: string;
  national_id: string;  
}

export type checkIdentifierPayload = {
    identifier: string;
};

export type checkIdentifierResponse = {
    available: boolean;
};


export interface AuthUser {
  id: string;
  email: string;
  phone_number: string;
  status: "pending_verification" | "verified" | "suspended";
  kyc_verified: boolean;
  phone_verified: boolean;
}

export interface AuthSession {
  device_info: string;
  expires_at: string;
  ip_address: string;
  is_active: boolean;
  session_id: string;
}

export interface SignInResponse {
    access_token: string;
    session: AuthSession;
    user: AuthUser;
}

export interface SignInApiResponse extends ApiSuccessResponse<SignInResponse> {
  data: SignInResponse;
}

export interface UserProfile {
  profile_id: string;
  user_id: string;
  role_id: string;
  partner_id: string;
  full_name: string;
  display_name: string;
  date_of_birth: string;
  gender: "M" | "F" | string;
  nationality: string;
  primary_phone: string;
  alternate_phone: string;
  email: string;
  permanent_address: string;
  current_address: string;
  province_code: string;
  province_name: string;
  district_code: string;
  district_name: string;
  ward_code: string;
  ward_name: string;
  postal_code: string;
  // Thông tin ngân hàng để nhận bồi thường
  account_number: string;
  account_name: string;
  bank_code: string;
  created_at: string;
  updated_at: string;
  last_updated_by: string;
  last_updated_by_name: string;
}


/**
 * ============================================
 * AUTH STATE - Quản lý trạng thái xác thực
 * ============================================
 */
export interface AuthState {
  // ============================================
  // 📦 CORE DATA - Dữ liệu xác thực cốt lõi
  // ============================================

  /** Access token JWT từ backend */
  accessToken: string | null;

  /** Thông tin user cơ bản từ auth */
  user: AuthUser | null;

  /** Thông tin user chi tiết từ /me (nếu có) */
  userProfile: UserProfile | null;

  /** Trạng thái đã đăng nhập hay chưa */
  isAuthenticated: boolean;

  /** Trạng thái đang tải dữ liệu */
  isLoading: boolean;

  // ============================================
  // 🔐 AUTH ACTIONS - Các hành động xác thực
  // ============================================

  /**
   * Lưu thông tin xác thực sau khi đăng nhập thành công
   * - Lưu token vào SecureStore
   * - Lưu user data vào SecureStore
   * - Lưu identifier (email/phone) để hiển thị lại lần sau
   * - Cập nhật state
   */
  setAuth: (token: string, user: AuthUser) => Promise<void>;

  /**
   * Kiểm tra token có hợp lệ không
   * - Lấy token từ SecureStore
   * - Gọi API verify token
   * - Cập nhật state dựa trên kết quả
   * - Xử lý token expired (hiển thị alert)
   */
  checkAuth: () => Promise<void>;

  /**
   * Đăng xuất user
   * - Xóa token và user data từ SecureStore
   * - Reset state về null
   * - Redirect về trang sign-in
   * - GIỮ NGUYÊN identifier và biometric settings
   */
  logout: () => Promise<void>;

  /**
   * Làm mới dữ liệu xác thực từ SecureStore
   * - Lấy token và user từ SecureStore
   * - Cập nhật state nếu có data
   * - Dùng khi app khởi động hoặc resume
   */
  refreshAuth: () => Promise<void>;

  /**
   * Xóa toàn bộ dữ liệu xác thực
   * - Xóa token và user data
   * - Reset state về null
   * - KHÔNG xóa identifier và biometric settings
   */
  clearAuth: () => Promise<void>;

  /**
   * Lấy thông tin user profile chi tiết từ /me
   * - Gọi API /me để lấy UserProfile
   * - Lưu vào SecureStore và state
   * - Chỉ gọi khi đã authenticated
   * - Fallback về AuthUser nếu chưa có profile
   */
  fetchUserProfile: () => Promise<void>;

  // ============================================
  // 🔐 BIOMETRIC ACTIONS - Xác thực sinh trắc học
  // ============================================

  /**
   * Kích hoạt đăng nhập bằng biometric
   * - Mã hóa và lưu password vào SecureStore
   * - Enable biometric flag cho account
   * - Yêu cầu user nhập password để xác nhận
   *
   * @param password - Mật khẩu gốc của user (sẽ được mã hóa)
   * @returns Promise<boolean> - true nếu enable thành công
   */
  enableBiometric: (password: string) => Promise<boolean>;

  /**
   * Tắt đăng nhập bằng biometric
   * - Xóa password đã lưu trong SecureStore
   * - Disable biometric flag cho account
   * - Chỉ áp dụng cho account hiện tại trên device hiện tại
   */
  disableBiometric: () => Promise<void>;
}

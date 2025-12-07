/**
 * Enum các mã lỗi từ API Auth
 */
export enum AuthErrorCode {
  // Password errors
  INVALID_PASSWORD_FORMAT = "INVALID_PASSWORD_FORMAT",
  PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT",
  PASSWORD_TOO_WEAK = "PASSWORD_TOO_WEAK",

  // Account errors
  ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",
  ACCOUNT_ALREADY_EXISTS = "ACCOUNT_ALREADY_EXISTS",
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",

  // Credential errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_PHONE_FORMAT = "INVALID_PHONE_FORMAT",
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
  INVALID_NATIONAL_ID = "INVALID_NATIONAL_ID",

  // Token errors
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // General errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
}

/**
 * Map error code sang message hiển thị cho user
 * Dựa trên schema validation của auth
 */
export const AuthErrorMessages: Record<AuthErrorCode, string> = {
  // Password errors
  [AuthErrorCode.INVALID_PASSWORD_FORMAT]:
    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*#?&)",
  [AuthErrorCode.PASSWORD_TOO_SHORT]: "Mật khẩu phải có ít nhất 8 ký tự",
  [AuthErrorCode.PASSWORD_TOO_WEAK]:
    "Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn",

  // Account errors
  [AuthErrorCode.ACCOUNT_NOT_FOUND]: "Tài khoản không tồn tại trong hệ thống",
  [AuthErrorCode.ACCOUNT_ALREADY_EXISTS]:
    "Số điện thoại hoặc email đã được đăng ký",
  [AuthErrorCode.ACCOUNT_DISABLED]: "Tài khoản đã bị vô hiệu hóa",
  [AuthErrorCode.ACCOUNT_LOCKED]:
    "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần",

  // Credential errors
  [AuthErrorCode.INVALID_CREDENTIALS]: "Tên đăng nhập hoặc mật khẩu không đúng",
  [AuthErrorCode.INVALID_PHONE_FORMAT]:
    "Số điện thoại Việt Nam không hợp lệ. VD: +84901234567",
  [AuthErrorCode.INVALID_EMAIL_FORMAT]: "Email không hợp lệ",
  [AuthErrorCode.INVALID_NATIONAL_ID]: "Số CCCD phải có đúng 12 số",

  // Token errors
  [AuthErrorCode.TOKEN_EXPIRED]:
    "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  [AuthErrorCode.TOKEN_INVALID]: "Phiên đăng nhập không hợp lệ",

  // General errors
  [AuthErrorCode.VALIDATION_ERROR]: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại",
  [AuthErrorCode.INTERNAL_ERROR]: "Có lỗi xảy ra, vui lòng thử lại sau",
  [AuthErrorCode.NETWORK_ERROR]: "Lỗi kết nối mạng, vui lòng kiểm tra lại",
};

/**
 * Lấy message từ error code
 * @param code - Mã lỗi từ API
 * @returns Message hiển thị cho user
 */
export const getAuthErrorMessage = (code: string): string => {
  if (code in AuthErrorCode) {
    return AuthErrorMessages[code as AuthErrorCode];
  }
  return "Có lỗi xảy ra, vui lòng thử lại sau";
};

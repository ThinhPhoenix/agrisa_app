/**
 * Farm Error Handler Utilities
 * Xử lý và phân loại tất cả các loại lỗi từ CreateFarm API
 */

/**
 * Error categories dựa trên backend responses
 */
export enum FarmErrorCategory {
  // Validation Errors
  VALIDATION = "VALIDATION",
  
  // Authentication & Authorization
  AUTH = "AUTH",
  
  // File Upload Errors
  FILE_UPLOAD = "FILE_UPLOAD",
  
  // Land Certificate Verification
  LAND_CERTIFICATE = "LAND_CERTIFICATE",
  
  // Database/System Errors
  SYSTEM = "SYSTEM",
  
  // Network Errors
  NETWORK = "NETWORK",
  
  // Unknown Errors
  UNKNOWN = "UNKNOWN",
}

/**
 * Structured error information
 */
export interface FarmErrorInfo {
  category: FarmErrorCategory;
  title: string;
  message: string;
  subMessage?: string;
  technicalMessage?: string;
  httpStatus?: number;
  errorCode?: string;
  suggestions?: string[];
  canRetry?: boolean;
}

/**
 * Parse error từ API response
 */
export const parseFarmError = (error: any): FarmErrorInfo => {
  // Default error info
  const defaultError: FarmErrorInfo = {
    category: FarmErrorCategory.UNKNOWN,
    title: "Đăng ký thất bại",
    message: "Không thể đăng ký trang trại. Vui lòng thử lại.",
    canRetry: true,
  };

  if (!error) return defaultError;

  // Extract error information
  const httpStatus = error?.response?.status || error?.status;
  const responseData = error?.response?.data;
  const errorCode = responseData?.error?.code || error?.code;
  const errorMessage =
    responseData?.error?.message || error?.message || "";
  const apiMessage = errorMessage.toLowerCase();

  // 1. NETWORK ERRORS
  if (error.isNetworkError || errorCode === "NETWORK_OFFLINE") {
    return {
      category: FarmErrorCategory.NETWORK,
      title: "Không có kết nối",
      message: "Không thể kết nối đến server.",
      subMessage: "Vui lòng kiểm tra kết nối internet và thử lại.",
      httpStatus,
      errorCode,
      canRetry: true,
      suggestions: [
        "Kiểm tra kết nối Wi-Fi hoặc dữ liệu di động",
        "Thử lại sau vài giây",
      ],
    };
  }

  // 2. AUTHENTICATION & AUTHORIZATION ERRORS (401, 403)
  if (httpStatus === 401 || httpStatus === 403) {
    return parseAuthError(errorCode, errorMessage, httpStatus);
  }

  // 3. VALIDATION ERRORS (400)
  if (httpStatus === 400 || errorCode === "VALIDATION_FAILED") {
    return parseValidationError(errorMessage, httpStatus);
  }

  // 4. NOT FOUND ERRORS (404)
  if (httpStatus === 404) {
    return {
      category: FarmErrorCategory.AUTH,
      title: "Thiếu thông tin",
      message: "Bạn chưa cung cấp đầy đủ thông tin căn cước công dân.",
      subMessage: "Vui lòng cập nhật thông tin cá nhân trước khi đăng ký trang trại.",
      httpStatus,
      errorCode: errorCode || "NOT_FOUND",
      canRetry: false,
      suggestions: [
        "Truy cập Hồ sơ → Thông tin cá nhân",
        "Cập nhật đầy đủ thông tin CCCD",
      ],
    };
  }

  // 5. SERVER ERRORS (500)
  if (httpStatus === 500 || errorCode === "INTERNAL_SERVER_ERROR") {
    return parseServerError(errorMessage, httpStatus);
  }

  // 6. UNKNOWN ERRORS
  return {
    ...defaultError,
    technicalMessage: errorMessage,
    httpStatus,
    errorCode,
  };
};

/**
 * Parse Authentication/Authorization errors
 */
const parseAuthError = (
  errorCode: string,
  errorMessage: string,
  httpStatus: number
): FarmErrorInfo => {
  const msg = errorMessage.toLowerCase();

  // Thiếu User ID
  if (msg.includes("user id is required")) {
    return {
      category: FarmErrorCategory.AUTH,
      title: "Lỗi xác thực",
      message: "Không xác định được thông tin người dùng.",
      subMessage: "Vui lòng đăng xuất và đăng nhập lại.",
      httpStatus,
      errorCode: errorCode || "UNAUTHORIZED",
      canRetry: false,
      suggestions: ["Đăng xuất", "Đăng nhập lại"],
    };
  }

  // Thiếu hoặc sai Authorization header
  if (
    msg.includes("authorization header is missing") ||
    msg.includes("invalid authorization format") ||
    msg.includes("empty token")
  ) {
    return {
      category: FarmErrorCategory.AUTH,
      title: "Phiên đăng nhập hết hạn",
      message: "Phiên làm việc của bạn đã hết hạn.",
      subMessage: "Vui lòng đăng nhập lại để tiếp tục.",
      httpStatus,
      errorCode: errorCode || "UNAUTHORIZED",
      canRetry: false,
      suggestions: ["Đăng nhập lại"],
    };
  }

  // Lỗi xác thực land certificate
  if (msg.includes("land certificate verification failed")) {
    return {
      category: FarmErrorCategory.LAND_CERTIFICATE,
      title: "Xác minh giấy chứng nhận thất bại",
      message: "Không thể xác minh giấy chứng nhận quyền sử dụng đất.",
      subMessage: "Vui lòng kiểm tra lại thông tin hoặc ảnh chụp giấy tờ.",
      httpStatus,
      errorCode: errorCode || "UNAUTHORIZED",
      canRetry: true,
      suggestions: [
        "Kiểm tra thông tin trên giấy chứng nhận",
        "Chụp lại ảnh rõ nét, đầy đủ thông tin",
        "Đảm bảo thông tin CCCD khớp với giấy chứng nhận",
      ],
    };
  }

  // Forbidden
  if (httpStatus === 403) {
    return {
      category: FarmErrorCategory.AUTH,
      title: "Không có quyền truy cập",
      message: "Bạn không có quyền thực hiện thao tác này.",
      subMessage: "Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.",
      httpStatus,
      errorCode: errorCode || "FORBIDDEN",
      canRetry: false,
    };
  }

  // Default auth error
  return {
    category: FarmErrorCategory.AUTH,
    title: "Lỗi xác thực",
    message: errorMessage || "Không thể xác thực người dùng.",
    subMessage: "Vui lòng đăng nhập lại và thử lại.",
    httpStatus,
    errorCode,
    canRetry: false,
  };
};

/**
 * Parse Validation errors
 */
const parseValidationError = (
  errorMessage: string,
  httpStatus: number
): FarmErrorInfo => {
  const msg = errorMessage.toLowerCase();

  // Parse JSON request body error
  if (msg.includes("invalid request body")) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Dữ liệu không hợp lệ",
      message: "Thông tin gửi lên không đúng định dạng.",
      subMessage: "Vui lòng kiểm tra lại tất cả các trường thông tin.",
      httpStatus,
      errorCode: "BAD_REQUEST",
      canRetry: true,
      suggestions: ["Kiểm tra lại tất cả các trường bắt buộc"],
    };
  }

  // Crop type errors
  if (msg.includes("crop_type is required")) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Thiếu loại cây trồng",
      message: "Bạn chưa chọn loại cây trồng.",
      subMessage: "Vui lòng chọn loại cây trồng cho trang trại.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Chọn loại cây trồng: Lúa hoặc Cà phê"],
    };
  }

  if (
    msg.includes("invalid crop_type") ||
    msg.includes("only rice or coffee allowed")
  ) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Loại cây trồng không hợp lệ",
      message: "Loại cây trồng bạn chọn không được hỗ trợ.",
      subMessage: "Hiện tại chỉ hỗ trợ Lúa và Cà phê.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Chọn Lúa hoặc Cà phê"],
    };
  }

  // Area errors
  if (msg.includes("area_sqm must be greater than 0")) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Diện tích không hợp lệ",
      message: "Diện tích trang trại phải lớn hơn 0.",
      subMessage: "Vui lòng nhập diện tích chính xác hoặc vẽ lại ranh giới.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: [
        "Nhập diện tích bằng số (m²)",
        "Hoặc vẽ ranh giới trên bản đồ",
      ],
    };
  }

  // Soil type errors
  if (msg.includes("soil_type is required")) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Thiếu loại đất",
      message: "Bạn chưa chọn loại đất.",
      subMessage: "Vui lòng chọn loại đất cho trang trại.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Chọn loại đất phù hợp với cây trồng"],
    };
  }

  if (msg.includes("invalid soil_type for the given crop_type")) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Loại đất không phù hợp",
      message: "Loại đất bạn chọn không phù hợp với loại cây trồng.",
      subMessage: "Vui lòng chọn loại đất phù hợp với cây trồng đã chọn.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: [
        "Lúa: Đất phù sa, đất phù sa pha cát",
        "Cà phê: Đất bazan, đất đỏ",
      ],
    };
  }

  // Date errors
  if (
    msg.includes("planting_date is required when expected_harvest_date is provided")
  ) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Thiếu ngày gieo trồng",
      message: "Bạn đã nhập ngày thu hoạch nhưng chưa nhập ngày gieo trồng.",
      subMessage: "Vui lòng nhập ngày gieo trồng.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Nhập ngày gieo trồng trước ngày thu hoạch"],
    };
  }

  if (
    msg.includes(
      "expected_harvest_date must be greater than or equal to planting_date"
    )
  ) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Ngày thu hoạch không hợp lệ",
      message: "Ngày thu hoạch phải sau ngày gieo trồng.",
      subMessage: "Vui lòng kiểm tra lại các ngày đã nhập.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Chọn ngày thu hoạch sau ngày gieo trồng"],
    };
  }

  // Owner national ID error
  if (msg.includes("owner_national_id is required")) {
    return {
      category: FarmErrorCategory.VALIDATION,
      title: "Thiếu số CCCD",
      message: "Bạn chưa nhập số căn cước công dân.",
      subMessage: "Vui lòng cập nhật thông tin CCCD trong hồ sơ cá nhân.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: false,
      suggestions: [
        "Truy cập Hồ sơ → Thông tin cá nhân",
        "Cập nhật số CCCD",
      ],
    };
  }

  // File validation errors
  if (
    msg.includes("invalid name") ||
    msg.includes("please check it")
  ) {
    return {
      category: FarmErrorCategory.FILE_UPLOAD,
      title: "Tên file không hợp lệ",
      message: "File bạn chọn có tên không hợp lệ.",
      subMessage: "Vui lòng đổi tên file và thử lại.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: [
        "Đổi tên file không chứa ký tự đặc biệt",
        "Sử dụng chữ cái, số và dấu gạch ngang",
      ],
    };
  }

  if (msg.includes("file extension is invalid")) {
    return {
      category: FarmErrorCategory.FILE_UPLOAD,
      title: "Định dạng file không hợp lệ",
      message: "File bạn chọn không đúng định dạng.",
      subMessage: "Chỉ chấp nhận file ảnh: JPG, JPEG, PNG.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Chọn file ảnh có định dạng JPG, JPEG hoặc PNG"],
    };
  }

  if (msg.includes("exceeds the maximum allowed size")) {
    return {
      category: FarmErrorCategory.FILE_UPLOAD,
      title: "File quá lớn",
      message: "File bạn chọn vượt quá dung lượng cho phép.",
      subMessage: "Vui lòng chọn file có kích thước nhỏ hơn.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: [
        "Nén ảnh trước khi tải lên",
        "Kích thước tối đa: 5MB/file",
      ],
    };
  }

  if (msg.includes("decode base64 error")) {
    return {
      category: FarmErrorCategory.FILE_UPLOAD,
      title: "Lỗi xử lý file",
      message: "Không thể xử lý file ảnh bạn chọn.",
      subMessage: "Vui lòng chọn file ảnh khác hoặc chụp lại.",
      httpStatus,
      errorCode: "VALIDATION_FAILED",
      canRetry: true,
      suggestions: ["Chụp ảnh mới", "Chọn ảnh khác từ thư viện"],
    };
  }

  // Default validation error
  return {
    category: FarmErrorCategory.VALIDATION,
    title: "Thông tin không hợp lệ",
    message: errorMessage || "Một số thông tin bạn nhập không hợp lệ.",
    subMessage: "Vui lòng kiểm tra lại tất cả các trường thông tin.",
    httpStatus,
    errorCode: "VALIDATION_FAILED",
    canRetry: true,
    suggestions: ["Kiểm tra lại các trường bắt buộc"],
  };
};

/**
 * Parse Server/System errors
 */
const parseServerError = (
  errorMessage: string,
  httpStatus: number
): FarmErrorInfo => {
  const msg = errorMessage.toLowerCase();

  // Land certificate verification API errors
  if (msg.includes("api verify nationalid error")) {
    return {
      category: FarmErrorCategory.LAND_CERTIFICATE,
      title: "Lỗi xác minh giấy tờ",
      message: "Hệ thống xác minh giấy chứng nhận gặp sự cố.",
      subMessage: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
      technicalMessage: errorMessage,
      httpStatus,
      errorCode: "INTERNAL_SERVER_ERROR",
      canRetry: true,
      suggestions: ["Thử lại sau 5 phút", "Liên hệ bộ phận hỗ trợ"],
    };
  }

  // MinIO upload errors
  if (msg.includes("failed to upload file") || msg.includes("bucket")) {
    return {
      category: FarmErrorCategory.FILE_UPLOAD,
      title: "Lỗi tải file",
      message: "Không thể tải file ảnh lên hệ thống.",
      subMessage: "Vui lòng thử lại hoặc chọn ảnh khác.",
      technicalMessage: errorMessage,
      httpStatus,
      errorCode: "INTERNAL_SERVER_ERROR",
      canRetry: true,
      suggestions: [
        "Kiểm tra kết nối internet",
        "Thử chọn ảnh khác",
        "Thử lại sau vài phút",
      ],
    };
  }

  // Farm creation errors
  if (msg.includes("error creating farm")) {
    return {
      category: FarmErrorCategory.SYSTEM,
      title: "Lỗi tạo trang trại",
      message: "Hệ thống không thể tạo trang trại.",
      subMessage: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
      technicalMessage: errorMessage,
      httpStatus,
      errorCode: "INTERNAL_SERVER_ERROR",
      canRetry: true,
      suggestions: ["Thử lại sau 5 phút", "Liên hệ bộ phận hỗ trợ"],
    };
  }

  // Imagery worker errors
  if (
    msg.includes("error creating imagery worker") ||
    msg.includes("error starting imagery worker")
  ) {
    return {
      category: FarmErrorCategory.SYSTEM,
      title: "Lỗi khởi tạo giám sát",
      message: "Không thể khởi tạo hệ thống giám sát vệ tinh cho trang trại.",
      subMessage:
        "Trang trại đã được tạo nhưng chức năng giám sát có thể chưa hoạt động. Vui lòng liên hệ hỗ trợ.",
      technicalMessage: errorMessage,
      httpStatus,
      errorCode: "INTERNAL_SERVER_ERROR",
      canRetry: false,
      suggestions: ["Liên hệ bộ phận hỗ trợ để kích hoạt giám sát"],
    };
  }

  // Default server error
  return {
    category: FarmErrorCategory.SYSTEM,
    title: "Lỗi hệ thống",
    message: "Hệ thống gặp sự cố không xác định.",
    subMessage: "Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.",
    technicalMessage: errorMessage,
    httpStatus,
    errorCode: "INTERNAL_SERVER_ERROR",
    canRetry: true,
    suggestions: ["Thử lại sau 5-10 phút", "Liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn"],
  };
};

/**
 * Format error message cho user-friendly display
 */
export const formatFarmErrorMessage = (errorInfo: FarmErrorInfo): string => {
  let message = `**${errorInfo.title}**\n\n${errorInfo.message}`;

  if (errorInfo.subMessage) {
    message += `\n\n${errorInfo.subMessage}`;
  }

  if (errorInfo.suggestions && errorInfo.suggestions.length > 0) {
    message += "\n\n**Gợi ý:**";
    errorInfo.suggestions.forEach((suggestion, index) => {
      message += `\n${index + 1}. ${suggestion}`;
    });
  }

  return message;
};

/**
 * Determine if error should show retry button
 */
export const canRetryFarmError = (errorInfo: FarmErrorInfo): boolean => {
  return errorInfo.canRetry ?? true;
};

/**
 * Get action buttons for error
 */
export const getFarmErrorActions = (
  errorInfo: FarmErrorInfo
): { label: string; action: string }[] => {
  const actions: { label: string; action: string }[] = [];

  // Always show home button
  actions.push({ label: "Về trang chủ", action: "home" });

  // Show retry if applicable
  if (errorInfo.canRetry) {
    actions.push({ label: "Thử lại", action: "retry" });
  }

  // Show profile button for auth errors
  if (
    errorInfo.category === FarmErrorCategory.AUTH &&
    (errorInfo.errorCode === "NOT_FOUND" ||
      errorInfo.message.includes("CCCD"))
  ) {
    actions.push({ label: "Cập nhật hồ sơ", action: "profile" });
  }

  // Show support button for system errors
  if (errorInfo.category === FarmErrorCategory.SYSTEM) {
    actions.push({ label: "Liên hệ hỗ trợ", action: "support" });
  }

  return actions;
};

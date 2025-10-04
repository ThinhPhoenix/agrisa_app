import { secureStorage } from "@/domains/shared/utils/secureStorage";
import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";

/**
 * Network utility functions
 */
class NetworkUtils {
  /**
   * Check nếu có kết nối mạng
   */
  static async isOnline(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected ?? false;
    } catch (error) {
      console.warn("Network check failed:", error);
      return false;
    }
  }

  /**
   * Show offline error message
   */
  static getOfflineError() {
    return {
      code: "NETWORK_OFFLINE",
      message: "Không có kết nối internet. Vui lòng kiểm tra và thử lại.",
    };
  }
}

/**
 * ✅ Enhanced Axios instance với network detection
 * KHÔNG SỬ DỤNG top-level await
 */
const useAxios: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * ✅ Request interceptor - Lấy token ĐỘNG cho mỗi request
 */
useAxios.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    // Check network connectivity
    const isOnline = await NetworkUtils.isOnline();

    if (!isOnline) {
      // Throw network error ngay lập tức
      return Promise.reject({
        ...config,
        message: "No internet connection",
        code: "NETWORK_OFFLINE",
        isNetworkError: true,
      });
    }

    // ✅ Lấy token ĐỘNG từ storage cho mỗi request
    try {
      const token = await secureStorage.getToken();

      if (__DEV__) {
        console.log(
          "🔑 Token retrieved:",
          token ? `${String(token).substring(0, 20)}...` : "NULL"
        );
      }

      // ✅ Chỉ set Authorization nếu có token
      if (token && typeof token === "string") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // ⚠️ Không có token - có thể là public endpoint hoặc chưa login
        if (__DEV__) {
          console.warn("⚠️ No token found for request:", config.url);
        }
        // Xóa Authorization header nếu có
        delete config.headers.Authorization;
      }
    } catch (error) {
      console.error("❌ Error getting token:", error);
      delete config.headers.Authorization;
    }

    // Log request (development only)
    if (__DEV__) {
      console.debug("🌐 API Request:", {
        method: config.method,
        url: config.url,
        hasAuth: !!config.headers.Authorization,
        hasData: !!config.data,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle success/error và network errors
 * ✅ QUAN TRỌNG: Transform response.data thay vì return response object
 */
useAxios.interceptors.response.use(
  // Success handler
  (response) => {
    // Validate response structure theo convention
    const data = response.data;

    if (__DEV__) {
      console.debug("✅ API Success:", {
        url: response.config.url,
        status: response.status,
      });
    }

    // Backend trả success: true → return DATA thay vì response
    if (data && data.success === true) {
      return data; // ✅ RETURN response.data thay vì response
    }

    // Backend trả success: false → throw error
    if (data && data.success === false) {
      return Promise.reject({
        response,
        message: data.error?.message || "Request failed",
        code: data.error?.code || "UNKNOWN_ERROR",
        status: response.status,
        isApiError: true,
      });
    }

    // Unknown response format
    return Promise.reject({
      response,
      message: "Invalid response format",
      code: "RESPONSE_FORMAT_ERROR",
      status: response.status,
      isApiError: true,
    });
  },

  // Error handler
  async (error) => {
    // Network error (không có response)
    if (!error.response) {
      if (__DEV__) {
        console.error("❌ Network Error:", {
          url: error.config?.url,
          message: error.message,
        });
      }

      // Check nếu là offline error từ request interceptor
      if (error.isNetworkError) {
        return Promise.reject({
          ...error,
          message: error.message,
          code: "NETWORK_OFFLINE",
          isNetworkError: true,
        });
      }

      // Generic network error
      return Promise.reject({
        message: "Không thể kết nối đến server",
        code: "NETWORK_ERROR",
        isNetworkError: true,
      });
    }

    // HTTP error (4xx, 5xx)
    const status = error.response.status;
    const data = error.response.data;

    if (__DEV__) {
      console.error("❌ API Error:", {
        url: error.config.url,
        status,
        statusText: error.response.statusText,
        data,
      });
    }

    // ✅ Handle 401 Unauthorized - Token expired hoặc invalid
    if (status === 401) {
      if (__DEV__) {
        console.warn("🔐 Unauthorized - Token may be expired or invalid");
      }
      router.push("/auth/sign-in");
      return Promise.reject({
        response: error.response,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        code: "UNAUTHORIZED",
        status: 401,
        isAuthError: true,
      });
    }

    // Extract error theo convention
    if (data && data.success === false) {
      return Promise.reject({
        response: error.response,
        message: data.error?.message || "Request failed",
        code: data.error?.code || `HTTP_${status}`,
        status,
        isApiError: true,
      });
    }

    // Generic HTTP error
    return Promise.reject({
      response: error.response,
      message: `Server error (${status})`,
      code: `HTTP_${status}`,
      status,
      isApiError: true,
    });
  }
);

export default useAxios;

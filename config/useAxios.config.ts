import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import NetInfo from "@react-native-community/netinfo";

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
 * Enhanced Axios instance với network detection
 */
const useAxios: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://your-api-url.com/api",
  timeout: 15000, // Tăng timeout cho mobile network
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Request interceptor - Check network trước khi gửi
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

    // Log request (development only)
    if (__DEV__) {
      console.debug("🌐 API Request:", {
        method: config.method,
        url: config.url,
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

import { secureStorage } from "@/domains/shared/utils/secureStorage";
import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert } from "react-native";

// ✅ Extend AxiosRequestConfig để thêm skipAuth flag
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean; // Flag để bỏ qua authentication
  }
}

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

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const useAxios: AxiosInstance = axios.create({
  baseURL: API_URL,
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

    // ✅ Kiểm tra skipAuth flag - Nếu true thì bỏ qua việc thêm token
    if (config.skipAuth === true) {
      if (__DEV__) {
        console.log("🌐 Public endpoint (skipAuth): ", config.url);
      }
      // Xóa Authorization header nếu có
      delete config.headers.Authorization;
      return config;
    }

    // ✅ Lấy token ĐỘNG từ storage cho mỗi request (chỉ khi không có skipAuth)
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
        skipAuth: config.skipAuth,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Biến để tránh hiển thị nhiều alert 401 cùng lúc
let isShowing401Alert = false;

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

      // ✅ Clear auth data
      try {
        await secureStorage.clearAuth();
        console.log("🗑️ Auth data cleared due to 401");
      } catch (clearError) {
        console.error("❌ Error clearing auth:", clearError);
      }

      // ✅ Hiển thị alert chỉ 1 lần (tránh spam)
      if (!isShowing401Alert) {
        isShowing401Alert = true;

        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
          [
            {
              text: "Đăng nhập",
              onPress: () => {
                isShowing401Alert = false;
                router.replace("/auth/sign-in");
              },
            },
          ],
          {
            cancelable: false, // Không cho phép đóng bằng cách tap ngoài
            onDismiss: () => {
              isShowing401Alert = false;
            },
          }
        );
      }

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

import { logger } from "@/domains/shared/utils/logger";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert } from "react-native";

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
 * ✅ Request interceptor - CHỈ append token nếu có
 * Backend sẽ tự quyết định endpoint nào cần token
 */
useAxios.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const requestStartTime = Date.now();

    // Check network connectivity
    const isOnline = await NetworkUtils.isOnline();

    if (!isOnline) {
      logger.network.error(config.url || "unknown", {
        code: "NETWORK_OFFLINE",
        message: "No internet connection",
      });

      return Promise.reject({
        ...config,
        message: "No internet connection",
        code: "NETWORK_OFFLINE",
        isNetworkError: true,
      });
    }

    // ✅ Lấy token từ storage (KHÔNG cần check endpoint)
    try {
      const token = await secureStorage.getToken();

      // ✅ Nếu CÓ token → append vào header
      // Backend sẽ tự kiểm tra token có hợp lệ hay không
      if (token && typeof token === "string") {
        config.headers.Authorization = `Bearer ${token}`;

        logger.debug("Network", "Token attached to request", {
          action: "TOKEN_ATTACHED",
          data: {
            url: config.url,
            method: config.method?.toUpperCase(),
            tokenPreview: `${token.substring(0, 20)}...`,
          },
        });
      } else {
        // ✅ KHÔNG có token → Request vẫn tiếp tục (public endpoint)
        logger.debug("Network", "Request without token", {
          action: "NO_TOKEN",
          data: {
            url: config.url,
            method: config.method?.toUpperCase(),
          },
        });
      }
    } catch (error) {
      // ✅ Lỗi khi lấy token → Log warning nhưng request vẫn tiếp tục
      logger.warn("Network", "Error retrieving token", {
        action: "TOKEN_ERROR",
        data: { url: config.url, error },
      });
    }

    // Log request
    logger.network.request(
      config.url || "unknown",
      config.method || "GET",
      !!config.headers.Authorization
    );

    // Store start time for duration calculation
    (config as any)._requestStartTime = requestStartTime;

    return config;
  },
  (error) => {
    logger.network.error("Request interceptor error", error);
    return Promise.reject(error);
  }
);

// ✅ Biến để tránh hiển thị nhiều alert 401 cùng lúc
let isShowing401Alert = false;

/**
 * ✅ Response interceptor - XỬ LÝ TOKEN EXPIRED
 */
useAxios.interceptors.response.use(
  // Success handler
  (response) => {
    // ✅ Validate duration trước khi log
    const requestStartTime = (response.config as any)._requestStartTime;
    let duration = 0;

    if (requestStartTime && typeof requestStartTime === "number") {
      duration = Date.now() - requestStartTime;

      // ✅ Kiểm tra duration hợp lệ (< 5 phút)
      if (duration < 0 || duration > 3000) {
        logger.warn("Network", "Invalid duration detected", {
          action: "DURATION_ERROR",
          data: {
            duration,
            requestStartTime,
            currentTime: Date.now(),
          },
        });
        duration = 0; // Reset về 0 nếu không hợp lệ
      }
    } else {
      logger.warn("Network", "Missing request start time", {
        action: "MISSING_START_TIME",
        data: { url: response.config.url },
      });
    }

    logger.network.response(
      response.config.url || "unknown",
      response.status,
      duration
    );

    const data = response.data;

    // Backend trả success: true → return DATA
    if (data && data.success === true) {
      return data;
    }

    // Backend trả success: false → throw error
    if (data && data.success === false) {
      logger.error("Network", "API returned success: false", {
        action: "API_ERROR",
        data: {
          url: response.config.url,
          message: data.error?.message,
          code: data.error?.code,
        },
      });

      return Promise.reject({
        response,
        message: data.error?.message || "Request failed",
        code: data.error?.code || "UNKNOWN_ERROR",
        status: response.status,
        isApiError: true,
      });
    }

    // Unknown response format
    logger.error("Network", "Invalid response format", {
      action: "INVALID_RESPONSE",
      data: { url: response.config.url, status: response.status },
    });

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
      logger.network.error(error.config?.url || "unknown", {
        message: error.message,
        isNetworkError: true,
      });

      if (error.isNetworkError) {
        return Promise.reject({
          ...error,
          message: error.message,
          code: "NETWORK_OFFLINE",
          isNetworkError: true,
        });
      }

      return Promise.reject({
        message: "Không thể kết nối đến server",
        code: "NETWORK_ERROR",
        isNetworkError: true,
      });
    }

    // HTTP error (4xx, 5xx)
    const status = error.response.status;
    const data = error.response.data;

    logger.error("Network", `HTTP ${status} Error`, {
      action: "HTTP_ERROR",
      data: {
        url: error.config.url,
        status,
        statusText: error.response.statusText,
        errorData: data,
      },
    });

    // ✅ Handle 401 Unauthorized - TOKEN EXPIRED
    if (status === 401) {
      logger.auth.tokenExpired("Token expired or invalid (401)", {
        url: error.config.url,
      });

      // ✅ Clear auth data ngay lập tức
      try {
        await secureStorage.clearAuth();
        logger.auth.logout("Auth data cleared due to 401");
      } catch (clearError) {
        logger.auth.authError("Error clearing auth", clearError);
      }

      // ✅ Hiển thị alert CHỈ 1 LẦN
      if (!isShowing401Alert) {
        isShowing401Alert = true;
        logger.info("Auth", "Showing 401 alert to user");

        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
          [
            {
              text: "Đăng nhập",
              onPress: () => {
                isShowing401Alert = false;
                logger.auth.logout(
                  "User dismissed 401 alert, redirecting to sign-in"
                );
                router.replace("/auth/sign-in");
              },
            },
          ],
          {
            cancelable: false,
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

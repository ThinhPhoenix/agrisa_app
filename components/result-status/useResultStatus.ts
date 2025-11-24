import { router } from "expo-router";
import { ResultAction, ResultStatus } from "./index";

/**
 * Config để navigate đến Result Status Screen
 */
export interface ResultStatusConfig {
  status: ResultStatus;
  title?: string;
  message: string;
  subMessage?: string;
  actions?: ResultAction[];
  showHomeButton?: boolean;
  lockNavigation?: boolean;
  homeRoute?: string;
  autoRedirectSeconds?: number;
  autoRedirectRoute?: string;
}

/**
 * Hook để điều hướng đến Result Status Screen
 * 
 * @example
 * ```tsx
 * const result = useResultStatus();
 * 
 * // Success
 * result.showSuccess({
 *   title: "Đăng ký thành công!",
 *   message: "Bảo hiểm đã được đăng ký",
 *   autoRedirectSeconds: 3,
 *   autoRedirectRoute: "/(farmer)/farm"
 * });
 * 
 * // Error
 * result.showError({
 *   title: "Đăng ký thất bại",
 *   message: "Đã hết hạn đăng ký",
 *   actions: [
 *     { label: "Thử lại", onPress: () => router.back() }
 *   ]
 * });
 * ```
 */
export const useResultStatus = () => {
  /**
   * Navigate đến Result Status Screen với config
   * Sử dụng router.replace() để ngăn người dùng back về màn hình trước
   */
  const show = (config: ResultStatusConfig) => {
    // Encode config thành query params
    const params = {
      status: config.status,
      title: config.title || "",
      message: config.message,
      subMessage: config.subMessage || "",
      showHomeButton: config.showHomeButton !== false ? "true" : "false",
      lockNavigation: config.lockNavigation !== false ? "true" : "false",
      homeRoute: config.homeRoute || "/(tabs)/",
      autoRedirectSeconds: config.autoRedirectSeconds?.toString() || "",
      autoRedirectRoute: config.autoRedirectRoute || "",
      // Actions không thể pass qua params, cần handle khác
      // Có thể dùng global state hoặc navigation state
    };

    // Dùng replace để thay thế màn hình hiện tại
    // Người dùng không thể back về màn hình trước
    router.replace({
      pathname: "/result-status",
      params,
    });
  };

  /**
   * Hiển thị màn hình Success
   */
  const showSuccess = (
    config: Omit<ResultStatusConfig, "status">
  ) => {
    show({ ...config, status: "success" });
  };

  /**
   * Hiển thị màn hình Error
   */
  const showError = (
    config: Omit<ResultStatusConfig, "status">
  ) => {
    show({ ...config, status: "error" });
  };

  /**
   * Hiển thị màn hình Warning
   */
  const showWarning = (
    config: Omit<ResultStatusConfig, "status">
  ) => {
    show({ ...config, status: "warning" });
  };

  /**
   * Hiển thị màn hình Loading
   */
  const showLoading = (
    config: Omit<ResultStatusConfig, "status">
  ) => {
    show({ ...config, status: "loading" });
  };

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showLoading,
  };
};

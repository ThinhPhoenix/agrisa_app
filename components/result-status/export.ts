/**
 * Result Status Screen Components & Hooks
 * 
 * Component để hiển thị màn hình kết quả với 4 trạng thái:
 * - Success: Thành công
 * - Error: Lỗi
 * - Warning: Cảnh báo
 * - Loading: Đang xử lý
 * 
 * @example
 * ```tsx
 * import { useResultStatus } from "@/components/result-status";
 * 
 * const result = useResultStatus();
 * 
 * // Hiển thị success với auto redirect
 * result.showSuccess({
 *   title: "Thành công!",
 *   message: "Thao tác đã được thực hiện",
 *   autoRedirectSeconds: 3,
 *   autoRedirectRoute: "/(tabs)/"
 * });
 * 
 * // Hiển thị error
 * result.showError({
 *   title: "Lỗi",
 *   message: "Có lỗi xảy ra",
 *   showHomeButton: true
 * });
 * ```
 */

export { ResultStatusScreen } from "./index";
export type { ResultAction, ResultStatus, ResultStatusScreenProps } from "./index";
export { useResultStatus } from "./useResultStatus";
export type { ResultStatusConfig } from "./useResultStatus";


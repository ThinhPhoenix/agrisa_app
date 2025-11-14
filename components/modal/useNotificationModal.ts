import { useCallback, useState } from "react";
import { NotificationConfig, NotificationType } from "./NotificationModal";

/**
 * Hook quản lý NotificationModal
 * 
 * @example
 * ```tsx
 * const notification = useNotificationModal();
 * 
 * // Hiển thị thông báo thành công
 * notification.success("Đăng ký thành công!");
 * 
 * // Hiển thị thông báo lỗi với custom title
 * notification.error("Có lỗi xảy ra", { title: "Oops!" });
 * 
 * // Sử dụng trong JSX
 * <NotificationModal
 *   isOpen={notification.isOpen}
 *   {...notification.config}
 *   onClose={notification.hide}
 * />
 * ```
 */
export const useNotificationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    type: "info",
    content: "",
  });

  /**
   * Hiển thị modal với config tùy chỉnh
   */
  const show = useCallback(
    (
      type: NotificationType,
      content: string,
      options?: {
        title?: string;
        closeText?: string;
        onClose?: () => void;
      }
    ) => {
      setConfig({
        type,
        content,
        title: options?.title,
        closeText: options?.closeText,
        onClose: options?.onClose,
      });
      setIsOpen(true);
    },
    []
  );

  /**
   * Ẩn modal
   */
  const hide = useCallback(() => {
    setIsOpen(false);
    // Gọi callback onClose nếu có
    if (config.onClose) {
      config.onClose();
    }
  }, [config]);

  /**
   * Shortcut: Hiển thị thông báo thành công
   */
  const success = useCallback(
    (
      content: string,
      options?: {
        title?: string;
        closeText?: string;
        onClose?: () => void;
      }
    ) => {
      show("success", content, options);
    },
    [show]
  );

  /**
   * Shortcut: Hiển thị thông báo lỗi
   */
  const error = useCallback(
    (
      content: string,
      options?: {
        title?: string;
        closeText?: string;
        onClose?: () => void;
      }
    ) => {
      show("error", content, options);
    },
    [show]
  );

  /**
   * Shortcut: Hiển thị thông báo info
   */
  const info = useCallback(
    (
      content: string,
      options?: {
        title?: string;
        closeText?: string;
        onClose?: () => void;
      }
    ) => {
      show("info", content, options);
    },
    [show]
  );

  return {
    isOpen,
    config,
    show,
    hide,
    success,
    error,
    info,
  };
};

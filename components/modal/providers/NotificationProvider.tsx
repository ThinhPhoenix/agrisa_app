import { NotificationModal, useNotificationModal } from "@/components/modal";
import React, { createContext, ReactNode, useContext } from "react";

/**
 * Context type cho NotificationProvider
 */
type NotificationContextType = ReturnType<typeof useNotificationModal>;

/**
 * Context để chia sẻ notification methods
 */
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/**
 * Provider component để quản lý global notification
 * 
 * @example
 * ```tsx
 * // Wrap ở root layout
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 * 
 * // Sử dụng trong component con
 * const notification = useGlobalNotification();
 * notification.success("Thành công!");
 * ```
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const notification = useNotificationModal();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
      
      {/* Global NotificationModal - Tự động render khi cần */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.config.type}
        title={notification.config.title}
        content={notification.config.content}
        closeText={notification.config.closeText}
        onClose={notification.hide}
      />
    </NotificationContext.Provider>
  );
};

/**
 * Hook để sử dụng global notification trong component
 * 
 * @throws Error nếu sử dụng ngoài NotificationProvider
 * 
 * @example
 * ```tsx
 * const notification = useGlobalNotification();
 * 
 * // Hiển thị thông báo thành công
 * notification.success("Đăng ký thành công!");
 * 
 * // Hiển thị thông báo lỗi
 * notification.error("Có lỗi xảy ra");
 * 
 * // Hiển thị thông báo info
 * notification.info("Thông tin quan trọng");
 * ```
 */
export const useGlobalNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useGlobalNotification must be used within NotificationProvider"
    );
  }

  return context;
};

import React, { createContext, useContext, useState, useCallback } from "react";
import { Animated, Dimensions } from "react-native";
import {
  Toast,
  ToastDescription,
  VStack,
  HStack,
  Icon,
  Box,
} from "@gluestack-ui/themed";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react-native";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";

// Interface cập nhật: Thêm heading và bullets cho layout như PDF
interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info"; // Types từ Notification Service
  description: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "id">) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastItem: React.FC<ToastProps & { onHide: () => void }> = ({
  type,
  description,
  duration = 3000, // Tăng duration cho nội dung dài
  onHide,
}) => {
  const { colors } = useAgrisaColors();
  const [fadeAnim] = useState(new Animated.Value(0));

  // Hiệu ứng animation (giữ nguyên)
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onHide);
    }, duration);
    return () => clearTimeout(timer);
  }, [fadeAnim, duration, onHide]);

  // Lấy icon (cập nhật color khớp text)
  const getIcon = () => {
    const iconProps = { size: 24, color: getTextColor() }; // Tăng size cho dễ nhìn
    switch (type) {
      case "success":
        return <CheckCircle {...iconProps} />;
      case "error":
        return <XCircle {...iconProps} />;
      case "warning":
        return <AlertTriangle {...iconProps} />;
      case "info":
        return <Info {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  // Background color (dựa trên type từ Notification Service)
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return colors.success; // Xanh cho claim approval
      case "error":
        return colors.error; // Đỏ cho system alert
      case "warning":
        return colors.warning; // Vàng cho weather alert
      case "info":
        return colors.info; // Xanh dương cho status update
      default:
        return colors.info;
    }
  };

  // Text color động (tránh trùng background)
  const getTextColor = () => {
    const bg = getBackgroundColor();
    return type === "warning" || bg.includes("fff") || bg.includes("ffff")
      ? colors.textWhiteButton
      : colors.textWhiteButton;
  };

  // Responsive width/height
  const screenWidth = Dimensions.get("window").width;
  const toastWidth = Math.min(screenWidth - 60, 300); // Giống layout PDF, không quá rộng

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          },
        ],
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: "center",
        marginTop: 15,
      }}
    >
      <Toast
        action={type}
        variant="solid"
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          width: toastWidth,
          padding: 10,
        }}
      >
        <VStack space="sm">
          <HStack space="md" justifyContent="center" alignItems="center">
            <Icon as={() => getIcon()} />
            <ToastDescription
              color={getTextColor()}
              fontSize="$md"
              fontWeight="$medium"
            >
              {description}
            </ToastDescription>
          </HStack>
        </VStack>
      </Toast>
    </Animated.View>
  );
};

// ToastProvider (giữ nguyên, nhưng giới hạn max toasts)
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const screenHeight = Dimensions.get("window").height;

  const showToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }].slice(-3)); // Giới hạn 3 toasts
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        pointerEvents="none"
        zIndex={9999}
      >
        {toasts.map((toast, index) => (
          <Box
            key={toast.id}
            position="absolute"
            top={screenHeight * 0.05 + index * 80} // Spacing lớn hơn cho bullets
            left={0}
            right={0}
            pointerEvents="box-none"
          >
            <ToastItem {...toast} onHide={() => hideToast(toast.id)} />
          </Box>
        ))}
      </Box>
    </ToastContext.Provider>
  );
};

// Hook useToast (cập nhật: Hỗ trợ heading và bullets)
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast phải được sử dụng trong ToastProvider");

  const { showToast } = context;

  return {
    toast: {
      success: (
        description: string,
        options: {
          duration?: number;
        } = {}
      ) => showToast({ type: "success", description, ...options }),
      error: (
        description: string,
        options: {
          duration?: number;
        } = {}
      ) => showToast({ type: "error", description, ...options }),
      warning: (
        description: string,
        options: {

          duration?: number;
        } = {}
      ) => showToast({ type: "warning", description, ...options }),
      info: (
        description: string,
        options: {
          duration?: number;
        } = {}
      ) => showToast({ type: "info", description, ...options }),
    },
  };
};

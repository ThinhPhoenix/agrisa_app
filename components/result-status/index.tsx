import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
    AlertTriangle,
    CheckCircle2,
    Home,
    LucideIcon,
    XCircle,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { BackHandler } from "react-native";

/**
 * Các loại trạng thái kết quả
 */
export type ResultStatus = "success" | "error" | "loading" | "warning";

/**
 * Cấu hình cho action button
 */
export interface ResultAction {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: LucideIcon;
}

/**
 * Props cho ResultStatusScreen
 */
export interface ResultStatusScreenProps {
  status: ResultStatus;
  title?: string;
  message: string;
  subMessage?: string;
  /** Các action buttons tùy chỉnh */
  actions?: ResultAction[];
  /** Hiển thị nút về trang chủ (mặc định: true) */
  showHomeButton?: boolean;
  /** Lock navigation - ngăn người dùng quay lại bằng nút back (mặc định: true) */
  lockNavigation?: boolean;
  /** Custom home route (mặc định: /(tabs)/) */
  homeRoute?: string;
  /** Auto redirect sau X giây (không set = không tự động) */
  autoRedirectSeconds?: number;
  /** Route để redirect tự động */
  autoRedirectRoute?: string;
}

/**
 * Component hiển thị màn hình kết quả với 4 trạng thái
 * 
 * @example
 * ```tsx
 * // Success với auto redirect
 * <ResultStatusScreen
 *   status="success"
 *   title="Đăng ký thành công!"
 *   message="Bảo hiểm của bạn đã được đăng ký"
 *   autoRedirectSeconds={3}
 *   autoRedirectRoute="/(farmer)/farm"
 * />
 * 
 * // Error với custom actions
 * <ResultStatusScreen
 *   status="error"
 *   title="Đăng ký thất bại"
 *   message="Đã hết hạn đăng ký cho sản phẩm này"
 *   actions={[
 *     { label: "Thử lại", onPress: () => router.back() },
 *     { label: "Chọn sản phẩm khác", onPress: () => router.push("/products") }
 *   ]}
 * />
 * ```
 */
export const ResultStatusScreen: React.FC<ResultStatusScreenProps> = ({
  status,
  title,
  message,
  subMessage,
  actions = [],
  showHomeButton = true,
  lockNavigation = true,
  homeRoute = "/(tabs)/",
  autoRedirectSeconds,
  autoRedirectRoute,
}) => {
  const { colors } = useAgrisaColors();
  const [countdown, setCountdown] = React.useState(autoRedirectSeconds || 0);

  // Lock back button navigation
  useEffect(() => {
    if (!lockNavigation) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true để chặn hành động back mặc định
        return true;
      }
    );

    return () => backHandler.remove();
  }, [lockNavigation]);

  // Auto redirect countdown
  useEffect(() => {
    if (!autoRedirectSeconds || !autoRedirectRoute || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.replace(autoRedirectRoute);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirectSeconds, autoRedirectRoute, countdown]);

  // Lấy style theo status
  const getStatusStyle = (): {
    icon: LucideIcon | null;
    iconColor: string;
    bgColor: string;
    defaultTitle: string;
  } => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle2,
          iconColor: AgrisaColors.light.success,
          bgColor: AgrisaColors.light.successSoft,
          defaultTitle: "Thành công!",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: AgrisaColors.light.error,
          bgColor: AgrisaColors.light.errorSoft,
          defaultTitle: "Có lỗi xảy ra",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: AgrisaColors.light.warning,
          bgColor: AgrisaColors.light.warningSoft,
          defaultTitle: "Cảnh báo",
        };
      case "loading":
        return {
          icon: null, // Loading sẽ dùng Spinner component riêng
          iconColor: AgrisaColors.light.primary,
          bgColor: AgrisaColors.light.primarySoft,
          defaultTitle: "Đang xử lý...",
        };
    }
  };

  const { icon: Icon, iconColor, bgColor, defaultTitle } = getStatusStyle();

  const handleGoHome = () => {
    router.replace(homeRoute);
  };

  const getButtonVariantStyle = (variant?: "primary" | "secondary" | "outline") => {
    switch (variant) {
      case "secondary":
        return {
          bg: colors.card_surface,
          borderColor: colors.frame_border,
          borderWidth: 1,
          textColor: colors.primary_text,
        };
      case "outline":
        return {
          bg: "transparent",
          borderColor: iconColor,
          borderWidth: 2,
          textColor: iconColor,
        };
      default: // primary
        return {
          bg: iconColor,
          borderColor: iconColor,
          borderWidth: 0,
          textColor: colors.primary_white_text,
        };
    }
  };

  return (
    <Box flex={1} bg={colors.background}>
      <VStack flex={1} justifyContent="center" alignItems="center" px="$6">
        {/* Icon */}
        <Box bg={bgColor} borderRadius="$full" p="$8" mb="$6">
          {status === "loading" ? (
            <Spinner size="large" color={iconColor} />
          ) : Icon ? (
            <Icon size={64} color={iconColor} strokeWidth={2.5} />
          ) : null}
        </Box>

        {/* Title */}
        <Text
          fontSize={28}
          fontWeight="$bold"
          color={colors.primary_text}
          textAlign="center"
          mb="$3"
        >
          {title || defaultTitle}
        </Text>

        {/* Message */}
        <Text
          fontSize={16}
          color={colors.secondary_text}
          textAlign="center"
          lineHeight={24}
          mb="$2"
        >
          {message}
        </Text>

        {/* Sub Message */}
        {subMessage && (
          <Text
            fontSize={14}
            color={colors.muted_text}
            textAlign="center"
            lineHeight={20}
            mb="$6"
          >
            {subMessage}
          </Text>
        )}

        {/* Auto redirect countdown */}
        {countdown > 0 && autoRedirectRoute && (
          <Box
            bg={colors.infoSoft}
            borderRadius="$lg"
            px="$4"
            py="$2"
            mb="$6"
          >
            <Text fontSize={13} color={colors.info} textAlign="center">
              Tự động chuyển trang sau {countdown}s...
            </Text>
          </Box>
        )}

        {/* Action Buttons */}
        {!lockNavigation && actions.length === 0 && !showHomeButton ? null : (
          <VStack space="sm" w="$full" mt="$4">
            {/* Custom action buttons */}
            {actions.map((action, index) => {
              const variantStyle = getButtonVariantStyle(action.variant);
              const ActionIcon = action.icon;

              return (
                <Button
                  key={index}
                  bg={variantStyle.bg}
                  borderColor={variantStyle.borderColor}
                  borderWidth={variantStyle.borderWidth}
                  borderRadius="$xl"
                  size="lg"
                  onPress={action.onPress}
                  sx={{
                    shadowColor:
                      action.variant === "primary" ? iconColor : "transparent",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: action.variant === "primary" ? 4 : 0,
                  }}
                >
                  <HStack space="sm" alignItems="center">
                    {ActionIcon && (
                      <ActionIcon size={20} color={variantStyle.textColor} />
                    )}
                    <ButtonText
                      color={variantStyle.textColor}
                      fontSize={16}
                      fontWeight="$bold"
                    >
                      {action.label}
                    </ButtonText>
                  </HStack>
                </Button>
              );
            })}

            {/* Home button */}
            {showHomeButton && status !== "loading" && (
              <Button
                bg={actions.length > 0 ? colors.card_surface : iconColor}
                borderColor={actions.length > 0 ? colors.frame_border : iconColor}
                borderWidth={actions.length > 0 ? 1 : 0}
                borderRadius="$xl"
                size="lg"
                onPress={handleGoHome}
                sx={{
                  shadowColor: actions.length > 0 ? "transparent" : iconColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: actions.length > 0 ? 0 : 4,
                }}
              >
                <HStack space="sm" alignItems="center">
                  <Home
                    size={20}
                    color={
                      actions.length > 0
                        ? colors.primary_text
                        : colors.primary_white_text
                    }
                  />
                  <ButtonText
                    color={
                      actions.length > 0
                        ? colors.primary_text
                        : colors.primary_white_text
                    }
                    fontSize={16}
                    fontWeight="$bold"
                  >
                    Về trang chủ
                  </ButtonText>
                </HStack>
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

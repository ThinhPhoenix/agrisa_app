import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { AuthUser } from "@/domains/auth/models/auth.models";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useEkyc } from "@/domains/eKYC/hooks/use-ekyc";
import { useToast } from "@/domains/shared/hooks/useToast";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import {
  Avatar,
  AvatarFallbackText,
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Divider,
  HStack,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Mail,
  Phone,
  RefreshCw,
  Shield
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Linking, RefreshControl, ScrollView } from "react-native";

export default function ProfileScreen() {
  const { user: storeUser, refreshAuth } = useAuthStore();
  const { toast } = useToast();
  const { colors } = useAgrisaColors();
  const { geteKYCStatusQuery } = useEkyc();
  
  const [user, setUser] = useState<AuthUser | null>(storeUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: ekycResponse,
    isLoading: isEkycLoading,
    isError: isEkycError,
  } = user?.id
    ? geteKYCStatusQuery(user.id)
    : { data: null, isLoading: false, isError: false };

  // ✅ FIX: Kiểm tra kiểu response trước khi truy cập .data
  const ekycStatus =
    ekycResponse && "data" in ekycResponse ? ekycResponse.data : null;

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await secureStorage.getUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAuth();
      await loadUserData();
      toast.success("Đã làm mới thông tin!");
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin. Vui lòng thử lại!");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCallSupport = () => {
    Alert.alert(
      "Hỗ trợ Agrisa 📞",
      "Bạn muốn liên hệ đội ngũ hỗ trợ Agrisa?\n• Tư vấn bảo hiểm cây trồng\n• Hướng dẫn sử dụng ứng dụng\n• Hỗ trợ kỹ thuật",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gọi ngay",
          onPress: () => Linking.openURL("tel:1900636828"),
        },
      ]
    );
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(
      `[Agrisa] Hỗ trợ từ ${user?.email || "Nông dân"}`
    );
    const body = encodeURIComponent(
      `Xin chào đội ngũ Agrisa,\n\nTôi cần hỗ trợ về:\n\nThông tin tài khoản:\n- Email: ${user?.email}\n- ID: ${user?.id}\n\nCảm ơn!`
    );
    Linking.openURL(`mailto:support@agrisa.vn?subject=${subject}&body=${body}`);
  };

  useEffect(() => {
    if (!storeUser) {
      loadUserData();
    }
  }, [storeUser]);

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending_verification: {
        color: "warning",
        text: "Chờ xác minh",
        icon: AlertCircle,
      },
      verified: {
        color: "success",
        text: "Đã xác minh",
        icon: CheckCircle,
      },
      suspended: {
        color: "error",
        text: "Tạm khóa",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.pending_verification;
    const IconComponent = config.icon;

    return (
      <Badge variant="solid" bg={`$${config.color}500`}>
        <HStack alignItems="center" space="xs">
          <IconComponent size={12} color="white" />
          <BadgeText color="white" fontSize="$xs">
            {config.text}
          </BadgeText>
        </HStack>
      </Badge>
    );
  };

  const getKycButton = () => {
    if (!ekycStatus) {
      return {
        text: "Bắt đầu KYC",
        route: "/settings/verify/id-scan",
        disabled: false,
        icon: Shield,
      };
    }

    if (ekycStatus.is_face_verified && ekycStatus.is_ocr_done) {
      return {
        text: "Đã xác minh KYC",
        route: null,
        disabled: true,
        icon: CheckCircle,
      };
    }

    if (ekycStatus.is_ocr_done && !ekycStatus.is_face_verified) {
      return {
        text: "Tiếp tục xác thực mặt",
        route: "/settings/verify/face-scan",
        disabled: false,
        icon: Shield,
      };
    }

    return {
      text: "Bắt đầu KYC",
      route: "/settings/verify/id-scan",
      disabled: false,
      icon: Shield,
    };
  };

  const renderVerificationItem = (
    title: string,
    isVerified: boolean,
    description: string,
    actionText?: string,
    onAction?: () => void
  ) => (
    <Box
      bg={colors.card}
      p="$4"
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack flex={1} space="xs">
          <HStack alignItems="center" space="sm">
            {isVerified ? (
              <CheckCircle size={16} color={colors.success} />
            ) : (
              <AlertCircle size={16} color={colors.warning} />
            )}
            <Text fontWeight="$semibold" color={colors.text}>
              {title}
            </Text>
          </HStack>
          <Text fontSize="$sm" color={colors.textSecondary}>
            {description}
          </Text>
          {!isVerified && actionText && onAction && (
            <Pressable onPress={onAction}>
              <Text fontSize="$sm" color={colors.text} fontWeight="$medium">
                {actionText} →
              </Text>
            </Pressable>
          )}
        </VStack>
        <Badge variant="solid" bg={isVerified ? "$success500" : "$warning500"}>
          <BadgeText color="white" fontSize="$xs">
            {isVerified ? "Hoàn tất" : "Cần làm"}
          </BadgeText>
        </Badge>
      </HStack>
    </Box>
  );

  if (isLoading && !user) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg={colors.background}
      >
        <VStack alignItems="center" space="md">
          <Spinner size="large" color={colors.text} />
          <Text color={colors.textSecondary}>
            Đang tải thông tin profile...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg={colors.background}
        p="$6"
      >
        <VStack alignItems="center" space="lg">
          <AlertCircle size={64} color={colors.warning} />
          <VStack alignItems="center" space="sm">
            <Text
              fontSize="$xl"
              fontWeight="$bold"
              color={colors.text}
              textAlign="center"
            >
              Không tìm thấy thông tin
            </Text>
            <Text
              fontSize="$md"
              color={colors.textSecondary}
              textAlign="center"
            >
              Có vẻ như thông tin tài khoản chưa được tải.{"\n"}
              Vui lòng thử lại hoặc đăng nhập lại.
            </Text>
          </VStack>
          <VStack space="sm" w="100%">
            <Button
              bg={colors.text}
              onPress={handleRefresh}
              isDisabled={isRefreshing}
            >
              <HStack alignItems="center" space="sm">
                <RefreshCw size={16} color="white" />
                <ButtonText color="white">
                  {isRefreshing ? "Đang tải..." : "Thử lại"}
                </ButtonText>
              </HStack>
            </Button>
            <Button
              variant="outline"
              borderColor={colors.border}
              onPress={() => router.push("/auth/sign-in")}
            >
              <ButtonText color={colors.text}>Đăng nhập lại</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  const kycButton = getKycButton();
  const IconComponent = kycButton.icon;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack space="lg" p="$4">
        <Box
          bg={colors.card}
          p="$6"
          borderRadius="$xl"
          borderWidth={1}
          borderColor={colors.border}
        >
          <VStack alignItems="center" space="md">
            <Avatar size="xl" bg={colors.text}>
              <AvatarFallbackText color="white" fontSize="$2xl">
                {user.email.charAt(0).toUpperCase()}
              </AvatarFallbackText>
            </Avatar>

            <VStack alignItems="center" space="xs">
              <Text fontSize="$xl" fontWeight="$bold" color={colors.text}>
                {user.email.split("@")[0]}
              </Text>
              <Text fontSize="$sm" color={colors.textSecondary}>
                Nông dân Agrisa
              </Text>
              {renderStatusBadge(user.status)}
            </VStack>

            <HStack space="sm">
              <Button
                variant={kycButton.disabled ? "solid" : "outline"}
                size="sm"
                bg={kycButton.disabled ? colors.success : "transparent"}
                borderColor={kycButton.disabled ? "transparent" : colors.border}
                isDisabled={kycButton.disabled}
                onPress={() => {
                  if (kycButton.route) {
                    router.push(kycButton.route as any);
                  }
                }}
              >
                <HStack alignItems="center" space="xs">
                  <IconComponent 
                    size={14} 
                    color={kycButton.disabled ? "white" : colors.text} 
                  />
                  <ButtonText 
                    color={kycButton.disabled ? "white" : colors.text} 
                    fontSize="$sm"
                  >
                    {kycButton.text}
                  </ButtonText>
                </HStack>
              </Button>

              <Button
                variant="outline"
                size="sm"
                borderColor={colors.border}
                onPress={() => router.push("/settings/profile/edit")}
              >
                <HStack alignItems="center" space="xs">
                  <Edit3 size={14} color={colors.text} />
                  <ButtonText color={colors.text} fontSize="$sm">
                    Chỉnh sửa
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </Box>

        <VStack space="sm">
          <Text fontSize="$lg" fontWeight="$semibold" color={colors.text}>
            Thông tin liên hệ
          </Text>

          <Box
            bg={colors.card}
            p="$4"
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border}
          >
            <VStack space="md">
              <HStack alignItems="center" space="md">
                <Box p="$2" bg={colors.surface} borderRadius="$md">
                  <Mail size={20} color={colors.text} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$sm" color={colors.textSecondary}>
                    Email
                  </Text>
                  <Text fontWeight="$medium" color={colors.text}>
                    {user.email}
                  </Text>
                </VStack>
              </HStack>

              <Divider bg={colors.border} />

              <HStack alignItems="center" space="md">
                <Box p="$2" bg={colors.surface} borderRadius="$md">
                  <Phone size={20} color={colors.text} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$sm" color={colors.textSecondary}>
                    Số điện thoại
                  </Text>
                  <Text fontWeight="$medium" color={colors.text}>
                    {user.phone_number || "Chưa cập nhật"}
                  </Text>
                </VStack>
                {!user.phone_verified && (
                  <Badge variant="solid" bg="$warning500">
                    <BadgeText color="white" fontSize="$xs">
                      Chưa xác minh
                    </BadgeText>
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Box>
        </VStack>

        <VStack space="sm">
          <Text fontSize="$lg" fontWeight="$semibold" color={colors.text}>
            Trạng thái xác minh
          </Text>

          <VStack space="sm">
            {renderVerificationItem(
              "Xác minh số điện thoại",
              user.phone_verified,
              user.phone_verified
                ? "Số điện thoại đã được xác minh thành công"
                : "Xác minh số điện thoại để bảo mật tài khoản",
              user.phone_verified ? undefined : "Xác minh ngay",
              user.phone_verified
                ? undefined
                : () => router.push("/settings/verify-phone")
            )}

            {renderVerificationItem(
              "Xác minh danh tính (KYC)",
              ekycStatus?.is_face_verified || false,
              ekycStatus?.is_face_verified
                ? "Danh tính đã được xác minh hoàn tất, có thể mua bảo hiểm"
                : ekycStatus?.is_ocr_done
                ? "Đã chụp CCCD thành công, tiếp tục xác thực khuôn mặt"
                : "Hoàn tất KYC để sử dụng đầy đủ dịch vụ bảo hiểm Agrisa",
              ekycStatus?.is_face_verified ? undefined : kycButton.text,
              ekycStatus?.is_face_verified || !kycButton.route
                ? undefined
                : () => router.push(kycButton.route as any)
            )}
          </VStack>
        </VStack>

        <VStack space="sm">
          <Text fontSize="$lg" fontWeight="$semibold" color={colors.text}>
            Cần hỗ trợ?
          </Text>

          <Box
            bg={colors.card}
            p="$4"
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border}
          >
            <VStack space="md">
              <Text fontSize="$sm" color={colors.textSecondary}>
                Đội ngũ Agrisa luôn sẵn sàng hỗ trợ bạn 24/7 về:
              </Text>
              <VStack space="xs" pl="$2">
                <Text fontSize="$xs" color={colors.textSecondary}>
                  • Tư vấn bảo hiểm cây trồng
                </Text>
                <Text fontSize="$xs" color={colors.textSecondary}>
                  • Hướng dẫn sử dụng ứng dụng
                </Text>
                <Text fontSize="$xs" color={colors.textSecondary}>
                  • Hỗ trợ kỹ thuật và bồi thường
                </Text>
              </VStack>

              <HStack space="sm">
                <Button
                  flex={1}
                  bg={colors.success}
                  onPress={handleCallSupport}
                >
                  <HStack alignItems="center" space="xs">
                    <Phone size={16} color="white" />
                    <ButtonText color="white" fontSize="$sm">
                      Gọi điện
                    </ButtonText>
                  </HStack>
                </Button>

                <Button
                  flex={1}
                  variant="outline"
                  borderColor={colors.border}
                  onPress={handleEmailSupport}
                >
                  <HStack alignItems="center" space="xs">
                    <Mail size={16} color={colors.text} />
                    <ButtonText color={colors.text} fontSize="$sm">
                      Email
                    </ButtonText>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>

        {__DEV__ && (
          <Box bg="$coolGray100" p="$3" borderRadius="$md">
            <Text fontSize="$xs" color="$coolGray600">
              🐛 Debug Info
              {"\n"}• User ID: {user.id}
              {"\n"}• Status: {user.status}
              {"\n"}• KYC Verified: {user.kyc_verified ? "✅" : "❌"}
              {"\n"}• Phone Verified: {user.phone_verified ? "✅" : "❌"}
              {"\n"}• OCR Done: {ekycStatus?.is_ocr_done ? "✅" : "❌"}
              {"\n"}• Face Verified: {ekycStatus?.is_face_verified ? "✅" : "❌"}
              {"\n"}• CIC No: {ekycStatus?.cic_no || "N/A"}
            </Text>
          </Box>
        )}

        <Box h="$8" />
      </VStack>
    </ScrollView>
  );
}

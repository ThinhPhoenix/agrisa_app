import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import {
  getMissingFields,
  isProfileComplete,
} from "@/domains/auth/utils/profile.utils";
import { FaceScanScreen } from "@/domains/eKYC/components/face-scan";
import {
  Box,
  Button,
  ButtonText,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { Info } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler } from "react-native";

/**
 * Screen quét khuôn mặt với guard kiểm tra profile đầy đủ
 * - Bắt buộc phải có thông tin cá nhân đầy đủ trước khi quét khuôn mặt
 * - Nếu thiếu thông tin, redirect về identity-update
 */
export default function FaceIDScanScreen() {
  const { colors } = useAgrisaColors();
  const { data: profileData, isLoading, refetch } = useAuthMe();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      setIsChecking(true);

      // Nếu chưa có data, fetch lại
      if (!profileData) {
        await refetch();
      }

      setIsChecking(false);
    };

    checkProfile();
  }, []);

  // Block hardware back button khi profile chưa đầy đủ
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (
          !isChecking &&
          !isLoading &&
          profileData &&
          !isProfileComplete(profileData)
        ) {
          // Chặn back, hiển thị thông báo
          Alert.alert(
            "Cập nhật thông tin cá nhân",
            "Vui lòng hoàn thiện thông tin cá nhân trước khi tiếp tục.",
            [
              {
                text: "Cập nhật ngay",
                onPress: () =>
                  router.replace("/settings/verify/identity-update"),
              },
            ],
            { cancelable: false }
          );
          return true; // Block back
        }
        return false; // Cho phép back
      };

      const handler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => handler.remove();
    }, [isChecking, isLoading, profileData])
  );

  useEffect(() => {
    if (!isChecking && !isLoading && profileData) {
      const profileComplete = isProfileComplete(profileData);

      if (!profileComplete) {
        const missingFields = getMissingFields(profileData);

        Alert.alert(
          "Cập nhật thông tin cá nhân",
          `Vui lòng hoàn thiện thông tin cá nhân để tiếp tục xác thực khuôn mặt.\n\nCần bổ sung: ${missingFields.join(", ")}`,
          [
            {
              text: "Cập nhật ngay",
              onPress: () => router.replace("/settings/verify/identity-update"),
            },
          ],
          { cancelable: false }
        );
      }
    }
  }, [isChecking, isLoading, profileData]);

  // Loading state
  if (isChecking || isLoading) {
    return (
      <VStack
        flex={1}
        bg={colors.background}
        justifyContent="center"
        alignItems="center"
        p="$6"
      >
        <Spinner size="large" color={colors.primary} />
        <Text fontSize="$sm" color={colors.secondary_text} mt="$3">
          Đang kiểm tra thông tin...
        </Text>
      </VStack>
    );
  }

  // Nếu profile chưa đầy đủ, hiển thị thông báo
  if (!isProfileComplete(profileData ?? null)) {
    const missingFields = getMissingFields(profileData ?? null);

    return (
      <VStack
        flex={1}
        bg={colors.background}
        justifyContent="center"
        alignItems="center"
        p="$6"
      >
        <Box bg={colors.primarySoft} borderRadius="$full" p="$5" mb="$4">
          <Info size={60} color={colors.primary} strokeWidth={2} />
        </Box>

        <Text
          fontSize="$xl"
          fontWeight="$bold"
          color={colors.primary_text}
          textAlign="center"
          mb="$2"
        >
          Hoàn thiện thông tin cá nhân
        </Text>

        <Text
          fontSize="$sm"
          color={colors.secondary_text}
          textAlign="center"
          mb="$3"
        >
          Trước khi xác thực khuôn mặt, vui lòng cập nhật đầy đủ thông tin cá
          nhân của bạn.
        </Text>

        <Box
          bg={colors.infoSoft}
          borderRadius="$lg"
          p="$3"
          mb="$5"
          width="100%"
        >
          <Text
            fontSize="$xs"
            color={colors.info}
            fontWeight="$semibold"
            mb="$1"
          >
            Thông tin cần bổ sung:
          </Text>
          {missingFields.map((field, index) => (
            <Text key={index} fontSize="$xs" color={colors.info}>
              • {field}
            </Text>
          ))}
        </Box>

        <Button
          bg={colors.primary}
          borderRadius="$lg"
          onPress={() => router.replace("/settings/verify/identity-update")}
          width="100%"
          size="lg"
        >
          <ButtonText
            color={colors.primary_white_text}
            fontWeight="$bold"
            fontSize="$md"
          >
            Cập nhật thông tin ngay
          </ButtonText>
        </Button>

        <Button
          variant="outline"
          borderColor={colors.frame_border}
          borderRadius="$lg"
          onPress={() => router.back()}
          width="100%"
          mt="$3"
          size="lg"
        >
          <ButtonText
            color={colors.secondary_text}
            fontWeight="$semibold"
            fontSize="$md"
          >
            Quay lại
          </ButtonText>
        </Button>
      </VStack>
    );
  }

  // Profile đầy đủ, cho phép quét khuôn mặt
  return (
    <>
      <FaceScanScreen />
    </>
  );
}

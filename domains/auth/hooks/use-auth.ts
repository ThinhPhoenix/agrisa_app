import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { AuthErrorCode, getAuthErrorMessage } from "../enums/auth-error.enum";
import { SignInPayload, SignUpPayload } from "../models/auth.models";
import { AuthServices } from "../service/auth.service";
import { useAuthStore } from "../stores/auth.store";

export const useAuth = () => {
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const notification = useGlobalNotification();

  const signUpMutation = useMutation({
    mutationKey: [QueryKey.AUTH.SIGN_UP],
    mutationFn: async (payload: SignUpPayload) => {
      return await AuthServices.signup(payload);
    },
    onSuccess: () => {
      notification.success("Đăng ký thành công");
      router.replace("/auth/username-sign-in");
    },
    onError: (error: any) => {
      // Lấy error code từ response nếu có
      const errorCode = error?.response?.data?.error?.code || error?.code;
      const errorMessage = getAuthErrorMessage(errorCode);
      
      notification.error(errorMessage);
      console.error("Sign up error:", error);
    },
  });

  const signInMutation = useMutation({
    mutationKey: [QueryKey.AUTH.SIGN_IN],
    mutationFn: async (payload: SignInPayload) => {
      return await AuthServices.signin(payload);
    },
    onSuccess: async (data: any) => {
      await setAuth(data.data.access_token, data.data.user);
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      // Lấy error code từ response nếu có
      const errorCode = error?.response?.data?.error?.code || error?.code;
      const errorMessage = getAuthErrorMessage(errorCode);

      Alert.alert("Đăng nhập thất bại", errorMessage);
      console.error("Sign in error:", error);
    },
  });

  const checkIdentifierMutation = useMutation({
    mutationKey: [QueryKey.AUTH.CHECK_IDENTIFIER],
    mutationFn: async (identifier: string) => {
      const response = await AuthServices.checkIdentifier({ identifier });

      // Type guard để đảm bảo response là success response
      if (!("data" in response)) {
        throw new Error("Invalid response format");
      }

      const available = response.data.available;

      console.log("✅ [Check Identifier] Full response:", response);
      console.log("✅ [Check Identifier] Available:", available);

      // Nếu available = false, reject promise để prevent navigation
      if (!available) {
        notification.error("Tài khoản không tồn tại trong hệ thống");
        throw new Error("Account not found");
      }

      return response.data;
    },
    onError: (error: any) => {
      // Chỉ show error nếu không phải lỗi "Account not found"
      if (error.message !== "Account not found") {
        console.error("❌ Check identifier error:", error);
        notification.error("Có lỗi xảy ra khi kiểm tra tài khoản");
      }
    },
  });

  return {
    signInMutation,
    signUpMutation,
    checkIdentifierMutation,
  };
};

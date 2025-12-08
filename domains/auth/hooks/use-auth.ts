import { useGlobalNotification } from "@/components/modal/providers/NotificationProvider";
import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { getAuthErrorMessage } from "../enums/auth-error.enum";
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
      const accessToken = data.data.access_token;
      const user = data.data.user;

      try {
        // Check partner_id từ API /me trước khi cho phép đăng nhập
        console.log("🔍 [Sign In] Checking partner_id...");
        const profileResponse =
          await AuthServices.getUserProfileWithToken(accessToken);
        const profile =
          (profileResponse as any)?.data?.data ||
          (profileResponse as any)?.data;

        console.log("📋 [Sign In] Profile response:", profile);

        // Nếu partner_id có giá trị (không phải null/undefined/empty) => Không cho đăng nhập
        if (profile?.partner_id || profile?.role_id === "system_admin") {
          console.log("❌ [Sign In] Partner detected, access denied");
          notification.error(
            "Bạn không được cấp quyền đăng nhập vào ứng dụng này. Vui lòng sử dụng ứng dụng dành cho đối tác/Admin."
          );
          return;
        }

        // partner_id = null => Farmer => Cho phép đăng nhập
        console.log("✅ [Sign In] Farmer verified, proceeding to home...");
        
        // Lưu fullName vào secureStorage để hiển thị ở màn hình đăng nhập
        if (profile?.full_name) {
          await secureStorage.setFullName(profile.full_name);
          console.log("✅ [Sign In] Full name saved:", profile.full_name);
        }
        
        await setAuth(accessToken, user);
        router.replace("/(tabs)");
      } catch (profileError) {
        console.error("❌ [Sign In] Error checking profile:", profileError);
      }
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

  // ============================================
  // 📱 PHONE VERIFICATION - Xác thực số điện thoại
  // ============================================
  
  const sendPhoneOTPMutation = useMutation({
    mutationKey: [QueryKey.AUTH.SEND_PHONE_OTP],
    mutationFn: async (phone: string) => {
      return await AuthServices.sendPhoneVerificationCode(phone);
    },
    onSuccess: () => {
      notification.success("Mã OTP đã được gửi đến số điện thoại của bạn");
      console.log("✅ [Phone OTP] OTP sent successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại sau.";
      notification.error(errorMessage);
      console.error("❌ [Phone OTP] Send OTP error:", error);
    },
  });

  const verifyPhoneOTPMutation = useMutation({
    mutationKey: [QueryKey.AUTH.VERIFY_PHONE_OTP],
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      return await AuthServices.verifyPhoneCode(phone, code);
    },
    onSuccess: () => {
      notification.success("Xác thực số điện thoại thành công");
      console.log("✅ [Phone OTP] Phone verified successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Mã OTP không chính xác. Vui lòng thử lại.";
      notification.error(errorMessage);
      console.error("❌ [Phone OTP] Verify OTP error:", error);
    },
  });

  return {
    signInMutation,
    signUpMutation,
    checkIdentifierMutation,
    sendPhoneOTPMutation,
    verifyPhoneOTPMutation,
  };
};

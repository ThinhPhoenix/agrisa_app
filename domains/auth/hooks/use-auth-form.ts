import { logger } from "@/domains/shared/utils/logger";
import { secureStorage } from "@/domains/shared/utils/secureStorage";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { SignInPayload, SignUpPayload } from "../models/auth.models";
import {
  SignInPayloadSchema,
  signInSchema,
  SignUpPayloadSchema,
  signUpSchema,
} from "../schemas/auth.schema";
import { useAuth } from "./use-auth";

interface AuthFormHooks {
  type: "sign-in" | "sign-up";
}

interface CheckIdentifierHooks {
  onSuccess?: () => void;
  onError?: () => void;
}

const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const isPhoneVN = (value: string): boolean => {
  return /^(\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(
    value.trim()
  );
};

/**
 * Transform identifier thành payload phù hợp cho API
 */
const transformIdentifierToPayload = (
  identifier: string,
  password: string
): SignInPayload => {
  const trimmedIdentifier = identifier.trim();

  const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
  if (isEmailFormat) {
    return { email: trimmedIdentifier, password };
  }

  const isPhoneFormat = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/.test(
    trimmedIdentifier.replace(/\s+/g, "")
  );

  if (isPhoneFormat) {
    let normalizedPhone = trimmedIdentifier.replace(/\s+/g, "");

    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+84" + normalizedPhone.substring(1);
    } else if (normalizedPhone.startsWith("84")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    return { phone: normalizedPhone, password };
  }

  throw new Error("Định dạng không hợp lệ");
};

export const useAuthForm = ({ type }: AuthFormHooks) => {
  const { signInMutation, signUpMutation, checkIdentifierMutation } = useAuth();

  const signInForm = useForm<SignInPayloadSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Form đăng ký
  const signUpForm = useForm<SignUpPayloadSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      phone: "",
      email: "",
      password: "",
      national_id: "",
      user_profile: {
        full_name: "",
        date_of_birth: "",
        gender: "male",
        address: "",
      },
    },
  });

  const form = type === "sign-in" ? signInForm : signUpForm;

  // ============================================
  // 🔐 ĐĂNG NHẬP BẰNG MẬT KHẨU THÔNG THƯỜNG
  // ============================================
  const handleSignIn = signInForm.handleSubmit(async (data) => {
    try {
      logger.auth.authSuccess("Sign in attempt", {
        identifier: data.identifier,
      });

      const { identifier, password } = data;
      let payload: SignInPayload;

      if (isEmail(identifier)) {
        payload = {
          email: identifier,
          password,
        };
      } else if (isPhoneVN(identifier)) {
        payload = {
          phone: identifier,
          password,
        };
      } else {
        throw new Error("Định dạng không hợp lệ");
      }

      logger.auth.authSuccess("Sending sign in request", payload);
      await signInMutation.mutateAsync(payload);
    } catch (error) {
      logger.auth.authError("Lỗi đăng nhập", error);
    }
  });

  // ============================================
  // 🔐 ĐĂNG NHẬP BẰNG BIOMETRIC
  // ============================================
  const handleBiometricSignIn = async (
    cachedIdentifier: string,
    biometricType: string,
    setAuth: (token: string, user: any) => Promise<void>
  ) => {
    try {
      logger.auth.authSuccess("Biometric sign in attempt", {
        identifier: cachedIdentifier,
      });

      // 1. Kiểm tra identifier
      if (!cachedIdentifier) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin tài khoản");
        return false;
      }

      // 2. Kiểm tra biometric có được bật không
      const enabled = await secureStorage.isBiometricEnabled(cachedIdentifier);
      if (!enabled) {
        Alert.alert(
          "Tính năng chưa bật",
          `Vui lòng bật xác thực ${biometricType} trong cài đặt sau khi đăng nhập.`
        );
        return false;
      }

      // 3. Kiểm tra hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Không hỗ trợ",
          `Thiết bị không hỗ trợ ${biometricType} hoặc chưa thiết lập.`
        );
        return false;
      }

      // 4. Xác thực biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Đăng nhập Agrisa bằng ${biometricType}`,
        disableDeviceFallback: false,
        fallbackLabel: "Dùng mật khẩu",
        cancelLabel: "Hủy",
      });

      if (!result.success) {
        logger.auth.authSuccess("Biometric authentication cancelled");
        return false;
      }

      // 5. Lấy mật khẩu đã lưu
      const password =
        await secureStorage.getBiometricPassword(cachedIdentifier);
      if (!password) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập bằng mật khẩu."
        );
        await secureStorage.clearBiometric(cachedIdentifier);
        return false;
      }

      // 6. Tạo payload và gọi API
      const loginPayload = transformIdentifierToPayload(
        cachedIdentifier,
        password
      );

      logger.auth.authSuccess("Sending biometric sign in request");
      const response = await signInMutation.mutateAsync(loginPayload);
      const { access_token, user } = response.data;

      // 7. Lưu auth state
      await setAuth(access_token, user);

      // 8. Navigate
      router.replace("/(tabs)");
      return true;
    } catch (error: any) {
      logger.auth.authError("Lỗi đăng nhập biometric", error);

      if (error?.response?.status === 401) {
        Alert.alert(
          "Đăng nhập thất bại",
          "Thông tin đăng nhập không đúng. Vui lòng đăng nhập lại bằng mật khẩu."
        );

        // Xóa password đã lưu nếu sai
        if (cachedIdentifier) {
          await secureStorage.clearBiometricPassword(cachedIdentifier);
          await secureStorage.clearBiometric(cachedIdentifier);
        }
      } else {
        Alert.alert(
          "Lỗi",
          error.message || `Có lỗi xảy ra khi đăng nhập bằng ${biometricType}.`
        );
      }

      return false;
    }
  };

  // ============================================
  // 🔐 ĐĂNG KÝ
  // ============================================
  const handleSignUp = signUpForm.handleSubmit(async (data) => {
    try {
      await signUpMutation.mutateAsync(data as SignUpPayload);
    } catch (error) {
      logger.auth.authError("Lỗi đăng ký", error);
    }
  });

  const onSubmit = type === "sign-in" ? handleSignIn : handleSignUp;

  // ============================================
  // 🔍 KIỂM TRA IDENTIFIER TỒN TẠI
  // ============================================
  const handleCheckIdentifier = async (
    identifier: string,
    callbacks?: CheckIdentifierHooks
  ): Promise<boolean> => {
    try {
      logger.auth.authSuccess("Checking identifier", { identifier });

      const result = await checkIdentifierMutation.mutateAsync(identifier);

      // Chỉ vào đây khi available = true
      if (result.available) {
        logger.auth.authSuccess("Identifier exists and available");
        callbacks?.onSuccess?.();
        return true;
      }

      // Fallback (không nên xảy ra vì đã throw trong mutationFn)
      callbacks?.onError?.();
      return false;
    } catch (error) {
      logger.auth.authError("Identifier check failed", error);
      callbacks?.onError?.();
      return false;
    }
  };

  return {
    form,
    onSubmit,
    handleBiometricSignIn,
    handleCheckIdentifier,
    isLoading:
      signInMutation.isPending ||
      signUpMutation.isPending ||
      checkIdentifierMutation.isPending,
    isCheckingIdentifier: checkIdentifierMutation.isPending,
    error: signInMutation.error || signUpMutation.error,
    isSuccess: signInMutation.isSuccess || signUpMutation.isSuccess,
    reset: () => form.reset(),
    clearErrors: () => form.clearErrors(),
  };
};

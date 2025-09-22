import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInSchema,
  signUpSchema,
  SignInPayloadSchema,
  SignUpPayloadSchema,
} from "../schemas/auth.schema";
import { SignInPayload, SignUpPayload } from "../models/auth.models";
import { useAuth } from "./use-auth";

interface AuthFormHooks {
  type: "sign-in" | "sign-up";
}

const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const isPhoneVN = (value: string): boolean => {
  return /^(\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(
    value.trim()
  );
};

export const useAuthForm = ({ type }: AuthFormHooks) => {
  const { signInMutation, signUpMutation } = useAuth();

  // Form đăng nhập với identifier
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

  // Transform cho đăng nhập - gửi đúng format cho backend
  const handleSignIn = signInForm.handleSubmit(async (data) => {
    try {
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

      await signInMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  });

  const handleSignUp = signUpForm.handleSubmit(async (data) => {
    try {
      await signUpMutation.mutateAsync(data as SignUpPayload);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  });

  const onSubmit = type === "sign-in" ? handleSignIn : handleSignUp;

  return {
    form,
    onSubmit,
    isLoading: signInMutation.isPending || signUpMutation.isPending,
    error: signInMutation.error || signUpMutation.error,
    isSuccess: signInMutation.isSuccess || signUpMutation.isSuccess,
    reset: () => form.reset(),
    clearErrors: () => form.clearErrors(),
  };
};

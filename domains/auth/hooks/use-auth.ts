import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { SignInApiResponse, SignInPayload, SignUpPayload } from "../models/auth.models";
import { AuthServices } from "../service/auth.service";
import { useAuthStore } from "../stores/auth.store";
import { Alert } from "react-native";

export const useAuth = () => {
  const { toast } = useToast();
  const { setAuth } = useAuthStore();

  const signUpMutation = useMutation({
    mutationKey: [QueryKey.AUTH.SIGN_UP],
    mutationFn: async (payload: SignUpPayload) => {
      return await AuthServices.signup(payload);
    },
    onSuccess: () => {
      router.push("/auth/signin");
      toast.success("Đăng ký thành công");
    },
    onError: (error) => {
      toast.error("Đăng ký thất bại");
      console.error(error);
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
      toast.success("Đăng nhập thành công");
    },
    onError: (error) => {
      Alert.alert(
        "Đăng nhập thất bại",
        "Tên đăng nhập hoặc mật khẩu không đúng"
      );
      console.error(error);
    },
  });

  return {
    signInMutation,
    signUpMutation,
  };
};

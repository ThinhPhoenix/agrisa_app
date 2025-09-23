import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation } from "@tanstack/react-query";
import { SignInPayload, SignUpPayload } from "../models/auth.models";
import { AuthServices } from "../service/auth.service";
import { router } from "expo-router";
import { useToast } from "@/domains/shared/hooks/useToast";

export const useAuth = () => {
  const { toast } = useToast();

  const signUpMutation = useMutation({
    mutationKey: [QueryKey.AUTH.SIGN_UP],
    mutationFn: async (payload: SignUpPayload) => {
      await AuthServices.signup(payload);
    },
    onSuccess: (data) => {
      router.push("/auth/signin");
      toast.success("Đăng ký thành công");
      console.log(data);
    },
    onError: (error) => {
      toast.error("Đăng ký thất bại");
      console.error(error);
    },
  });

  const signInMutation = useMutation({
    mutationKey: [QueryKey.AUTH.SIGN_IN],
    mutationFn: async (payload: SignInPayload) => {
      return AuthServices.signin(payload);
    },
    onSuccess: (data) => {
      router.push("(tabs)/")    
      toast.success("Đăng nhập thành công");
      console.log(data);
    },
    onError: (error) => {
      toast.error("Lỗi đăng nhập");

      console.error(error);
    },
  });

  return {
    signUpMutation,
    signInMutation,
  };
};

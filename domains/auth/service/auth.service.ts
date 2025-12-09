import useAxios from "@/config/useAxios.config";
import axios from "axios";
import Constants from "expo-constants";
import {
  checkIdentifierPayload,
  checkIdentifierResponse,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  UserProfile,
} from "../models/auth.models";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export const AuthServices = {
    signin: async (payload: SignInPayload): Promise<ApiResponse<SignInResponse>> => { 
        return useAxios.post("/auth/public/login", payload);
    },
    signup: async (payload: SignUpPayload): Promise<ApiResponse<void>> => { 
        return useAxios.post("/auth/public/register", payload);
    },
    checkIdentifier: async (payload: checkIdentifierPayload): Promise<ApiResponse<checkIdentifierResponse>> => {
        return useAxios.post("/auth/public/verify-identifier", payload);
    },
    getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
        return useAxios.get("/profile/protected/api/v1/me");
    },
    /**
     * Lấy thông tin profile với token cụ thể (không dùng token từ store)
     * Sử dụng khi cần check partner_id trước khi set auth
     */
    getUserProfileWithToken: async (token: string): Promise<any> => {
        const response = await axios.get(`${API_URL}/profile/protected/api/v1/me`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    },
    updateUserProfile: async (payload: Partial<UserProfile>): Promise<ApiResponse<void>> => {
        return useAxios.put("/profile/protected/api/v1/users", payload);
    },
    sendPhoneVerificationCode: async (phone: string): Promise<ApiResponse<void>> => {
        return useAxios.post(
          `/auth/public/phone-otp/generate/${phone}`,
          { phone }
        );
    },
    verifyPhoneCode: async (phone: string, code: string): Promise<ApiResponse<void>> => {
        return useAxios.post(
          `/auth/public/phone-otp/validate/${phone}?otp=${code}`,
          { phone, code }
        );
    },
}
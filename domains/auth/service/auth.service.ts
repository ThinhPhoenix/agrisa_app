import useAxios from "@/config/useAxios.config";
import {
  checkIdentifierPayload,
  checkIdentifierResponse,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  UserProfile,
} from "../models/auth.models";


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
        return useAxios.get("/auth/me");
    }
}
import useAxios from "@/config/useAxios.config";
import { SignInPayload, SignInResponse, SignUpPayload } from "../models/auth.models";


export const AuthServices = {
    signin: async (payload: SignInPayload): Promise<ApiResponse<SignInResponse>> => { 
        return useAxios.post("/auth/public/login", payload);
    },
    signup: async (payload: SignUpPayload): Promise<ApiResponse<void>> => { 
        return useAxios.post("/auth/public/register", payload);
    }
}
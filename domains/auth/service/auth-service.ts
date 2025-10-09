import useAxios from "@/config/axios";
import { endpoints } from "@/domains/endpoints";
import { SignInPayload, SignInResponse, SignUpPayload } from "../models/auth-model";


export const AuthServices = {
    signin: async (payload: SignInPayload): Promise<ApiResponse<SignInResponse>> => { 
        return useAxios.post(endpoints.sign_in, payload);
    },
    signup: async (payload: SignUpPayload): Promise<ApiResponse<void>> => { 
        return useAxios.post(endpoints.sign_up, payload);
    }
}
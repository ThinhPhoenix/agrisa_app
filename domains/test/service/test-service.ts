import useAxios from "@/config/axios";

export const TestService = {
    post: {},
    get: {
        ping: async (): Promise<ApiResponse<string>> => { 
            return useAxios.get("/auth/ping");
        }
    }
}
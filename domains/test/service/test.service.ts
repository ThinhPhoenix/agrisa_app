import useAxios from "@/config/useAxios.config"

export const TestService = {
    post: {},
    get: {
        ping: async (): Promise<ApiResponse<string>> => { 
            return useAxios.get("/auth/ping");
        }
    }
}
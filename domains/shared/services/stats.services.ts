import useAxios from "@/config/useAxios.config";
import { StatsModelResponse } from "../models/stats.model";


export const StatsService = {
    
    getStats: async (): Promise<ApiResponse<StatsModelResponse>> => {
        return useAxios.get(
          `/policy/protected/api/v2/policies/read-own/stats/overview`
        );
     }
}
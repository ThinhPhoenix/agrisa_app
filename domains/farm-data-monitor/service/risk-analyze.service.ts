import useAxios from "@/config/useAxios.config";
import { RiskAnalysesResponse } from "../models/risk-analyze.model";

export const riskAnalyzeService = {
  post: {
    // Có thể thêm các POST methods nếu cần trong tương lai
  },

  get: {
    /**
     * Lấy danh sách Risk Analysis của một registered policy
     * @param policyId - ID của registered policy
     * @returns Promise<ApiResponse<RiskAnalysesResponse>>
     */
    riskAnalyzeByPolicy: async (
      policyId: string
    ): Promise<ApiResponse<RiskAnalysesResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/risk-analysis/read-own/by-policy/${policyId}`
      );
    },
  },
};


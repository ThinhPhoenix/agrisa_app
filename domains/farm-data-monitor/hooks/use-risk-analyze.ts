import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { RiskAnalysesResponse } from "../models/risk-analyze.model";
import { riskAnalyzeService } from "../service/risk-analyze.service";

/**
 * Hook để quản lý Risk Analysis data
 */
export const useRiskAnalyze = () => {
  /**
   * Lấy danh sách Risk Analysis của một registered policy
   * @param policyId - ID của registered policy
   * @param options - Query options từ react-query
   */
  const getRiskAnalyzeByPolicy = (
    policyId: string,
    options?: Omit<
      UseQueryOptions<ApiResponse<RiskAnalysesResponse>>,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery({
      queryKey: ["risk-analyze", policyId],
      queryFn: () => riskAnalyzeService.get.riskAnalyzeByPolicy(policyId),
      enabled: !!policyId && policyId.length > 0, // Chỉ fetch khi có policyId hợp lệ
      staleTime: 5 * 60 * 1000, // 5 phút - risk analysis không thay đổi thường xuyên
      gcTime: 10 * 60 * 1000, // 10 phút cache time
      retry: 2,
      ...options,
    });
  };

  return {
    getRiskAnalyzeByPolicy,
  };
};

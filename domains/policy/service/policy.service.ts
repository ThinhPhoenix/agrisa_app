import useAxios from "@/config/useAxios.config";
import { PolicyDetailResponse, PublicBasePolicyResponse } from "../models/policy.models";


export const policyServices = {
  post: {
        
  },

  get: {
    base_policy: async (): Promise<ApiResponse<PublicBasePolicyResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/base-policies/active`
      );
    },
    detail_policy: async (base_policy_id: string): Promise<ApiResponse<PolicyDetailResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/base-policies/detail?id=${base_policy_id}&include_pdf=true`
      );
    },


  }
    
}
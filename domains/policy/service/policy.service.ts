import useAxios from "@/config/useAxios.config";
import {
  PolicyDetailResponse,
  PublicBasePolicyResponse,
  RegisteredPoliciesResponse,
  RegisteredPolicyDetailResponse,
  RegisterPolicyPayload,
  UnderwritingData,
} from "../models/policy.models";

export const policyServices = {
  post: {
    register_policy: async (
      payload: RegisterPolicyPayload
    ): Promise<ApiResponse<any>> => {
      return useAxios.post(
        `/policy/protected/api/v2/policies/register`,
        payload
      );
    },
  },

  get: {
    base_policy: async (): Promise<ApiResponse<PublicBasePolicyResponse>> => {
      return useAxios.get(`/policy/protected/api/v2/base-policies/active`);
    },
    detail_policy: async (
      base_policy_id: string
    ): Promise<ApiResponse<PolicyDetailResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/base-policies/detail?id=${base_policy_id}&include_pdf=true`
      );
    },
    get_registered_policies: async (): Promise<
      ApiResponse<RegisteredPoliciesResponse>
    > => {
      return useAxios.get(`/policy/protected/api/v2/policies/read-own/list`);
    },
    get_registered_policy_detail: async (
      policy_id: string
    ): Promise<ApiResponse<RegisteredPolicyDetailResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/policies/read-own/detail/${policy_id}`
      );
    },
    getUnderwritingPolicy: async (
      policy_id: string
    ): Promise<ApiResponse<UnderwritingData>> => {
      return useAxios.get(
        `/policy/protected/api/v2/policies/read-own/underwriting/${policy_id}`
      );
    },
  },
};
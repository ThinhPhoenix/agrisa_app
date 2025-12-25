import useAxios from "@/config/useAxios.config";
import {
  CancelRequestPayload,
  CancelRequestsResponse,
  PolicyDetailResponse,
  PublicBasePolicyResponse,
  RegisteredPoliciesResponse,
  RegisteredPolicyDetailResponse,
  RegisterPolicyPayload,
  ResolveDisputePayload,
  ReviewCancelRequestPayload,
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
    cancel_registered_policy: async (
      registered_policy_id: string,
      payload: CancelRequestPayload
    ): Promise<ApiResponse<any>> => {
      return useAxios.post(
        `/policy/protected/api/v2/cancel_request?policy_id=${registered_policy_id}`,
        payload
      );
    },
    revoke_cancel_request: async (
      cancel_request_id: string
    ): Promise<ApiResponse<any>> => {
      return useAxios.post(
        `/policy/protected/api/v2/cancel_request/revoke/${cancel_request_id}`
      );
    },
  },

  get: {
    base_policy: async (
      providerId: string,
      cropType: string
    ): Promise<ApiResponse<PublicBasePolicyResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/base-policies/active?provider_id=${providerId}&crop_type=${cropType}`
      );
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
    get_cancel_request_reasons: async (): Promise<ApiResponse<any>> => {
      return useAxios.get(
        `/policy/protected/api/v2/cancel_request/read-own/me`
      );
    },
    get_cancel_requests: async (): Promise<
      ApiResponse<CancelRequestsResponse>
    > => {
      return useAxios.get(
        `/policy/protected/api/v2/cancel_request/read-own/me`
      );
    },
    get_transferable_policies: async (registered_policy_id: string): Promise<
      ApiResponse<RegisteredPoliciesResponse>
      > => {
      return useAxios.get(
        `/policy/protected/api/v2/cancel_request/read-own/transfer?policy_id=${registered_policy_id}`
      );
    },
  },
  put: {
    review_cancel_request: async (
      cancel_request_id: string,
      payload: ReviewCancelRequestPayload
    ): Promise<ApiResponse<any>> => {
      return useAxios.put(
        `/policy/protected/api/v2/cancel_request/review/${cancel_request_id}`,
        payload
      );
    },
    resolve_dispute: async (
      cancel_request_id: string,
      payload: ResolveDisputePayload
    ): Promise<ApiResponse<any>> => {
      return useAxios.put(
        `/policy/protected/api/v2/cancel_request/resolve-dispute/${cancel_request_id}`,
        payload
      );
    },
  },
};

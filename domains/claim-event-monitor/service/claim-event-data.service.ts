import useAxios from "@/config/useAxios.config";
import {
  ClaimDetailResponse,
  ClaimsByFarmResponse,
  ClaimsByPolicyResponse,
  ConfirmPayoutPayload,
  FarmerClaimsListResponse,
} from "../models/claim-event-data.models";

export const claimDataServices = {
  put: {
    confirmPayout: async (
      id: string,
      payload: ConfirmPayoutPayload
    ): Promise<ApiResponse<any>> => {
      return useAxios.put(
        `/policy/protected/api/v2/payouts/update/confirm/${id}`,
        payload
      );
    },
    //
  },
  get: {
    claimEventData: async (): Promise<
      ApiResponse<FarmerClaimsListResponse>
    > => {
      return useAxios.get(`/policy/protected/api/v2/claims/read-own/list`);
    },
    claimEventDetailData: async (
      claim_id: string
    ): Promise<ApiResponse<ClaimDetailResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/claims/read-own/detail/${claim_id}`
      );
    },
    claimEventBasedonRegisteredPolicy: async (
      policy_id: string
    ): Promise<ApiResponse<ClaimsByPolicyResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/claims/read-own/by-policy/${policy_id}`
      );
    },
    claimEventBasedonFarm: async (
      farm_id: string
    ): Promise<ApiResponse<ClaimsByFarmResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/claims/read-own/by-farm/${farm_id}`
      );
    },
  },
};

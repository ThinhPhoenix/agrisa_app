import useAxios from "@/config/useAxios.config";
import {
  InsurancePartner,
  InsurancePartnerResponse,
} from "../models/insurance-partner.model";

export const insurancePartnerService = {
  post: {},

  get: {
    getInsurancePartner: async (): Promise<ApiResponse<InsurancePartner>> => {
      return useAxios.get(`/profile/public/api/v1/insurance-partners`);
    },

    getInsurancePartnerByID: async (
      id: string
    ): Promise<ApiResponse<InsurancePartnerResponse>> => {
      return useAxios.get(`/profile/public/api/v1/insurance-partners/${id}`);
    },
  },
};

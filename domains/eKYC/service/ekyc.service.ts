import useAxios from "@/config/useAxios.config";
import {
  EKYCStatusResponse,
  FaceScanPayload,
  OCRIDPPayload,
} from "../models/ekyc.models";

export const eKYCServices = {
  post: {
    ocr_id: async (
      payload: OCRIDPPayload
    ): Promise<ApiResponse<EKYCStatusResponse>> => {
      return useAxios.post("/auth/protected/api/v2/ocridcard", payload, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
    },
    scan_face: async (
      payload: FaceScanPayload
    ): Promise<ApiResponse<EKYCStatusResponse>> => {
      return useAxios.post("/auth/protected/api/v2/face-liveness", payload, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
    },

    reset_ekyc: async (): Promise<ApiResponse<void>> => {
      return useAxios.post("/auth/protected/api/v2/session/reset-ekyc");
    }
  },

  get: {
    ekyc_status: async (
      i: string
    ): Promise<ApiResponse<EKYCStatusResponse>> => {
      return useAxios.get(`/auth/protected/api/v2/ekyc-progress/${i}`);
    },
    card_info: async (): Promise<ApiResponse<any>> => {
      return useAxios.get(`/auth/protected/api/v2/session/cards`);
    },
  },
};

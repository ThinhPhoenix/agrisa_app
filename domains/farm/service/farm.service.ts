import useAxios from "@/config/useAxios.config";
import { Farm, FarmModel, FormFarmDTO } from "../models/farm.models";


export const farmServices = {
  post: {
    createFarm: async (
      payload: FormFarmDTO
    ): Promise<ApiResponse<FarmModel>> => {
      return useAxios.post("/policy/protected/api/v2/farms", payload);
    },
  },

  get: {
    listFarm: async(): Promise<ApiResponse<Farm[]>> => {
      return useAxios.get("/policy/protected/api/v2/farms/me");
    },
    detailFarm: async (farm_id: string): Promise<ApiResponse<Farm>> => {
      return useAxios.get(`/policy/protected/api/v2/farms/${farm_id}`);
    }

  },
};
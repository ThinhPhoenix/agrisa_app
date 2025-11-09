import useAxios from "@/config/useAxios.config";
import { FarmModel, FormFarmDTO } from "../models/farm.models";


export const policyServices = {
  post: {
    createFarm: async (
      payload: FormFarmDTO
    ): Promise<ApiResponse<FarmModel>> => {
      return useAxios.post("/policy/protected/api/v2/farms", payload);
    },
  },

  get: {},
};
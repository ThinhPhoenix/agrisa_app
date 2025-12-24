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
        listFarm: async (cropType: string): Promise<ApiResponse<Farm[]>> => {
            return useAxios.get(
                `/policy/protected/api/v2/farms/me?crop_type=${cropType}`
            );
        },
        detailFarm: async (farm_id: string): Promise<ApiResponse<Farm>> => {
            return useAxios.get(`/policy/protected/api/v2/farms/${farm_id}`);
        },
    },
    put: {
        updateFarm: async (
            farm_id: string,
            payload: FormFarmDTO
        ): Promise<ApiResponse<FarmModel>> => {
            return useAxios.put(
                `/policy/protected/api/v2/farms/${farm_id}`,
                payload
            );
        },
    }
};

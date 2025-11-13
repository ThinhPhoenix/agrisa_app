import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { farmServices } from "../service/farm.service";

export const useFarm = () => {

  const getListFarm = () => {
    return useQuery({
      queryKey: [QueryKey.FARM.LIST],
      queryFn: () => farmServices.get.listFarm(),
    });
  }

  const getDetailFarm = (farm_id: string) => {
    return useQuery({
      queryKey: [QueryKey.FARM.DETAIL, farm_id],
      queryFn: () => farmServices.get.detailFarm(farm_id),
      enabled: !!farm_id,
    });
  };
  

  return {
    getListFarm,
    getDetailFarm,
  };
};

import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FormFarmDTO } from "../models/farm.models";
import { farmServices } from "../service/farm.service";

export const useFarm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getListFarm = () => {
    return useQuery({
      queryKey: [QueryKey.FARM.LIST],
      queryFn: () => farmServices.get.listFarm(),
    });
  };

  const getDetailFarm = (farm_id: string) => {
    return useQuery({
      queryKey: [QueryKey.FARM.DETAIL, farm_id],
      queryFn: () => farmServices.get.detailFarm(farm_id),
      enabled: !!farm_id,
    });
  };

  /**
   * Mutation: Tạo farm mới
   */
  const createFarmMutation = useMutation({
    mutationFn: (payload: FormFarmDTO) => farmServices.post.createFarm(payload),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("✅ Đăng ký nông trại thành công!");

        // Invalidate queries để refresh danh sách farm
        queryClient.invalidateQueries({ queryKey: [QueryKey.FARM.LIST] });

        // Navigate về danh sách farm
        router.replace("/(farmer)/farm");
      }
    },
    onError: (error: any) => {
      console.error("❌ Create farm error:", error);
      toast.error(
        error?.message || "Không thể đăng ký nông trại. Vui lòng thử lại."
      );
    },
  });

  /**
   * Mutation: Cập nhật farm
   */
  const updateFarmMutation = useMutation({
    mutationFn: ({
      farmId,
      payload,
    }: {
      farmId: string;
      payload: FormFarmDTO;
    }) => farmServices.post.createFarm(payload), // TODO: Cần thêm API update
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success("✅ Cập nhật nông trại thành công!");

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: [QueryKey.FARM.LIST] });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.FARM.DETAIL, variables.farmId],
        });

        // Navigate về detail mode
        router.replace(`/(farmer)/form-farm/${variables.farmId}?mode=detail`);
      }
    },
    onError: (error: any) => {
      console.error("❌ Update farm error:", error);
      toast.error(
        error?.message || "Không thể cập nhật nông trại. Vui lòng thử lại."
      );
    },
  });

  return {
    getListFarm,
    getDetailFarm,
    createFarmMutation,
    updateFarmMutation,
  };
};

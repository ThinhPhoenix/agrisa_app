import { useNotificationModal } from "@/components/modal";
import { useResultStatus } from "@/components/result-status/export";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FormFarmDTO } from "../models/farm.models";
import { farmServices } from "../service/farm.service";

export const useFarm = () => {
  const queryClient = useQueryClient();
  const notification = useNotificationModal();
  const resultStatus = useResultStatus();
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
    onSuccess: async (data: any) => {
      // Invalidate queries trước khi chuyển trang
      await queryClient.invalidateQueries({ queryKey: [QueryKey.FARM.LIST] });

      // Hiển thị Result Status Screen
      resultStatus.showSuccess({
        title: "Đăng ký thành công!",
        message: "Trang trại của bạn đã được đăng ký thành công.",
        subMessage: "Bạn có thể bắt đầu đăng ký bảo hiểm cho trang trại này.",
        autoRedirectSeconds: 5,
        autoRedirectRoute: "/(tabs)",
        showHomeButton: true,
        lockNavigation: true,
      });
    },
    onError: (error: any) => {
      console.error("❌ Create farm error:", error);

      // Xử lý error message cụ thể
      let errorMessage = "Không thể đăng ký trang trại. Vui lòng thử lại.";
      let errorTitle = "Đăng ký thất bại";

      const apiMessage = error?.response?.data?.message || error?.message || "";

      if (
        apiMessage.toLowerCase().includes("duplicate") ||
        apiMessage.toLowerCase().includes("already exists")
      ) {
        errorTitle = "Trang trại đã tồn tại";
        errorMessage =
          "Trang trại này đã được đăng ký. Vui lòng kiểm tra lại thông tin.";
      } else if (
        apiMessage.toLowerCase().includes("invalid coordinates") ||
        apiMessage.toLowerCase().includes("boundary")
      ) {
        errorTitle = "Tọa độ không hợp lệ";
        errorMessage =
          "Tọa độ ranh giới trang trại không hợp lệ. Vui lòng vẽ lại ranh giới.";
      } else if (apiMessage) {
        errorMessage = apiMessage;
      }

      // Hiển thị Result Status Screen với error
      resultStatus.showError({
        title: errorTitle,
        message: errorMessage,
        subMessage:
          "Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ.",
        showHomeButton: true,
        lockNavigation: true,
      });
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
    }) => farmServices.post.createFarm(payload),
    onSuccess: (response, variables) => {
      if (response.success) {
        notification.success("✅ Cập nhật nông trại thành công!");

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
      notification.error(
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

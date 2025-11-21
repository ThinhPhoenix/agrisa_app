import { useNotificationModal } from "@/components/modal";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { policyServices } from "../service/policy.service";

export const usePolicy = () => {
  const notification = useNotificationModal();

  const getPublicBasePolicy = () => {
    return useQuery({
      queryKey: [QueryKey.EKYC.STATUS],
      queryFn: () => policyServices.get.base_policy(),
    });
  };

  const getDetailBasePolicy = (base_policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.DETAIL, base_policy_id],
      queryFn: () => policyServices.get.detail_policy(base_policy_id),
      enabled: !!base_policy_id,
    });
  };

  const registerPolicyMutation = useMutation({
    mutationKey: [QueryKey.POLICY.REGISTER],
    mutationFn: async (payload: any) => {
      return await policyServices.post.register_policy(payload);
    },
    onSuccess: async (data: any) => {
      console.log("Đăng ký chính sách thành công:", data);

      // Hiển thị thông báo thành công
      notification.success(
        "Đăng ký bảo hiểm thành công! Vui lòng chờ xét duyệt."
      );

      // Redirect về trang danh sách farm
      setTimeout(() => {
        router.push("/(farmer)/farm");
      }, 500);
    },
    onError: (error: any) => {
      console.error("❌ Error registering policy:", error);

      // Xử lý error message cụ thể
      let errorMessage = "Không thể đăng ký bảo hiểm. Vui lòng thử lại.";

      // Lấy message từ response
      const apiMessage = error?.response?.data?.message || error?.message || "";

      // Dịch các message thường gặp
      if (
        apiMessage
          .toLowerCase()
          .includes("enrollment date validation failed") ||
        apiMessage.toLowerCase().includes("policy enrollment date is over")
      ) {
        errorMessage =
          "Đã hết hạn đăng ký cho sản phẩm bảo hiểm này. Vui lòng chọn sản phẩm khác.";
      } else if (apiMessage.toLowerCase().includes("farm already registered")) {
        errorMessage =
          "Trang trại này đã được đăng ký bảo hiểm. Vui lòng chọn trang trại khác.";
      } else if (apiMessage.toLowerCase().includes("invalid planting date")) {
        errorMessage = "Ngày gieo trồng không hợp lệ. Vui lòng kiểm tra lại.";
      } else if (
        apiMessage.toLowerCase().includes("insufficient balance") ||
        apiMessage.toLowerCase().includes("payment required")
      ) {
        errorMessage = "Số dư không đủ. Vui lòng nạp thêm tiền để tiếp tục.";
      } else if (apiMessage) {
        // Nếu có message từ API và không match case nào, hiển thị luôn
        errorMessage = apiMessage;
      }

      notification.error(errorMessage);
    },
  });

  return {
    getPublicBasePolicy,
    getDetailBasePolicy,
    registerPolicyMutation,
  };
};

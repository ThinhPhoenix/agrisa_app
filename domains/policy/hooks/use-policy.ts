import { useNotificationModal } from "@/components/modal";
import { useResultStatus } from "@/components/result-status/useResultStatus";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { policyServices } from "../service/policy.service";

export const usePolicy = () => {
  const notification = useNotificationModal();
  const resultStatus = useResultStatus();

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

  const getRegisteredPolicy = () => {
    return useQuery({
      queryKey: [QueryKey.POLICY.REGISTERED_POLICIES],
      queryFn: () => policyServices.get.get_registered_policies(),
    });
  }

  const getRegisteredPolicyDetail = (policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.REGISTERED_POLICY_DETAIL, policy_id],
      queryFn: () => policyServices.get.get_registered_policy_detail(policy_id),
      enabled: !!policy_id,
    });
  };

  const registerPolicyMutation = useMutation({
    mutationKey: [QueryKey.POLICY.REGISTER],
    mutationFn: async (payload: any) => {
      return await policyServices.post.register_policy(payload);
    },
    onSuccess: async (data: any) => {
      // Hiển thị Result Status Screen với success
      resultStatus.showLoading({
        title: "Đăng ký bảo hiểm thành công!",
        message: "Hồ sơ của bạn đã được gửi đi và đang chờ xét duyệt.",
        subMessage: "Chúng tôi sẽ thông báo kết quả trong vòng 1-3 ngày làm việc.",
        autoRedirectSeconds: 5,
        autoRedirectRoute: "/(tabs)",
        showHomeButton: true,
        lockNavigation: true,
      });

      
    },
    onError: (error: any) => {
      console.error("❌ Error registering policy:", error);

      // Xử lý error message cụ thể
      let errorMessage = "Không thể đăng ký bảo hiểm. Vui lòng thử lại.";
      let errorTitle = "Đăng ký thất bại";

      // Lấy message từ response
      const apiMessage = error?.response?.data?.message || error?.message || "";

      // Dịch các message thường gặp
      if (
        apiMessage
          .toLowerCase()
          .includes("enrollment date validation failed") ||
        apiMessage.toLowerCase().includes("policy enrollment date is over")
      ) {
        errorTitle = "Hết hạn đăng ký";
        errorMessage =
          "Đã hết hạn đăng ký cho sản phẩm bảo hiểm này. Vui lòng chọn sản phẩm khác hoặc liên hệ hỗ trợ.";
      } else if (apiMessage.toLowerCase().includes("farm already registered")) {
        errorTitle = "Trang trại đã được bảo hiểm";
        errorMessage =
          "Trang trại này đã được đăng ký bảo hiểm. Vui lòng chọn trang trại khác hoặc kiểm tra lại danh sách bảo hiểm của bạn.";
      } else if (apiMessage.toLowerCase().includes("invalid planting date")) {
        errorTitle = "Ngày gieo trồng không hợp lệ";
        errorMessage = "Ngày gieo trồng không hợp lệ. Vui lòng kiểm tra và chọn lại ngày gieo trồng phù hợp.";
      } else if (
        apiMessage.toLowerCase().includes("insufficient balance") ||
        apiMessage.toLowerCase().includes("payment required")
      ) {
        errorTitle = "Số dư không đủ";
        errorMessage = "Số dư trong tài khoản không đủ để thanh toán. Vui lòng nạp thêm tiền để tiếp tục.";
      } else if (apiMessage) {
        // Nếu có message từ API và không match case nào, hiển thị luôn
        errorMessage = apiMessage;
      }

      // Hiển thị Result Status Screen với error
      resultStatus.showError({
        title: errorTitle,
        message: errorMessage,
        subMessage: "Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ.",
        showHomeButton: true,
        lockNavigation: true,
      });

      // Vẫn giữ notification modal cho những nơi khác sử dụng
      // notification.error(errorMessage);
    },
  });

  return {
    getPublicBasePolicy,
    getDetailBasePolicy,
    registerPolicyMutation,
    getRegisteredPolicy,
    getRegisteredPolicyDetail,
  };
};

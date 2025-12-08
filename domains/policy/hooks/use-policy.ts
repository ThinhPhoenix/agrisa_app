import { useNotificationModal } from "@/components/modal";
import { useResultStatus } from "@/components/result-status/useResultStatus";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CancelRequestPayload } from "../models/policy.models";
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

  const getDetailBasePolicy = (
    base_policy_id: string,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.DETAIL, base_policy_id],
      queryFn: () => policyServices.get.detail_policy(base_policy_id),
      enabled:
        options?.enabled !== undefined ? options.enabled : !!base_policy_id,
    });
  };

  const getUnderwritingPolicy = (policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.UNDERWRITING, policy_id],
      queryFn: () => policyServices.get.getUnderwritingPolicy(policy_id),
      enabled: !!policy_id,
    });
  };

  const getRegisteredPolicy = () => {
    return useQuery({
      queryKey: [QueryKey.POLICY.REGISTERED_POLICIES],
      queryFn: () => policyServices.get.get_registered_policies(),
    });
  };

  const getRegisteredPolicyDetail = (
    policy_id: string,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.REGISTERED_POLICY_DETAIL, policy_id],
      queryFn: () => policyServices.get.get_registered_policy_detail(policy_id),
      enabled: options?.enabled !== undefined ? options.enabled : !!policy_id,
    });
  };

  const registerPolicyMutation = useMutation({
    mutationKey: [QueryKey.POLICY.REGISTER],
    mutationFn: async (payload: any) => {
      return await policyServices.post.register_policy(payload);
    },
    onSuccess: async (data: any) => {
      // Hiển thị Result Status Screen với success
      resultStatus.showSuccess({
        title: "Đăng ký bảo hiểm thành công!",
        message: "Hồ sơ của bạn đã được gửi đi và đang chờ xét duyệt.",
        subMessage:
          "Chúng tôi sẽ thông báo kết quả trong vòng 1-3 ngày làm việc.",
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
        errorMessage =
          "Ngày gieo trồng không hợp lệ. Vui lòng kiểm tra và chọn lại ngày gieo trồng phù hợp.";
      } else if (
        apiMessage.toLowerCase().includes("insufficient balance") ||
        apiMessage.toLowerCase().includes("payment required")
      ) {
        errorTitle = "Số dư không đủ";
        errorMessage =
          "Số dư trong tài khoản không đủ để thanh toán. Vui lòng nạp thêm tiền để tiếp tục.";
      } else if (apiMessage) {
        // ✅ Case chung chung: Hiển thị message từ API nhưng thêm context
        errorTitle = "Đăng ký thất bại";
        errorMessage = apiMessage;
      } else {
        // ✅ Không có message gì từ API
        errorTitle = "Lỗi không xác định";
        errorMessage =
          "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.";
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
   * Mutation: Hủy hợp đồng bảo hiểm (Cancel Policy)
   */
  const cancelPolicyMutation = useMutation({
    mutationKey: [QueryKey.POLICY.CANCEL],
    mutationFn: async (payload: {
      registered_policy_id: string;
      cancel_request_type: CancelRequestPayload["cancel_request_type"];
      reason: string;
      compensate_amount: number;
      evidence: CancelRequestPayload["evidence"];
    }) => {
      return await policyServices.post.cancel_registered_policy(
        payload.registered_policy_id,
        {
          cancel_request_type: payload.cancel_request_type,
          reason: payload.reason,
          compensate_amount: payload.compensate_amount,
          evidence: payload.evidence,
        }
      );
    },
    onSuccess: async (data: any) => {
      console.log("✅ Cancel policy request submitted:", data);

      // Hiển thị Result Status Screen với success
      resultStatus.showSuccess({
        title: "Gửi yêu cầu thành công!",
        message: "Yêu cầu hủy hợp đồng của bạn đã được gửi đi.",
        subMessage:
          "Chúng tôi sẽ xem xét và phản hồi trong vòng 3-5 ngày làm việc.",
        autoRedirectSeconds: 5,
        autoRedirectRoute: "/(tabs)",
        showHomeButton: true,
        lockNavigation: true,
      });
    },
    onError: (error: any) => {
      console.error("❌ Error cancelling policy:", error);

      // Xử lý error message cụ thể
      let errorMessage =
        "Không thể gửi yêu cầu hủy hợp đồng. Vui lòng thử lại.";
      let errorTitle = "Gửi yêu cầu thất bại";

      const apiMessage = error?.response?.data?.message || error?.message || "";

      if (apiMessage.toLowerCase().includes("policy not found")) {
        errorTitle = "Không tìm thấy hợp đồng";
        errorMessage =
          "Hợp đồng không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại.";
      } else if (
        apiMessage.toLowerCase().includes("policy already cancelled") ||
        apiMessage.toLowerCase().includes("already canceled")
      ) {
        errorTitle = "Hợp đồng đã hủy";
        errorMessage = "Hợp đồng này đã được hủy trước đó.";
      } else if (
        apiMessage.toLowerCase().includes("policy not active") ||
        apiMessage.toLowerCase().includes("invalid status")
      ) {
        errorTitle = "Trạng thái không hợp lệ";
        errorMessage =
          "Chỉ có thể hủy hợp đồng đang có hiệu lực. Vui lòng kiểm tra lại trạng thái hợp đồng.";
      } else if (apiMessage.toLowerCase().includes("pending cancel request")) {
        errorTitle = "Đã có yêu cầu hủy";
        errorMessage =
          "Bạn đã gửi yêu cầu hủy hợp đồng này trước đó. Vui lòng đợi phản hồi.";
      } else if (apiMessage) {
        // Case chung chung: Hiển thị message từ API
        errorMessage = apiMessage;
      } else {
        // Không có message từ API
        errorTitle = "Lỗi không xác định";
        errorMessage =
          "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.";
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

  return {
    getPublicBasePolicy,
    getDetailBasePolicy,
    registerPolicyMutation,
    cancelPolicyMutation,
    getRegisteredPolicy,
    getRegisteredPolicyDetail,
    getUnderwritingPolicy,
  };
};

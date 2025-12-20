import { useResultStatus } from "@/components/result-status/useResultStatus";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CancelRequestPayload,
  ReviewCancelRequestPayload,
} from "../models/policy.models";
import { policyServices } from "../service/policy.service";

export const usePolicy = () => {
  const resultStatus = useResultStatus();
  const queryClient = useQueryClient();

  const useGetPublicBasePolicy = (
    providerId: string = "",
    cropType: string = ""
  ) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.BASE, providerId, cropType],
      queryFn: () => policyServices.get.base_policy(providerId, cropType),
    });
  };
  const useGetCancelReason = () => {
    return useQuery({
      queryKey: [QueryKey.POLICY.GET_CANCEL_REASONS],
      queryFn: () => policyServices.get.get_cancel_request_reasons(),
    });
  };
  // Backwards compatible alias
  const getCancelReason = useGetCancelReason;

  const useGetCancelRequests = () => {
    return useQuery({
      queryKey: [QueryKey.POLICY.GET_CANCEL_REQUESTS],
      queryFn: () => policyServices.get.get_cancel_requests(),
    });
  };
  const getCancelRequests = useGetCancelRequests;

  const useGetCancelRequestByPolicyId = (registered_policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.GET_CANCEL_REQUESTS, registered_policy_id],
      queryFn: async () => {
        const response = await policyServices.get.get_cancel_requests();
        console.log("🔍 Full API Response:", JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          console.log("🔍 Response data:", response.data);
          console.log("🔍 Looking for policy_id:", registered_policy_id);

          // Lọc cancel request theo registered_policy_id
          const filteredClaim = response.data.claims?.find((claim) => {
            console.log(
              "🔍 Comparing claim.registered_policy_id:",
              claim.registered_policy_id,
              "with:",
              registered_policy_id
            );
            return claim.registered_policy_id === registered_policy_id;
          });

          console.log("🔍 Filtered claim:", filteredClaim);
          return filteredClaim || null;
        }
        console.log("❌ Response not successful or no data");
        return null;
      },
      enabled: !!registered_policy_id,
    });
  };
  const getCancelRequestByPolicyId = useGetCancelRequestByPolicyId;

  const useGetDetailBasePolicy = (
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
  const getDetailBasePolicy = useGetDetailBasePolicy;

  const useGetUnderwritingPolicy = (policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.UNDERWRITING, policy_id],
      queryFn: () => policyServices.get.getUnderwritingPolicy(policy_id),
      enabled: !!policy_id,
    });
  };
  const getUnderwritingPolicy = useGetUnderwritingPolicy;

  const useGetRegisteredPolicy = () => {
    return useQuery({
      queryKey: [QueryKey.POLICY.REGISTERED_POLICIES],
      queryFn: () => policyServices.get.get_registered_policies(),
    });
  };
  const getRegisteredPolicy = useGetRegisteredPolicy;

  const useGetRegisteredPolicyDetail = (
    policy_id: string,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.REGISTERED_POLICY_DETAIL, policy_id],
      queryFn: () => policyServices.get.get_registered_policy_detail(policy_id),
      enabled: options?.enabled !== undefined ? options.enabled : !!policy_id,
    });
  };
  const getRegisteredPolicyDetail = useGetRegisteredPolicyDetail;

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

      // Lấy error code và message từ response
      const errorCode = error?.response?.data?.code || "";
      const apiMessage = error?.response?.data?.message || error?.message || "";
      const httpStatus = error?.response?.status || 0;

      // Xử lý theo error code từ API
      if (errorCode === "INVALID_REQUEST") {
        errorTitle = "Dữ liệu không hợp lệ";
        errorMessage =
          "Thông tin đăng ký không đúng định dạng. Vui lòng kiểm tra lại các trường thông tin.";
      } else if (errorCode === "VALIDATION_FAILED") {
        errorTitle = "Thông tin chưa đầy đủ";
        // Parse validation errors từ message
        if (apiMessage.toLowerCase().includes("base_policy_id")) {
          errorMessage = "Vui lòng chọn gói bảo hiểm.";
        } else if (apiMessage.toLowerCase().includes("farmer_id")) {
          errorMessage =
            "Không tìm thấy thông tin nông dân. Vui lòng đăng nhập lại.";
        } else if (apiMessage.toLowerCase().includes("coverage_amount")) {
          errorMessage = "Số tiền bảo hiểm phải lớn hơn 0.";
        } else if (apiMessage.toLowerCase().includes("planting_date")) {
          errorMessage =
            "Ngày gieo trồng không hợp lệ. Vui lòng chọn ngày trong quá khứ hoặc bỏ qua nếu chưa có.";
        } else if (apiMessage.toLowerCase().includes("area_multiplier")) {
          errorMessage = "Hệ số diện tích không hợp lệ.";
        } else if (
          apiMessage.toLowerCase().includes("farm.id") ||
          apiMessage.toLowerCase().includes("farm_name")
        ) {
          errorMessage =
            "Vui lòng chọn trang trại hoặc nhập thông tin trang trại mới.";
        } else if (apiMessage.toLowerCase().includes("farm.area_sqm")) {
          errorMessage = "Diện tích trang trại phải lớn hơn 0.";
        } else if (apiMessage.toLowerCase().includes("crop_type")) {
          errorMessage = "Vui lòng chọn loại cây trồng.";
        } else if (
          apiMessage.toLowerCase().includes("boundary") ||
          apiMessage.toLowerCase().includes("center_location")
        ) {
          errorMessage = "Vui lòng cung cấp thông tin vị trí trang trại.";
        } else if (apiMessage.toLowerCase().includes("policy_tags")) {
          errorMessage = "Thông tin tài liệu bảo hiểm không hợp lệ.";
        } else {
          errorMessage =
            "Thông tin đăng ký chưa đầy đủ hoặc không hợp lệ. Vui lòng kiểm tra lại.";
        }
      } else if (errorCode === "UNAUTHORIZED" || httpStatus === 401) {
        errorTitle = "Chưa đăng nhập";
        errorMessage =
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
      } else if (errorCode === "FORBIDDEN" || httpStatus === 403) {
        errorTitle = "Không có quyền truy cập";
        errorMessage =
          "Bạn không có quyền đăng ký bảo hiểm cho người khác. Vui lòng kiểm tra lại thông tin.";
      } else if (errorCode === "INTERNAL") {
        errorTitle = "Lỗi hệ thống";
        if (apiMessage.toLowerCase().includes("partner user ids")) {
          errorMessage =
            "Không thể kết nối với đối tác bảo hiểm. Vui lòng thử lại sau.";
        } else {
          errorMessage =
            "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.";
        }
      } else if (errorCode === "REGISTRATION_FAILED") {
        errorTitle = "Đăng ký thất bại";
        // Parse chi tiết lỗi từ service
        if (
          apiMessage
            .toLowerCase()
            .includes("enrollment date validation failed") ||
          apiMessage.toLowerCase().includes("enrollment dates are required")
        ) {
          errorMessage =
            "Đã hết hạn đăng ký cho sản phẩm bảo hiểm này. Vui lòng chọn sản phẩm khác.";
        } else if (
          apiMessage.toLowerCase().includes("farm already registered")
        ) {
          errorTitle = "Trang trại đã được bảo hiểm";
          errorMessage =
            "Trang trại này đã được đăng ký bảo hiểm cho gói này. Vui lòng chọn trang trại khác.";
        } else if (
          apiMessage.toLowerCase().includes("base policy is not active") ||
          apiMessage.toLowerCase().includes("base policy is invalid")
        ) {
          errorTitle = "Gói bảo hiểm không khả dụng";
          errorMessage =
            "Gói bảo hiểm này hiện không còn hoạt động. Vui lòng chọn gói khác.";
        } else if (
          apiMessage.toLowerCase().includes("database") ||
          apiMessage.toLowerCase().includes("transaction")
        ) {
          errorMessage =
            "Không thể lưu thông tin đăng ký. Vui lòng thử lại sau.";
        } else if (
          apiMessage.toLowerCase().includes("document") ||
          apiMessage.toLowerCase().includes("signed")
        ) {
          errorMessage =
            "Không thể tạo hợp đồng bảo hiểm. Vui lòng thử lại sau.";
        } else {
          errorMessage =
            "Không thể hoàn tất đăng ký bảo hiểm. Vui lòng kiểm tra lại thông tin và thử lại.";
        }
      } else if (
        apiMessage.toLowerCase().includes("insufficient balance") ||
        apiMessage.toLowerCase().includes("payment required")
      ) {
        errorTitle = "Số dư không đủ";
        errorMessage =
          "Số dư trong tài khoản không đủ để thanh toán. Vui lòng nạp thêm tiền để tiếp tục.";
      } else if (apiMessage) {
        // Case chung chung: Hiển thị message từ API
        errorTitle = "Đăng ký thất bại";
        errorMessage = apiMessage;
      } else {
        // Không có message gì từ API
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

  const reviewCancelRequestMutation = useMutation({
    mutationKey: [QueryKey.POLICY.REVIEW_CANCEL_REQUEST],
    mutationFn: async ({
      cancel_request_id,
      payload,
    }: {
      cancel_request_id: string;
      payload: ReviewCancelRequestPayload;
    }) => {
      return await policyServices.put.review_cancel_request(
        cancel_request_id,
        payload
      );
    },
    onSuccess: async (data: any, variables) => {
      // Invalidate cache để refresh dữ liệu
      queryClient.invalidateQueries({
        queryKey: [QueryKey.POLICY.GET_CANCEL_REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKey.POLICY.REGISTERED_POLICIES],
      });

      const isApproved = variables.payload.approved;

      // Hiển thị Result Status Screen với success
      resultStatus.showSuccess({
        title: isApproved
          ? "Đã chấp nhận yêu cầu hủy"
          : "Đã từ chối yêu cầu hủy",
        message: isApproved
          ? "Yêu cầu hủy hợp đồng đã được chấp nhận thành công."
          : "Yêu cầu hủy hợp đồng đã bị từ chối.",
        subMessage: isApproved
          ? "Hợp đồng sẽ được xử lý hủy trong thời gian sớm nhất."
          : "Nông dân sẽ được thông báo về quyết định này.",
        autoRedirectSeconds: 3,
        autoRedirectRoute: "/(tabs)",
        showHomeButton: true,
        lockNavigation: false,
      });
    },
    onError: (error: any) => {
      console.error("❌ Error reviewing cancel request:", error);

      let errorMessage = "Không thể xử lý yêu cầu hủy. Vui lòng thử lại.";
      let errorTitle = "Xử lý thất bại";

      const errorCode = error?.response?.data?.code || "";
      const apiMessage = error?.response?.data?.message || error?.message || "";

      if (errorCode === "INVALID_REQUEST") {
        errorTitle = "Dữ liệu không hợp lệ";
        errorMessage =
          "Thông tin xử lý không đúng định dạng. Vui lòng kiểm tra lại.";
      } else if (errorCode === "NOT_FOUND") {
        errorTitle = "Không tìm thấy yêu cầu";
        errorMessage = "Yêu cầu hủy hợp đồng không tồn tại hoặc đã bị xóa.";
      } else if (
        apiMessage.toLowerCase().includes("already processed") ||
        apiMessage.toLowerCase().includes("already reviewed")
      ) {
        errorTitle = "Đã xử lý trước đó";
        errorMessage = "Yêu cầu này đã được xử lý rồi.";
      } else if (apiMessage) {
        errorMessage = apiMessage;
      } else {
        errorTitle = "Lỗi không xác định";
        errorMessage = "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
      }

      resultStatus.showError({
        title: errorTitle,
        message: errorMessage,
        subMessage: "Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ hỗ trợ.",
        showHomeButton: true,
        lockNavigation: false,
      });
    },
  });

  return {
    useGetPublicBasePolicy,
    // backwards compatible alias
    getPublicBasePolicy: useGetPublicBasePolicy,
    getDetailBasePolicy,
    registerPolicyMutation,
    cancelPolicyMutation,
    reviewCancelRequestMutation,
    getRegisteredPolicy,
    getRegisteredPolicyDetail,
    getUnderwritingPolicy,
    getCancelReason,
    getCancelRequests,
    getCancelRequestByPolicyId,
  };
};

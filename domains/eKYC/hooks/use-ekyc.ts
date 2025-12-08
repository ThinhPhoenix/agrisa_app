import { useResultStatus } from "@/components/result-status/useResultStatus";
import { AuthServices } from "@/domains/auth/service/auth.service";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CardInfoResponse,
  FaceScanPayload,
  OCRIDPPayload,
  UpdateCardInfoPayload,
} from "../models/ekyc.models";
import { eKYCServices } from "../service/ekyc.service";
import { mapCardInfoToProfile } from "../utils/card-info.utils";

export const useEkyc = () => {
  const resultStatus = useResultStatus();
  const queryClient = useQueryClient();
  const { fetchUserProfile } = useAuthStore();

  const geteKYCStatusQuery = (id: string) => {
    return useQuery({
      queryKey: [QueryKey.EKYC.STATUS, id],
      queryFn: () => eKYCServices.get.ekyc_status(id),
    });
  };

  const getCardInfo = () => {
    return useQuery({
      queryKey: [QueryKey.EKYC.CARD_INFO],
      queryFn: () => eKYCServices.get.card_info(),
    });
  };

  const ocrIdMutation = useMutation({
    mutationKey: [QueryKey.EKYC.OCR_ID],
    mutationFn: async (payload: OCRIDPPayload) => {
      return await eKYCServices.post.ocr_id(payload);
    },
    onSuccess: async (data: any) => {
      // Hiển thị success và chuyển đến face scan
      resultStatus.showSuccess({
        title: "Xác thực CCCD thành công!",
        message: "Thông tin CCCD đã được xác nhận.",
        subMessage: "Tiếp tục xác thực khuôn mặt để hoàn tất.",
        autoRedirectSeconds: 3,
        autoRedirectRoute: "/settings/verify/face-scan",
        showHomeButton: false,
        lockNavigation: true,
      });
    },
    onError: (error: any) => {
      console.error("❌ Lỗi xác thực CCCD:", error);
      resultStatus.showError({
        title: "Xác thực CCCD thất bại",
        message:
          error?.response?.data?.message ||
          "Không thể xác thực CCCD. Vui lòng thử lại.",
        subMessage: "Đảm bảo ảnh CCCD rõ nét và đúng khung.",
        showHomeButton: true,
        lockNavigation: true,
      });
    },
  });

  const faceScanMutation = useMutation({
    mutationKey: [QueryKey.EKYC.FACE_SCAN],
    mutationFn: async (payload: FaceScanPayload) => {
      return await eKYCServices.post.scan_face(payload);
    },
    onSuccess: async (data: any) => {
      // Hiển thị success và chuyển đến confirm-info
      resultStatus.showSuccess({
        title: "Xác thực khuôn mặt thành công!",
        message: "Khuôn mặt của bạn đã được xác thực.",
        subMessage: "Vui lòng kiểm tra và xác nhận thông tin từ CCCD.",
        autoRedirectSeconds: 3,
        autoRedirectRoute: "/settings/verify/confirm-info",
        showHomeButton: false,
        lockNavigation: true,
      });
    },
    onError: (error: any) => {
      console.error("❌ Lỗi xác thực khuôn mặt:", error);
      resultStatus.showError({
        title: "Xác thực khuôn mặt thất bại",
        message:
          error?.response?.data?.message ||
          "Không thể xác thực khuôn mặt. Vui lòng thử lại.",
        subMessage: "Đảm bảo khuôn mặt nằm trong khung và có đủ ánh sáng.",
        showHomeButton: true,
        lockNavigation: true,
      });
    },
  });

  /**
   * Mutation để xác nhận thông tin từ CCCD và update profile
   * - Map CardInfo sang UserProfile
   * - Gọi API update profile
   * - Refresh profile trong auth store
   * - Navigate đến màn hình status
   */
  const confirmCardInfoMutation = useMutation({
    mutationKey: [QueryKey.EKYC.CONFIRM_CARD_INFO],
    mutationFn: async (cardInfo: CardInfoResponse) => {
      // Map CardInfo sang UserProfile
      const profileData = mapCardInfoToProfile(cardInfo);
      console.log(
        "🔄 [confirmCardInfoMutation] Sending profile data to API..."
      );

      // Gọi API update profile
      const response = await AuthServices.updateUserProfile(profileData);
      console.log(
        "✅ [confirmCardInfoMutation] API Response:",
        JSON.stringify(response, null, 2)
      );
      return response;
    },
    onSuccess: async () => {
      // Refresh profile trong auth store
      await fetchUserProfile();

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: [QueryKey.AUTH.ME] });
      queryClient.invalidateQueries({ queryKey: [QueryKey.EKYC.CARD_INFO] });

      // Hiển thị success và chuyển đến bank-info để nhập thông tin ngân hàng
      resultStatus.showSuccess({
        title: "Xác nhận thành công!",
        message: "Thông tin CCCD đã được cập nhật.",
        subMessage: "Tiếp tục nhập thông tin ngân hàng để nhận bồi thường.",
        autoRedirectSeconds: 3,
        autoRedirectRoute: "/settings/verify/bank-info",
        showHomeButton: false,
        lockNavigation: true,
      });
    },
    onError: (error: any) => {
      console.error("❌ Lỗi xác nhận thông tin CCCD:", error);
      console.error(
        "❌ Error details:",
        JSON.stringify(
          {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
          },
          null,
          2
        )
      );
      resultStatus.showError({
        title: "Cập nhật thất bại",
        message:
          error?.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại.",
        subMessage: "Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ hỗ trợ.",
        showHomeButton: true,
        lockNavigation: true,
      });
    },
  });

  const resetEkycMutation = useMutation({
    mutationKey: [QueryKey.EKYC.RESET_EKYC],
    mutationFn: async () => {
      return await eKYCServices.post.reset_ekyc();
    },
    onSuccess: async () => {
      // Invalidate tất cả cache liên quan đến eKYC
      queryClient.invalidateQueries({ queryKey: [QueryKey.EKYC.STATUS] });
      queryClient.invalidateQueries({ queryKey: [QueryKey.EKYC.CARD_INFO] });
      queryClient.invalidateQueries({ queryKey: [QueryKey.AUTH.ME] });

      resultStatus.showSuccess({
        title: "Đã đặt lại xác thực thành công!",
        message: "Bạn có thể bắt đầu quy trình xác thực lại.",
        autoRedirectSeconds: 3,
        autoRedirectRoute: "/settings",
        showHomeButton: true,
        lockNavigation: false,
      });
    },
    onError: (error: any) => {
      console.error("❌ Lỗi reset eKYC:", error);
      resultStatus.showError({
        title: "Không thể reset eKYC",
        message: error?.response?.data?.message || "Vui lòng thử lại sau.",
        showHomeButton: true,
        lockNavigation: false,
      });
    },
  });

  /**
   * Mutation để cập nhật các field thông tin CCCD
   * - Chỉ cần truyền các field muốn update
   * - Sau khi update thành công, invalidate cache và quay lại trang confirm
   */
  const updateCardInfoFieldsMutation = useMutation({
    mutationKey: [QueryKey.EKYC.UPDATE_CARD_INFO_FIELDS],
    mutationFn: async (payload: UpdateCardInfoPayload) => {
      console.log(
        "🔄 [updateCardInfoFieldsMutation] Updating fields:",
        payload
      );
      return await eKYCServices.post.update_card_info_fields(payload);
    },
    onSuccess: async () => {
      // Invalidate cache để refetch data mới
      queryClient.invalidateQueries({ queryKey: [QueryKey.EKYC.CARD_INFO] });

      resultStatus.showSuccess({
        title: "Cập nhật thành công!",
        message: "Thông tin CCCD đã được cập nhật.",
        autoRedirectSeconds: 2,
        autoRedirectRoute: "/settings/verify/confirm-info",
        showHomeButton: false,
        lockNavigation: true,
      });
    },
    onError: (error: any) => {
      console.error("❌ Lỗi cập nhật thông tin CCCD:", error);
      resultStatus.showError({
        title: "Cập nhật thất bại",
        message:
          error?.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại.",
        subMessage: "Kiểm tra lại thông tin và thử lại.",
        showHomeButton: true,
        lockNavigation: true,
      });
    },
  });

  return {
    geteKYCStatusQuery,
    ocrIdMutation,
    faceScanMutation,
    getCardInfo,
    confirmCardInfoMutation,
    resetEkycMutation,
    updateCardInfoFieldsMutation,
    isConfirming: confirmCardInfoMutation.isPending,
    isUpdating: updateCardInfoFieldsMutation.isPending,
  };
};

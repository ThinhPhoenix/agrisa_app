import { AuthServices } from "@/domains/auth/service/auth.service";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  CardInfoResponse,
  FaceScanPayload,
  OCRIDPPayload,
} from "../models/ekyc.models";
import { eKYCServices } from "../service/ekyc.service";
import { mapCardInfoToProfile } from "../utils/card-info.utils";

export const useEkyc = () => {
  const { toast } = useToast();
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
      router.push("/settings/verify/face-scan");
      toast.success("Xác thực CCCD thành công");
    },
    onError: (error) => {
      toast.error("Xác thực CCCD thất bại");
      console.error(error);
    },
  });

  const faceScanMutation = useMutation({
    mutationKey: [QueryKey.EKYC.FACE_SCAN],
    mutationFn: async (payload: FaceScanPayload) => {
      return await eKYCServices.post.scan_face(payload);
    },
    onSuccess: async (data: any) => {
      toast.success("Xác thực khuôn mặt thành công");
      // Chuyển đến màn hình xác nhận thông tin CCCD
      router.push("/settings/verify/confirm-info");
    },
    onError: (error) => {
      router.push("/settings/verify/status");
      toast.error("Xác thực khuôn mặt thất bại");
      console.error(error);
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

      // Gọi API update profile
      const response = await AuthServices.updateUserProfile(profileData);
      return response;
    },
    onSuccess: async () => {
      // Refresh profile trong auth store
      await fetchUserProfile();

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: [QueryKey.AUTH.ME] });
      queryClient.invalidateQueries({ queryKey: [QueryKey.EKYC.CARD_INFO] });

      toast.success("Xác nhận thông tin thành công");

      // Navigate đến màn hình status
      router.push("/settings/verify/status");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
      console.error("❌ Lỗi xác nhận thông tin CCCD:", error);
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

      toast.success("Đã reset eKYC thành công. Bạn có thể bắt đầu lại.");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Không thể reset eKYC. Vui lòng thử lại."
      );
      console.error("❌ Lỗi reset eKYC:", error);
    },
  });

  return {
    geteKYCStatusQuery,
    ocrIdMutation,
    faceScanMutation,
    getCardInfo,
    confirmCardInfoMutation,
    resetEkycMutation,
    isConfirming: confirmCardInfoMutation.isPending,
  };
};

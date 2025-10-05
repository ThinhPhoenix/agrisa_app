import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { eKYCServices } from "../service/ekyc.service";
import { FaceScanPayload, OCRIDPPayload } from "../models/ekyc.models";


export const useEkyc = () => {
  const { toast } = useToast();

  const geteKYCStatusQuery = (id: string) => {
    return useQuery({
      queryKey: [QueryKey.EKYC.STATUS, id],
      queryFn: () => eKYCServices.get.ekyc_status(id),
    });
  }
  
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
      router.push("/settings/profile");
      console.error(error);
    },
  });

  const faceScanMutation = useMutation({
    mutationKey: [QueryKey.EKYC.FACE_SCAN],
    mutationFn: async (payload: FaceScanPayload) => {
      return await eKYCServices.post.scan_face(payload);
    },
    onSuccess: async (data: any) => {
      router.push("/settings/profile");
      toast.success("Xác thực khuôn mặt thành công");
    },
    onError: (error) => {
      toast.error("Xác thực khuôn mặt thất bại");
      console.error(error);
    },
  });

  return {
    geteKYCStatusQuery,
    ocrIdMutation,
    faceScanMutation,
  };
};

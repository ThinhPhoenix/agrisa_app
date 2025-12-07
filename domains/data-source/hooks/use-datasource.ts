import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FaceScanPayload, OCRIDPPayload } from "../models/data-source.models";
import { eKYCServices } from "../service/data-source.service";


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
      router.push("/settings/verify/status");
    },
    onError: (error) => {
      router.push("/settings/verify/status");
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useEkyc } from "./use-ekyc";
import { FaceScanPayloadSchema, FaceScanSchema, OCRIDPayloadSchema, OCRIDSchema } from "../schemas/ekyc.schema";
import { FaceScanPayload, OCRIDPPayload } from "../models/ekyc.models";

interface eKYCFormHooks {
  type: "ocr-id" | "face-scan";
}

export const useEkycForm = ({ type }: eKYCFormHooks) => {
  const { faceScanMutation, ocrIdMutation } = useEkyc();

  // Form đăng nhập với identifier
  const ocrIDForm = useForm<OCRIDPayloadSchema>({
    resolver: zodResolver(OCRIDSchema),
    defaultValues: {
      cccd_front: undefined,
      cccd_back: undefined,
      user_id: "",
    },
  });

  // Form đăng ký
  const faceScanForm = useForm<FaceScanPayloadSchema>({
    resolver: zodResolver(FaceScanSchema),
    defaultValues: {
      user_id: "",
      video: undefined,
      cmnd: undefined,
    },
  });

  const form = type === "ocr-id" ? ocrIDForm : faceScanForm;

  // Transform cho đăng nhập - gửi đúng format cho backend
  const handleOCRScan = ocrIDForm.handleSubmit(async (data) => {
    try {
      
      await ocrIdMutation.mutateAsync(data as OCRIDPPayload);
    } catch (error) {
      console.error("Lỗi OCR ID:", error);
    }
  });

  const handleFaceScan = faceScanForm.handleSubmit(async (data) => {
    try {
      await faceScanMutation.mutateAsync(data as FaceScanPayload);
    } catch (error) {
      console.error("Lỗi Face Scan:", error);
    }
  });

  const onSubmit = type === "ocr-id" ? handleOCRScan : handleFaceScan;

  return {
    form,
    onSubmit,
    isLoading: ocrIdMutation.isPending || faceScanMutation.isPending,
    error: ocrIdMutation.error || faceScanMutation.error,
    isSuccess: ocrIdMutation.isSuccess || faceScanMutation.isSuccess,
    reset: () => form.reset(),
    clearErrors: () => form.clearErrors(),
  };
};

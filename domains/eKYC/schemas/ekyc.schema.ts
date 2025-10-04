import { z } from "zod";

export const RNFileSchema = z.object({
  uri: z.string().min(1, "Thiếu URI file"), // URI local từ expo-camera
  type: z.string().min(1, "Thiếu type file"), // Ví dụ: 'image/jpeg'
  name: z.string().min(1, "Thiếu name file"), // Tên file
});

export const OCRIDSchema = z.object({
  cccd_front: RNFileSchema,
  cccd_back: RNFileSchema,
  user_id: z.string()
});

export const FaceScanSchema = z.object({
  user_id: z.string(),
  video: RNFileSchema,
  cmnd: RNFileSchema
})

export type OCRIDPayloadSchema = z.infer<typeof OCRIDSchema>;

export type FaceScanPayloadSchema = z.infer<typeof FaceScanSchema>;


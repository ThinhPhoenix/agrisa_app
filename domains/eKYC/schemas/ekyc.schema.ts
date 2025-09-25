import { z } from "zod";

export const OCRIDSchema = z.object({
  cccd_front: z.file(),
  cccd_back: z.file(),
  user_id: z.string()
});

export const FaceScanSchema = z.object({
  user_id: z.string(),
  video: z.file(),
  cmnd: z.file()
})

export type OCRIDPayloadSchema = z.infer<typeof OCRIDSchema>;

export type FaceScanPayloadSchema = z.infer<typeof FaceScanSchema>;


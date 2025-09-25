

export type OCRIDPPayload = {
  cccd_front: File,
  cccd_back: File,
  user_id: string
}

export type FaceScanPayload = {
  user_id: string,
  video: File,
  cmnd: File
}


export type EKYCStatusResponse = {
  user_id: string,
  cic_no: string,
  is_ocr_done: boolean,
  ocr_done_at: string | null,
  is_face_verified: boolean,
  face_verified_at: string | null
}



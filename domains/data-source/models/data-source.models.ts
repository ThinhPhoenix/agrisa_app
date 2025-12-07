
export type RNFile = {
  uri: string; // Đường dẫn local từ expo-camera/image-picker
  type: string; // Ví dụ: 'image/jpeg' hoặc 'video/mp4'
  name: string; // Tên file, ví dụ: 'cccd_front.jpg'
};

export type OCRIDPPayload = {
  cccd_front: RNFile,
  cccd_back: RNFile,
  user_id: string
}

export type FaceScanPayload = {
  user_id: string,
  video: RNFile,
  cmnd: RNFile
}


export type EKYCStatusResponse = {
  user_id: string,
  cic_no: string,
  is_ocr_done: boolean,
  ocr_done_at: string | null,
  is_face_verified: boolean,
  face_verified_at: string | null
}




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

/**
 * Response từ API getCardInfo - Thông tin từ CCCD đã quét
 */
export type CardInfoResponse = {
  national_id: string;
  name: string;
  dob: string; // Format: dd/mm/yyyy
  sex: string; // "NAM" hoặc "NỮ"
  nationality: string;
  home: string; // Địa chỉ thường trú
  address: string; // Địa chỉ hiện tại
  doe: string; // Ngày hết hạn CCCD
  number_of_name_lines: string;
  features: string; // Đặc điểm nhận dạng
  issue_date: string; // Ngày cấp
  mrz: string;
  issue_loc: string; // Nơi cấp
  image_front: string; // URL ảnh mặt trước
  image_back: string; // URL ảnh mặt sau
  user_id: string;
}



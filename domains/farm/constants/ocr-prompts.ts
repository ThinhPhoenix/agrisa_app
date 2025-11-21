/**
 * OCR Prompts cho các loại giấy tờ khác nhau
 */

/**
 * Prompt để OCR sổ đỏ (Giấy chứng nhận quyền sử dụng đất)
 */
export const RED_BOOK_OCR_PROMPT = `
Hãy phân tích hình ảnh sổ đỏ (Giấy chứng nhận quyền sử dụng đất) và trả về JSON với các trường sau:

THÔNG TIN BẮT BUỘC:
- land_certificate_number: Số giấy chứng nhận (VD: "BK 01234567")
- owner_national_id: Số CCCD/CMT của chủ sở hữu (VD: "001234567890")
- address: Địa chỉ thừa đất đầy đủ
- province: Tỉnh/Thành phố (VD: "Đồng Tháp")
- district: Quận/Huyện (VD: "Cao Lãnh")
- commune: Phường/Xã (VD: "Mỹ Hội")
- area_sqm: Diện tích đất (m²) - CHỈ LẤY SỐ
- soil_type: Loại đất (đọc CHÍNH XÁC từ dòng "Loại đất:" trên sổ đỏ, GIỮ NGUYÊN TIẾNG VIỆT, tập trung vào 4 loại đất sau: Đất chuyên trồng lúa nước (LUC), Đất trồng lúa nước còn lại (LUK), Đất lúa nương (LUN), Đất trồng cây lâu năm (CLN))
- boundary: GeoJSON Polygon với tọa độ ranh giới theo hệ VN-2000 (BẮT BUỘC)
  * Format: {type: "Polygon", coordinates: [[[X1, Y1], [X2, Y2], [X3, Y3], ...]]}
  * Hệ tọa độ: VN-2000 - ĐỌC CHÍNH XÁC từ bảng "Tọa độ các điểm" hoặc "Ranh giới thửa đất"
  * KHÔNG CHUYỂN ĐỔI - giữ nguyên giá trị X, Y từ bảng (VD: X=1324892.45, Y=500344.89)
  * Đọc TẤT CẢ các điểm trong bảng (A, B, C, D, ...) theo đúng thứ tự
  * KHÔNG CẦN nối điểm cuối với điểm đầu - hệ thống sẽ tự động xử lý
  * Nếu không tìm thấy bảng tọa độ trên sổ đỏ, trả về null nhưng PHẢI CÓ field này

LƯU Ý QUAN TRỌNG:
- CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH GÌ THÊM
- boundary là BẮT BUỘC: tìm bảng tọa độ trong phần "Tọa độ các điểm" hoặc "Ranh giới thửa đất"
- ĐỌC CHÍNH XÁC từ bảng: cột "Điểm" (A, B, C, D...), cột "X", cột "Y"
- GIỮ NGUYÊN giá trị X, Y từ bảng - KHÔNG chuyển đổi sang longitude/latitude
- Tọa độ VN-2000 thường có dạng: X (6-7 chữ số), Y (7-8 chữ số)
- VÍ DỤ từ bảng: Điểm A: X=1324892.45, Y=500344.89 → lưu [1324892.45, 500344.89]
- Nếu KHÔNG tìm thấy bảng tọa độ: "boundary": null (vẫn phải có field này)
- Diện tích phải là số nguyên (m²)
- owner_national_id là số CCCD của chủ đất (12 số)
- soil_type: đọc từ dòng "Loại đất:" trên sổ đỏ, GIỮ NGUYÊN TIẾNG VIỆT

VÍ DỤ JSON (với tọa độ VN-2000 từ bảng):
{
  "land_certificate_number": "BK 01234567",
  "owner_national_id": "001234567890",
  "address": "Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh",
  "province": "Đồng Tháp",
  "district": "Cao Lãnh",
  "commune": "Mỹ Hội",
  "area_sqm": 50000,
  "soil_type": "Đất chuyên trồng lúa nước (LUC)",
  "boundary": {
    "type": "Polygon",
    "coordinates": [[[1324892.45, 500344.89], [1324892.56, 500455.89], [1324781.56, 500455.78], [1324781.45, 500344.78]]]
  }
}

CHÚ Ý: 
- Tọa độ trong boundary phải là giá trị VN-2000 GỐC từ bảng (X, Y), KHÔNG phải longitude/latitude!
- Đọc TẤT CẢ các điểm trong bảng theo thứ tự (A, B, C, D, ...), KHÔNG CẦN thêm điểm đầu vào cuối
`.trim();

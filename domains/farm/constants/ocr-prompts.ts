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

THÔNG TIN TỌA ĐỘ (nếu có):
- boundary: GeoJSON Polygon với format {type: "Polygon", coordinates: [[[lng, lat], [lng, lat], ...]]}
- center_location: GeoJSON Point với format {type: "Point", coordinates: [lng, lat]}

LƯU Ý:
- CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH GÌ THÊM
- Nếu không tìm thấy tọa độ, có thể bỏ qua boundary và center_location
- Diện tích phải là số nguyên (m²)
- owner_national_id là số CCCD của chủ đất (12 số)

VÍ DỤ JSON:
{
  "land_certificate_number": "BK 01234567",
  "owner_national_id": "001234567890",
  "address": "Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh",
  "province": "Đồng Tháp",
  "district": "Cao Lãnh",
  "commune": "Mỹ Hội",
  "area_sqm": 50000,
  "boundary": {
    "type": "Polygon",
    "coordinates": [[[105.123, 10.456], [105.124, 10.456], [105.124, 10.457], [105.123, 10.457], [105.123, 10.456]]]
  },
  "center_location": {
    "type": "Point",
    "coordinates": [105.1235, 10.4565]
  }
}
`.trim();

import { OCRIdScreen } from "@/domains/eKYC/components/ocr-id";

/**
 * Screen quét CCCD
 * - Flow mới: eKYC trước → Confirm thông tin CCCD → Auto update profile
 * - Không cần kiểm tra profile đầy đủ trước khi quét
 */
export default function IdScanScreen() {
  return <OCRIdScreen />;
}

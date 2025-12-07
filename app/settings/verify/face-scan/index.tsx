import { FaceScanScreen } from "@/domains/eKYC/components/face-scan";

/**
 * Screen quét khuôn mặt
 * - Flow mới: eKYC trước → Confirm thông tin CCCD → Auto update profile
 * - Không cần kiểm tra profile đầy đủ trước khi quét
 */
export default function FaceIDScanScreen() {
  return <FaceScanScreen />;
}

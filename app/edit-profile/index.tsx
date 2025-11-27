import { AgrisaHeader } from "@/components/Header";
import MeComponentUI from "@/domains/auth/components/me";

/**
 * Trang chỉnh sửa thông tin cá nhân (bình thường - không phải eKYC)
 * - Cho phép chỉnh sửa bất kỳ trường nào
 * - Không bắt buộc điền đầy đủ
 * - Sau khi lưu sẽ quay lại trang trước
 */
export default function EditProfileScreen() {
  return (
    <>
      <AgrisaHeader title="Chỉnh sửa thông tin" />
      <MeComponentUI />
    </>
  );
}

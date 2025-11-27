import { AgrisaHeader } from "@/components/Header";
import MeComponentUI from "@/domains/auth/components/me";

/**
 * Trang cập nhật thông tin trong luồng eKYC
 * - Bắt buộc điền đầy đủ thông tin trước khi quét CCCD
 * - Không cho phép bỏ qua
 */
export default function IdentityUpdateScreen() {
  return (
    <>
      <AgrisaHeader 
        title="Cập nhật thông tin" 
      />
      <MeComponentUI isFromEkyc={true} />
    </>
  );
};

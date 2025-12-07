import { AgrisaHeader } from "@/components/Header";
import MeComponentUI from "@/domains/auth/components/me";

/**
 * [DEPRECATED] Trang này không còn sử dụng trong flow mới
 * Flow mới: eKYC → Confirm CCCD Info → Auto Update Profile
 * 
 * Trang được giữ lại để tương thích ngược
 */
export default function IdentityUpdateScreen() {
  return (
    <>
      <AgrisaHeader title="Cập nhật thông tin" />
      <MeComponentUI />
    </>
  );
};

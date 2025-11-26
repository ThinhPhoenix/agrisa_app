import { AgrisaHeader } from "@/components/Header";
import { EKYCStatusCheck } from "@/domains/eKYC/components/ekyc-status-check";

export default function EKYCStatusScreen() {
    return (
      <>
    <AgrisaHeader title="Xác thực danh tính" />
            <EKYCStatusCheck />
      </>
  )
}
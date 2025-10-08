import { AgrisaHeader } from "@/components/Header";
import { FaceScanScreen } from "@/domains/eKYC/components/face-scan";

export default function FaceIDScanScreen() {
    return (
        <>
            <AgrisaHeader title="Xác thực khuôn mặt" />
            <FaceScanScreen />
        </>
    )
};

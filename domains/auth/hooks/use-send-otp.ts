import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";

const useSendOtp = () => {
    const mutation = useMutation({
        mutationFn: (phone: string) => {
            return useAxios.post(`/auth/public/phone-otp/generate/${phone}`);
        },
    });

    // Expose async send function and pending state for better UI control
    return {
        data: mutation.data,
        error: mutation.error,
        sendOtp: mutation.mutateAsync,
        isPending: (mutation as any).isPending || false,
    };
};

export default useSendOtp;

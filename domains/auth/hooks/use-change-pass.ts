import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";

const useChangePass = () => {
    const mutation = useMutation({
        mutationFn: async ({
            otp,
            current_password,
            new_password,
        }: {
            otp: string;
            current_password?: string;
            new_password: string;
        }) => {
            // API expects otp and new_password as query params; current_password is optional
            const url = `/auth/protected/api/v2/update/password?otp=${encodeURIComponent(
                otp
            )}&new_password=${encodeURIComponent(new_password)}`;
            const body: Record<string, any> = {};
            if (current_password) {
                body.current_password = current_password;
            }
            return await useAxios.put(url, body);
        },
    });

    return mutation;
};

export default useChangePass;

import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";

interface UnsubscribeResponse {
    message: string;
}

const unsubscribeFromNotifications = async (
    expoToken: string
): Promise<ApiResponse<UnsubscribeResponse>> => {
    return useAxios.post("/noti/protected/unsubscribe/android", {
        expoToken,
    });
};

export const useUnsubscribe = () => {
    return useMutation({
        mutationFn: (expoToken: string) =>
            unsubscribeFromNotifications(expoToken),
    });
};

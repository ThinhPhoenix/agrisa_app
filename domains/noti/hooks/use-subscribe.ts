import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";

interface SubscribeResponse {
    message: string;
    data: any;
}

const subscribeToNotifications = async (
    expoToken: string
): Promise<ApiResponse<SubscribeResponse>> => {
    return useAxios.post("/noti/protected/subscribe/android", {
        expoToken,
    });
};

export const useSubscribe = () => {
    return useMutation({
        mutationFn: (expoToken: string) => subscribeToNotifications(expoToken),
    });
};

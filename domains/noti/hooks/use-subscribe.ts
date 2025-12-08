import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";

interface SubscribeResponse {
    message: string;
    data: any;
}

const subscribeToNotifications = async (
    expoToken: string
): Promise<ApiResponse<SubscribeResponse>> => {
    if (Platform.OS === "ios") {
        return useAxios.post("/noti/protected/subscribe/ios", {});
    }
    return useAxios.post("/noti/protected/subscribe/android", {
        expoToken,
    });
};

export const useSubscribe = () => {
    return useMutation({
        mutationFn: (expoToken: string) => subscribeToNotifications(expoToken),
    });
};

import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";

interface UnsubscribeResponse {
    message: string;
}

const unsubscribeFromNotifications = async (
    expoToken: string
): Promise<ApiResponse<UnsubscribeResponse>> => {
    if (Platform.OS === "ios") {
        return useAxios.post("/noti/protected/unsubscribe/ios", {});
    }
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

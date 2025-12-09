import useAxios from "@/config/useAxios.config";
import { useQuery } from "@tanstack/react-query";
import { Platform } from "react-native";

interface ValidateResponse {
    value: boolean;
}

const validateNotificationToken = async (): Promise<
    ApiResponse<ValidateResponse>
    > => {
    if (Platform.OS === "ios") {
        return useAxios.get("/noti/protected/validate?platform=ios");
    }
    return useAxios.get("/noti/protected/validate?platform=android");
};

export const useValidate = () => {
    return useQuery({
        queryKey: ["validate-noti-token"],
        queryFn: validateNotificationToken,
    });
};

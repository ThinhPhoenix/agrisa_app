import useAxios from "@/config/useAxios.config";
import { useQuery } from "@tanstack/react-query";

interface ValidateResponse {
    value: boolean;
}

const validateNotificationToken = async (): Promise<
    ApiResponse<ValidateResponse>
> => {
    return useAxios.get("/noti/protected/validate?platform=android");
};

export const useValidate = () => {
    return useQuery({
        queryKey: ["validate-noti-token"],
        queryFn: validateNotificationToken,
    });
};

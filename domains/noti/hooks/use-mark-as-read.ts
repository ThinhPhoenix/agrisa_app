import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";

interface MarkAsReadResponse {
    message: string;
    data: any;
}

const markAsReadNotifications = async (
    receiverIds: string[]
): Promise<ApiResponse<MarkAsReadResponse>> => {
    return useAxios.post("/noti/protected/mark-read", { receiverIds });
};

const useMarkAsRead = () => {
    return useMutation({
        mutationFn: (receiverIds: string[]) =>
            markAsReadNotifications(receiverIds),
    });
};

export default useMarkAsRead;

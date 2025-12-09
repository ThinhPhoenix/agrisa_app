import useAxios from "@/config/useAxios.config";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useQuery } from "@tanstack/react-query";

interface PullNotificationsParams {
    user_id: string;
    limit?: number;
}

const pullNotifications = async (
    params: PullNotificationsParams
): Promise<any> => {
    const { user_id, limit = 10 } = params;
    return useAxios.get("/noti/public/pull/ios", {
        params: {
            user_id,
            limit,
        },
    });
};

export const usePull = (limit?: number) => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["pull-notifications", user?.id, limit],
        queryFn: () => pullNotifications({ user_id: user!.id, limit }),
        enabled: !!user?.id,
        refetchInterval: 5000,
    });
};

import useAxios from "@/config/useAxios.config";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Platform } from "react-native";

const useMyNoti = ({ limit }: { limit?: number }) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["my-notifications"],
        queryFn: async ({ pageParam = 1 }) => {
            const platform = Platform.OS === "ios" ? "ios" : "android";
            console.log(
                "Fetching notifications page:",
                pageParam,
                "limit:",
                limit
            );
            const response = await useAxios.get(
                `/noti/protected/notifications?page=${pageParam}&limit=${limit}&platform=${platform}`
            );
            console.log("Response status:", response.status);
            console.log("Response data:", response.data);
            return response;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage.pagination;
            console.log("Last page pagination:", pagination);
            if (pagination && pagination.page < pagination.totalPages) {
                return pagination.page + 1;
            }
            return undefined;
        },
    });

    // Flatten the data from all pages
    const notifications = data?.pages.flatMap((page) => page.data || []) || [];
    console.log("Flattened notifications:", notifications.length);

    return {
        data: notifications,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    };
};

export default useMyNoti;

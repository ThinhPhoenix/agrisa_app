import useAxios from "@/config/useAxios.config";
import { useQuery } from "@tanstack/react-query";

const useAuthMe = () => {
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["auth-me"],
        queryFn: async () => {
            return useAxios.get("/profile/protected/api/v1/me");
        }
    });
    console.log("ahihi",data)
    return { data, error, isLoading, refetch };
};

export default useAuthMe;
import useAxios from "@/config/useAxios.config";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";

const useAuthMe = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey.AUTH.ME],
    queryFn: async () => {
      const response = await useAxios.get("/auth/me");
      return response.data;
    },
    enabled: false,
    retry: 1,
  });

  return { data, isLoading, error, refetch };
};

export default useAuthMe;

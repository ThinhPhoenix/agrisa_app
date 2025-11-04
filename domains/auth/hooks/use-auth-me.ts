import useAxios from "@/config/useAxios.config";
import { useQuery } from "@tanstack/react-query";

const useAuthMe = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const response = await useAxios.get("/auth/me");
      return response.data; // Giả sử API trả về { user: {...} } hoặc trực tiếp user object
    },
    enabled: false, // Không auto-run, sẽ trigger thủ công
    retry: 1, // Retry 1 lần nếu lỗi
  });

  return { data, isLoading, error, refetch };
};

export default useAuthMe;

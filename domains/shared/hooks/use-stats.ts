import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { StatsService } from "../services/stats.services";

/**
 * Hook để fetch thống kê overview
 * Bao gồm: số lượng chính sách đã đăng ký, số nông trại active/inactive
 */
export const useStats = () => {
  const statsQuery = useQuery({
    queryKey: [QueryKey.STATS.OVERVIEW],
    queryFn: async () => {
      const response = await StatsService.getStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    gcTime: 10 * 60 * 1000, // Giữ cache 10 phút
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

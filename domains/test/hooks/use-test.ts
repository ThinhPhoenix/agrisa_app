import { QueryKey } from "@/domains/shared/stores/query-key"
import { useQuery } from "@tanstack/react-query"
import { TestService } from "../service/test-service"


export const useTest = {
    
    ping: () => {
        return useQuery({
          queryKey: [QueryKey.TEST],
          queryFn: () => TestService.get.ping(),
          refetchInterval: 30000, // Ping mỗi 30 giây
          refetchOnWindowFocus: true, // Ping khi user mở lại app
          refetchOnReconnect: true, // Ping khi có mạng trở lại
          retry: 3, 
          retryDelay: (attemptIndex) =>
            Math.min(1000 * 2 ** attemptIndex, 10000),
          staleTime: 10000, // Data fresh trong 10 giây

          // Chỉ ping khi có mạng
          enabled: true,

          // Không throw error để UI có thể handle gracefully
          throwOnError: false,
        });
    }


}
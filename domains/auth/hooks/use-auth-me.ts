import useAxios from "@/config/useAxios.config";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "../models/auth.models";
import { AuthServices } from "../service/auth.service";

const useAuthMe = () => {
  const queryClient = useQueryClient();

  // Query để lấy thông tin user profile
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey.AUTH.ME],
    queryFn: async () => {
      const response = await AuthServices.getUserProfile();
      return response as any;
    },
    enabled: false,
    retry: 1,
  });

  // Mutation để cập nhật profile
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Partial<UserProfile>) => {
      const response = await AuthServices.updateUserProfile(payload);
      return response;
    },
    onSuccess: () => {
      // Invalidate và refetch user profile sau khi update thành công
      queryClient.invalidateQueries({ queryKey: [QueryKey.AUTH.ME] });
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
};

export default useAuthMe;

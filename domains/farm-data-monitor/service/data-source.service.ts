import useAxios from "@/config/useAxios.config";


export const dataSourceServices = {
  post: {
  
  },

  get: {
    dataSourceByID: async (dataId: string) : Promise<ApiResponse<any>> => {
      return useAxios.get(`/policy/protected/api/v2/data-sources/${dataId}`);
    },
    
  },
};


import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { dataSourceServices } from "../service/data-source.service";

export const useDataSource = () => {


  const getDataSourceByID = (dataId: string) => {
    return useQuery({
      queryKey: [QueryKey.DATA_SOURCE.DETAIL, dataId],
      queryFn: () =>
        dataSourceServices.get.dataSourceByID(dataId),
      enabled: !!dataId,
    });
  };

    return {
      getDataSourceByID,
    };
};

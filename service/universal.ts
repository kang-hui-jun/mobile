import { Filter, GridFilter } from "@/types/grid-filter";
import { useHttp } from "@/utils/http";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useMobileLayoutV2 = (params: {
  entity: string;
  id: string;
  multipleLayoutId: string;
}) => {
  const client = useHttp();
  return useQuery({
    queryKey: ["mobileLayoutV2"],
    queryFn: async () => {
      return client("/gw/layout/mobileLayoutV2", { params });
    },
  });
};

export const useAdvQueryZn = (
  params?: object,
  data?: object,
  options?: { enabled?: boolean }
) => {
  const client = useHttp();
  return useInfiniteQuery({
    queryKey: ["advQueryZn", params, data],
    enabled: options?.enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client("/gw/entity/adv-queryZn", {
        method: "post",
        params: { ...params, page_no: pageParam },
        data,
      });

      const totalItem = response.data?.totalData?.find((item: any) =>
        Object.prototype.hasOwnProperty.call(item, "totalCount")
      );
      const totalCount = totalItem?.totalCount || 0;

      return {
        list: response.data?.data || [],
        totalCount,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.flatMap((page) => page.list).length;

      if (loadedCount < lastPage.totalCount) {
        return lastPage.currentPage + 1;
      }

      return undefined;
    },
  });
};

export const useGridColumnFields = (params: { entity: string }) => {
  const client = useHttp();
  return useQuery({
    queryKey: ["gridColumnFields"],
    enabled: Boolean(params.entity),
    queryFn: async () => {
      const response = await client("/gw/apiGrid/gridColumnFields", {
        params: { ...params, type: "" },
      });
      return response.data;
    },
  });
};

export const useInitEntityMainData = (params: {
  id: string;
  entity: string;
  fieldName: string;
  actionType: string;
}) => {
  const client = useHttp();
  return useQuery({
    queryKey: ["initEntityMainData"],
    queryFn: async () => {
      return client("/gw/entity/initEntityMainData", { params });
    },
  });
};

export const useGridFilter = (params: { entity: string }) => {
  const client = useHttp();
  return useQuery({
    queryKey: ["gridFilter", params],
    queryFn: async () => {
      const response = await client("/gw/apiGrid/gridfilter", { params });
      const isDefault = response.data?.some((key: GridFilter) => key.isDefault);
      const filter = {
        type: "AND",
        filters: [],
        children: [],
      };
      const all = {
        filterName: "全部",
        filterId: "",
        isDefault: !isDefault,
        filter,
      };

      for (const item of response.data) {
        if (!item.filter) {
          item.filter = filter;
        }
      }

      return [all, ...response.data];
    },
  });
};

export const useGridColumnLayout = (params: { entity: string }) => {
  const client = useHttp();
  return useQuery({
    queryKey: ["gridColumnLayout", params],
    queryFn: () => client("/gw/Gadiipr / gridColumnLayout", { params }),
  });
};

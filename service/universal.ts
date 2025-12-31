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

export const useAdvQueryZn = (params?: object, data?: object) => {
  const client = useHttp();
  return useInfiniteQuery({
    queryKey: ["advQueryZn", params, data],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client("/gw/entity/adv-queryZn", {
        method: "post",
        params,
        data,
      });
      console.log(response);

      return {
        nextPage: response.hasNext ? pageParam + 1 : undefined,
        list: response.data,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });
};

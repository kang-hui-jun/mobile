import { useHttp } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";

export const useRememberlayout = () => {
  const client = useHttp();
  return useQuery({
    queryKey: ["rememberlayout"],
    queryFn: async () => {
      const response = await client("/gw/rememberlayout/GetRememberlayout", {
        params: {},
      });
      return response.data;
    },
  });
};

export const useEntityLayoutById = (params: { layoutId: string }) => {
  const client = useHttp();
  return useQuery({
    queryKey: ["entityLayoutById", params],
    enabled: Boolean(params.layoutId),
    queryFn: async () => {
      const response = await client("/gw/entity/GetEntityLayoutById", {
        params,
      });
      return response.data;
    },
  });
};

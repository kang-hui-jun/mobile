import { HomeDataBoard } from "@/types/home-data-board";
import { ListHomeDataBoard } from "@/types/list-home-data-board";
import { useHttp } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";

export const useHomeDataBoard = () => {
  const client = useHttp();
  return useQuery<HomeDataBoard>({
    queryKey: ["homeDataBoard"],
    queryFn: async () => {
      const response = await client("/gw/panel/homedataboard", { params: {} });
      return response.data;
    },
  });
};

export const useListHomeDataBoard = () => {
  const client = useHttp();
  return useQuery<ListHomeDataBoard[]>({
    queryKey: ["listHomeDataBoard"],
    queryFn: async () => {
      const response = await client("/gw/homeDataBoard/listHomeDataBoard", { params: {} });
      return response.data;
    },
  });
};
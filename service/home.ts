import { HomeDataBoard } from "@/types/home-data-board";
import { ListHomeDataBoard } from "@/types/list-home-data-board";
import { Message } from "@/types/message";
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
      const response = await client("/gw/homeDataBoard/listHomeDataBoard", {
        params: {},
      });
      return response.data;
    },
  });
};

export const useMessageNotificationsByTypeNew = (params: {
  messageType: string;
  firstResult: number;
  maxResults: number;
  isUnRed: boolean;
}) => {
  const client = useHttp();
  return useQuery<Message[]>({
    queryKey: ["messageNotificationsByTypeNew", params],
    queryFn: async () => {
      const response = await client(
        "/gw/message/GetMessageNotificationsByTypeNew",
        {params}
      );      
      return response.data.messageList;
    },
  });
};

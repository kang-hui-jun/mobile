import { ToDoCenterMenus } from "@/types/to-do-menu";
import { useHttp } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";

export const useToDoCenterMenus = () => {
  const client = useHttp();
  return useQuery<ToDoCenterMenus>({
    queryKey: ["todoMenu"],
    queryFn: async () => {
      const response = await client("/gw/toDoCenter/getToDoCenterMenus", {
        params: {
          isMobile: true,
        },
      });

      return response.data;
    },
  });
};

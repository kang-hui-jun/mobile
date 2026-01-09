import { useHttp } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";

export const useToDoCenterMenus = () => {
  const client = useHttp();
  return useQuery({
    queryKey: ["todoMenu"],
    queryFn: () =>
      client("/gw/toDoCenter/getToDoCenterMenus", {
        params: {
          isMobile: true,
        },
      }),
  });
};

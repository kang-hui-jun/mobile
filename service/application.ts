import { useHttp } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";

export const useMenus = () => {
  const client = useHttp();

  return useQuery({
    queryKey: ["menus"],
    queryFn: () => {
      return client("/gw/user/GetMenuV2", {
        params: {
          isMobile: true,
        },
      });
    },
  });
};

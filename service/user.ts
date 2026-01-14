import { useHttp } from "@/utils/http";

export const useUser = async () => {
  const client = useHttp();
  const response = await client("/gw/system/GetSystemInfo", { params: {} });
};

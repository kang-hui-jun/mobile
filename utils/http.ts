import { apiUrl } from "@/auth-provider";
import { useAuth } from "@/store";
import qs from "qs";
import { useCallback } from "react";

interface Config extends RequestInit {
  loginToken?: string;
  data?: object;
  params?: object;
}

export const http = async (
  endpoint: string,
  { data, params, loginToken, headers, ...customConfig }: Config = {}
) => {
  const config = {
    method: "GET",
    headers: {
      //   Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
    ...customConfig,
  };

  if (params) {
    endpoint += `?${qs.stringify({ loginToken, ...params })}`;
  }

  if (data) {
    config.body = JSON.stringify(data || {});
  }

  return fetch(`${apiUrl}${endpoint}`, config).then(async (response) => {
    //   if (response.status === 401) {
    //     await auth.logout();
    //     window.location.reload();
    //     return Promise.reject({ message: "请重新登录" });
    //   }
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      return data;
    } else {
      return Promise.reject(data);
    }
  });
};

export const useHttp = () => {
  const { user } = useAuth();
  return useCallback(
    (...[endpoint, config]: Parameters<typeof http>) =>
      http(endpoint, { ...config, loginToken: user?.loginToken }),
    [user?.loginToken]
  );
};

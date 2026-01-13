import { User } from "@/types/user";
import qs from "qs";
import { AuthForm } from "./types/auth-form";
import { storage } from "./store/mmkv";

export const apiUrl = "https://v5.imocq.com";

const storageKey = "loginToken";

export const getToken = () => storage.getString(storageKey);

export const handleUserResponse = ({ data }: { data: User }) => {
  storage.set(storageKey, data.loginToken);
  return data;
};

export const login = (data: AuthForm) => {
  return fetch(`${apiUrl}/appLogin/login?${qs.stringify(data)}`, {}).then(
    async (response) => {
      if (response.ok) {
        return handleUserResponse(await response.json());
      } else {
        return Promise.reject(await response.json());
      }
    }
  );
};

export const register = (data: { username: string; password: string }) => {
  return fetch(`${apiUrl}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (response.ok) {
      return handleUserResponse(await response.json());
    } else {
      return Promise.reject(await response.json());
    }
  });
};

// export const logout = async () =>
//   window.localStorage.removeItem(localStorageKey);

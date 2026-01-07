import { AuthForm } from "@/types/auth-form";
import { User } from "@/types/user";
import { createContext, ReactNode, useContext, useState } from "react";
import * as auth from "@/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutData } from "@/utils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // 失败后重试次数
      staleTime: 1000 * 60 * 5, // 数据 5 分钟内被认为是新鲜的
    },
  },
});

const AuthContext = createContext<
  | {
      user: User | null;
      register: (form: AuthForm) => Promise<void>;
      login: (form: AuthForm) => Promise<void>;
      logout: () => Promise<void>;
      mobileLayout: LayoutData | null;
      setMobileLayout: (mobileLayout: LayoutData | null) => void;
    }
  | undefined
>(undefined);
AuthContext.displayName = "AuthContext";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileLayout, setMobileLayout] = useState<LayoutData | null>(null);

  const register = (form: AuthForm) => Promise.resolve(null).then(setUser);
  const login = (form: AuthForm) => auth.login(form).then(setUser);
  const logout = () =>
    Promise.resolve(null).then(() => {
      setUser(null);
      queryClient.clear();
    });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{ user, register, login, logout, mobileLayout, setMobileLayout }}
        children={children}
      />
    </QueryClientProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth必须在AppProviders中使用");
  }
  return context;
};

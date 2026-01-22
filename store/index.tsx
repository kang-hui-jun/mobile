import { AuthForm } from "@/types/auth-form";
import { User } from "@/types/user";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as auth from "@/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutData } from "@/utils";
import { http } from "@/utils/http";

const bootstrapUser = async () => {
  let user = null;
  const token = auth.getToken();
  if (token) {
    const data = await http("/gw/system/GetSystemInfo", {
      params: {},
      loginToken: token,
    });
    user = { ...data.data, loginToken: token };
  }
  return user;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // 失败后重试次数
      staleTime: 1000 * 60 * 5, // 数据 5 分钟内被认为是新鲜的
    },
  },
});

export interface DocComponentValue {
  content: string;
  pictures: string[];
  files: string[];
  labels: { name: string; choose: boolean }[];
}

export type FormValue =
  | string
  | number
  | { label: string; value: string | number }
  | string[]
  | DocComponentValue;

const AuthContext = createContext<
  | {
      user: User | null;
      register: (form: AuthForm) => Promise<void>;
      login: (form: AuthForm) => Promise<void>;
      logout: () => Promise<void>;
      mobileLayout: LayoutData | null;
      setMobileLayout: (mobileLayout: LayoutData | null) => void;
      formData: Record<string, FormValue>;
      setFormData: (formData: Record<string, FormValue>) => void;
    }
  | undefined
>(undefined);
AuthContext.displayName = "AuthContext";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileLayout, setMobileLayout] = useState<LayoutData | null>(null);
  const [formData, setFormData] = useState<Record<string, FormValue>>({});

  const register = (form: AuthForm) => Promise.resolve(null).then(setUser);
  const login = (form: AuthForm) => auth.login(form).then(setUser);
  const logout = () =>
    Promise.resolve(null).then(() => {
      setUser(null);
      queryClient.clear();
    });

  useEffect(() => {
    setLoading(true);
    bootstrapUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user,
          register,
          login,
          logout,
          mobileLayout,
          setMobileLayout,
          formData,
          setFormData,
        }}
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

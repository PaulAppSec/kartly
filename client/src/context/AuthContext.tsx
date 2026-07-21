import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "../api/client";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>(null as unknown as AuthValue);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore a session via the refresh cookie on load.
    api
      .refresh()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value: AuthValue = {
    user,
    loading,
    async login(email, password) {
      const res = await api.login(email, password);
      setUser(res.user);
    },
    async register(email, password, name) {
      const res = await api.register(email, password, name);
      setUser(res.user);
    },
    async logout() {
      await api.logout();
      setUser(null);
    },
    async refreshMe() {
      const res = await api.me();
      setUser(res.user);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

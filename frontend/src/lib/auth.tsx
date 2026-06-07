import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'admin_token';

interface AdminAuthState {
  token:              string | null;
  isAuthenticated:    boolean;
  mustChangePassword: boolean;
  login:  (token: string, primeiroLogin: boolean) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState>({
  token:              null,
  isAuthenticated:    false,
  mustChangePassword: false,
  login:  () => {},
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]                           = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const login = useCallback((newToken: string, primeiroLogin: boolean) => {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
    setMustChangePassword(primeiroLogin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setMustChangePassword(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{
      token,
      isAuthenticated: !!token,
      mustChangePassword,
      login,
      logout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

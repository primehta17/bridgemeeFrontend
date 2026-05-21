import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, clearTokens, setTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = localStorage.getItem('accessToken');
    const legacy = localStorage.getItem('token');
    if (!token && legacy) {
      token = legacy;
      localStorage.setItem('accessToken', legacy);
      localStorage.removeItem('token');
    }
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        clearTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (tokens, userData) => {
    setTokens(tokens);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API logout failures
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

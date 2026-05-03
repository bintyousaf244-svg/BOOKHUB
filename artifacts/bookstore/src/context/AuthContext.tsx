import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("bookstore_admin_token");
    if (saved) {
      setToken(saved);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("bookstore_admin_token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("bookstore_admin_token");
    setLocation("/admin");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

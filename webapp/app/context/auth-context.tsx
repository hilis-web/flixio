"use client";

import { createContext, useContext, useEffect, useState } from "react";
import API from "../../lib/api";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isValidUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.username === "string" &&
    typeof candidate.email === "string"
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete API.defaults.headers.common["Authorization"];
        return;
      }

      const parsedUser: unknown = JSON.parse(storedUser);

      if (!isValidUser(parsedUser)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete API.defaults.headers.common["Authorization"];
        return;
      }

      setToken(storedToken);
      setUser(parsedUser);
      API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete API.defaults.headers.common["Authorization"];
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await API.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    const { token: newToken, user: loggedInUser } = res.data;

    if (!newToken || !isValidUser(loggedInUser)) {
      throw new Error("Invalid login response from server");
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    setUser(loggedInUser);
    setToken(newToken);

    return loggedInUser;
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const res = await API.post<{ user: User }>("/auth/signup", {
      username,
      email,
      password,
    });

    if (!isValidUser(res.data.user)) {
      throw new Error("Invalid signup response from server");
    }

    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete API.defaults.headers.common["Authorization"];

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}

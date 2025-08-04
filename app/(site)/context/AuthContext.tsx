"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IUser } from "../cautrucdata";
import { API_ENDPOINTS } from "../../config/api";
import { clearAuthData } from "../../utils/authUtils";
interface AuthContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const router = useRouter();
  
  // Hàm lấy user từ API (dùng khi đăng nhập Google hoặc refresh avatar)
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    console.log('🔍 AuthContext: refreshUser called, token:', !!token);
    
    if (token) {
      const res = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        console.log('🔍 AuthContext: Setting user data from API');
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.log('🔍 AuthContext: API call failed, clearing auth data');
        setUser(null);
        clearAuthData();
      }
    } else {
      console.log('🔍 AuthContext: No token found, setting user to null');
      setUser(null);
    }
  };

  // Đọc user từ localStorage khi load
  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log('🔍 AuthContext: Loading user from localStorage:', userData);
    if (userData) setUser(JSON.parse(userData));
  }, []);

  // Lắng nghe sự kiện đăng nhập/đăng xuất từ tab khác
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      console.log('🔍 AuthContext: Storage event detected:', event.key, event.newValue);
      if (event.key === "user" || event.key === "token") {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        console.log('🔍 AuthContext: After storage event - token:', token, 'user:', userData);
        if (token && userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Đăng xuất
  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

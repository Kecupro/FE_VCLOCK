"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IUser } from "../cautrucdata";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  
  // Hàm lấy user từ API (dùng khi đăng nhập Google hoặc refresh avatar)
  const refreshUser = async () => {
    // Không refresh nếu đang logout
    if (isLoggingOut) {
      return;
    }
    
    const token = localStorage.getItem("token");
    
    if (token) {
      const res = await fetch('http://localhost:3000/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        clearAuthData();
      }
    } else {
      setUser(null);
    }
  };

  // Đọc user từ localStorage khi load
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    // Reset logout flag khi component mount
    setIsLoggingOut(false);
  }, []);

  // Lắng nghe sự kiện đăng nhập/đăng xuất từ tab khác
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "user" || event.key === "token") {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
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
    setIsLoggingOut(true);
    setUser(null); // Set user null trước để tránh vòng lặp
    clearAuthData();
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

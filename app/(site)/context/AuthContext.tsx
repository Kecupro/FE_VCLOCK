"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { IUser } from "../cautrucdata";
import { API_ENDPOINTS } from "../../config/api";
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
  const storageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggingOutRef = useRef(false);
  
  // Hàm lấy user từ API (dùng khi đăng nhập Google hoặc refresh avatar)
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
      }
    } else {
      setUser(null);
      // Đảm bảo xóa sạch localStorage nếu không có token
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
    }
  };

  // Đọc user từ localStorage khi load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    // Nếu không có token thì logout
    if (!token) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      return;
    }
    
    // Nếu có token nhưng không có user data, thử refresh
    if (token && !userData) {
      refreshUser();
      return;
    }
    
    // Nếu có cả token và user data thì set user
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Lắng nghe sự kiện đăng nhập/đăng xuất từ tab khác
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      // Bỏ qua nếu đang trong quá trình logout
      if (isLoggingOutRef.current) {
        return;
      }
      
      // Chỉ xử lý khi có thay đổi thực sự
      if (event.key === "user" || event.key === "token") {
        // Clear timeout cũ nếu có
        if (storageTimeoutRef.current) {
          clearTimeout(storageTimeoutRef.current);
        }
        
        // Thêm delay để tránh race condition và debounce
        storageTimeoutRef.current = setTimeout(() => {
          const token = localStorage.getItem("token");
          const userData = localStorage.getItem("user");
          
          // Nếu token bị xóa thì logout
          if (!token) {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("cart");
            return;
          }
          
          // Nếu có token nhưng không có user data, thử refresh
          if (token && !userData) {
            refreshUser();
            return;
          }
          
          // Nếu có cả token và user data thì set user
          if (token && userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
            } catch (error) {
              console.error("Error parsing user data:", error);
              setUser(null);
            }
          }
        }, 200);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
      }
    };
  }, []);

  // Đăng xuất
  const logout = () => {
    // Set flag để tránh xử lý storage event trong quá trình logout
    isLoggingOutRef.current = true;
    
    // Xóa localStorage trước
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); // Xóa cart khi đăng xuất
    
    // Cập nhật state ngay lập tức
    setUser(null);
    
    // Trigger storage events để đồng bộ với các tab khác
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'token',
      newValue: null
    }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      newValue: null
    }));
    
    // Reset flag sau một khoảng thời gian
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 1000);
    
    // Chuyển hướng
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

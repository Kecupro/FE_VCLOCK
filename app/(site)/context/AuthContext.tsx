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
  const hasLoggedOutRef = useRef(false);

  // Wrapper function để đồng bộ localStorage khi setUser
  const setUserAndSync = (userData: IUser | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      // Reset logout flag khi có user mới
      hasLoggedOutRef.current = false;
    } else {
      localStorage.removeItem("user");
    }
  };
  
  // Hàm lấy user từ API (dùng khi đăng nhập Google hoặc refresh avatar)
  const refreshUser = async () => {
    // Bỏ qua nếu đang trong quá trình logout
    if (isLoggingOutRef.current) {
      return;
    }
    
    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUserAndSync(userData);
      } else {
        setUserAndSync(null);
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
      }
    } else {
      setUserAndSync(null);
      // Đảm bảo xóa sạch localStorage nếu không có token
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
        setUserAndSync(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    }
  }, []);

  // Lắng nghe sự kiện đăng nhập/đăng xuất từ tab khác
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      // Bỏ qua nếu đang trong quá trình logout hoặc đã logout
      if (isLoggingOutRef.current || hasLoggedOutRef.current) {
        return;
      }
      
      // Chỉ xử lý khi có thay đổi thực sự và newValue khác null
      if ((event.key === "user" || event.key === "token") && event.newValue !== null) {
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
              setUserAndSync(parsedUser);
            } catch (error) {
              console.error("Error parsing user data:", error);
              setUser(null);
            }
          }
        }, 100);
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

  // Hàm cleanup để xóa tất cả dữ liệu
  const clearAllData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("selectedItems");
    localStorage.removeItem("searchHistory");
    // Xóa tất cả dữ liệu khác có thể liên quan
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_') || key.startsWith('auth_')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Đăng xuất
  const logout = () => {
    // Set flag để tránh xử lý storage event trong quá trình logout
    isLoggingOutRef.current = true;
    hasLoggedOutRef.current = true;
    
    // Cập nhật state trước (để UI cập nhật ngay lập tức)
    setUser(null);
    
    // Xóa tất cả dữ liệu
    clearAllData();
    
    // Reset flag sau một khoảng thời gian ngắn hơn
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 500);
    
    // Chuyển hướng
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndSync, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

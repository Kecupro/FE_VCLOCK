"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: number;
  fullName: string;
  avatar?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthorized: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const storageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggingOutRef = useRef(false);
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AdminAuthContext: Token found:', !!token);
    
    if (token) {
      try {
        const decoded = jwtDecode<AdminUser>(token);
        console.log('AdminAuthContext: Decoded user:', decoded);
        console.log('AdminAuthContext: User role:', decoded.role, 'Type:', typeof decoded.role);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        const exp = (decoded as { exp?: number }).exp;
        if (exp && exp < currentTime) {
          console.log('AdminAuthContext: Token expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('cart');
          setUser(null);
          setIsAuthorized(false);
        } else {
          // Kiểm tra role - chỉ cho phép role 1 và 2 truy cập admin
          const userRole = Number(decoded.role);
          console.log('AdminAuthContext: Checking role:', userRole);
          
          if (userRole === 1 || userRole === 2) {
            console.log('AdminAuthContext: Role authorized');
            setUser(decoded);
            setIsAuthorized(true);
          } else {
            console.log('AdminAuthContext: User role not authorized for admin access:', userRole);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('cart');
            setUser(null);
            setIsAuthorized(false);
          }
        }
      } catch (error) {
        console.error('AdminAuthContext: Token decode error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        setUser(null);
        setIsAuthorized(false);
      }
    } else {
      console.log('AdminAuthContext: No token found');
    }
    setIsLoading(false);
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
          if (!token) {
            // Nếu token bị xóa thì logout
            setUser(null);
            setIsAuthorized(false);
          } else {
            // Nếu có token, thử decode lại để kiểm tra
            try {
              const decoded = jwtDecode<AdminUser>(token);
              const userRole = Number(decoded.role);
              if (userRole === 1 || userRole === 2) {
                setUser(decoded);
                setIsAuthorized(true);
                // Reset logout flag khi có user mới
                hasLoggedOutRef.current = false;
              } else {
                setUser(null);
                setIsAuthorized(false);
              }
            } catch (error) {
              console.error("AdminAuthContext: Token decode error in storage event:", error);
              setUser(null);
              setIsAuthorized(false);
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

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<AdminUser>(token);
      localStorage.setItem('token', token);
      setUser(decoded);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

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

  const logout = () => {
    // Set flag để tránh xử lý storage event trong quá trình logout
    isLoggingOutRef.current = true;
    hasLoggedOutRef.current = true;
    
    // Xóa tất cả dữ liệu
    clearAllData();
    
    // Cập nhật state ngay lập tức
    setUser(null);
    setIsAuthorized(false);
    
    // Reset flag sau một khoảng thời gian
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 500);
  };

  const value: AdminAuthContextType = {
    user,
    isLoading,
    isAuthorized,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 
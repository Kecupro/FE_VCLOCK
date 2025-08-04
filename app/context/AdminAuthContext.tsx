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
      // Bỏ qua nếu đang trong quá trình logout
      if (isLoggingOutRef.current) {
        return;
      }
      
      if (event.key === "user" || event.key === "token") {
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
            localStorage.removeItem("user");
            localStorage.removeItem("cart");
          } else {
            // Nếu có token, thử decode lại để kiểm tra
            try {
              const decoded = jwtDecode<AdminUser>(token);
              const userRole = Number(decoded.role);
              if (userRole === 1 || userRole === 2) {
                setUser(decoded);
                setIsAuthorized(true);
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

  const logout = () => {
    // Set flag để tránh xử lý storage event trong quá trình logout
    isLoggingOutRef.current = true;
    
    // Xóa localStorage trước
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Xóa cart khi đăng xuất
    
    // Cập nhật state ngay lập tức
    setUser(null);
    setIsAuthorized(false);
    
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
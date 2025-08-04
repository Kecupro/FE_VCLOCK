"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
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
            setUser(null);
            setIsAuthorized(false);
          }
        }
      } catch (error) {
        console.error('AdminAuthContext: Token decode error:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthorized(false);
      }
    } else {
      console.log('AdminAuthContext: No token found');
    }
    setIsLoading(false);
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
    // Xóa localStorage trước
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Xóa cart khi đăng xuất
    
    // Cập nhật state ngay lập tức
    setUser(null);
    setIsAuthorized(false);
    
    // Trigger storage event để đồng bộ với các tab khác
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'token',
      newValue: null
    }));
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
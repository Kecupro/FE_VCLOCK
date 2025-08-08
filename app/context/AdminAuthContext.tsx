"use client";


import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { clearAuthData } from '../utils/authUtils';

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: number;
  fullName: string;
  avatar?: string;
}

interface JWTUserPayload {
  userId: string;
  username: string;
  role: number;
  exp?: number;
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token) {
      try {
        const decoded = jwtDecode<JWTUserPayload>(token);
        
        const currentTime = Date.now() / 1000;
        const exp = decoded.exp;
        if (exp && exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthorized(false);
        } else {
          const userRole = Number(decoded.role);
          
          if (userRole === 1 || userRole === 2) {
            
            if (userData) {
              try {
                const fullUserData = JSON.parse(userData);
                
                const completeUser: AdminUser = {
                  _id: decoded.userId || fullUserData._id,
                  username: decoded.username || fullUserData.username,
                  email: fullUserData.email,
                  role: userRole,
                  fullName: fullUserData.fullName,
                  avatar: fullUserData.avatar
                };
                
                setUser(completeUser);
                setIsAuthorized(true);
              } catch (parseError) {
                console.error('AdminAuthContext: Lỗi phân tích dữ liệu người dùng:', parseError);
                const fallbackUser: AdminUser = {
                  _id: decoded.userId,
                  username: decoded.username,
                  email: 'N/A',
                  role: userRole,
                  fullName: 'N/A',
                  avatar: undefined
                };
                setUser(fallbackUser);
                setIsAuthorized(true);
              }
            } else {
              const fallbackUser: AdminUser = {
                _id: decoded.userId,
                username: decoded.username,
                email: 'N/A',
                role: userRole,
                fullName: 'N/A',
                avatar: undefined
              };
              setUser(fallbackUser);
              setIsAuthorized(true);
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthorized(false);
          }
        }
      } catch (error) {
        console.error('AdminAuthContext: Lỗi giải mã token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthorized(false);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<JWTUserPayload>(token);
      const userData = localStorage.getItem('user');
      
      localStorage.setItem('token', token);
      
      if (userData) {
        try {
          const fullUserData = JSON.parse(userData);
          
          const completeUser: AdminUser = {
            _id: decoded.userId || fullUserData._id,
            username: decoded.username || fullUserData.username,
            email: fullUserData.email,
            role: Number(decoded.role),
            fullName: fullUserData.fullName,
            avatar: fullUserData.avatar
          };
          
          setUser(completeUser);
          setIsAuthorized(true);
        } catch (parseError) {
          		console.error('Đăng nhập: Lỗi phân tích dữ liệu người dùng:', parseError);
          const fallbackUser: AdminUser = {
            _id: decoded.userId,
            username: decoded.username,
            email: 'N/A',
            role: Number(decoded.role),
            fullName: 'N/A',
            avatar: undefined
          };
          setUser(fallbackUser);
          setIsAuthorized(true);
        }
      } else {
        const fallbackUser: AdminUser = {
          _id: decoded.userId,
          username: decoded.username,
          email: 'N/A',
          role: Number(decoded.role),
          fullName: 'N/A',
          avatar: undefined
        };
        setUser(fallbackUser);
        setIsAuthorized(true);
      }
    } catch (error) {
      		console.error('Lỗi đăng nhập:', error);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthorized(false);
    router.push('/');
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
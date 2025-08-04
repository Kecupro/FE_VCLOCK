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
    console.log('AdminAuthContext: Token found:', !!token);
    console.log('AdminAuthContext: User data found:', !!userData);
    
    if (token) {
      try {
        const decoded = jwtDecode<JWTUserPayload>(token);
        console.log('AdminAuthContext: Decoded user:', decoded);
        console.log('AdminAuthContext: User role:', decoded.role, 'Type:', typeof decoded.role);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        const exp = decoded.exp;
        if (exp && exp < currentTime) {
          console.log('AdminAuthContext: Token expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthorized(false);
        } else {
          // Kiểm tra role - chỉ cho phép role 1 và 2 truy cập admin
          const userRole = Number(decoded.role);
          console.log('AdminAuthContext: Checking role:', userRole);
          
          if (userRole === 1 || userRole === 2) {
            console.log('AdminAuthContext: Role authorized');
            
            // Lấy thông tin user đầy đủ từ localStorage
            if (userData) {
              try {
                const fullUserData = JSON.parse(userData);
                console.log('AdminAuthContext: Full user data:', fullUserData);
                
                // Kết hợp thông tin từ JWT và localStorage
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
                console.error('AdminAuthContext: Error parsing user data:', parseError);
                // Fallback to JWT data only
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
              // Fallback to JWT data only
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
            console.log('AdminAuthContext: User role not authorized for admin access:', userRole);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthorized(false);
          }
        }
      } catch (error) {
        console.error('AdminAuthContext: Token decode error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
      const decoded = jwtDecode<JWTUserPayload>(token);
      const userData = localStorage.getItem('user');
      
      localStorage.setItem('token', token);
      
      // Lấy thông tin user đầy đủ từ localStorage
      if (userData) {
        try {
          const fullUserData = JSON.parse(userData);
          
          // Kết hợp thông tin từ JWT và localStorage
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
          console.error('Login: Error parsing user data:', parseError);
          // Fallback to JWT data only
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
        // Fallback to JWT data only
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
      console.error('Login error:', error);
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
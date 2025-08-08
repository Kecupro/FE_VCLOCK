"use client";

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'token',
    newValue: null
  }));
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: null
  }));
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');
  return !!token;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Lỗi phân tích dữ liệu người dùng:', error);
      return null;
    }
  }
  return null;
};

export const getCurrentToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}; 
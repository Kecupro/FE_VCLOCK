"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
interface WishlistItem {
  _id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlistCount: () => void;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  getWishlistStatus: () => Promise<{[key: string]: boolean}>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlistCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.length || 0);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
              console.error('Lỗi tải số lượng danh sách yêu thích:', error);
      setWishlistCount(0);
    }
  }, []);

  const refreshWishlistCount = () => {
    fetchWishlistCount();
  };

  const getWishlistStatus = async (): Promise<{[key: string]: boolean}> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return {};
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const statusMap: {[key: string]: boolean} = {};
        if (Array.isArray(data)) {
          data.forEach((item: WishlistItem) => {
            statusMap[item.product_id] = true;
          });
        }
        return statusMap;
      }
      return {};
    } catch (error) {
              console.error('Lỗi tải trạng thái danh sách yêu thích:', error);
      return {};
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistCount(prev => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
              console.error('Lỗi thêm vào danh sách yêu thích:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
              console.error('Lỗi xóa khỏi danh sách yêu thích:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === null) {
        fetchWishlistCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchWishlistCount]);

  const value: WishlistContextType = {
    wishlistCount,
    refreshWishlistCount,
    addToWishlist,
    removeFromWishlist,
    getWishlistStatus
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 
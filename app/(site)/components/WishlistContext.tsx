"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlistCount: () => void;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
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

  const fetchWishlistCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch('https://bevclock-production.up.railway.app/user/wishlist', {
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
      console.error('Error fetching wishlist count:', error);
      setWishlistCount(0);
    }
  };

  const refreshWishlistCount = () => {
    fetchWishlistCount();
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`https://bevclock-production.up.railway.app/user/wishlist/${productId}`, {
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
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`https://bevclock-production.up.railway.app/user/wishlist/${productId}`, {
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
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, []);

  // Lắng nghe sự thay đổi của token để refresh wishlist count
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === null) {
        fetchWishlistCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: WishlistContextType = {
    wishlistCount,
    refreshWishlistCount,
    addToWishlist,
    removeFromWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 
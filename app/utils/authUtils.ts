/**
 * Utility functions for authentication
 */

/**
 * Clears all authentication data from localStorage and triggers storage events
 * for cross-tab synchronization
 */
export const clearAuthData = () => {
  console.log('🔍 clearAuthData: Bắt đầu xóa dữ liệu auth');
  
  // Remove all auth-related data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  
  console.log('🔍 clearAuthData: Đã xóa dữ liệu, kiểm tra lại:');
  console.log('  - token:', localStorage.getItem('token'));
  console.log('  - user:', localStorage.getItem('user'));
  console.log('  - cart:', localStorage.getItem('cart'));
  
  // Trigger storage events for cross-tab synchronization
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'token',
    newValue: null
  }));
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: null
  }));
  
  console.log('🔍 clearAuthData: Đã trigger storage events');
};

/**
 * Checks if user is authenticated by verifying token existence
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Gets current user data from localStorage
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Gets current token from localStorage
 */
export const getCurrentToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}; 
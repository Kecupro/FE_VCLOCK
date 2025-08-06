// Cấu hình API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  VERIFY_EMAIL: `${API_BASE_URL}/verify-email`,
  REQUEST_PASSWORD_RESET: `${API_BASE_URL}/request-password-reset`,
  RESET_PASSWORD: `${API_BASE_URL}/reset-password`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  FACEBOOK_AUTH: `${API_BASE_URL}/auth/facebook`,
  
  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/user/profile`,
  USER_PROFILE_UPDATE: `${API_BASE_URL}/user/profile/update`,
  USER_ADDRESSES: `${API_BASE_URL}/user/addresses`,
  USER_WISHLIST: `${API_BASE_URL}/user/wishlist`,
  CHECK_ROLE: `${API_BASE_URL}/check-role`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_DETAIL: (id: string) => `${API_BASE_URL}/api/product/${id}`,
  PRODUCT_PRICE_RANGE: `${API_BASE_URL}/api/product/price-range`,
  PRODUCTS_TOP_RATED: (limit?: number) => `${API_BASE_URL}/api/products/top-rated${limit ? `?limit=${limit}` : ''}`,
  PRODUCTS_FILTER: `${API_BASE_URL}/api/sp_filter`,
  PRODUCTS_NEW: `${API_BASE_URL}/api/sp_moi`,
  PRODUCTS_SALE: `${API_BASE_URL}/api/sp_giam_gia`,
  PRODUCTS_RELATED: (id: string) => `${API_BASE_URL}/api/sp_lien_quan/${id}`,
  
  // Category endpoints
  CATEGORIES: `${API_BASE_URL}/api/category`,
  CATEGORIES_NEWS: `${API_BASE_URL}/api/category-news`,
  
  // Brand endpoints
  BRANDS: `${API_BASE_URL}/api/brand`,
  BRAND_DETAIL: (id: string) => `${API_BASE_URL}/api/brand/${id}`,
  BRAND_PRODUCTS: (id: string, limit?: number) => `${API_BASE_URL}/api/brand/${id}/products${limit ? `?limit=${limit}` : ''}`,
  
  // News endpoints
  NEWS: `${API_BASE_URL}/api/news`,
  NEWS_DETAIL: (id: string) => `${API_BASE_URL}/api/news/${id}`,
  NEWS_BY_CATEGORY: (categoryId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    return `${API_BASE_URL}/api/news/category/${categoryId}?${params.toString()}`;
  },
  
  // Search endpoints
  SEARCH: `${API_BASE_URL}/api/search`,
  SEARCH_SUGGESTIONS: (query: string) => `${API_BASE_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`,
  
  // Review endpoints
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  REVIEWS_BY_PRODUCT: (productId: string) => `${API_BASE_URL}/api/reviews/${productId}`,
  REVIEWS_BY_USER: `${API_BASE_URL}/reviews/user`,
  REVIEWS_STATS: (productId: string) => `${API_BASE_URL}/api/reviews/stats/${productId}`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_DETAILS: (orderId: string) => `${API_BASE_URL}/api/order-details/${orderId}`,
  CANCEL_ORDER: (orderId: string) => `${API_BASE_URL}/api/cancel-order/${orderId}`,
  RETURN_ORDER: (orderId: string) => `${API_BASE_URL}/api/return-order/${orderId}`,
  
  // Payment endpoints
  PAYMENT_METHODS: `${API_BASE_URL}/api/payment-methods`,
  
  // Voucher endpoints
  VOUCHERS_AVAILABLE: `${API_BASE_URL}/api/vouchers/available`,
  VOUCHER_USER: `${API_BASE_URL}/voucher-user`,
  VOUCHER_USER_SAVE: `${API_BASE_URL}/api/voucher-user/save`,
  ADMIN_VOUCHER: (limit?: number) => `${API_BASE_URL}/api/admin/voucher${limit ? `?limit=${limit}` : ''}`,
  
  // Address endpoints
  PROVINCES: `${API_BASE_URL}/api/provinces`,
  DISTRICTS: (provinceCode: string) => `${API_BASE_URL}/api/districts/${provinceCode}`,
  WARDS: (districtCode: string) => `${API_BASE_URL}/api/wards/${districtCode}`,
  SET_DEFAULT_ADDRESS: (addressId: string) => `${API_BASE_URL}/api/user/addresses/${addressId}/set-default`,
  
  // Contact endpoints
  CONTACT: `${API_BASE_URL}/api/contact`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/api/admin/user`,
  ADMIN_USER_DELETE: (userId: string) => `${API_BASE_URL}/api/admin/user/delete/${userId}`,
  
  // Chat endpoints
  MESSAGES: (conversationId: string) => `${API_BASE_URL}/api/messages/${conversationId}`,
  
  // File uploads
  AVATAR_URL: (avatar: string) => `${API_BASE_URL}/uploads/avatars/${avatar}`,
  
  // Socket connection
  SOCKET_URL: API_BASE_URL,
};

export default API_ENDPOINTS; 
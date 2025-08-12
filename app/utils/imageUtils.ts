/**
 * Utility function để xử lý đường dẫn hình ảnh
 * Nếu là URL Cloudinary (bắt đầu với http), trả về nguyên vẹn
 * Nếu là đường dẫn local, thêm prefix /images/
 */

export const getImageUrl = (imagePath: string | undefined | null, folder?: string): string => {
  if (!imagePath) {
    return '/images/avatar-default.png';
  }

  // Nếu đã là URL đầy đủ (Cloudinary), trả về nguyên vẹn
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Nếu là đường dẫn local, thêm prefix
  if (folder) {
    return `/images/${folder}/${imagePath}`;
  }

  // Nếu không có folder, kiểm tra xem đã có /images/ chưa
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }

  return `/images/${imagePath}`;
};

export const getProductImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return '/images/mixed/logoVCLOCK.png';
  }
  return getImageUrl(imagePath, 'product');
};

export const getCategoryImageUrl = (imagePath: string | undefined | null): string => {
  return getImageUrl(imagePath, 'category');
};

export const getBrandImageUrl = (imagePath: string | undefined | null): string => {
  return getImageUrl(imagePath, 'brand');
};

export const getNewsImageUrl = (imagePath: string | undefined | null): string => {
  return getImageUrl(imagePath, 'news');
};

export const getAvatarImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return '/images/avatar-default.png';
  }
  return getImageUrl(imagePath, 'avatar');
};

export const getPaymentMethodImageUrl = (imagePath: string | undefined | null): string => {
  return getImageUrl(imagePath, 'payment-Method');
};



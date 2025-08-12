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
  if (!imagePath) {
    return '/images/news/default-news.jpg';
  }

  try {
    // Nếu đã là URL đầy đủ (Cloudinary), trả về nguyên vẹn
    if (imagePath.startsWith('http')) {
      // Validate URL format
      new URL(imagePath);
      return imagePath;
    }

    // Nếu là đường dẫn local, thêm prefix
    if (imagePath.startsWith('/images/')) {
      return imagePath;
    }

    // Xử lý tên file có ký tự đặc biệt
    const sanitizedPath = imagePath.replace(/[^\w\-\.]/g, '_');
    return `/images/news/${sanitizedPath}`;
  } catch (error) {
    console.error('Error processing news image URL:', error);
    return '/images/news/default-news.jpg';
  }
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



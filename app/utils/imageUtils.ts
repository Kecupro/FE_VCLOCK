

export const getImageUrl = (imagePath: string | undefined | null, folder?: string): string => {
  if (!imagePath) {
    return '/images/avatar-default.png';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  if (folder) {
    return `/images/${folder}/${imagePath}`;
  }
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



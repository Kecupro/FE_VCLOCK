

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  fallbackSrc = '/images/avatar-default.png'
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Nếu ảnh bắt đầu bằng http hoặc https, sử dụng unoptimized
  const isExternalImage = src.startsWith('http');

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized={isExternalImage}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      priority={priority}
      unoptimized={isExternalImage}
      onError={handleError}
    />
  );
} 
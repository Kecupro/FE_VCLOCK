

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  fallbackSrc?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  fallbackSrc = '/images/avatar-default.png',
  style,
  onError
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Validate và sanitize src URL
  const validateAndSanitizeSrc = (url: string): string => {
    if (!url) return fallbackSrc;
    
    try {
      // Nếu là URL đầy đủ, validate format
      if (url.startsWith('http')) {
        new URL(url);
        return url;
      }
      
      // Nếu là relative path, đảm bảo bắt đầu với /
      if (!url.startsWith('/')) {
        return `/${url}`;
      }
      
      return url;
    } catch (error) {
      console.error('Invalid image URL:', url, error);
      return fallbackSrc;
    }
  };

  // Update imgSrc khi src prop thay đổi
  useEffect(() => {
    const validatedSrc = validateAndSanitizeSrc(src);
    setImgSrc(validatedSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const isExternalImage = imgSrc.startsWith('http');

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized={isExternalImage}
        onError={onError || handleError}
        style={style}
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
      onError={onError || handleError}
      style={style}
    />
  );
} 
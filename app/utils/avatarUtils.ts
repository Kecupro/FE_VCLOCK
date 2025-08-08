"use client";

export const getAvatarSrc = (avatar: string | null | undefined): string => {
  if (!avatar || avatar.trim() === "") {
    return "/images/avatar-default.png";
  }
  
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  if (avatar.startsWith('/')) {
    return avatar;
  }
  
  const baseUrl = `/images/avatar/${avatar}`;
  return baseUrl;
}; 
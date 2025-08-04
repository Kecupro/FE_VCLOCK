/**
 * Utility function để xử lý đường dẫn avatar
 * Hỗ trợ: Google/Facebook avatar, local uploads, default avatar
 */
import { API_ENDPOINTS } from '../config/api';

export const getAvatarSrc = (avatar: string | null | undefined): string => {
  console.log("getAvatarSrc input:", avatar);
  
  if (!avatar || avatar.trim() === "") {
    console.log("Avatar empty, using default");
    return "/images/avatar-default.png";
  }
  
  // Nếu avatar bắt đầu bằng http (Google, Facebook, etc.) thì sử dụng trực tiếp
  if (avatar.startsWith('http')) {
    console.log("Avatar is URL:", avatar);
    return avatar;
  }
  
  // Nếu là đường dẫn tương đối bắt đầu bằng /
  if (avatar.startsWith('/')) {
    console.log("Avatar is relative path:", avatar);
    return avatar;
  }
  
  // Nếu chỉ là tên file, thêm prefix đường dẫn uploads/avatars
  const baseUrl = API_ENDPOINTS.AVATAR_URL(avatar);
  console.log("Avatar is filename, result:", baseUrl);
  return baseUrl;
}; 
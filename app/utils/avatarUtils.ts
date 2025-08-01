/**
 * Utility function để xử lý đường dẫn avatar
 * Hỗ trợ: Google/Facebook avatar, local uploads, default avatar
 */
import { API_ENDPOINTS } from '../config/api';

export const getAvatarSrc = (avatar: string | null | undefined): string => {
  if (!avatar || avatar.trim() === "") {
    return "/images/avatar-default.png";
  }
  
  // Nếu avatar bắt đầu bằng http (Google, Facebook, etc.) thì sử dụng trực tiếp
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // Nếu là đường dẫn tương đối bắt đầu bằng /
  if (avatar.startsWith('/')) {
    return avatar;
  }
  
  // Nếu chỉ là tên file, thêm prefix đường dẫn uploads/avatars
  return API_ENDPOINTS.AVATAR_URL(avatar);
}; 
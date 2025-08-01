export const getRoleDisplayName = (role: string | number): string => {
  if (typeof role == "string") return role;
  switch (role) {
    case 0: return "Admin";
    case 1: return "Quản lý";
    case 2: return "Nhân viên";
    default: return "Người dùng";
  }
};

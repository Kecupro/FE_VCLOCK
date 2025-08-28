"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../assets/css/all.module.css";
import { useAppContext } from "../../context/AppContext";
import Link from "next/link";
import Image from "next/image";
import { IUser } from "@/app/(site)/cautrucdata";
import { CurrentUser, APIResponse } from "@/app/(site)/cautrucdata";
const UsersPage = () => {
  const { isDarkMode } = useAppContext();
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [roleCheckLoading, setRoleCheckLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [availableStatuses, setAvailableStatuses] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const limit = 10;

  const isSuperAdmin = useMemo(() => {
    return currentUser && Number(currentUser.role) == 2;
  }, [currentUser]);

  const defaultRoles = useMemo(() => [
    { value: 0, label: "Người dùng" },
    { value: 1, label: "Quản trị viên" },
    { value: 2, label: "Quản trị viên cấp cao" },
  ], []);

  const defaultStatuses = useMemo(() => [
    { value: 0, label: "Bị khóa" },
    { value: 1, label: "Hoạt động" },
  ], []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add(styles['dark-mode']);
    } else {
      html.classList.remove(styles['dark-mode']);
    }
  }, [isDarkMode]);

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol == "http:" || url.protocol == "https:";
    } catch {
      return false;
    }
  };

  const getAvatarSource = (avatar: string | null | undefined): string => {
    if (!avatar || avatar.trim() == "") {
      return "/images/avatar-default.png";
    }

    if (isValidUrl(avatar)) {
      return avatar;
    }

    let cleanPath = avatar.trim();
    
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    if (cleanPath.startsWith('images/avatar/')) {
      return `/${cleanPath}`;
    }
    
    return `/images/avatar/${cleanPath}`;
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const createAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error('Vui lòng đăng nhập để tiếp tục');
          setRoleCheckLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3000/check-role`, {
          method: 'GET',
          headers: createAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status == 401) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          } else if (response.status == 403) {
            toast.error('Bạn không có quyền truy cập trang này!');
          }
          throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setCurrentUser(data.user);
        } else {
          toast.error(data.message || 'Không thể xác thực người dùng');
        }
      } catch {
        toast.error('Lỗi khi kiểm tra quyền truy cập');
      } finally {
        setRoleCheckLoading(false);
      }
    };

    checkUserRole();
  }, [createAuthHeaders]);

  const canDeleteUser = (targetUser: IUser): boolean => {
    if (!currentUser) return false;
    const currentRole = Number(currentUser.role);
    const targetRole = Number(targetUser.role);

    if (currentRole == 2) {
      return currentUser.userId != targetUser._id && targetRole < 2;
    }
    
    if (currentRole == 1) {
      return targetRole == 0;
    }
    
    return false;
  };

  const canEditUser = (targetUser: IUser): boolean => {
    if (!currentUser) return false;
    const currentRole = Number(currentUser.role);
    const targetRole = Number(targetUser.role);

    if (currentRole == 2) {
      // Super admin: có thể chỉnh sửa chính mình và tài khoản khác (trừ super admin khác)
      if (currentUser.userId === targetUser._id) {
        return true; // Có thể chỉnh sửa chính mình
      }
      return targetRole < 2; // Không thể chỉnh sửa super admin khác
    }
    
    if (currentRole == 1) {
      // Moderator: có thể chỉnh sửa chính mình và user thường
      if (currentUser.userId === targetUser._id) {
        return true; // Có thể chỉnh sửa chính mình
      }
      if (targetRole == 0) {
        return true; // Có thể chỉnh sửa user thường
      }
      return false; // Không thể chỉnh sửa admin khác
    }
    
    return false;
  };

  const getUserDisplayName = (user: IUser): string => {
    return (
      user.addresses?.[0]?.receiver_name ||
      user.fullName ||
      user.username ||
      "Chưa cập nhật"
    );
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (roleFilter && roleFilter != "all") {
        params.append('role', roleFilter);
      }
      
      if (statusFilter && statusFilter != "all") {
        params.append('status', statusFilter);
      }

      const apiUrl = `http://localhost:3000/api/admin/user?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        let errorMessage = 'Có lỗi xảy ra khi tải dữ liệu';
        
        switch (response.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
            break;
          case 403:
            errorMessage = 'Bạn không có quyền truy cập tính năng này!';
            break;
          case 404:
            errorMessage = 'Không tìm thấy API endpoint';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau!';
            break;
          default:
            errorMessage = `Lỗi HTTP: ${response.status}`;
        }
        
        toast.error(errorMessage);
        throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (!data.success) {
        const errorMessage = data.message || data.error || 'API trả về lỗi';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const usersData = data.data || data.list || data.users || [];
      const totalUsersData = data.total || data.totalUsers || data.count || 0;

      if (!Array.isArray(usersData)) {
        toast.error('Dữ liệu người dùng không hợp lệ');
        setUsers([]);
        setTotalUsers(0);
        return;
      }

      setUsers(usersData);
      setTotalUsers(totalUsersData);

      if (data.metadata) {
        if (Array.isArray(data.metadata.roles) && data.metadata.roles.length > 0) {
          const validRoles = data.metadata.roles.filter(role => 
            typeof role == 'object' && 
            typeof role.value == 'number' && 
            typeof role.label == 'string'
          );
          
          if (validRoles.length > 0) {
            setAvailableRoles(validRoles);
          } else {
            setAvailableRoles(defaultRoles);
          }
        } else {
          setAvailableRoles(defaultRoles);
        }

        if (Array.isArray(data.metadata.statuses) && data.metadata.statuses.length > 0) {
          const validStatuses = data.metadata.statuses.filter(status => 
            typeof status == 'object' && 
            typeof status.value == 'number' && 
            typeof status.label == 'string'
          );
          
          if (validStatuses.length > 0) {
            setAvailableStatuses(validStatuses);
          } else {
            setAvailableStatuses(defaultStatuses);
          }
        } else {
          setAvailableStatuses(defaultStatuses);
        }
      } else {
        setAvailableRoles(defaultRoles);
        setAvailableStatuses(defaultStatuses);
      }
      
    } catch {
      setUsers([]);
      setTotalUsers(0);
      setAvailableRoles(defaultRoles);
      setAvailableStatuses(defaultStatuses);
      
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, createAuthHeaders, defaultRoles, defaultStatuses]);

  const refreshUserList = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!roleCheckLoading) {
      fetchUsers();
    }
  }, [fetchUsers, roleCheckLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const handleReset = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
    toast.info("Đã đặt lại bộ lọc!");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value == "all") {
      setRoleFilter("all");
    } else {
      const numValue = parseInt(value);
      const isValidRole = availableRoles.some(role => role.value == numValue);
      
      if (isValidRole) {
        setRoleFilter(value);
      } else {
        setRoleFilter("all");
        toast.warning("Giá trị vai trò không hợp lệ, đã đặt lại về 'Tất cả'");
      }
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value == "all") {
      setStatusFilter("all");
    } else {
      const numValue = parseInt(value);
      const isValidStatus = availableStatuses.some(status => status.value == numValue);
      
      if (isValidStatus) {
        setStatusFilter(value);
      } else {
        setStatusFilter("all");
        toast.warning("Giá trị trạng thái không hợp lệ, đã đặt lại về 'Tất cả'");
      }
    }
  };

  const handleDeleteClick = (user: IUser) => {
    if (!canDeleteUser(user)) {
      toast.error("Bạn không có quyền xóa người dùng này!");
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      const deleteResponse = await fetch(
        `http://localhost:3000/api/admin/user/delete/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: createAuthHeaders(),
        }
      );

      if (!deleteResponse.ok) {
        let errorMessage = 'Có lỗi xảy ra khi xóa người dùng';
        
        switch (deleteResponse.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn';
            break;
          case 403:
            errorMessage = 'Bạn không có quyền xóa người dùng này';
            break;
          case 404:
            errorMessage = 'Không tìm thấy người dùng';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ';
            break;
        }
        
        toast.error(errorMessage);
        throw new Error(`Lỗi HTTP! trạng thái: ${deleteResponse.status}`);
      }

      const deleteData = await deleteResponse.json();

      if (deleteData.success != false) {
        await refreshUserList();
        toast.success(deleteData.thong_bao || deleteData.message || "Xóa người dùng thành công!");
      } else {
        const errorMessage = deleteData.thong_bao || deleteData.error || deleteData.message || "Có lỗi xảy ra khi xóa người dùng";
        toast.error(errorMessage);
      }
    } catch {

    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const getRoleName = (role: number | string) => {
    const roleValue = typeof role == "string" ? parseInt(role) : role;
    const roleOption = availableRoles.find(option => option.value == roleValue);
    if (roleOption) return roleOption.label;

    switch (roleValue) {
      case 0: return "Người dùng";
      case 1: return "Quản trị viên";
      case 2: return "Quản trị viên cấp cao";
      default: return "Không xác định";
    }
  };

  const getStatusName = (status: number | string) => {
    const statusValue = typeof status == "string" ? parseInt(status) : status;
    const statusOption = availableStatuses.find(option => option.value == statusValue);
    if (statusOption) return statusOption.label;

    return statusValue == 1 ? "Hoạt động" : "Bị khóa";
  };

  const totalPages = Math.ceil(totalUsers / limit);

  if (roleCheckLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <RefreshCw className={styles.spinning} size={24} />
          <span>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
                      <h1 className={styles.title}>Quản lý người dùng</h1>
        </div>
        <div className={styles.headerActions}>
          {(isSuperAdmin || (currentUser && Number(currentUser.role) >= 1)) && (
            <Link href={"users/addUser"}>
              <button className={styles.addButton}>
                <Plus size={16} />
                {isSuperAdmin ? "Thêm quản trị viên" : "Thêm người dùng"}
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tìm kiếm</label>
            <div style={{ position: "relative" }}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Tìm email, tên người dùng"
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
                style={{width: "102%"
                }}
              />
            </div>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Vai trò</label>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className={styles.select}
            >
              <option value="all">Tất cả vai trò</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value.toString()}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className={styles.select}
            >
              <option value="all">Tất cả trạng thái</option>
              {availableStatuses.map((status) => (
                <option key={status.value} value={status.value.toString()}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <RefreshCw className={styles.spinning} size={24} />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>STT</th>
                    <th>Tên người dùng</th>
                    <th>Ảnh đại diện</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Vai trò</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => {
                      const avatarSrc = getAvatarSource(user.avatar);
                      return (
                        <tr key={user._id}>
                          <td className={styles.tableCell}>
                            {(currentPage - 1) * limit + index + 1}
                          </td>
                          <td className={styles.tableCell}>
                            <div className={styles.userName}>
                              {user.fullName || "Chưa cập nhật"}
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <div className={styles.avatarContainer}>
                              <Image
                                src={avatarSrc}
                                alt={`Avatar của ${user.username || user.fullName || 'User'}`}
                                width={40}
                                height={40}
                                className={styles.avatar}
                                style={{
                                  border: "none",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                }}
                                unoptimized={isValidUrl(user.avatar || '')}
                                priority={false}
                              />
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.email}>
                              {user.email || "N/A"}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span
                              className={`${styles.statusBadge} ${
                                String(user.account_status) == "1"
                                  ? styles.statusActive
                                  : styles.statusInactive
                              }`}
                            >
                              {getStatusName(user.account_status)}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span
                              className={`${styles.statusBadge} ${
                                Number(user.role) == 0
                                  ? styles.roleUser
                                  : Number(user.role) == 1
                                  ? styles.roleAdmin  
                                  : styles.roleSuperAdmin
                              }`}
                            >
                              {getRoleName(user.role)}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <div className={styles.actions}>
                              <Link href={`users/${user._id}`}>
                                <button
                                  className={`${styles.actionButton} ${styles.viewButton}`}
                                  title="Xem chi tiết"
                                >
                                  <Eye size={16} />
                                </button>
                              </Link>

                              {canEditUser(user) && (
                                <Link href={`users/editUser/${user._id}`}>
                                  <button
                                    className={`${styles.actionButton} ${styles.editButton}`}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </Link>
                              )}

                              {canDeleteUser(user) && (
                                <button
                                  className={`${styles.actionButton}`}
                                  title="Xóa"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.emptyState}>
                        <div className={styles.emptyContent}>
                          <Search size={48} className={styles.emptyIcon} />
                          <h3>Không tìm thấy người dùng</h3>
                          <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalUsers > 0 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Hiển thị {(currentPage - 1) * limit + 1}
                  &nbsp;đến&nbsp;
                  {Math.min(currentPage * limit, totalUsers)} trong {totalUsers}{" "}
                  người dùng
                  {searchTerm && ` (tìm kiếm: "${searchTerm.trim()}")`}
                </div>
                <div className={styles.paginationButtons}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage == 1}
                    className={`${styles.paginationButton} ${
                      currentPage == 1 ? styles.paginationButtonInactive : ""
                    }`}
                  >
                    Trang đầu
                  </button>

                  <button
                    className={`${styles.paginationButton} ${
                      currentPage == 1 ? styles.paginationButtonInactive : ""
                    }`}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage == 1}
                  >
                    &laquo;
                  </button>

                  {totalPages > 0 &&
                    Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        className={`${styles.paginationButton} ${
                          currentPage == page
                            ? styles.paginationButtonActive
                            : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    className={`${styles.paginationButton} ${
                      currentPage == totalPages || totalPages == 0
                        ? styles.paginationButtonInactive
                        : ""
                    }`}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage == totalPages || totalPages == 0}
                  >
                    &raquo;
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage == totalPages || totalPages == 0}
                    className={`${styles.paginationButton} ${
                      currentPage == totalPages || totalPages == 0
                        ? styles.paginationButtonInactive
                        : ""
                    }`}
                  >
                    Trang cuối
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xóa người dùng&nbsp;
                <strong>&quot;{getUserDisplayName(userToDelete!)}&quot;</strong> không?
              </p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>
                Lưu ý: Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalcancelButton}
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default UsersPage;
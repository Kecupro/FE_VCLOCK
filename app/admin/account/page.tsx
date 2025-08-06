"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  CreditCard,
  Edit3,
  Save,
  X,
  Lock,
  // Eye,
  // EyeOff,
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../assets/css/AdminProfile.module.css";
import Image from "next/image";
import { useAppContext } from "../../context/AppContext";
import {
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
  isBrowser,
} from "./utils/localStorage";
import { getAvatarSrc } from "../../utils/avatarUtils";

// Hàm hiển thị tên role
const getRoleDisplayName = (role: number): string => {
  switch (role) {
    case 0: return "Người dùng";
    case 1: return "Quản trị viên";
    case 2: return "Quản trị viên cấp cao";
    default: return "Người dùng";
  }
};


interface AdminData {
  _id: string;
  username: string;
  email: string;
  role: string | number;
  fullName: string;
  avatar: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EditData extends AdminData {
  password?: string;
}

interface ApiResponse {
  success: boolean;
  user?: {
    userId?: string;
    id?: string;
    _id?: string;
    username?: string;
    email?: string;
    role?: string | number;
    fullName?: string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  message?: string;
}

interface UpdateResponse {
  success: boolean;
  message: string;
  user?: AdminData;
}

const AdminProfile = () => {
  const { isDarkMode } = useAppContext();

  const [adminData, setAdminData] = useState<AdminData>({
    _id: "",
    username: "",
    email: "",
    role: "",
    fullName: "",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  });
  const [editData, setEditData] = useState<EditData>({
    ...adminData,
    password: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add(styles['dark-mode']);
    } else {
      html.classList.remove(styles['dark-mode']);
    }
  }, [isDarkMode]);

  const hasVietnameseDiacritics = (str: string): boolean => {
    const vietnameseDiacritics =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseDiacritics.test(str);
  };

  const getUserId = useCallback((): string | null => {
    if (isBrowser && window.location.pathname.includes("/admin/user/")) {
      const pathParts = window.location.pathname.split("/");
      const idIndex = pathParts.findIndex((part) => part === "user") + 1;
      if (idIndex > 0 && pathParts[idIndex]) {
        return pathParts[idIndex];
      }
    }

    const cachedUser = getFromLocalStorage("user");
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        return parsedUser._id || parsedUser.id || parsedUser.userId || null;
      } catch (error) {
        console.error("Lỗi phân tích dữ liệu người dùng đã lưu:", error);
      }
    }
    return null;
  }, []);

  const getDisplayName = (userData: AdminData): string => {
    return userData.fullName || userData.username || "Chưa cập nhật";
  };



  const fetchUserDataById = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const token = getFromLocalStorage("token");
        if (!token) throw new Error("Không tìm thấy mã thông báo xác thực");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `http://localhost:3000/api/admin/user/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            removeFromLocalStorage("token");
            removeFromLocalStorage("user");
            if (isBrowser) window.location.href = "/login";
            return;
          }

          if (response.status === 404)
            throw new Error("Không tìm thấy người dùng với ID này");

          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData.error) errorMessage = errorData.error;
          } catch (e) {
            console.error("Lỗi phân tích thông báo lỗi:", e);
          }
          throw new Error(errorMessage);
        }

        const userData = await response.json();

        if (userData) {
          const mappedUserData: AdminData = {
            _id: userData._id || id,
            username: userData.username || "",
            email: userData.email || "",
            role: Number(userData.role) || 0, // Đảm bảo role là number
            fullName: userData.fullName || userData.username || "",
            avatar:
              userData.avatar ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          };

          setAdminData(mappedUserData);
          setEditData({ ...mappedUserData, password: "" });
          setToLocalStorage("user", JSON.stringify(mappedUserData));
        } else {
          throw new Error("Không nhận được dữ liệu người dùng từ server");
        }
      } catch (error) {
        let errorMessage = "Không thể tải thông tin người dùng";
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage = "Hết thời gian chờ - vui lòng kiểm tra kết nối";
          } else if (error.message.includes("fetch")) {
            errorMessage = "Lỗi kết nối - vui lòng kiểm tra server";
          } else {
            errorMessage = error.message;
          }
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [getFromLocalStorage, isBrowser, removeFromLocalStorage, setToLocalStorage, setAdminData, setEditData]
  );

  const fetchCurrentUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getFromLocalStorage("token");
      if (!token) throw new Error("Không tìm thấy mã thông báo xác thực");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("http://localhost:3000/check-role", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          removeFromLocalStorage("token");
          removeFromLocalStorage("user");
          if (isBrowser) window.location.href = "/login";
          return;
        }

        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (error) {
          console.error("Lỗi phân tích thông báo lỗi:", error);
        }

        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.user) {
        const userId = data.user.userId || data.user.id || data.user._id || "";
        if (userId) {
          await fetchUserDataById(userId);
        } else {
          throw new Error("Không thể lấy ID người dùng");
        }
      } else {
        throw new Error(data.message || "Không thể lấy dữ liệu người dùng.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải thông tin người dùng",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [getFromLocalStorage, isBrowser, removeFromLocalStorage, fetchUserDataById]);

  const updateUserData = async (updatedData: EditData) => {
    setIsSaving(true);

    try {
      const token = getFromLocalStorage("token");
      if (!token) throw new Error("Không tìm thấy mã thông báo xác thực.");
      if (!updatedData._id) throw new Error("Không tìm thấy ID người dùng");

      const formData = new FormData();
      formData.append("username", updatedData.username.trim());
      formData.append("fullName", updatedData.fullName.trim());

      if (updatedData.password?.trim()) {
        formData.append("password", updatedData.password.trim());
      }

      if (updatedData.avatar?.startsWith("data:image")) {
        const blob = await (await fetch(updatedData.avatar)).blob();
        formData.append("image", blob, "avatar.png");
      } else if (updatedData.avatar) {
        formData.append("avatar", updatedData.avatar.trim());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `http://localhost:3000/api/admin/account/edit/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi cập nhật người dùng");
      }

      const data: UpdateResponse = await response.json();
      if (data.success) {
        const updatedUserData: AdminData = {
          ...adminData,
          _id: adminData._id,
          username: data.user?.username || updatedData.username,
          email: adminData.email,
          fullName: data.user?.fullName || updatedData.fullName,
          avatar: data.user?.avatar || updatedData.avatar,
          updatedAt: data.user?.updatedAt || new Date().toISOString(),
        };
        if (data.user?.role !== undefined) {
            updatedUserData.role = Number(data.user.role);
        } else {
            updatedUserData.role = adminData.role;
        }


        setAdminData(updatedUserData);
        setEditData({ ...updatedUserData, password: "" });
        setToLocalStorage("user", JSON.stringify(updatedUserData));

        toast.success("Cập nhật thông tin thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setIsEditing(false);
      } else {
        throw new Error(data.message || "Cập nhật không thành công");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Cập nhật thất bại",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchCurrentUserData();

    const id = getUserId();
    if (id) {
      fetchUserDataById(id);
    }
  }, [fetchCurrentUserData, fetchUserDataById, getUserId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      ...adminData,
      password: "",
    });
  };

  const handleSave = async () => {
    if (!editData) {
        toast.error("Dữ liệu chỉnh sửa không hợp lệ.", { position: "top-right", autoClose: 5000 });
        return;
    }

    if (!editData.username?.trim() || !editData.fullName?.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (editData.password && editData.password.trim() !== "") {
      if (editData.password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      if (hasVietnameseDiacritics(editData.password)) {
        toast.error("Mật khẩu không được chứa dấu", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(editData.username.trim())) {
      toast.error("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    await updateUserData(editData);
  };

  const handleCancel = () => {
    setEditData({
      ...adminData,
      password: "",
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof EditData, value: string) => {
    setEditData((prev) => {
        if (!prev) return prev;
        return {
            ...prev,
            [field]: value,
        };
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.maxWidth}>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "400px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminData._id) {
      return (
          <div className={styles.container}>
              <div className={styles.maxWidth}>
                  <p>Không tìm thấy dữ liệu người dùng. Vui lòng tải lại trang.</p>
              </div>
          </div>
      );
  }

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        <div className={styles.header}>
          <div className={styles.headerBackground}>
            <div className={styles.headerContent}>
              <h1 className={styles.headerTitle}>Hồ Sơ Quản Trị Viên</h1>
            </div>
          </div>

          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={getAvatarSrc(adminData.avatar)}
                  alt="Avatar"
                  className={styles.avatar}
                  width={120}
                  height={120}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `/images/avatar-default.png`;
                  }}
                  unoptimized
                  priority
                />
                <div className={styles.statusIndicator}></div>
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userInfoHeader}>
                  <div>
                    <h2 className={styles.userName}>
                      {getDisplayName(isEditing ? editData : adminData)}
                    </h2>
                    <p className={styles.userRole}>
                      {getRoleDisplayName(Number(adminData.role)) || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className={styles.buttonGroup}>
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className={`${styles.button} ${styles.editButton}`}
                        disabled={isLoading}
                      >
                        <Edit3 className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          className={`${styles.button} ${styles.saveButton}`}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <div
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {isSaving ? "Đang lưu..." : "Lưu"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className={`${styles.button} ${styles.cancelButton}`}
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <User className={styles.personalIcon} />
              Thông Tin Cá Nhân
            </h3>

            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Họ và Tên <span className="text-danger">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.fullName || ""}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className={styles.input}
                    placeholder="Nhập họ và tên"
                    required
                  />
                ) : (
                  <div className={styles.displayField}>
                    {adminData.fullName || "Chưa cập nhật"}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tên đăng nhập <span className="text-danger">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.username || ""}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={styles.input}
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                ) : (
                  <div className={styles.displayField}>
                    {adminData.username || "Chưa cập nhật"}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ảnh đại diện</label>
                  {editData.avatar && (
                    <div className="mb-2">
                      <Image
                        src={editData.avatar || getAvatarSrc(adminData.avatar)}
                        alt="Avatar Preview"
                        width={100}
                        height={100}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getAvatarSrc(adminData.avatar);
                        }}
                        unoptimized
                        priority
                      />
                    </div>
                  )}

                  <div className={styles.uploadWrapper}>
                    <input
                      type="file"
                      id="avatarInput"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result == "string") {
                              handleInputChange("avatar", reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={styles.hiddenInput}
                    />
                    <label htmlFor="avatarInput" className={styles.customButton}>Chọn ảnh đại diện</label>
                  </div>

                </div>
              )}

              {isEditing && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Mật khẩu mới
                    <small className="text-muted ms-2">
                      (Để trống nếu không muốn thay đổi)
                    </small>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editData.password || ""}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={styles.input}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự, không có dấu)"
                      style={{ paddingRight: "45px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
                      style={{
                        border: "none",
                        background: "transparent",
                        zIndex: 10,
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <span style={{ fontSize: "14px" }}>👁️</span>
                      ) : (
                        <span style={{ fontSize: "14px" }}>🙈</span>
                      )}
                    </button>
                  </div>
                  {editData.password && editData.password.length > 0 && (
                    <div className="mt-1">
                      {editData.password.length < 6 && (
                        <small className="text-warning d-block">
                          ⚠️ Mật khẩu phải có ít nhất 6 ký tự
                        </small>
                      )}
                      {hasVietnameseDiacritics(editData.password) && (
                        <small className="text-danger d-block">
                          ❌ Mật khẩu không được chứa dấu
                        </small>
                      )}
                      {editData.password.length >= 6 && !hasVietnameseDiacritics(editData.password) && (
                        <small className="text-success d-block">
                          ✅ Mật khẩu hợp lệ
                        </small>
                      )}
                    </div>
                  )}
             
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Shield className={styles.accountIcon} />
              Thông Tin Tài Khoản
            </h3>

            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>ID Tài Khoản</label>
                <div className={styles.displayFieldWithIcon}>
                  <CreditCard className={styles.fieldIcon} />
                  {adminData._id || "Chưa cập nhật"}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email
                  <Lock
                    className="ms-2"
                    size={16}
                    style={{ color: "#6c757d" }}
                  />
                </label>
                <div className={styles.displayFieldWithIcon}>
                  <Mail className={styles.fieldIcon} />
                  {adminData.email || "Chưa cập nhật"}
                </div>
                <small className="mt-1 text-muted d-block">
                  Email không thể chỉnh sửa vì lý do bảo mật
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Vai trò
                  <Lock
                    className="ms-2"
                    size={16}
                    style={{ color: "#6c757d" }}
                  />
                </label>
                <div className={styles.roleField}>
                  <span className={styles.roleContent}>
                    <Shield className={styles.roleIcon} />
                    {adminData.role || "Chưa cập nhật"}
                  </span>
                  <small className="mt-1 text-muted d-block"></small>
                </div>
              </div>

              {!isEditing && adminData.createdAt && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngày tạo tài khoản</label>
                  <div className={styles.displayField}>
                    {new Date(adminData.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}

              {!isEditing && adminData.updatedAt && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Lần cập nhật cuối</label>
                  <div className={styles.displayField}>
                    {new Date(adminData.updatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default AdminProfile;
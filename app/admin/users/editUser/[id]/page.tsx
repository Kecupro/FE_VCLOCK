"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppContext } from '../../../../context/AppContext';
import { ToastContainer, toast } from "react-toastify";
import styles from "../../../assets/css/add.module.css";
import { IUser } from '@/app/(site)/cautrucdata';
const EditUser = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { isDarkMode } = useAppContext();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    receiver_name: "",
    fullName: "",
    account_status: 1,
    currentImage: "",
  });

  const getRoleString = (role: number | string): string => {
    const roleNum = Number(role);
    switch (roleNum) {
      case 2:
        return "admin";
      case 1:
        return "moderator";
      case 0:
      default:
        return "user";
    }
  };

  const getRoleNumber = (roleString: string): number => {
    switch (roleString) {
      case "admin":
        return 2;
      case "moderator":
        return 1;
      case "user":
      default:
        return 0;
    }
  };

  const isValidPasswordCharacter = (char: string): boolean => {
    const validChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]$/;
    return validChars.test(char);
  };

  const validatePassword = (
    password: string
  ): { isValid: boolean; message: string } => {
    if (!password) {
      return { isValid: true, message: "" };
    }

    if (password.length < 6) {
      return {
        isValid: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        message: "Mật khẩu không được quá 128 ký tự",
      };
    }

    for (let i = 0; i < password.length; i++) {
      if (!isValidPasswordCharacter(password[i])) {
        return {
          isValid: false,
          message: `Mật khẩu chứa ký tự không hợp lệ: "${password[i]}". Chỉ cho phép chữ cái, số và các ký tự đặc biệt thông thường.`,
        };
      }
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      return {
        isValid: false,
        message: "Mật khẩu nên chứa ít nhất một chữ cái và một số",
      };
    }

    return { isValid: true, message: "" };
  };

  const sanitizePassword = (password: string): string => {
    return password
      .split("")
      .filter((char) => isValidPasswordCharacter(char))
      .join("");
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setCurrentUser(result.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
        router.push("/login");
      }
    };

    fetchCurrentUser();
  }, [router]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !currentUser) return;

      try {
        setFetchLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData: IUser = await response.json();

          setUserToEdit(userData);

          const userAddress =
            userData.addresses && userData.addresses.length > 0
              ? userData.addresses[0]
              : null;

          const newFormData = {
            username: userData.username || "",
            email: userData.email || "",
            password: "",
            phone: userAddress?.phone?.toString() || "",
            address: userAddress?.address || "",
            receiver_name: userAddress?.receiver_name || "",
            fullName: userData.fullName || "",
            account_status: userData.account_status || 1,
            currentImage: userData.avatar || "",
          };

          setFormData(newFormData);

          const roleString = getRoleString(userData.role);
          setSelectedRole(roleString);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Không thể tải thông tin người dùng");
        }
      } catch {
        toast.error("Lỗi khi tải thông tin người dùng");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUser();
  }, [userId, currentUser]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name == "password") {
      const sanitizedPassword = sanitizePassword(value);
      if (sanitizedPassword != value) {
        toast.warning(
          "Một số ký tự không hợp lệ đã được loại bỏ khỏi mật khẩu"
        );
      }

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedPassword,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordBlur = () => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      if (!validation.isValid) {
        toast.error(validation.message);
      }
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error("Tên đăng nhập không được để trống");
      return false;
    }

    if (formData.username.trim().length < 3) {
      toast.error("Tên đăng nhập phải có ít nhất 3 ký tự");
      return false;
    }

    if (!formData.fullName.trim()) {
      toast.error("Tên đầy đủ không được để trống");
      return false;
    }

    if (formData.fullName.trim().length < 3) {
      toast.error("Tên đầy đủ phải có ít nhất 3 ký tự");
      return false;
    }

    if (!selectedRole) {
      toast.error("Vui lòng chọn vai trò");
      return false;
    }

    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực");
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append("username", formData.username.trim());
      formDataToSend.append("fullName", formData.fullName.trim());
      formDataToSend.append("role", getRoleNumber(selectedRole).toString());
      formDataToSend.append(
        "account_status",
        formData.account_status.toString()
      );

      if (formData.password && formData.password.trim()) {
        const passwordValidation = validatePassword(formData.password.trim());
        if (passwordValidation.isValid) {
          formDataToSend.append("password", formData.password.trim());
        } else {
          toast.error(passwordValidation.message);
          return;
        }
      }

      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/edit/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(
          errorData.error || "Lỗi khi cập nhật thông tin người dùng"
        );
      }

      toast.success("Cập nhật người dùng thành công!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
              console.error("Lỗi khi cập nhật người dùng:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi cập nhật người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/users");
  };

  const handleReturn = () => {
    router.push("/admin/users");
  };

  const canEditUser = currentUser && Number(currentUser.role) >= 1;
  const canEditThisUser =
    currentUser &&
    userToEdit &&
    (() => {
      const currentRole = Number(currentUser.role);
      const targetRole = Number(userToEdit.role);
      
      const currentUserId = (currentUser as IUser & { userId?: string })._id || (currentUser as IUser & { userId?: string }).userId;
      
      if (currentRole === 2) {
        if (currentUserId === userToEdit._id) {
          return true; 
        }
        if (targetRole === 2) {
          return false; 
        }
        return true; 
      }
      
      if (currentRole === 1) {
        if (currentUserId === userToEdit._id) {
          return true; 
        }
        if (targetRole === 0) {
          return true; 
        }
        return false; 
      }
      
      return false;
    })();

  const canChangeRole = currentUser && Number(currentUser.role) == 2;

  const canEditAccountStatus =
    currentUser &&
    userToEdit &&
    (() => {
      const currentRole = Number(currentUser.role);
      const targetRole = Number(userToEdit.role);
      
      const currentUserId = (currentUser as IUser & { userId?: string })._id || (currentUser as IUser & { userId?: string }).userId;
      
      if (currentRole === 2) {
        if (currentUserId === userToEdit._id) {
          return true; 
        }
        if (targetRole === 2) {
          return false; 
        }
        return true; 
      }
      
      if (currentRole === 1) {
        if (currentUserId === userToEdit._id) {
          return true; 
        }
        if (targetRole === 0) {
          return true; 
        }
        return false; 
      }
      
      return false;
    })();

  if (fetchLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Đang tải...</h1>
        </div>
      </main>
    );
  }

  if (!canEditUser) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Không có quyền truy cập</h1>
          <p style={{ color: "#ff4757", marginTop: "10px" }}>
            Bạn không có quyền chỉnh sửa người dùng trong hệ thống.
          </p>
          <button className={styles.returnButton} onClick={handleReturn}>
            Quay lại
          </button>
        </div>
      </main>
    );
  }

  if (!canEditThisUser) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Không có quyền truy cập</h1>
          <p style={{ color: "#ff4757", marginTop: "10px" }}>
            {(() => {
              if (!userToEdit) return "Không tìm thấy thông tin người dùng cần chỉnh sửa.";
              
              const currentUserId = (currentUser as IUser & { userId?: string })._id || (currentUser as IUser & { userId?: string }).userId;
              if (currentUserId === userToEdit._id) {
                return "Bạn có thể chỉnh sửa tài khoản của chính mình từ trang này.";
              }
              if (Number(currentUser.role) === 2 && Number(userToEdit.role) === 2) {
                return "Quản trị viên cấp cao không thể chỉnh sửa tài khoản của các quản trị viên cấp cao khác.";
              }
              return "Bạn không có quyền chỉnh sửa người dùng này.";
            })()}
          </p>
          <button className={styles.returnButton} onClick={handleReturn}>
            Quay lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chỉnh sửa người dùng</h1>
        <button className={styles.returnButton} onClick={handleReturn}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {currentUser && userToEdit && (() => {
          const currentUserId = (currentUser as IUser & { userId?: string })._id || (currentUser as IUser & { userId?: string }).userId;
          return currentUserId === userToEdit._id;
        })() && (
          <div className={styles.formGroup}>
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Vai trò <span style={{color: "red"}}>*</span></label>
          <select
            className={styles.select}
            value={selectedRole}
            onChange={handleRoleChange}
            disabled={!canChangeRole}
            required
          >
            <option value="">--- Chọn vai trò ---</option>
            <option value="user">Người dùng</option>
            <option value="moderator">Quản trị viên</option>
            <option value="admin">Quản trị viên cấp cao</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tên đăng nhập <span style={{color: "red"}}>*</span></label>
          <input
            type="text"
            name="username"
            className={styles.input}
            placeholder="Nhập tên đăng nhập..."
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tên đầy đủ </label>
          <input
            type="text"
            name="fullName"
            className={styles.input}
            placeholder="Nhập tên đầy đủ..."
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            className={styles.input}
            placeholder="Nhập email..."
            value={formData.email}
            onChange={handleInputChange}
            disabled
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu mới</label>
          <div className="position-relative">
            <input
            type={showPassword ? "text" : "password"}
            name="password"
            className={styles.input}
            placeholder="Nhập mật khẩu..."
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handlePasswordBlur}
            />
            <button
            type="button"
            className="top-50 btn btn-sm position-absolute end-0 translate-middle-y"
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
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái tài khoản <span style={{color: "red"}}>*</span></label>
          <select
            className={styles.select}
            name="account_status"
            value={formData.account_status}
            onChange={handleInputChange}
            disabled={!canEditAccountStatus}
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Bị khóa</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Username và email phải duy nhất trong hệ thống</li>
              <li>Email không thể thay đổi</li>
              <li>Tên đầy đủ là bắt buộc</li>
              <li>Mật khẩu phải có ít nhất 6 kí tự, bao gồm chữ cái, số và ký tự đặc biệt</li>
              <li>Quản trị viên cấp cao có thể chỉnh sửa tài khoản của chính mình</li>
              <li>Quản trị viên cấp cao không thể chỉnh sửa tài khoản của các quản trị viên cấp cao khác</li>
              <li>Quản trị viên thường có thể chỉnh sửa tài khoản của chính mình và người dùng thường</li>
            </ul>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.createButton}
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </main>
  );
};

export default EditUser;

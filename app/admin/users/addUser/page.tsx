"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from '../../../context/AppContext';
import { ToastContainer, toast } from "react-toastify";
import styles from "../../assets/css/add.module.css";
import { IUser } from '@/app/(site)/cautrucdata';
const AddUser = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
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
    fullName: "",
    account_status: 0,
  });

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
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePasswordComplexity = (password: string): string | null => {
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (password.length > 128) {
    return "Mật khẩu không được quá 128 ký tự";
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  if (!hasLetter || !hasNumber || !hasSpecialChar) {
    return "Mật khẩu cần ít nhất một chữ cái, một số và một ký tự đặc biệt";
  }

  const isValidPasswordCharacter = (char: string): boolean => {
    const validChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]$/;
    return validChars.test(char);
  };

  for (let i = 0; i < password.length; i++) {
    if (!isValidPasswordCharacter(password[i])) {
      return `Mật khẩu chứa ký tự không hợp lệ: "${password[i]}". Chỉ cho phép chữ cái, số và các ký tự đặc biệt thông thường.`;
    }
  }

  return null;
  };

  const validateForm = () => {
  const { username, email, password, fullName } = formData;

  if (!selectedRole) {
    toast.error("Vui lòng chọn vai trò");
    return false;
  }

  if (!username.trim()) {
    toast.error("Tên đăng nhập không được để trống");
    return false;
  }

  if (username.trim().length < 3) {
    toast.error("Tên đăng nhập phải có ít nhất 3 ký tự");
    return false;
  }

  if (!fullName.trim()) {
    toast.error("Tên đầy đủ không được để trống");
    return false;
  }

  if (!email.trim()) {
    toast.error("Email không được để trống");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    toast.error("Email không hợp lệ");
    return false;
  }

  if (!password.trim()) {
    toast.error("Mật khẩu không được để trống");
    return false;
  }

  const passwordError = validatePasswordComplexity(password.trim());
  if (passwordError) {
    toast.error(passwordError);
    return false;
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

      const createData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: getRoleNumber(selectedRole),
        account_status: Number(formData.account_status),
        fullName: formData.fullName.trim(),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi tạo người dùng");
      }

      await response.json();

      toast.success("Tạo người dùng thành công!");
      
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        account_status: 0,
      });
      setSelectedRole("");
      
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
              console.error("Lỗi khi tạo người dùng:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi tạo người dùng"
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

  const canCreateAdmin = currentUser && Number(currentUser.role) >= 1;

  if (fetchLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Đang tải...</h1>
        </div>
      </main>
    );
  }

  if (!canCreateAdmin) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Không có quyền truy cập</h1>
          <p style={{ color: "#666", margin: "10px 0" }}>
            Chỉ quản trị viên cấp cao mới có thể tạo tài khoản quản trị viên.
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
        <h1 className={styles.title}>
          {currentUser && Number(currentUser.role) == 2 ? "Tạo quản trị viên mới" : "Thêm người dùng mới"}
        </h1>
        <button className={styles.returnButton} onClick={handleReturn}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Vai trò <span style={{color: "red"}}>*</span></label>
          <select
            className={styles.select}
            value={selectedRole}
            onChange={handleRoleChange}
            
          >
            <option value="">--- Chọn vai trò ---</option>
            {currentUser && Number(currentUser.role) == 2 && (
              <option value="moderator">Quản trị viên</option>
            )}
            <option value="user">Người dùng</option>
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
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tên đầy đủ <span style={{color: "red"}}>*</span></label>
          <input
            type="text"
            name="fullName"
            className={styles.input}
            placeholder="Nhập tên đầy đủ..."
            value={formData.fullName}
            onChange={handleInputChange}
            
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email <span style={{color: "red"}}>*</span></label>
          <input
            type="email"
            name="email"
            className={styles.input}
            placeholder="Nhập email..."
            value={formData.email}
            onChange={handleInputChange}
            
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu <span style={{color: "red"}}>*</span></label>
          <div className="position-relative">
            <input
            type={showPassword ? "text" : "password"}
            name="password"
            className={styles.input}
            placeholder="Nhập mật khẩu..."
            value={formData.password}
            onChange={handleInputChange}
            
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
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              {currentUser && Number(currentUser.role) == 2 ? (
                <>
                  <li>Chỉ có thể tạo tài khoản quản trị viên, không thể tạo quản trị viên cấp cao</li>
                  <li>Tài khoản mặc định sẽ bị khóa, cần kích hoạt thủ công</li>
                </>
              ) : (
                <li>Chỉ có thể tạo tài khoản người dùng thường</li>
              )}
              <li>Username và email phải duy nhất trong hệ thống</li>
              <li>Tên đầy đủ là bắt buộc</li>
              <li>Mật khẩu phải có ít nhất 6 kí tự</li>
            </ul>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.createButton}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
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

export default AddUser;
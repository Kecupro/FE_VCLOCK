"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../assets/css/add.module.css";

interface IUser {
  _id: string;
  username: string;
  email: string;
  role: 0 | 1 | 2;
  account_status: 0 | 1;
  fullName: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

const AddUser = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

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

        const response = await fetch("http://localhost:3000/check-role", {
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

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error("Tên đăng nhập không được để trống");
      return false;
    }

    if (formData.username.trim().length < 3) {
      toast.error("Tên đăng nhập phải có ít nhất 3 ký tự");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email không được để trống");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Email không hợp lệ");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Mật khẩu không được để trống");
      return false;
    }

    if (formData.password.trim().length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (!formData.fullName.trim()) {
      toast.error("Tên đầy đủ không được để trống");
      return false;
    }

    if (!selectedRole) {
      toast.error("Vui lòng chọn vai trò");
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

      		console.log("Đang gửi dữ liệu tạo:", createData);

      const response = await fetch("http://localhost:3000/api/admin/user/add", {
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

      const result = await response.json();
      		console.log("Phản hồi tạo người dùng:", result);

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
              console.error("Lỗi tạo người dùng:", error);
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

  const canCreateAdmin = currentUser && Number(currentUser.role) === 2;

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
        <h1 className={styles.title}>Tạo quản trị viên mới</h1>
        <button className={styles.returnButton} onClick={handleReturn}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Vai trò *</label>
          <select
            className={styles.select}
            value={selectedRole}
            onChange={handleRoleChange}
            required
          >
            <option value="">--- Chọn vai trò ---</option>
            <option value="moderator">Quản trị viên</option>
          </select>
          <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
            Chỉ có thể tạo quản trị viên hoặc người dùng (không thể tạo quản trị viên cấp cao)
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tên đăng nhập *</label>
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
          <label className={styles.label}>Tên đầy đủ *</label>
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
          <label className={styles.label}>Email *</label>
          <input
            type="email"
            name="email"
            className={styles.input}
            placeholder="Nhập email..."
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu *</label>
          <input
            type="password"
            name="password"
            className={styles.input}
            placeholder="Nhập mật khẩu..."
            value={formData.password}
            onChange={handleInputChange}
            minLength={6}
            required
          />
          <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
            Mật khẩu phải có ít nhất 6 ký tự
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái tài khoản *</label>
          <select
            className={styles.select}
            name="account_status"
            value={formData.account_status}
            onChange={handleInputChange}
          >
            <option value={0}>Bị khóa</option>
            <option value={1}>Hoạt động</option>
          </select>
          <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
            Tài khoản mặc định sẽ bị khóa sau khi tạo
          </p>
        </div>

        <div className={styles.formGroup}>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              padding: "15px",
              margin: "15px 0",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#495057",
                fontSize: "14px",
              }}
            >
              📋 Thông tin quan trọng:
            </h4>
            <ul
              style={{
                margin: "0",
                paddingLeft: "20px",
                color: "#666",
                fontSize: "13px",
              }}
            >
              <li>Chỉ có thể tạo tài khoản quản trị viên (role = 1)</li>
              <li>Không thể tạo quản trị viên cấp cao (role = 2)</li>
              <li>Tài khoản mặc định sẽ bị khóa, cần kích hoạt thủ công</li>
              <li>Username và email phải duy nhất trong hệ thống</li>
              <li>Tên đầy đủ là bắt buộc</li>
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
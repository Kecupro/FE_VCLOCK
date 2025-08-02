"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../../assets/css/add.module.css";

interface IAddress {
  _id: string;
  user_id: string;
  receiver_name: string;
  phone: number;
  address: string;
  created_at?: Date;
  updated_at: Date;
}

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
  addresses?: IAddress[];
}

const EditUser = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [activeImageTab, setActiveImageTab] = useState("preview");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressAction, setAddressAction] = useState<"select" | "edit">(
    "select"
  );

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

    if (!hasLetter || !hasNumber) {
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

        const response = await fetch("https://bevclock-production.up.railway.app/check-role", {
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
        console.error("Error fetching current user:", error);
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
          `https://bevclock-production.up.railway.app/api/admin/user/${userId}`,
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

          if (userData.addresses && userData.addresses.length > 0) {
            setSelectedAddressId(userData.addresses[0]._id);
          }

          if (userData.avatar) {
            setActiveImageTab("preview");
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Không thể tải thông tin người dùng");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Lỗi khi tải thông tin người dùng");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUser();
  }, [userId, currentUser]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  const getImageSrc = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === "") {
      return "/images/avatar-default.png";
    }
    
    // Nếu avatar bắt đầu bằng http (Google, Facebook, etc.) thì sử dụng trực tiếp
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu là đường dẫn tương đối bắt đầu bằng /
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Nếu chỉ là tên file, thêm prefix đường dẫn uploads/avatars
    return `https://bevclock-production.up.railway.app/uploads/avatars/${imagePath}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận các file ảnh (JPEG, PNG, GIF, WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);

      setSelectedFile(file);
      setActiveImageTab("preview");
    }
  };

  const handleImageTabClick = (tab: string) => {
    setActiveImageTab(tab);
    if (tab === "upload") {
      const fileInput = document.getElementById(
        "userFileInput"
      ) as HTMLInputElement;
      fileInput?.click();
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);

    if (newRole !== "user") {
      setSelectedAddressId("");
      setAddressAction("select");
      setFormData((prev) => ({
        ...prev,
        phone: "",
        address: "",
        receiver_name: "",
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "password") {
      const sanitizedPassword = sanitizePassword(value);
      if (sanitizedPassword !== value) {
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

  const handleAddressSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "") {
      setAddressAction("select");
      setSelectedAddressId("");
      setFormData((prev) => ({
        ...prev,
        phone: "",
        address: "",
        receiver_name: "",
      }));
    } else {
      setAddressAction("edit");
      setSelectedAddressId(value);

      const selectedAddress = userToEdit?.addresses?.find(
        (addr) => addr._id === value
      );
      if (selectedAddress) {
        setFormData((prev) => ({
          ...prev,
          phone: selectedAddress.phone.toString(),
          address: selectedAddress.address,
          receiver_name: selectedAddress.receiver_name,
        }));
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

    if (
      selectedRole === "user" &&
      addressAction === "edit" &&
      formData.phone &&
      !/^\d{10,11}$/.test(formData.phone)
    ) {
      toast.error("Số điện thoại không hợp lệ (10-11 chữ số)");
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

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      console.log(
        "Sending FormData with image:",
        selectedFile ? selectedFile.name : "No image"
      );

      const userResponse = await fetch(
        `https://bevclock-production.up.railway.app/api/admin/user/edit/${userId}`,
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


      if (
        selectedRole === "user" &&
        addressAction === "edit" &&
        selectedAddressId
      ) {
        try {
          const addressData: { phone?: number; address?: string; receiver_name?: string } = {};
          let hasAddressData = false;

          if (formData.phone && formData.phone.trim()) {
            const phoneNumber = parseInt(formData.phone.trim());
            if (!isNaN(phoneNumber)) {
              addressData.phone = phoneNumber;
              hasAddressData = true;
            }
          }

          if (formData.address && formData.address.trim()) {
            addressData.address = formData.address.trim();
            hasAddressData = true;
          }

          if (formData.receiver_name && formData.receiver_name.trim()) {
            addressData.receiver_name = formData.receiver_name.trim();
            hasAddressData = true;
          }

          if (hasAddressData) {
            const endpoint = `https://bevclock-production.up.railway.app/api/admin/user/addresses/${selectedAddressId}`;

            const addressResponse = await fetch(endpoint, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(addressData),
            });

            if (!addressResponse.ok) {
              const addressError = await addressResponse.json();
              console.error("Address API Error:", addressError);
              toast.error("Không thể cập nhật địa chỉ");
            }
          }
        } catch (error) {
          console.error("Error updating address:", error);
          toast.error("Lỗi khi cập nhật địa chỉ");
        }
      }

      toast.success("Cập nhật người dùng thành công!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
      console.error("Error updating user:", error);
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
    (Number(currentUser.role) === 2 ||
      (Number(currentUser.role) === 1 && Number(userToEdit.role) === 0));

  const canChangeRole = currentUser && Number(currentUser.role) === 2;

  const canEditAccountStatus =
    currentUser &&
    userToEdit &&
    (Number(currentUser.role) === 2 ||
      (Number(currentUser.role) === 1 && Number(userToEdit.role) === 0));

  if (fetchLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Đang tải...</h1>
        </div>
      </main>
    );
  }

  if (!canEditUser || !canEditThisUser) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Không có quyền truy cập</h1>
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Vai trò *</label>
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
            {canChangeRole && (
              <option value="admin">Quản trị viên cấp cao</option>
            )}
          </select>
          {!canChangeRole && (
            <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
              Chỉ có quản trị viên cấp cao mới có thể thay đổi vai trò
            </p>
          )}
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
            style={{ backgroundColor: "#f5f5f5" }}
          />
          <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
            Email không thể chỉnh sửa
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu mới</label>
          <input
            type="password"
            name="password"
            className={styles.input}
            placeholder="Để trống nếu không muốn thay đổi..."
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handlePasswordBlur}
            minLength={6}
            maxLength={40}
          />
          <div style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
            <p style={{ margin: "0 0 3px 0" }}>
              Để trống nếu không muốn thay đổi mật khẩu
            </p>
            <p style={{ margin: "0" }}>
              Mật khẩu phải có 6-40 ký tự, bao gồm chữ cái, số và có thể có ký
              tự đặc biệt
            </p>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái tài khoản *</label>
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
          {!canEditAccountStatus && (
            <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
              Bạn không có quyền thay đổi trạng thái tài khoản này
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh đại diện</label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button
                type="button"
                className={`${styles.imageTab} ${
                  activeImageTab === "upload" ? styles.imageTabActive : ""
                }`}
                onClick={() => handleImageTabClick("upload")}
              >
                Tải lên ảnh mới
              </button>
            </div>

            {activeImageTab === "preview" && (
              <div
                className={styles.imagePreview}
                style={{ margin: "10px 0 0 5px" }}
              >
                {selectedFile ? (
                  <>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                      Ảnh mới đã chọn: {selectedFile.name}
                    </p>
                    <img
                      src={previewUrl}
                      alt="New avatar preview"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        marginTop: "10px",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/avatar-default.png"; 
                        target.onerror = null; 
                      }}
                    />
                  </>
                ) : formData.currentImage ? (
                  <>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                      Ảnh hiện tại:
                    </p>
                    <img
                      src={getImageSrc(formData.currentImage)}
                      alt="Current avatar"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        marginTop: "10px",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/avatar-default.png"; 
                        target.onerror = null; 
                      }}
                    />
                  </>
                ) : (
                  <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                    Chưa có ảnh đại diện
                  </p>
                )}
              </div>
            )}

            <input
              id="userFileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {selectedRole === "user" &&
          userToEdit?.addresses &&
          userToEdit.addresses.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Chỉnh sửa địa chỉ</label>
              <select
                className={styles.select}
                value={selectedAddressId}
                onChange={handleAddressSelection}
              >
                <option value="">--- Chọn địa chỉ để chỉnh sửa ---</option>
                {userToEdit.addresses.map((address) => (
                  <option key={address._id} value={address._id}>
                    {address.receiver_name} - {address.phone} -{" "}
                    {address.address}
                  </option>
                ))}
              </select>

              {addressAction === "edit" && selectedAddressId && (
                <div
                  style={{
                    marginTop: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <h4
                      style={{ margin: "0", fontSize: "16px", color: "#333" }}
                    >
                      Chỉnh sửa địa chỉ
                    </h4>
                  </div>

                  <div style={{ padding: "15px" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              width: "150px",
                              verticalAlign: "top",
                            }}
                          >
                            Tên người nhận:
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              name="receiver_name"
                              className={styles.input}
                              placeholder="Nhập tên người nhận..."
                              value={formData.receiver_name}
                              onChange={handleInputChange}
                              style={{ width: "100%", margin: "0" }}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              verticalAlign: "top",
                            }}
                          >
                            Số điện thoại:
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="tel"
                              name="phone"
                              className={styles.input}
                              placeholder="Nhập số điện thoại..."
                              value={formData.phone}
                              onChange={handleInputChange}
                              pattern="[0-9]{10,11}"
                              style={{ width: "100%", margin: "0" }}
                            />
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                margin: "5px 0 0 0",
                              }}
                            >
                              Nhập 10-11 chữ số
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              verticalAlign: "top",
                            }}
                          >
                            Địa chỉ:
                          </td>
                          <td style={{ padding: "8px" }}>
                            <textarea
                              name="address"
                              className={styles.textarea}
                              placeholder="Nhập địa chỉ..."
                              rows={3}
                              value={formData.address}
                              onChange={handleInputChange}
                              style={{ width: "100%", margin: "0" }}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        {selectedRole === "user" &&
          (!userToEdit?.addresses || userToEdit.addresses.length === 0) && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Địa chỉ</label>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  fontStyle: "italic",
                  margin: "0",
                }}
              >
                Người dùng này chưa có địa chỉ nào.
              </p>
            </div>
          )}

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

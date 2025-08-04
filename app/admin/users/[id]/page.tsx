'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import styles from '../../assets/css/detail.module.css';

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
  fullName: string;
  email: string;
  role: number;
  account_status: number;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  addresses?: IAddress[];
}

const UserDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { isDarkMode } = useAppContext();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (id) {
      checkUserRole();
    }
  }, [id]);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token không tồn tại');
      }

      const response = await fetch('https://bevclock-production.up.railway.app/check-role', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        const userRole = Number(data.user.role);
        setCurrentUserRole(userRole);
        
        if (userRole >= 1) {
          setHasPermission(true);
          await fetchUserDetail();
        } else {
          setHasPermission(false);
          setError('Bạn không có quyền xem thông tin này');
        }
      } else {
        setError('Lỗi xác thực quyền truy cập');
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra role:', error);
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token không tồn tại');
      }

      const response = await fetch(`https://bevclock-production.up.railway.app/api/admin/user/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data) {
        const userData = {
          ...data,
          role: Number(data.role),
          account_status: Number(data.account_status),
          fullName: data.fullName || 'Chưa cập nhật' 
        };
        setUser(userData);
      } else {
        setError('Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết người dùng:', error);
      setError('Lỗi kết nối, vui lòng thử lại');
    }
  };

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar || avatar.trim() === "") {
      return "/images/avatar-default.png";
    }
    
    // Nếu avatar bắt đầu bằng http (Google, Facebook, etc.) thì sử dụng trực tiếp
    if (avatar.startsWith('http')) {
      return avatar; // Bỏ timestamp để tránh reload liên tục
    }
    
    // Nếu là đường dẫn tương đối bắt đầu bằng /
    if (avatar.startsWith('/')) {
      return avatar;
    }
    
    // Nếu chỉ là tên file, thêm prefix đường dẫn uploads/avatars
    const avatarUrl = `https://bevclock-production.up.railway.app/uploads/avatars/${avatar}`;
    return avatarUrl; // Bỏ timestamp để tránh reload liên tục
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  const AvatarDisplay = ({ user }: { user: IUser }) => {
    const avatarUrl = getAvatarUrl(user.avatar);
    
    if (!avatarUrl || imageError) {
      return (
        <div
          style={{
            width: '110px',
            height: '100px',
            borderRadius: '100px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e5e7eb'
          }}
        >
          <User size={40} color="#9ca3af" />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        {imageLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '110px',
              height: '100px',
              borderRadius: '100px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #e5e7eb'
            }}
          >
            <div className={styles.loadingSpinner}></div>
          </div>
        )}
        <img
          src={avatarUrl}
          alt={`Avatar của ${user.fullName}`}
          style={{
            width: '110px',
            height: '100px',
            borderRadius: '100px',
            objectFit: 'cover',
            border: '2px solid #e5e7eb',
            display: imageLoading ? 'none' : 'block'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  const getRoleText = (role: number) => {
    const roleNum = Number(role);
    switch (roleNum) {
      case 0: return 'Khách hàng';
      case 1: return 'Quản trị viên';
      case 2: return 'Quản trị viên cấp cao';
      default: return `Không xác định (${roleNum})`;
    }
  };

  const getStatusText = (status: number) => {
    const statusNum = Number(status);
    return statusNum === 1 ? 'Đang hoạt động' : 'Bị khóa';
  };

  const getStatusColor = (status: number) => {
    const statusNum = Number(status);
    return statusNum === 1 ? '#22c55e' : '#ef4444';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h3>Không có quyền truy cập</h3>
          <p>Bạn không có quyền xem thông tin chi tiết người dùng.</p>
          <p>Vai trò hiện tại: {getRoleText(currentUserRole)}</p>
          <p>Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
          <button 
            onClick={() => router.push('/admin')}
            className={styles.returnButton}
          >
            <ArrowLeft size={16} />
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error || 'Không tìm thấy người dùng'}</p>
          <button 
            onClick={() => router.push('/admin/users')}
            className={styles.returnButton}
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chi tiết người dùng</h1>
        <div className={styles.headerRight}>
          <button 
            onClick={() => router.push('/admin/users')}
            className={styles.returnButton}
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </button>
        </div>
      </div>

      <div className={styles.productDetails}>
        <div className={styles.detailSection}>
          <div className={styles.productImage} style={{ marginBottom: '50px'}}>
            <AvatarDisplay user={user} />
            <div className={styles.productInfo} style={{ marginTop: '10px', marginLeft: '100px'}}>
              <h2 className={styles.productName}>{user.fullName}
                <span 
                  className={user.account_status === 1 ? styles.statusActive : styles.statusInactive}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getStatusColor(user.account_status),
                    backgroundColor: user.account_status === 1 ? '#dcfce7' : '#fee2e2'
                  }}
                >
                  {getStatusText(user.account_status)}
                </span>
              </h2>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Thông tin chi tiết</h3>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>ID người dùng:</span>
            <span className={styles.detailValue}>{user._id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Họ và tên:</span>
            <span className={styles.detailValue}>{user.fullName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Tên đăng nhập:</span>
            <span className={styles.detailValue}>{user.username}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email:</span>
            <span className={styles.detailValue}>{user.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Vai trò:</span>
            <span className={styles.detailValue} style={{ fontWeight: '600' }}>
              {getRoleText(user.role)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Trạng thái tài khoản:</span>
            <span 
              className={styles.detailValue}
              style={{ 
                color: getStatusColor(user.account_status),
                fontWeight: '600'
              }}
            >
              {getStatusText(user.account_status)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Ngày tạo:</span>
            <span className={styles.detailValue}>{formatDate(user.created_at)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Cập nhật lần cuối:</span>
            <span className={styles.detailValue}>{formatDate(user.updated_at)}</span>
          </div>
        </div>

        {user.addresses && user.addresses.length > 0 && (
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Địa chỉ ({user.addresses.length})</h3>
            {user.addresses.map((address, index) => (
              <div key={address._id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Địa chỉ {index + 1}
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên người nhận:</span>
                  <span className={styles.detailValue}>{address.receiver_name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Số điện thoại:</span>
                  <span className={styles.detailValue}>{address.phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Địa chỉ:</span>
                  <span className={styles.detailValue}>{address.address}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Ngày tạo:</span>
                  <span className={styles.detailValue}>
                    {formatDate(address.updated_at.toString())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!user.addresses || user.addresses.length === 0) && (
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Địa chỉ</h3>
            <div className={styles.contentBox}>
              <p className={styles.contentText}>Người dùng chưa có địa chỉ nào.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;
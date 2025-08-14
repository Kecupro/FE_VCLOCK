"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import styles from "../../assets/css/detail.module.css";
import { useAppContext } from "../../../context/AppContext";
import { IBrand } from "@/app/(site)/cautrucdata";
const BrandDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useAppContext();
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles["dark-mode"]);
    else html.classList.remove(styles["dark-mode"]);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchBrandDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const brandId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        if (!brandId) {
          throw new Error("Không tìm thấy ID thương hiệu");
        }
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/brand/${brandId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }
        );

        const data = await res.json();
        const brandData = data.data || data.brand || data;

        setBrand(brandData);
        setImageError(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin thương hiệu"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBrandDetail();
    } else {
      setError("Không tìm thấy ID thương hiệu");
      setLoading(false);
    }
  }, [params.id]);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Không có thông tin";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
      }
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const getImageUrl = (imagePath: string | undefined | null) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `/images/brand/${imagePath}`;
  };

  const handleEdit = () => {
    const brandId = Array.isArray(params.id) ? params.id[0] : params.id;
    router.push(`/admin/brands/editBrand/${brandId}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brand) return;

    setIsDeleting(true);
    try {
      const brandId = Array.isArray(params.id) ? params.id[0] : params.id;
      const deleteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/brand/xoa/${brandId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const deleteData = await deleteResponse.json();

      if (deleteResponse.ok) {
        toast.success(deleteData.thong_bao || "Xóa thương hiệu thành công!");
        setTimeout(() => {
          router.push("/admin/brands");
        }, 1500);
      } else {
        const errorMessage = deleteData.thong_bao || 
                            deleteData.error || 
                            deleteData.message || 
                            "Có lỗi xảy ra khi xóa thương hiệu";
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } catch {
      toast.error("Không thể kết nối đến server. Vui lòng thử lại!");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleBack = () => {
    router.push("/admin/brands");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={handleBack} className={styles.returnButton}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "red" }}>Không tìm thấy thương hiệu</p>
          <button onClick={handleBack} className={styles.returnButton}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(brand.image);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chi tiết thương hiệu</h1>
        <button className={styles.returnButton} onClick={handleBack}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      <div className={styles.form}>
        <div className={styles.productDetails}>
          <div className={styles.detailSection}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>
              Hình ảnh
            </h3>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={brand.alt || brand.name || "Brand image"}
                  width={200}
                  height={200}
                  style={{
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                  onError={handleImageError}
                  priority
                />
              ) : (
                <Image
                  src="/images/logo/logoV.png"
                  alt="Default brand image"
                  width={200}
                  height={200}
                  style={{
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  backgroundColor:
                    brand.brand_status == 0 ? "#10b981" : "#ef4444",
                  color: "white",
                }}
              >
                {brand.brand_status == 0 ? "Hoạt động" : "Dừng hoạt động"}
              </span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>
              Thông tin cơ bản
            </h3>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{brand._id || "Không có"}</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tên thương hiệu:</span>
              <span className={styles.detailValue}>{brand.name || "Không có tên"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mô tả:</span>
              <div className={styles.detailValue}>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: brand.description || "Không có mô tả" 
                  }}
                  style={{
                    maxWidth: '100%',
                    wordWrap: 'break-word'
                  }}
                />
              </div>
            </div>
          
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Alt text:</span>
              <span className={styles.detailValue}>
                {brand.alt || "Không có"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Trạng thái:</span>
              <span className={styles.detailValue}>
                {brand.brand_status == 0
                  ? "Hoạt động (0)"
                  : "Dừng hoạt động (1)"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày tạo:</span>
              <span className={styles.detailValue}>
                {formatDate(brand.created_at)}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày cập nhật:</span>
              <span className={styles.detailValue}>
                {formatDate(brand.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.createButton}
            onClick={handleEdit}
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleDeleteClick}
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xóa thương hiệu{" "}
                <strong>&quot;{brand?.name}&quot;</strong>
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

export default BrandDetailPage;
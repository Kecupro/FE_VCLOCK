"use client";



import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {ArrowLeft, Edit, Trash2, Calendar, Tag, Percent, Settings} from "lucide-react";
import Link from "next/link";
import styles from "../../assets/css/detailPro.module.css";
import { useAppContext } from "../../../context/AppContext";
import { IVoucher } from "@/app/(site)/cautrucdata";
import { ToastContainer, toast } from "react-toastify";

const VoucherDetailPage = () => {
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { isDarkMode } = useAppContext();

  const getStatus = (voucher: IVoucher): string => {
    const now = new Date();
    const start = new Date(voucher.start_date);
    const end = new Date(voucher.end_date);
  
    if (now < start) return "Sắp bắt đầu";
    if (now > end) return "Hết hạn";
    return "Còn hạn";
  };

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle(styles["dark-mode"], isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchVoucherDetail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher/${params?.id}`
        );
        const data = await res.json();
        setVoucher(data.voucher || data);
      } catch {
        toast.error("Không thể tải thông tin voucher");
      }
    };

    if (params?.id) {
      fetchVoucherDetail();
    }
  }, [params?.id]);

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Không hợp lệ";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Không hợp lệ"
      : date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);  

  const formatDiscountValue = (type: string, value: number) =>
    type == "percentage" ? `${value}%` : formatCurrency(value);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher/xoa/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Xóa thành công!");
        setTimeout(() => {
          router.push("/admin/vouchers");
        }, 1500);
      } else {
        toast.error(`Lỗi: ${data.error}`);
      }
    } catch {
      toast.error("Lỗi khi xóa voucher!");
    } finally {
      setShowModal(false);
      setDeletingId(null);
    }
  };

  const handleBack = () => router.push("/admin/vouchers");

  if (!voucher) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chi tiết mã khuyến mãi</h1>
        <button className={styles.returnButton} onClick={handleBack}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      <div className={styles.form}>
        <div className={styles.productDetails}>

          {/* Thông tin cơ bản */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <Tag size={18} /> &nbsp;Thông tin cơ bản
            </h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{voucher._id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tên mã khuyến mãi:</span>
              <span className={styles.detailValue}>{voucher.voucher_name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mã khuyến mãi:</span>
              <span className={styles.detailValue}>{voucher.voucher_code}</span>
            </div>
          </div>

          {/* Thông tin giảm giá */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <Percent size={18} /> &nbsp;Thông tin giảm giá
            </h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Loại giảm giá:</span>
              <span className={styles.detailValue}>
                {voucher.discount_type == "percentage"
                  ? "Giảm phần trăm (%)"
                  : "Giảm số tiền cố định (đ)"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Giá trị giảm giá:</span>
              <span className={styles.detailValue}>
                {formatDiscountValue(voucher.discount_type, voucher.discount_value)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Giá trị tối thiểu đơn hàng:</span>
              <span className={styles.detailValue}>
                {formatCurrency(voucher.minimum_order_value ?? 0)}
              </span>
            </div>
            {(voucher.max_discount ?? 0) > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Giảm giá tối đa:</span>
                <span className={styles.detailValue}>
                  {formatCurrency(voucher.max_discount ?? 0)}
                </span>
              </div>
            )}
          </div>

          {/* Thời gian hiệu lực */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <Calendar size={18} /> &nbsp;Thời gian hiệu lực
            </h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày bắt đầu:</span>
              <span className={styles.detailValue}>{formatDate(voucher.start_date)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày hết hạn:</span>
              <span className={styles.detailValue}>{formatDate(voucher.end_date)}</span>
            </div>
          </div>

          {/* Hệ thống */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <Settings size={18} /> &nbsp;Thông tin hệ thống
            </h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày tạo:</span>
              <span className={styles.detailValue}>{formatDate(voucher.created_at)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày cập nhật:</span>
              <span className={styles.detailValue}>{formatDate(voucher.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Hiệu lực trạng thái */}
        <div className={styles.statusSection}>
          <div className={styles.statusLabel}>Trạng thái mã khuyến mãi</div>
          <span className={`${styles.statusBadge}`}>
            {(() => {
              const status = getStatus(voucher);
              const statusClass =
                status == "Còn hạn"
                  ? styles.statusInStock
                  : status == "Hết hạn"
                  ? styles.statusOutOfStock
                  : styles.statusUpcoming;
            
              return <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>;
            })()}
          </span>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <Link href={`editVoucher/?id=${voucher._id}`}>
            <button className={styles.createButton}>
              <Edit size={16} /> Chỉnh sửa
            </button>
          </Link>
          <button className={styles.cancelButton} onClick={() => handleDeleteClick(voucher._id)}>
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}><h3>Xác nhận xóa</h3></div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xóa voucher{" "}
                <strong>&quot;{voucher?.voucher_name}&quot;</strong> không?
              </p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>
                Lưu ý: Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalcancelButton} onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className={styles.deleteButton} onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default VoucherDetailPage;

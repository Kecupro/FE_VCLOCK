"use client";



import React, { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import styles from "../assets/css/all.module.css";
import Link from "next/link";
import { useAppContext } from "../../context/AppContext";
import { IVoucher } from "@/app/(site)/cautrucdata";
import { ToastContainer, toast } from "react-toastify";

const VouchersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [total, setTotal] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const limit = 16;

  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { isDarkMode } = useAppContext();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add(styles['dark-mode']);
    } else {
      html.classList.remove(styles['dark-mode']);
    }
  }, [isDarkMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption, showModal]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher?page=${currentPage}&limit=${limit}&searchTerm=${encodeURIComponent(searchTerm)}&statusFilter=${statusFilter}&sort=${sortOption}`
        );
        const data = await res.json();
        let filteredList = data.list || [];

        if (statusFilter !== 'all') {
          filteredList = filteredList.filter((voucher: IVoucher) => getStatus(voucher) === statusFilter);
        }

        setVouchers(filteredList);
        setTotal(filteredList.length);
      } catch {
        toast.error("Lỗi khi tải dữ liệu voucher!");
      }
    };
    fetchVouchers();
  }, [currentPage, searchTerm, statusFilter, sortOption, showModal]);

  const deletingCategory = vouchers.find((cat) => cat._id == deletingId);

  const getStatus = (voucher: IVoucher): string => {
    const now = new Date();
    const start = new Date(voucher.start_date);
    const end = new Date(voucher.end_date);

    if (now < start) return "Sắp bắt đầu";
    if (now > end) return "Hết hạn";
    return "Còn hạn";
  };

  const formatDiscount = (voucher: IVoucher) =>
    voucher.discount_type == "fixed"
      ? `${voucher.discount_value.toLocaleString("vi-VN")}đ`
      : `${voucher.discount_value}%`;

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortOption('newest');
    toast.info("Đã đặt lại bộ lọc!");
  };

  const totalPages = Math.ceil(total / limit);
  const maxPagesToShow = 5;
  const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow + 1));
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

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
        setVouchers((prev) => prev.filter((v) => v._id != deletingId));
      } else {
        toast.error(`Lỗi: ${data.error}`);
      }
    } catch {
      toast.error("Không thể xóa voucher.");
    } finally {
      setShowModal(false);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mã Khuyến Mãi</h1>
        <Link href="/admin/vouchers/addVoucher">
          <button className={styles.addButton}>
            <Plus size={16} /> Thêm mới
          </button>
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tìm kiếm</label>
            <div style={{ position: "relative" }}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">Tất cả</option>
              <option value="Còn hạn">Còn hạn</option>
              <option value="Hết hạn">Hết hạn</option>
              <option value="Sắp bắt đầu">Sắp bắt đầu</option>
            </select>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Sắp xếp theo</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.select}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>STT</th>
                <th>Tên mã</th>
                <th>Mã</th>
                <th>Giá trị</th>
                <th>Bắt đầu</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length > 0 ? (
                vouchers.map((voucher, index) => (
                  <tr key={voucher._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{(currentPage - 1) * limit + index + 1}</td>
                    <td className={styles.tableCell}>{voucher.voucher_name}</td>
                    <td className={styles.tableCell}>{voucher.voucher_code}</td>
                    <td className={styles.tableCell}>{formatDiscount(voucher)}</td>
                    <td className={styles.tableCell}>
                      {voucher.start_date
                        ? new Date(voucher.start_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "---"}
                    </td>
                    <td className={styles.tableCell}>

                      {voucher.end_date
                        ? new Date(voucher.end_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "---"}
                    </td>
                    <td className={styles.tableCell}>
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
                    </td>

                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                        <Link href={`/admin/vouchers/${voucher._id}`}>
                          <button className={styles.actionButton}><Eye size={16} /></button>
                        </Link>
                        <Link href={`/admin/vouchers/editVoucher?id=${voucher._id}`}>
                          <button className={styles.actionButton}><Edit size={16} /></button>
                        </Link>
                        <button className={styles.actionButton} onClick={() => handleDeleteClick(voucher._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className={styles.tableCell}>Không có mã khuyến mãi nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị {(currentPage - 1) * limit + 1}&nbsp;đến&nbsp;
            {Math.min(currentPage * limit, total)} trong {total} voucher
          </div>
          <div className={styles.paginationButtons}>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(1)} className={styles.paginationButton}>Trang đầu</button>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(currentPage - 1)} className={styles.paginationButton}>&laquo;</button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <button
                key={page}
                className={`${styles.paginationButton} ${currentPage == page ? styles.paginationButtonActive : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button disabled={currentPage == totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={styles.paginationButton}>&raquo;</button>
            <button onClick={() => setCurrentPage(totalPages)} className={styles.paginationButton}>Trang cuối</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}><h3>Xác nhận xóa</h3></div>
            <div className={styles.modalBody}>
              <p>Bạn có chắc chắn muốn xóa mã khuyến mãi <strong>&quot;{deletingCategory?.voucher_name}&quot;</strong> này không?</p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>Lưu ý: Hành động này không thể hoàn tác!</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalcancelButton} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.deleteButton} onClick={confirmDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default VouchersPage;

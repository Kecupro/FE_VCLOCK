"use client";



import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../assets/css/all.module.css';
import { useAppContext } from '../../context/AppContext';
import { ICategory } from '@/app/(site)/cautrucdata';
import { ToastContainer, toast } from 'react-toastify';

const CategoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [total, setTotal] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const limit = 9;

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
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/admin/categoryProduct?page=${currentPage}&limit=${limit}&searchTerm=${encodeURIComponent(searchTerm)}&statusFilter=${statusFilter}&sort=${sortOption}`
        );
        const data = await res.json();
        setCategories(data.list || []);
        setTotal(data.total || 0);
      } catch {
        toast.error("Lỗi khi tải danh mục sản phẩm!");
      }
    };

    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, sortOption, showModal]);

  const deletingCategory = categories.find((cat) => cat._id == deletingId);

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter == 'all' || String(category.category_status) == statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      const res = await fetch(`http://localhost:3000/api/admin/categoryProduct/xoa/${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Xóa thành công!');
        setCategories((prev) => prev.filter((cat) => cat._id != deletingId));
      } else {
        toast.error(`Lỗi: ${data.error}`);
      }
    } catch {
      toast.error('Lỗi khi xóa danh mục sản phẩm');
    } finally {
      setShowModal(false);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Danh mục sản phẩm</h1>
        <Link href={`categories-product-list/addCatePro`}>
          <button className={styles.addButton}>
            <Plus size={16} /> Thêm danh mục sản phẩm
          </button>
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tìm kiếm</label>
            <div style={{ position: 'relative' }}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Tìm Alt hình ảnh..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Dừng hoạt động</option>
              <option value="0">Hoạt động</option>
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
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>STT</th>
                <th className={styles.tableHeaderCell}>Ảnh</th>
                <th className={styles.tableHeaderCell}>Alt (tên sẽ hiện nếu ảnh lỗi)</th>
                <th className={styles.tableHeaderCell}>Trạng thái</th>
                <th className={styles.tableHeaderCell}>Ngày tạo</th>
                <th className={styles.tableHeaderCell}>Ngày cập nhật gần nhất</th>
                <th className={styles.tableHeaderCell}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category: ICategory, index) => (
                <tr key={category._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{(currentPage - 1) * limit + index + 1}</td>
                  <td className={styles.tableCell}>
                    <Image style={{ margin: "0 auto" }}
                      src={
                        category.image?.startsWith('http')
                          ? category.image
                          : `/images/category/${category.image || 'no-image.png'}`
                      }
                      alt={category.alt || category.name}
                      width={60}
                      height={60}
                      className={styles.brandImage}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.brandName}>{category.name}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <span
                      className={`${styles.statusBadge} ${category.category_status == 0 ? styles.statusActive : styles.statusInactive}`}
                    >
                      {category.category_status == 0 ? 'Hoạt động' : 'Dừng hoạt động'}
                    </span>
                  </td>

                  <td className={styles.tableCell}>{category.created_at
                    ? new Date(category.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                    : '---'}</td>

                  <td className={styles.tableCell}>{category.updated_at
                    ? new Date(category.updated_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                    : '---'}</td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link href={`categories-product-list/editCatePro?id=${category._id}`}>
                        <button className={styles.actionButton}>
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteClick(category._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị {(currentPage - 1) * limit + 1}
            &nbsp;đến&nbsp;
            {Math.min(currentPage * limit, total)} trong {total} danh mục sản phẩm
          </div>

          <div className={styles.paginationButtons}>
            <button
              onClick={() => setCurrentPage(currentPage - currentPage + 1)}
              className={styles.paginationButton}
            >
              Trang đầu
            </button>

            <button
              disabled={currentPage == 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={styles.paginationButton}
            >
              &laquo;
            </button>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <button
                key={page}
                className={`${styles.paginationButton} ${currentPage == page ? styles.paginationButtonActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage == totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={styles.paginationButton}
            >
              &raquo;
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={styles.paginationButton}
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xóa danh mục <strong>&quot;{deletingCategory?.name}&quot;</strong> không?
              </p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>
                Lưu ý: Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalcancelButton}
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className={styles.deleteButton}
                onClick={confirmDelete}
              >
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

export default CategoryPage;

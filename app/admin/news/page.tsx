"use client";



import React, { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import styles from "../assets/css/all.module.css";
import { useAppContext } from "../../context/AppContext";
import { INews, ICateNews } from "@/app/(site)/cautrucdata";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [news, setNews] = useState<INews[]>([]);
  const [cateNewsgories, setCategoriesNews] = useState<ICateNews[]>([]);
  const [total, setTotal] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const limit = 7;

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
  }, [searchTerm, statusFilter, categoryFilter, sortOption, showModal]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/news?page=${currentPage}&limit=${limit}&searchTerm=${encodeURIComponent(searchTerm)}&statusFilter=${statusFilter}&categoryFilter=${encodeURIComponent(categoryFilter)}&sort=${sortOption}`
        );
        const data = await res.json();
        setNews(data.list);
        setTotal(data.total);
      } catch {
        toast.error("Lỗi khi tải dữ liệu tin tức!");
      }
    };

    fetchNews();
  }, [currentPage, searchTerm, statusFilter, categoryFilter, sortOption, showModal]);

  useEffect(() => {
    const fetchCateNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryNews`);
        const data = await res.json();
        setCategoriesNews(data.list || []);
      } catch {
        toast.error("Lỗi khi tải danh mục tin tức!");
      }
    };
    fetchCateNews();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/xoa/${deletingId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Xóa thành công!");
        setNews(prev => prev.filter(item => item._id != deletingId));
      } else {
        toast.error(`Lỗi: ${data.error}`);
      }
    } catch {
      toast.error("Lỗi khi xóa tin tức!");
    } finally {
      setShowModal(false);
      setDeletingId(null);
    }
  };

  const filteredNews = news.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter == 'all' || news.categorynews_id?._id == categoryFilter;
    const matchesStatus = statusFilter == 'all' || String(news.news_status) == statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortOption('newest');
    toast.info("Đã đặt lại bộ lọc!");
  };

  const totalPages = Math.ceil(total / limit);
  const maxPagesToShow = 5;
  const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow + 1));
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const deletingNews = news.find(item => item._id == deletingId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tin tức</h1>
        <Link href="news/addNew">
          <button className={styles.addButton}><Plus size={16} /> Thêm tin mới</button>
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tìm kiếm</label>
            <div style={{ position: "relative" }}>
              <Search className={styles.searchIcon} size={16} />
              <input type="text" placeholder="Tìm tiêu đề tin tức..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Danh mục</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.select}>
              <option value="all">Tất cả danh mục</option>
              {cateNewsgories.map(cate => <option key={cate._id} value={cate._id}>{cate.name}</option>)}
            </select>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Trạng thái</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.select}>
              <option value="all">Tất cả</option>
              <option value="0">Công khai</option>
              <option value="1">Bản nháp</option>
            </select>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Sắp xếp theo</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className={styles.select}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tiêu đề A-Z</option>
              <option value="name-desc">Tiêu đề Z-A</option>
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleReset}>Đặt lại</button>
        </div>
      </div>

      <div className={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ngày tạo</th>
                <th>Ngày cập nhật</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.map((item, index) => (
                <tr key={item._id} className={styles.tableRow}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td><Image src={item.image ? `/images/news/${item.image}` : `/images/logo/logoV.png`} alt={item.title} width={80} height={80} style={{ objectFit: "cover" }} /></td>
                  <td style={{ maxWidth: 200, wordBreak: "break-word" }}>{item.title}</td>
                  <td>{item.categorynews_id?.name || "Không có danh mục"}</td>
                  <td>{ new Date(item.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                  <td>{ new Date(item.updated_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                  <td>{item.views}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.news_status == 0 ? styles.statusActive : styles.statusInactive}`}>
                      {item.news_status == 0 ? "Công khai" : "Bản nháp"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`news/${item._id}`}><button className={styles.actionButton}><Eye size={16} /></button></Link>
                      <Link href={`news/editNew/?id=${item._id}`}><button className={styles.actionButton}><Edit size={16} /></button></Link>
                      <button className={styles.actionButton} onClick={() => handleDeleteClick(item._id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, total)} trong {total} tin tức
          </div>
          <div className={styles.paginationButtons}>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(1)} className={styles.paginationButton}>Trang đầu</button>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(currentPage - 1)} className={styles.paginationButton}>&laquo;</button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`${styles.paginationButton} ${currentPage == page ? styles.paginationButtonActive : ""}`}>{page}</button>
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
              <p>Bạn có chắc chắn muốn xóa bài viết <strong>&quot;{deletingNews?.title}&quot;</strong> không?</p>
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

export default NewsPage;
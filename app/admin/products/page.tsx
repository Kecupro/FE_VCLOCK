'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import styles from '../assets/css/all.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';
import { IProduct, ICategory, IBrand } from '@/app/(site)/cautrucdata';
import { ToastContainer, toast } from 'react-toastify';

const ProductsPage = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, sortOption, showModal]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/categoryProduct`);
        const data = await res.json();
        setCategories(data.list || []);
      } catch {
        toast.error('Lỗi khi tải danh mục!');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/brand`);
        const data = await res.json();
        setBrands(data.list || []);
      } catch {
        toast.error('Lỗi khi tải thương hiệu!');
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          searchTerm,
          brandFilter,
          statusFilter,
          categoryFilter,
          sort: sortOption
        });
        const res = await fetch(`http://localhost:3000/api/admin/product?${params}`);
        const data = await res.json();
        setProducts(data.list || []);
        setTotal(data.total || 0);
      } catch {
        toast.error("Lỗi khi tải sản phẩm!");
      }
    };
    fetchProducts();
  }, [currentPage, searchTerm, statusFilter, categoryFilter, brandFilter, sortOption, showModal]);

  const handleReset = () => {
    setSearchTerm('');
    setBrandFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortOption('newest');
    toast.info("Đã đặt lại bộ lọc!");
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/product/xoa/${deletingId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Xóa thành công!");
        setProducts(prev => prev.filter(item => item._id != deletingId));
      } else {
        toast.error(`Lỗi: ${data.error}`);
      }
    } catch {
      toast.error("Lỗi khi xóa sản phẩm!");
    } finally {
      setShowModal(false);
      setDeletingId(null);
    }
  };

  const formatCurrency = (num: number) => {
    return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const totalPages = Math.ceil(total / limit);
  const maxPagesToShow = 5;
  const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow + 1));
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const deletingProduct = products.find(item => item._id == deletingId);

  return (
  <div className={styles.container}>
    <div className={styles.header}>
      <h1 className={styles.title}>Sản phẩm</h1>
              <Link href="/admin/products/addProduct">
        <button className={styles.addButton}>
          <Plus size={16} /> Thêm sản phẩm
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
              placeholder="Tìm tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterGroupFixed}>
          <label className={styles.label}>Danh mục</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.select}>
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroupFixed}>
          <label className={styles.label}>Thương hiệu</label>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={styles.select}>
            <option value="all">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroupFixed}>
          <label className={styles.label}>Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">Tất cả</option>
            <option value="1">Còn hàng</option>
            <option value="0">Hết hàng</option>
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

        <button className={styles.resetButton} onClick={handleReset}>Đặt lại</button>
      </div>
    </div>

    <div className={styles.card}>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Hình ảnh</th>
              <th>Giá</th>
              <th>Giảm giá</th>
              <th>Số lượng</th>
              <th>Lượt xem</th>
              <th>Thương hiệu</th>
              <th>Danh mục</th>
              <th>Đã bán</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product._id} className={styles.tableRow}>
                <td>{(currentPage - 1) * limit + index + 1}</td>
                <td className={styles.cell}>
                  <div className={styles.lineclamp2}>{product.name}</div>
                </td>
                <td>
                  {product.main_image?.image ? (
                    <Image
                      src={`/images/product/${product.main_image.image}`}
                      alt={product.main_image.alt || product.name}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>
                <td>{formatCurrency(product.price)}</td>
                <td>{formatCurrency(product.sale_price)}</td>
                <td>{product.quantity}</td>
                <td>{product.views}</td>
                <td>{typeof product.brand_id == 'object' && 'name' in product.brand_id ? product.brand_id.name : '---'}</td>
                <td>
                  {Array.isArray(product.categories) && product.categories.length > 0
                    ? product.categories.map((c) => c.name).join(', ')
                    : '---'}
                </td>
                <td>{product.sold ?? 0}</td>
                <td>
                  <span className={`${styles.statusBadge} ${product.quantity == 0 ? styles.statusOutOfStock : styles.statusInStock}`}>
                    {product.quantity == 0 ? 'Hết hàng' : 'Còn hàng'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/products/${product._id}`}>
                      <button className={styles.actionButton}><Eye size={16} /></button>
                    </Link>
                    <Link href={`/admin/products/edit?id=${product._id}`}>
                      <button className={styles.actionButton}><Edit size={16} /></button>
                    </Link>
                    <button className={styles.actionButton} onClick={() => handleDeleteClick(product._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, total)} trong {total} sản phẩm
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

    {/* Modal */}
    {showModal && (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Xác nhận xóa</h3>
          </div>
          <div className={styles.modalBody}>
            <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deletingProduct?.name}</strong> không?</p>
            <p style={{ color: '#ff4757', fontSize: '14px' }}>Lưu ý: Hành động này không thể hoàn tác!</p>
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

export default ProductsPage;

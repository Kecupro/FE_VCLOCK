"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit} from 'lucide-react';
import styles from '../assets/css/all.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';
import { IProduct, ICategory, IBrand } from '@/app/(site)/cautrucdata';
import { ToastContainer, toast } from 'react-toastify';
import { getProductImageUrl } from '@/app/utils/imageUtils';

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
  const limit = 9;

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
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, sortOption]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryProduct`);
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/brand`);
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/product?${params}`);
        const data = await res.json();
        console.log(data);
        setProducts(data.list || []);
        setTotal(data.total || 0);
      } catch {
        toast.error("Lỗi khi tải sản phẩm!");
      }
    };
    fetchProducts();
  }, [currentPage, searchTerm, statusFilter, categoryFilter, brandFilter, sortOption]);

  const handleReset = () => {
    setSearchTerm('');
    setBrandFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortOption('newest');
    toast.info("Đã đặt lại bộ lọc!");
  };

  const formatCurrency = (num: number) => {
    return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const totalPages = Math.ceil(total / limit);
  const maxPagesToShow = 5;
  const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow + 1));
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  return (
  <div className={styles.container}>
    <div className={styles.header}>
      <h1 className={styles.title}>Sản phẩm</h1>
              <Link href="/admin/products/addProduct">
        <button className={styles.addButton}>
          <Plus size={14} /> Thêm sản phẩm
        </button>
      </Link>
    </div>

    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Tìm kiếm</label>
          <div style={{ position: 'relative' }}>
            <Search className={styles.searchIcon} size={14} />
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
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.name}>
                  {product.name}
                </td>
                <td>
                  {product.main_image ? (
                    <Image
                      src={typeof product.main_image == 'string' ? 
                        getProductImageUrl(product.main_image) : 
                        getProductImageUrl(product.main_image.image)
                      }
                      alt={typeof product.main_image == 'string' ? 
                        product.name : 
                        (product.main_image.alt || product.name)
                      }
                      width={60}
                      height={60}
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
                <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={typeof product.brand_id == 'object' && 'name' in product.brand_id ? product.brand_id.name : '---'}>
                  {typeof product.brand_id == 'object' && 'name' in product.brand_id ? product.brand_id.name : '---'}
                </td>
                <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={Array.isArray(product.categories) && product.categories.length > 0 ? product.categories.map((c) => c.name).join(', ') : '---'}>
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
                      <button className={styles.actionButton}><Eye size={14} /></button>
                    </Link>
                    <Link href={`/admin/products/edit?id=${product._id}`}>
                      <button className={styles.actionButton}><Edit size={14} /></button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, total)} trong {total} sản phẩm
        </div>
        <div className={styles.paginationButtons}>
          <button disabled={currentPage == 1} onClick={() => setCurrentPage(1)} className={styles.paginationButton}>Trang đầu</button>
          <button disabled={currentPage == 1} onClick={() => setCurrentPage(currentPage - 1)} className={styles.paginationButton}>&lt;</button>
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`${styles.paginationButton} ${currentPage == page ? styles.paginationButtonActive : ""}`}>{page}</button>
          ))}
          <button disabled={currentPage == totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={styles.paginationButton}>&gt;</button>
          <button onClick={() => setCurrentPage(totalPages)} className={styles.paginationButton}>Trang cuối</button>
        </div>
      </div>
    </div>

    <ToastContainer position="top-right" autoClose={3000} />
  </div>
  );
};

export default ProductsPage;

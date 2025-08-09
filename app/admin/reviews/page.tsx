"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Star} from 'lucide-react';
import styles from '../assets/css/all.module.css';
import { useAppContext } from '../../context/AppContext';
import { IReview } from '@/app/(site)/cautrucdata';
import { ToastContainer, toast } from 'react-toastify';
const RatingPage = () => {
  const { isDarkMode } = useAppContext();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    document.documentElement.classList.toggle(styles['dark-mode'], isDarkMode);
  }, [isDarkMode]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        rating: ratingFilter,
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      const res = await fetch(`http://localhost:3000/api/admin/review?${params}`);
      const data = await res.json();
      setReviews(data.list || []);
      setTotalReviews(data.total || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, ratingFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchReviews();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchReviews]);

  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, sortBy, sortOrder]);

  const handleReset = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
    toast.info("Đã đặt lại bộ lọc!");
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case 'newest':
        setSortBy('created_at');
        setSortOrder('desc');
        break;
      case 'oldest':
        setSortBy('created_at');
        setSortOrder('asc');
        break;
      case 'highest_rating':
        setSortBy('rating');
        setSortOrder('desc');
        break;
      case 'lowest_rating':
        setSortBy('rating');
        setSortOrder('asc');
        break;
      default:
        setSortBy('created_at');
        setSortOrder('desc');
    }
  };

  const getSortValue = () => {
    if (sortBy == 'created_at' && sortOrder == 'desc') return 'newest';
    if (sortBy == 'created_at' && sortOrder == 'asc') return 'oldest';
    if (sortBy == 'rating' && sortOrder == 'desc') return 'highest_rating';
    if (sortBy == 'rating' && sortOrder == 'asc') return 'lowest_rating';
    return 'newest';
  };

  const renderStars = (rating: number) => (
    <div className={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={16} className={star <= rating ? styles.starFilled : styles.starEmpty} />
      ))}
    </div>
  );

  const totalPages = Math.ceil(totalReviews / limit);

  const generatePaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Đánh giá</h1>
      
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tìm kiếm</label>
            <div style={{ position: 'relative' }}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Tìm theo bình luận, sản phẩm, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Đánh giá</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">Tất cả sao</option>
              {[5, 4, 3, 2, 1].map((rate) => (
                <option key={rate} value={rate.toString()}>{rate} sao</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Sắp xếp theo</label>
            <select
              value={getSortValue()}
              onChange={(e) => handleSortChange(e.target.value)}
              className={styles.select}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest_rating">Số sao cao nhất</option>
              <option value="lowest_rating">Số sao thấp nhất</option>
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Đang tải...</span>
          </div>
        )}
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>STT</th>
                <th className={styles.tableHeaderCell}>
                  Sản phẩm
                </th>
                <th className={styles.tableHeaderCell}>
                  Khách hàng
                </th>
                <th className={styles.tableHeaderCell}>
                  Sao
                </th>
                <th className={styles.tableHeaderCell}>Bình luận</th>
                <th className={styles.tableHeaderCell}>
                  Ngày đánh giá
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr key={review._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {(currentPage - 1) * limit + index + 1}
                  </td>
                  <td className={styles.tableCell} style={{ maxWidth: "200px", wordBreak: "break-word" }}>
                    {review.order_detail_id?.product_id?.name || 'N/A'}
                  </td>
                  <td className={styles.tableCell}>
                    {review.user_id?.fullName || review.user_id?.username || 'Ẩn danh'}
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.ratingCell}>
                      {renderStars(review.rating)}
                      <span className={styles.ratingNumber}>({review.rating})</span>
                    </div>
                  </td>
                  <td className={styles.tableCell} style={{ maxWidth: "200px", wordBreak: "break-word" }}>
                    <div className={styles.commentText} title={review.comment || ''}>
                      {review.comment || 'Không có bình luận'}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString('vi-VN')
                      : ''}
                  </td>
                </tr>
              ))}
              {reviews.length == 0 && !loading && (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    {searchTerm || ratingFilter != 'all' 
                      ? 'Không tìm thấy đánh giá phù hợp.' 
                      : 'Chưa có đánh giá nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Fixed Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị {(currentPage - 1) * limit + 1}
            &nbsp;đến&nbsp;
            {Math.min(currentPage * limit, totalReviews)} trong {totalReviews} đánh giá
          </div>

          <div className={styles.paginationButtons}>
            {/* First Page Button */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage == 1}
              className={`${styles.paginationButton} ${
                currentPage == 1 ? styles.paginationButtonInactive : ''
              }`}
            >
              Trang đầu
            </button>

            {/* Previous Button */}
            <button
              disabled={currentPage == 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={`${styles.paginationButton} ${
                currentPage == 1 ? styles.paginationButtonInactive : ''
              }`}
            >
              &laquo;
            </button>

            {/* Page Numbers - Sử dụng function generatePaginationNumbers */}
            {generatePaginationNumbers().map((page) => (
              <button
                key={page}
                className={`${styles.paginationButton} ${
                  currentPage == page ? styles.paginationButtonActive : ''
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              disabled={currentPage == totalPages || totalPages == 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={`${styles.paginationButton} ${
                currentPage == totalPages || totalPages == 0 ? styles.paginationButtonInactive : ''
              }`}
            >
              &raquo;
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage == totalPages || totalPages == 0}
              className={`${styles.paginationButton} ${
                currentPage == totalPages || totalPages == 0 ? styles.paginationButtonInactive : ''
              }`}
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RatingPage;
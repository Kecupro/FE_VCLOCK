"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../assets/css/add.module.css';
import { useAppContext } from '../../../context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
const EditCateNew = () => {
  const [categoryName, setCategoryName] = useState('');
  const [status, setStatus] = useState<'Hoạt động' | 'Dừng hoạt động'>('Hoạt động');
  const [id, setId] = useState<string | null>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  useEffect(() => {
    const param = searchParams?.get('id');
    if (param) setId(param);
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/categoryNews/${id}`);
        const data = await res.json();
        const category = data.categoryNews;

        setCategoryName(category.name || '');
        setStatus(category.status == 0 ? 'Hoạt động' : 'Dừng hoạt động');
      } catch {
        toast.error('Lỗi khi tải dữ liệu danh mục!');
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('Tên danh mục không được để trống.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/admin/categoryNews/sua/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          status: status == 'Hoạt động' ? 0 : 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cập nhật danh mục thành công!');
        setTimeout(() => {
          router.push('/admin/categories-news-list');
        }, 1500);
      } else {
        toast.error(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi cập nhật.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chỉnh sửa danh mục tin tức</h1>
        <button className={styles.returnButton} onClick={() => router.back()}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên danh mục <span style={{color: "red"}}>*</span></label>
          <input
            type="text"
            className={styles.input}
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Nhập tên danh mục..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="Hoạt động"
                checked={status == 'Hoạt động'}
                onChange={(e) => setStatus(e.target.value as 'Hoạt động' | 'Dừng hoạt động')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Hoạt động</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="Dừng hoạt động"
                checked={status == 'Dừng hoạt động'}
                onChange={(e) => setStatus(e.target.value as 'Hoạt động' | 'Dừng hoạt động')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Dừng hoạt động</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.createButton}>
            Cập nhật
          </button>
          <button type="button" className={styles.cancelButton} onClick={() => router.back()}>
            Hủy
          </button>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{ color: "red" }}>*</strong> là bắt buộc phải nhập.</li>
              <li>Trường <em>Tên danh mục</em> là bắt buộc và phải duy nhất.</li>
              <li>Nên chọn trạng thái “<strong>Hoạt động</strong>” nếu bạn muốn danh mục hiển thị trên trang người dùng.</li>
            </ul>
          </div>
        </div>
        
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default EditCateNew;

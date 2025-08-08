"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const AddCateNew = () => {
  const [status, setStatus] = useState<'Hoạt động' | 'Dừng hoạt động'>('Hoạt động');
  const nameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { isDarkMode } = useAppContext();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = nameRef.current?.value.trim();
    if (!name) {
      toast.error('Tên danh mục không được để trống.');
      return;
    }

    const body = {
      name,
      status: status == 'Hoạt động' ? 0 : 1,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryNews/them`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Thêm danh mục thành công!');
        setTimeout(() => {
          router.push('/admin/categories-news-list');
        }, 1500);
      } else {
        toast.error(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi thêm danh mục.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thêm danh mục tin tức</h1>
        <Link href="/admin/categories-news-list" className={styles.returnButton}>
          Quay lại
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên danh mục <span style={{color: "red"}}>*</span></label>
          <input
            ref={nameRef}
            type="text"
            className={styles.input}
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
                onChange={() => setStatus('Hoạt động')}
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
                onChange={() => setStatus('Dừng hoạt động')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Dừng hoạt động</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions2}>
          <button type="submit" className={styles.createButton}>
            Tạo mới
          </button>
          <Link href="/admin/categories-news-list" className={styles.cancelButton}>
            Hủy
          </Link>
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

export default AddCateNew;

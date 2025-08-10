"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
const AddCatePro = () => {
  const [status, setStatus] = useState<'Hoạt động' | 'Dừng hoạt động'>('Hoạt động');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');

  const nameRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLInputElement>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setActiveTab('preview');
    }
  };

  const handleTabClick = (tab: 'upload' | 'preview') => {
    setActiveTab(tab);
    if (tab == 'upload') {
      document.getElementById('fileInput')?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = nameRef.current?.value.trim();
    const alt = altRef.current?.value.trim();

    if (!name) {
      toast.error('Tên danh mục không được để trống.');
      return;
    }
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp ảnh.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp không được vượt quá 5MB.');
      return;
    }
    if (!alt) {
      toast.error('Alt không được để trống.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('alt', alt);
    formData.append('category_status', status == 'Hoạt động' ? '0' : '1');
    formData.append('image', selectedFile);

    try {
      const res = await fetch(`http://localhost:3000/api/admin/categoryProduct/them`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Thêm danh mục thành công!');
        setTimeout(() => {
          router.push('/admin/categories-product-list');
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
        <h1 className={styles.title}>Thêm danh mục sản phẩm</h1>
        <Link href="/admin/categories-product-list" className={styles.returnButton}>
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
          <label className={styles.label}>Ảnh <span style={{color: "red"}}>*</span></label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button
                type="button"
                className={`${styles.imageTab} ${activeTab == 'upload' ? styles.imageTabActive : ''}`}
                onClick={() => handleTabClick('upload')}
              >
                Chọn tệp
              </button>
              <button
                type="button"
                className={`${styles.imageTab} ${activeTab == 'preview' ? styles.imageTabActive : ''}`}
                onClick={() => handleTabClick('preview')}
              >
                {selectedFile ? selectedFile.name : 'Chưa có tệp nào được chọn'}
              </button>

              <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              />
              {selectedFile && activeTab == 'preview' && (
              <div className={styles.imagePreview}>
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className={styles.image} 
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Alt (Alt sẽ xuất hiện khi ảnh lỗi) <span style={{color: "red"}}>*</span></label>
          <input
            ref={altRef}
            type="text"
            className={styles.input}
            placeholder="Nhập Alt cho ảnh..."
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
          <Link href="/admin/categories-product-list" className={styles.cancelButton}>
            Hủy
          </Link>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{ color: "red" }}>*</strong> là bắt buộc phải nhập.</li>
              <li>Trường <em>Tên danh mục</em> là bắt buộc và phải duy nhất.</li>
              <li>Trường <em>Alt (alt hình ảnh)</em> dùng để tối ưu SEO, bắt buộc phải nhập.</li>
             <li>Chỉ cho phép tải ảnh định dạng: .jpg, .jpeg, .png, .webp.</li>
              <li>Dung lượng tối đa mỗi ảnh: <strong>10MB</strong>.</li>
              <li>Nên chọn trạng thái “<strong>Hoạt động</strong>” nếu bạn muốn danh mục hiển thị trên trang người dùng.</li>
            </ul>
          </div>
        </div>

      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default AddCatePro;

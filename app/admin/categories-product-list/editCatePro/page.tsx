"use client";


import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import Image from 'next/image';
import { useAppContext } from '../../../context/AppContext';
import { ToastContainer, toast } from 'react-toastify';

type SelectedFile = {
  name: string;
  url: string;
  file?: File;
};

const EditCatePro = () => {
  const [name, setName] = useState('');
  const [alt, setAlt] = useState('');
  const [status, setStatus] = useState<'Hoạt động' | 'Dừng hoạt động'>('Hoạt động');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('preview');
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
    const param = searchParams!.get('id');
    if (param) setId(param);
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryProduct/${id}`);
        const data = await res.json();

        const category = data.categoryPro;

        setName(category.name || '');
        setAlt(category.alt || '');
        setStatus(category.category_status == 0 ? 'Hoạt động' : 'Dừng hoạt động');

        if (category.image) {
          setSelectedFile({
            name: category.image,
            url: category.image.startsWith('http')
              ? category.image
              : `/images/category/${category.image}`,
          });
        }

        setActiveTab('preview');
      } catch {
        toast.error('Lỗi khi lấy dữ liệu từ server!');
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Ảnh vượt quá dung lượng cho phép (tối đa 10MB)!');
      return;
    }

    setSelectedFile({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file,
    });
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

    if (!name.trim()) {
      toast.error('Tên danh mục không được để trống.');
      return;
    }
    if (!alt.trim()) {
      toast.error('Alt không được để trống.');
      return;
    }
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp ảnh.');
      return;
    }
    if (selectedFile.file && selectedFile.file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp không được vượt quá 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('alt', alt);
    formData.append('category_status', status == 'Hoạt động' ? '0' : '1');

    if (selectedFile?.file) {
      formData.append('image', selectedFile.file);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryProduct/sua/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cập nhật thành công!');
        setTimeout(() => {
          router.push('/admin/categories-product-list');
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
        <h1 className={styles.title}>Chỉnh sửa danh mục sản phẩm</h1>
        <button className={styles.returnButton} onClick={() => router.back()}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên danh mục <span style={{color: "red"}}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

              {activeTab == 'preview' && selectedFile?.url && (
                <div className={styles.imagePreview}>
                  <Image
                    src={selectedFile.url}
                    alt="Preview"
                    width={200}
                    height={200}
                    className={styles.image}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Alt ( alt sẽ xuất hiện khi ảnh lỗi ) <span style={{color: "red"}}>*</span></label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className={styles.input}
            placeholder="Nhập Alt cho ảnh..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel2}>
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
            Cập nhật
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.back()}
          >
            Hủy
          </button>
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

export default EditCatePro;

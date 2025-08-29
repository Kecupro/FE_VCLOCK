"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { ToastContainer, toast } from 'react-toastify';

const AddPaymentMethodPage = () => {
  const [status, setStatus] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');

  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<TinyMCEEditor | null>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;

  if (!file) {
    setSelectedFile(null);
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    toast.error('Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!');
    e.target.value = '';
    setSelectedFile(null);
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('Ảnh vượt quá dung lượng cho phép (tối đa 10MB)!');
    e.target.value = '';
    setSelectedFile(null);
    return;
  }

  setSelectedFile(file);
  setActiveTab('preview');
  };

  const handleTabClick = (tab: 'upload' | 'preview') => {
    setActiveTab(tab);
    if (tab == 'upload') document.getElementById('fileInput')?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = nameRef.current?.value.trim();
    const code = codeRef.current?.value.trim();
    const description = contentRef.current?.getContent().trim();

    if (!name || !code || !description) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!selectedFile) {
      toast.error('Vui lòng chọn biểu tượng.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Ảnh không được lớn hơn 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('code', code);
    formData.append('description', description);
    formData.append('is_active', String(status));
    formData.append('image', selectedFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payment-method/them`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Thêm phương thức thanh toán thành công!');
        setTimeout(() => {
          router.push('/admin/payment-methods');
        }, 1500);
      } else {
        toast.error(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi thêm phương thức.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thêm phương thức thanh toán</h1>
        <Link href="/admin/payment-methods" className={styles.returnButton}>
          Quay lại
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên phương thức <span style={{ color: 'red' }}>*</span></label>
          <input ref={nameRef} type="text" className={styles.input} placeholder="VD: Chuyển khoản Ngân hàng..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mã code <span style={{ color: 'red' }}>*</span></label>
          <input ref={codeRef} type="text" className={styles.input} placeholder="VD: BANK_TRANSFER..." />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Mô tả <span style={{color: "red"}}>*</span></label>
          <div className={styles.tinymceWrapper}>
          <Editor
            onInit={(evt, editor) => (contentRef.current = editor)}
            init={{
              height: 400,
              menubar: false,
              plugins: 'advlist autolink lists link image charmap preview',
              toolbar:
                'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
              skin: false,
              content_css: false,
              content_style: `
                body {
                  font-family: 'Inter', sans-serif;
                  font-size: 14px;
                  padding: 16px;
                }
              `,
              branding: false,
            }}
            tinymceScriptSrc="https://cdn.tiny.cloud/1/3n407w2hrdm50486yfaarb459wuuvhbzuzs8d2grfyt4bouf/tinymce/6/tinymce.min.js"
          />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Biểu tượng (ảnh) <span style={{ color: 'red' }}>*</span></label>
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
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="true"
                checked={status == true}
                onChange={() => setStatus(true)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Đang hoạt động</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="false"
                checked={status == false}
                onChange={() => setStatus(false)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Không hoạt động</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions2}>
          <button type="submit" className={styles.createButton}>
            Tạo mới
          </button>
          <Link href="/admin/payment-method" className={styles.cancelButton}>
            Hủy
          </Link>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{ color: "red" }}>*</strong> là bắt buộc phải nhập.</li>
              <li>Trường <em>Tên phương thức</em> là bắt buộc và phải duy nhất.</li>
              <li>Nên chọn trạng thái “<strong>Đang hoạt động</strong>” nếu bạn muốn phương thức thanh toán này hiển thị trên trang người dùng.</li>
              <li>Chỉ cho phép tải ảnh định dạng: .jpg, .jpeg, .png, .webp.</li>
              <li>Dung lượng tối đa mỗi ảnh: <strong>10MB</strong>.</li>
              <li>Hãy nhập đầy đủ mô tả sản phẩm để tăng hiệu quả SEO và trải nghiệm người dùng.</li>
            </ul>
          </div>
        </div>

      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default AddPaymentMethodPage;

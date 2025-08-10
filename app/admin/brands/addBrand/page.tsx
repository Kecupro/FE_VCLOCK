"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import styles from '../../assets/css/add.module.css';
import Image from 'next/image';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { IBrand } from '@/app/(site)/cautrucdata';
const AddBrand = () => {
  const [formData, setFormData] = useState<IBrand>({
  _id: '',
  name: '',
  image: '',
  alt: '',
  description: '',
  brand_status: 0,
  created_at: '',
  updated_at: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const contentRef = useRef<TinyMCEEditor | null>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const status = e.target.value == 'active' ? 0 : 1;
    setFormData(prev => ({
      ...prev,
      brand_status: status
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setActiveTab('preview');
      
      if (!formData.alt) {
        const altText = file.name.split('.')[0].replace(/[-_]/g, ' ');
        setFormData(prev => ({
          ...prev,
          alt: altText
        }));
      }

      toast.success(`Đã chọn file: ${file.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleTabClick = (tab: 'upload' | 'preview') => {
    setActiveTab(tab);
    if (tab == 'upload') {
      document.getElementById('fileInput')?.click();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên thương hiệu là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên thương hiệu phải có ít nhất 2 ký tự';
    }

    const description = contentRef.current?.getContent();

    if (!description || !description.trim()) {
      newErrors.description = 'Mô tả thương hiệu là bắt buộc';
    }

    if (!selectedFile) {
      newErrors.image = 'Vui lòng chọn ảnh cho thương hiệu';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Đang tạo thương hiệu...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
    });
    
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name.trim());
      const content = contentRef.current?.getContent() || '';
      formDataToSend.append('description', content.trim());
      formDataToSend.append('alt', formData.alt.trim());
      formDataToSend.append('brand_status', formData.brand_status.toString());
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await fetch(`http://localhost:3000/api/admin/brand/add`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        toast.update(loadingToastId, {
          render: "Thêm thương hiệu thành công!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          router.push('/admin/brands');
        }, 1500);
      } else {
        let errorMessage = 'Có lỗi xảy ra khi tạo thương hiệu';
        if (result.error) {
          if (result.error.includes('đã tồn tại') || result.error.includes('duplicate')) {
            setErrors({ name: 'Tên thương hiệu đã tồn tại' });
            errorMessage = 'Tên thương hiệu đã tồn tại';
          } else {
            setErrors({ general: result.error });
            errorMessage = result.error;
          }
        } else if (result.message) {
          setErrors({ general: result.message });
          errorMessage = result.message;
        } else {
          setErrors({ general: errorMessage });
        }

        toast.update(loadingToastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
              console.error('Lỗi khi tạo thương hiệu:', error);
      const errorMessage = 'Có lỗi xảy ra khi kết nối đến server';
      setErrors({ general: errorMessage });
      
      toast.update(loadingToastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thêm thương hiệu</h1>
        <Link href="/admin/brands" className={styles.returnButton}>
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Tên thương hiệu <span style={{color: 'red'}}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Nhập tên thương hiệu..."
            disabled={loading}
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
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
            tinymceScriptSrc="https://cdn.tiny.cloud/1/6fo0luz3qumzjivmx7fqqwnkpf7hrg0e8san58tjg18xa5n7/tinymce/6/tinymce.min.js"
          />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Alt text cho ảnh</label>
          <input
            type="text"
            name="alt"
            value={formData.alt}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Nhập alt text cho ảnh..."
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Ảnh <span style={{color: 'red'}}>*</span>
          </label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button
                type="button"
                className={`${styles.imageTab} ${activeTab == 'upload' ? styles.imageTabActive : ''}`}
                onClick={() => handleTabClick('upload')}
                disabled={loading}
              >
                Chọn tệp
              </button>
              <button
                type="button"
                className={`${styles.imageTab} ${activeTab == 'preview' ? styles.imageTabActive : ''}`}
                onClick={() => handleTabClick('preview')}
                disabled={!selectedFile || loading}
              >
                {selectedFile ? selectedFile.name : 'Chưa có tệp nào được chọn'}
              </button>
            </div>

            {activeTab == 'preview' && previewUrl && (
              <div className={styles.imagePreview}>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    marginTop: '10px',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </div>
          {errors.image && (
            <span className={styles.errorText}>{errors.image}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel} style={{backgroundColor: "none", border: "none"}}>
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.brand_status == 0}
                onChange={handleStatusChange}
                className={styles.radioInput}
                disabled={loading}
              />
              <span className={styles.radioText}>Hoạt động</span>
            </label>
            <label className={styles.radioLabel} style={{backgroundColor: "none", border: "none"}}>
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.brand_status == 1}
                onChange={handleStatusChange}
                className={styles.radioInput}
                disabled={loading}
              />
              <span className={styles.radioText}>Dừng hoạt động</span>
            </label>
          </div>  
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.createButton}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo mới'}
          </button>
          <Link 
            href="/admin/brands" 
            className={`${styles.cancelButton} ${loading ? styles.disabled : ''}`}
          >
            Hủy
          </Link>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{color: "red"}}>*</strong> là bắt buộc phải nhập.</li>
              <li>Chỉ cho phép tải ảnh định dạng: .jpg, .jpeg, .png, .webp.</li>
              <li>Dung lượng tối đa mỗi ảnh: <strong>10MB</strong>.</li>
              <li>Hãy nhập đầy đủ mô tả sản phẩm để tăng hiệu quả SEO và trải nghiệm người dùng.</li>
              <li>Trường <em>Tên thương hiệu</em> là bắt buộc và phải duy nhất.</li>
              <li>Nên chọn trạng thái “<strong>Hoạt động</strong>” nếu bạn muốn thương hiệu hiển thị trên trang người dùng.</li>
            </ul>
          </div>
        </div>
        
      </form>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
    </main>
  );
};

export default AddBrand;
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { useRouter, useParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../../assets/css/add.module.css';
import { IBrand } from "@/app/(site)/cautrucdata";
import Image from 'next/image';
import { Editor } from '@tinymce/tinymce-react';
const EditBrand = () => {
  const router = useRouter();
  const params = useParams();
  const brandId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [alt, setAlt] = useState('');
  const [status, setStatus] = useState('0');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { isDarkMode } = useAppContext();

  const getImageUrl = (imagePath: string): string | null => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `/images/brand/${imagePath}`;
  };

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);

        if (!brandId) {
          throw new Error("Không tìm thấy ID thương hiệu");
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/brand/${brandId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }
        );

        const data = await response.json();
        
        if (!data) {
          throw new Error("Không nhận được dữ liệu từ server");
        }

        const brand: IBrand = data.data || data.brand || data;
        
        if (!brand || !brand._id) {
          throw new Error("Dữ liệu thương hiệu không hợp lệ");
        }

        setBrandName(brand.name || '');
        setBrandDescription(brand.description || '');
        setAlt(brand.alt || '');
        setStatus(brand.brand_status?.toString() || '0');
        setCurrentImage(brand.image || '');
        
        if (brand.image) {
          const imageUrl = getImageUrl(brand.image);
          if (imageUrl) {
            setPreviewUrl(imageUrl);
            setActiveTab('preview');
          }
        } else {
          setActiveTab('upload');
        }

      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Không thể tải dữ liệu thương hiệu";
        toast.error('Không thể tải dữ liệu thương hiệu: ' + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrandData();
    } else {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const handleInputChange = (name: string, value: string) => {
    if (name == 'name') setBrandName(value);
    else if (name == 'description') setBrandDescription(value);
    else if (name == 'alt') setAlt(value);
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WebP)');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setActiveTab('preview');

      if (!alt) {
        const altText = file.name.split('.')[0].replace(/[-_]/g, ' ');
        setAlt(altText);
      }

      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }

      toast.success(`Đã chọn file: ${file.name}`);

      return () => URL.revokeObjectURL(url);
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab == 'upload') {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      fileInput?.click();
    }
  };


  const validateForm = (): boolean => {
  const newErrors: {[key: string]: string} = {};

  if (!brandName || !brandName.trim()) {
    newErrors.name = 'Tên thương hiệu không được để trống';
  } else if (brandName.trim().length < 2) {
    newErrors.name = 'Tên thương hiệu phải có ít nhất 2 ký tự';
  } else if (brandName.trim().length > 100) {
    newErrors.name = 'Tên thương hiệu không được vượt quá 100 ký tự';
  } else if (!/^[a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(brandName.trim())) {
    newErrors.name = 'Tên thương hiệu chỉ được chứa chữ cái, số và khoảng trắng';
  }

  if (!brandDescription || !brandDescription.trim()) {
    newErrors.description = 'Mô tả thương hiệu không được để trống';
  } else if (brandDescription.trim().length < 10) {
    newErrors.description = 'Mô tả thương hiệu phải có ít nhất 10 ký tự';
  } else if (brandDescription.trim().length > 1000) {
    newErrors.description = 'Mô tả thương hiệu không được vượt quá 1000 ký tự';
  }

  if (alt && alt.trim().length > 0) {
    if (alt.trim().length < 3) {
      newErrors.alt = 'Alt text không được dưới quá 3 ký tự';
    } else if (alt.trim().length > 200) {
      newErrors.alt = 'Alt text không được vượt quá 200 ký tự';
    }
  }

  if (!currentImage && !selectedFile) {
    newErrors.image = 'Vui lòng chọn ảnh cho thương hiệu';
  }

  if (selectedFile) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      newErrors.image = 'Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WebP)';
    } else {
      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        newErrors.image = 'Kích thước file không được vượt quá 5MB';
      }
      const minSize = 1024;
      if (selectedFile.size < minSize) {
        newErrors.image = 'Kích thước file quá nhỏ (tối thiểu 1KB)';
      }
    }
  }

  if (!status || (status != '0' && status != '1')) {
    newErrors.status = 'Vui lòng chọn trạng thái cho thương hiệu';
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

    setUpdating(true);
    
    const loadingToastId = toast.loading("Đang cập nhật thương hiệu...", {
      position: "top-right",
    });

    try {
      const formData = new FormData();
      formData.append('name', brandName.trim());
      formData.append('description', brandDescription.trim());
      formData.append('alt', alt.trim());
      formData.append('brand_status', parseInt(status).toString());
      if (selectedFile) {
        formData.append('image', selectedFile);
      } else {
        formData.append('image_cu', currentImage);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/brand/edit/${brandId}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.update(loadingToastId, {
          render: "Cập nhật thương hiệu thành công!",
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
        let errorMessage = 'Có lỗi xảy ra khi cập nhật thương hiệu';
        
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

    } catch {
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
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      router.back();
    }
  };

  const handleReturn = () => {
    router.back();
  };

  useEffect(() => {
    return () => {
      if (previewUrl && selectedFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Đang tải...</h1>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
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
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chỉnh sửa thương hiệu</h1>
        <button 
          className={styles.returnButton}
          onClick={handleReturn}
          type="button"
        >
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
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
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Nhập tên thương hiệu..."
            value={brandName}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={updating}
            
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Mô tả <span style={{color: "red"}}>*</span></label>
          <div className={styles.tinymceWrapper}>
          <Editor
            value={brandDescription}
            onEditorChange={(value) => handleInputChange('description', value)}
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
          <label className={styles.label}>Alt text cho ảnh</label>
          <input 
            type="text" 
            className={styles.input}
            placeholder="Nhập alt text cho ảnh..."
            value={alt}
            onChange={(e) => handleInputChange('alt', e.target.value)}
            disabled={updating}
          />    
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Ảnh thương hiệu <span style={{color: 'red'}}>*</span>
          </label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button 
                className={`${styles.imageTab} ${activeTab == 'upload' ? styles.imageTabActive : ''}`}
                onClick={() => handleTabClick('upload')}
                type="button"
                disabled={updating}
              >
                Chọn tệp mới
              </button>
              {(previewUrl || currentImage) && (
                <button 
                  className={`${styles.imageTab} ${activeTab == 'preview' ? styles.imageTabActive : ''}`}
                  onClick={() => setActiveTab('preview')}
                  type="button"
                  disabled={updating}
                >
                  Xem ảnh
                </button>
              )}
            </div>
            
            {activeTab == 'preview' && previewUrl && (
              <div className={styles.imagePreview}>
                <Image
                  src={previewUrl}
                  alt="Brand logo preview"
                  width={200}
                  height={200}
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    marginTop: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  unoptimized
                />
              </div>
            )}
            
            {activeTab == 'preview' && !previewUrl && (
              <div className={styles.imagePreview}>
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Chưa có ảnh. Vui lòng chọn ảnh mới.
                </p>
              </div>
            )}
            
            <input 
              id="fileInput"
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={updating}
            />
          </div>
          {errors.image && (
            <span className={styles.errorText}>{errors.image}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                name="status" 
                value="0"
                checked={status == '0'}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.radioInput}
                disabled={updating}
              />
              <span className={styles.radioText}>Hoạt động</span>
            </label>
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                name="status" 
                value="1"
                checked={status == '1'}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.radioInput}
                disabled={updating}
              />
              <span className={styles.radioText}>Dừng hoạt động</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.createButton}
            disabled={updating}
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={updating}
          >
            Hủy
          </button>
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
        autoClose={3000}
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

export default EditBrand;
"use client";



import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import Image from 'next/image';
import { useAppContext } from '../../../context/AppContext';
import { Editor } from '@tinymce/tinymce-react';
import { ToastContainer, toast } from 'react-toastify';

type SelectedFile = {
  name: string;
  url: string;
  file?: File;
};

const EditPaymentMethod = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
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
    const param = searchParams.get('id');
    if (param) setId(param);
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payment-method/${id}`);
        const data = await res.json();

        const method = data.payment;

        setName(method.name || '');
        setCode(method.code || '');
        setDescription(method.description || '');
        setIsActive(method.is_active ?? true);

        if (method.icon_url) {
          setSelectedFile({
            name: method.icon_url,  
            url: method.icon_url.startsWith('http')
              ? method.icon_url
              : `/images/payment-Method/${method.icon_url}`,
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

    if (!name.trim() || !code.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và mã.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('code', code);
    formData.append('description', description);
    formData.append('is_active', isActive ? 'true' : 'false');

    if (selectedFile?.file) {
      formData.append('image', selectedFile.file);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payment-method/sua/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cập nhật thành công!');
        setTimeout(() => {
          router.push('/admin/payment-methods');
        }, 1500);
      } else {
        toast.error(data.error || 'Lỗi không xác định.');
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi cập nhật.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chỉnh sửa phương thức thanh toán</h1>
        <button className={styles.returnButton} onClick={() => router.back()}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên <span style={{color: 'red'}}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Tên phương thức thanh toán"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mã <span style={{color: 'red'}}>*</span></label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={styles.input}
            placeholder="Mã định danh (ví dụ: bank_transfer)"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Mô tả <span style={{color: "red"}}>*</span></label>
          <div className={styles.tinymceWrapper}>
          <Editor
            value={description}
            onEditorChange={(content) => setDescription(content)}
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
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel2}>
              <input
                type="radio"
                name="status"
                value="true"
                checked={isActive == true}
                onChange={() => setIsActive(true)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Đang hoạt động</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="false"
                checked={isActive === false}
                onChange={() => setIsActive(false)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Dừng hoạt động</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions2}>
          <button type="submit" className={styles.createButton}>Cập nhật</button>
          <button type="button" className={styles.cancelButton} onClick={() => router.back()}>Hủy</button>
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

export default EditPaymentMethod;

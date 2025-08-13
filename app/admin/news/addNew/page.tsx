"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { ICateNews } from '@/app/(site)/cautrucdata';
const AddNew = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [status, setStatus] = useState<'Công khai' | 'Bản nháp'>('Công khai');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [cateNewsgories, setCategoriesNews] = useState<ICateNews[]>([]);

  const titleRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
      const fetchCateNews = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryNews`);
          const data = await res.json();
          setCategoriesNews(data.list || []);
        } catch {
          toast.error("Lỗi khi tải danh mục tin tức!");
        }
      };
      fetchCateNews();
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = titleRef.current?.value.trim();
    const content = contentRef.current?.getContent().trim();

    if (!title) return toast.error('Vui lòng nhập tiêu đề.');
    if (!content) return toast.error('Vui lòng nhập mô tả.');
    if (!selectedCategory) return toast.error('Vui lòng chọn danh mục.');
    if (!selectedFile) return toast.error('Vui lòng chọn ảnh.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('categorynews_id', selectedCategory);
    formData.append('news_status', status == 'Công khai' ? '0' : '1');
    formData.append('image', selectedFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/them`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Thêm tin tức thành công!');
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        toast.error(data.error || 'Đã xảy ra lỗi.');
      }
    } catch {
      toast.error('Lỗi khi gửi dữ liệu.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thêm tin tức</h1>
        <Link href="/admin/news" className={styles.returnButton}>
          Quay lại
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tiêu đề <span style={{color: "red"}}>*</span></label>
          <input ref={titleRef} type="text" className={styles.input} placeholder="Nhập tiêu đề..." />
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
          <label className={styles.label}>Danh mục <span style={{color: "red"}}>*</span></label>
          <select className={styles.select} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">--- Chọn danh mục ---</option>
            {cateNewsgories.map(cate => <option key={cate._id} value={cate._id}>{cate.name}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh <span style={{color: "red"}}>*</span></label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button type="button" className={`${styles.imageTab} ${activeTab == 'upload' ? styles.imageTabActive : ''}`} onClick={() => handleTabClick('upload')}>Chọn tệp</button>
              <button type="button" className={`${styles.imageTab} ${activeTab == 'preview' ? styles.imageTabActive : ''}`} onClick={() => handleTabClick('preview')}>
                {selectedFile ? selectedFile.name : 'Chưa có tệp nào được chọn'}
              </button>

              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
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
          <label className={styles.label}>Trạng thái</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="status" value="Công khai" checked={status == 'Công khai'} onChange={() => setStatus('Công khai')} className={styles.radioInput} />
              <span className={styles.radioText}>Công khai</span>
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="status" value="Bản nháp" checked={status == 'Bản nháp'} onChange={() => setStatus('Bản nháp')} className={styles.radioInput} />
              <span className={styles.radioText}>Bản nháp</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.createButton}>Tạo mới</button>
          <Link href="/admin/news" className={styles.cancelButton}>Hủy</Link>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{color: "red"}}>*</strong> là bắt buộc phải nhập.</li>
              <li>Chỉ cho phép tải ảnh định dạng: .jpg, .jpeg, .png, .webp.</li>
              <li>Dung lượng tối đa ảnh: <strong>10MB</strong>.</li>
              <li>Mục chọn danh mục là bắt buộc để đảm bảo dữ liệu đầy đủ.</li>
              <li>Hãy nhập đầy đủ mô tả sản phẩm để tăng hiệu quả SEO và trải nghiệm người dùng.</li>
              <li>Trường <em>Tiêu đề</em> là bắt buộc và phải duy nhất.</li>
              <li>Nên chọn trạng thái “<strong>Công khai</strong>” nếu bạn muốn tin tức hiển thị trên trang người dùng.</li>
            </ul>
          </div>
        </div>
        
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default AddNew;

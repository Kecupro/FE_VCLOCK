"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import Image from 'next/image';
import { useAppContext } from '../../../context/AppContext';
import { ToastContainer, toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';
import { ICateNews } from '@/app/(site)/cautrucdata';
const EditNews = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'Công khai',
    publishDate: '',
    updateDate: '',
  });

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    url?: string;
    file?: File;
  } | null>(null);

  const [cateNewsgories, setCategoriesNews] = useState<ICateNews[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('preview');
  const [id, setId] = useState<string | null>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/${id}`);
        const data = await res.json();
        const news = data.news;

        setFormData({
          title: news.title || '',
          description: news.content || '',
          category: typeof news.categorynews_id == 'object'
            ? news.categorynews_id._id
            : news.categorynews_id || '',
          status: news.news_status == 0 ? 'Công khai' : 'Bản nháp',
          publishDate: news.created_at?.substring(0, 10) || '',
          updateDate: news.updated_at?.substring(0, 10) || '',
        });

        if (news.image) {
          setSelectedFile({
            name: news.image,
            url: news.image.startsWith('http')
              ? news.image
              : `/images/news/${news.image}`,
          });
        }

        setActiveTab('preview');
      } catch {
        toast.error('Không thể tải dữ liệu bài viết.');
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

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
      file,
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

    console.log('Form data:', formData); 

    if (!formData.title?.trim()) {
      toast.error('Vui lòng nhập tiêu đề.');
      return;
    }

    if (!formData.category?.trim()) {
      toast.error('Vui lòng chọn danh mục.');
      return;
    }

    if (formData.status === 'Công khai') {
      if (!formData.description) {
        toast.error('Vui lòng nhập mô tả khi chọn trạng thái Công khai.');
        return;
      }
      
      const cleanDescription = formData.description.replace(/<[^>]*>/g, '').trim();
      if (!cleanDescription) {
        toast.error('Vui lòng nhập mô tả khi chọn trạng thái Công khai.');
        return;
      }
    }

    const body = new FormData();
    body.append('title', formData.title);
    body.append('content', formData.description || ''); 
    body.append('categorynews_id', formData.category);
    body.append('news_status', formData.status == 'Công khai' ? '0' : '1');

    if (selectedFile?.file) {
      body.append('image', selectedFile.file);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/sua/${id}`, {
        method: 'PUT',
        body,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Cập nhật tin tức thành công!');
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        toast.error(`Lỗi: ${result.error || 'Không xác định'}`);
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chỉnh sửa tin tức</h1>
        <button className={styles.returnButton} onClick={() => router.back()}>
          Quay lại
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tiêu đề <span style={{color: "red"}}>*</span></label>
          <input
            type="text"
            className={styles.input}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Mô tả <span style={{color: "red"}}>*</span></label>
          <div className={styles.tinymceWrapper}>
          <Editor
            value={formData.description || ''}
            onEditorChange={(content) => handleInputChange('description', content)}
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
          <select
            className={styles.select}
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            <option value="">--- Chọn danh mục ---</option>
            {cateNewsgories.map(cate => <option key={cate._id} value={cate._id}>{cate.name}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh</label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button
                type="button"
                className={`${styles.imageTab} ${activeTab == 'upload' ? styles.imageTabActive : ''}`}
                onClick={() => handleTabClick('upload')}
              >
                Chọn tệp mới
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
                style={{ display: 'none' }}
                onChange={handleFileChange}
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
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="Công khai"
                checked={formData.status == 'Công khai'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Công khai</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="status"
                value="Bản nháp"
                checked={formData.status == 'Bản nháp'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Bản nháp</span>
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

export default EditNews;

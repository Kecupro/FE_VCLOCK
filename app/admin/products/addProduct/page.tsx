"use client";

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import styles from '../../assets/css/addPro.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';
import { ICategory, IBrand } from '@/app/(site)/cautrucdata';

const AddProduct = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subImages, setSubImages] = useState<File[]>([]);
  const [activeImageTab, setActiveImageTab] = useState('upload');
  const [selectedGender, setSelectedGender] = useState('');
  const [caseDiameter, setCaseDiameter] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [features, setFeatures] = useState('');
  const [selectedWaterResistance, setSelectedWaterResistance] = useState('');
  const [thickness, setThickness] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState('');
  const [selectedStrapMaterial, setSelectedStrapMaterial] = useState('');
  const [selectedCaseMaterial, setSelectedCaseMaterial] = useState('');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [status, setStatus] = useState('Hoạt động');
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const { isDarkMode } = useAppContext();

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Get selected brand name for display
  const selectedBrandName = brands.find(brand => brand._id === selectedBrand)?.name || '--- Chọn thương hiệu ---';

  // Get selected categories names for display
  const selectedCategoriesNames = selectedCategories.length > 0 
    ? selectedCategories.map(id => categories.find(cat => cat._id === id)?.name).filter(Boolean).join(', ')
    : '--- Chọn danh mục ---';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`.${styles.customSelect}`)) {
        setShowBrandDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    if (showBrandDropdown || showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBrandDropdown, showCategoryDropdown, styles.customSelect]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  useEffect(() => {
        const fetchCateNews = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categoryProduct`);
            const data = await res.json();
            setCategories(data.list || []);
          } catch {
            toast.error("Lỗi khi tải danh mục tin tức!");
          }
        };
        fetchCateNews();
      }, []);

  useEffect(() => {
        const fetchBrands = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand`);
            const data = await res.json();
            // Filter only active brands (brand_status: 0)
            const activeBrands = data.filter((brand: IBrand) => brand.brand_status === 0);
            setBrands(activeBrands || []);
          } catch {
            toast.error("Lỗi khi tải danh sách thương hiệu!");
          }
        };
        fetchBrands();
      }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseFloat(price || '0');
    const parsedSalePrice = parseFloat(salePrice || '0');
    const parsedQuantity = parseInt(quantity || '0');
    const parsedCaseDiameter = parseInt(caseDiameter || '0');
    const parsedWaterResistance = parseInt(selectedWaterResistance || '0');
    const parsedThickness = parseInt(thickness || '0');

    if (parsedPrice <= 0) {
      toast.error('Giá phải lớn hơn 0!');
      return;
    }
    
    if (parsedSalePrice < 0) {
      toast.error('Giá giảm phải lớn hơn hoặc bằng 0!');
      return;
    }
    
    if (parsedQuantity < 0) {
      toast.error('Số lượng phải lớn hơn hoặc bằng 0!');
      return;
    }
    
    if (parsedCaseDiameter < 0) {
      toast.error('Đường kính mặt đồng hồ phải lớn hơn hoặc bằng 0!');
      return;
    }
    
    if (parsedWaterResistance < 0) {
      toast.error('Khả năng chống nước phải lớn hơn hoặc bằng 0!');
      return;
    }
    
    if (parsedThickness < 0) {
      toast.error('Độ dày phải lớn hơn hoặc bằng 0!');
      return;
    }

    if (!name || !selectedBrand || selectedCategories.length == 0 || !selectedFile || !parsedPrice || !quantity) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    if (parsedSalePrice >= parsedPrice) {
      toast.error('Giá giảm phải nhỏ hơn giá gốc!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', parsedPrice.toString());
    formData.append('sale_price', parsedSalePrice.toString());
    formData.append('status', status == 'Hoạt động' ? '0' : '1');
    formData.append('quantity', parsedQuantity.toString());
    formData.append('brand_id', selectedBrand);
    if (selectedGender) {
      formData.append('sex', selectedGender);
    }
    formData.append('case_diameter', caseDiameter);
    formData.append('style', selectedStyle);
    formData.append('features', features);
    formData.append('water_resistance', selectedWaterResistance);
    formData.append('thickness', thickness);
    formData.append('color', selectedColor);
    formData.append('machine_type', selectedMovementType);
    formData.append('strap_material', selectedStrapMaterial);
    formData.append('case_material', selectedCaseMaterial);
    selectedCategories.forEach((id) => formData.append('category_ids', id));

    formData.append('main_image', selectedFile);
    subImages.forEach((file) => {
      formData.append('sub_images', file);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/product/them`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Thêm sản phẩm thành công!');
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        toast.error(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch (error) {
      toast.error('Lỗi gửi dữ liệu: ' + error);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thêm sản phẩm</h1>
        <Link href="/admin/products" className={styles.returnButton}>
          Quay lại
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên sản phẩm <span style={{color: "red"}}>*</span></label>
          <input type="text" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên sản phẩm..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Số lượng <span style={{color: "red"}}>*</span></label>
          <input type="number" className={styles.input} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Nhập số lượng sản phẩm..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Danh mục <span style={{ color: 'red' }}>*</span>
          </label>
          <div className={styles.customSelect}>
            <div 
              className={styles.selectTrigger}
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span>{selectedCategoriesNames}</span>
              <span className={styles.selectArrow}>▼</span>
            </div>
            
            {showCategoryDropdown && (
              <div className={styles.selectDropdown}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className={styles.searchInput}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className={styles.optionsContainer}>
                  {filteredCategories.map((category) => (
                    <div
                      key={category._id}
                      className={`${styles.option} ${selectedCategories.includes(category._id) ? styles.selected : ''}`}
                      onClick={() => {
                        const newSelectedCategories = selectedCategories.includes(category._id)
                          ? selectedCategories.filter(id => id !== category._id)
                          : [...selectedCategories, category._id];
                        setSelectedCategories(newSelectedCategories);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => {}} // Handled by parent div onClick
                        className={styles.checkbox}
                      />
                      {category.name}
                    </div>
                  ))}
                  
                  {filteredCategories.length === 0 && categorySearchTerm && (
                    <div className={styles.noResults}>
                      Không tìm thấy danh mục &quot;{categorySearchTerm}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Thương hiệu <span style={{color: "red"}}>*</span></label>
          <div className={styles.customSelect}>
            <div 
              className={styles.selectTrigger}
              onClick={() => setShowBrandDropdown(!showBrandDropdown)}
            >
              <span>{selectedBrandName}</span>
              <span className={styles.selectArrow}>▼</span>
            </div>
            
            {showBrandDropdown && (
              <div className={styles.selectDropdown}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm thương hiệu..."
                    value={brandSearchTerm}
                    onChange={(e) => setBrandSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className={styles.optionsContainer}>
                  <div
                    className={styles.option}
                    onClick={() => {
                      setSelectedBrand('');
                      setShowBrandDropdown(false);
                      setBrandSearchTerm('');
                    }}
                  >
                    --- Chọn thương hiệu ---
                  </div>
                  
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand._id}
                      className={`${styles.option} ${selectedBrand === brand._id ? styles.selected : ''}`}
                      onClick={() => {
                        setSelectedBrand(brand._id);
                        setShowBrandDropdown(false);
                        setBrandSearchTerm('');
                      }}
                    >
                      {brand.name}
                    </div>
                  ))}
                  
                                     {filteredBrands.length === 0 && brandSearchTerm && (
                     <div className={styles.noResults}>
                       Không tìm thấy thương hiệu &quot;{brandSearchTerm}&quot;
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái <span style={{color: "red"}}>*</span></label>
          <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Không hoạt động">Không hoạt động</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá (đ) <span style={{color: "red"}}>*</span></label>
          <input type="number" className={styles.input} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Giá gốc..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá giảm (đ)</label>
          <input type="number" className={styles.input} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Giá khuyến mãi..." />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Mô tả sản phẩm </label>
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
            tinymceScriptSrc="https://cdn.tiny.cloud/1/3n407w2hrdm50486yfaarb459wuuvhbzuzs8d2grfyt4bouf/tinymce/6/tinymce.min.js"
          />
          </div>
        </div>
            
        <div className={styles.formGroup}>
          <label className={styles.label}>Giới tính</label>
          <select className={styles.select} value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
            <option value="">--- Chọn giới tính ---</option>
            <option value="nam">Nam</option>
            <option value="nữ">Nữ</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Đường kính mặt đồng hồ</label>
          <input type="number" className={styles.input} value={caseDiameter} onChange={(e) => setCaseDiameter(e.target.value)} placeholder="Đường kính mặt đồng hồ VD: 35mm" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Kiểu dáng</label>
          <select className={styles.select} value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
            <option value="">--- Chọn kiểu dáng ---</option>
            <option value="Kim cương">Kim cương</option>
            <option value="18k">18k</option>
            <option value="Cổ điển">Cổ điển</option>
            <option value="Thể thao">Thể thao</option>
            <option value="Sang trọng">Sang trọng</option>
            <option value="Vàng 18 carat">Vàng 18 carat</option>
            <option value="Ameradl">Ameradl</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tính năng</label>
          <select className={styles.select} value={features} onChange={(e) => setFeatures(e.target.value)}>
            <option value="">--- Chọn kiểu dáng ---</option>
            <option value="Thời gian">Thời gian</option>
            <option value="Ngày">Ngày</option>
            <option value="Giai đoạn mặt trăng">Giai đoạn mặt trăng</option>
            <option value="Vĩnh viễn">Vĩnh viễn</option>
            <option value="Dự trữ năng lượng">Dự trữ năng lượng</option>
            <option value="Đồng hồ bấm giờ">Đồng hồ bấm giờ</option>
            <option value="Lịch">Lịch</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Khả năng chống nước</label>
          <input type="number" className={styles.input} value={selectedWaterResistance} onChange={(e) => setSelectedWaterResistance(e.target.value)} placeholder="Nhập khả năng chống nước VD: 3 ATM" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Độ dày</label>
          <input type="number" className={styles.input} value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="Nhập độ dày VD: 7mm" />
        </div>

        <div className={styles.formGroup}>
         <label className={styles.label}>Màu sắc</label>
         <select className={styles.input} value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
           <option value="">--- Chọn màu sắc ---</option>
           <option value="Đen">Đen</option>
           <option value="Trắng">Trắng</option>
           <option value="Vàng">Vàng</option>
           <option value="Xanh">Xanh</option>
           <option value="Đỏ">Đỏ</option>
           <option value="Hồng">Hồng</option>
           <option value="Xám">Xám</option>
           <option value="Bạc">Bạc</option>
           <option value="Pha lê">Pha lê</option>
         </select>
        </div>

        <div className={styles.formGroup}>
         <label className={styles.label}>Loại máy</label>
         <select className={styles.input} value={selectedMovementType} onChange={(e) => setSelectedMovementType(e.target.value)}>
           <option value="">--- Chọn loại máy ---</option>
           <option value="Cơ">Cơ</option>
           <option value="Pin">Pin</option>
           <option value="Tự động">Tự động</option>
           <option value="Năng lượng ánh sáng">Năng lượng ánh sáng</option>
           <option value="Thạch anh">Thạch anh</option>
         </select>
        </div>

        <div className={styles.formGroup}>
         <label className={styles.label}>Chất liệu dây</label>
         <select className={styles.input} value={selectedStrapMaterial} onChange={(e) => setSelectedStrapMaterial(e.target.value)}>
           <option value="">--- Chọn chất liệu dây ---</option>
           <option value="Dây da">Dây da</option>
           <option value="Thép không gỉ">Thép không gỉ</option>
           <option value="Nhựa">Nhựa</option>
           <option value="Vải">Vải</option>
           <option value="Silicone">Silicone</option>
           <option value="Dây kim loại">Dây kim loại</option>
           <option value="Dây cao su">Dây cao su</option>
         </select>
        </div>

        <div className={styles.formGroup}>
         <label className={styles.label}>Chất liệu vỏ</label>
         <select className={styles.input} value={selectedCaseMaterial} onChange={(e) => setSelectedCaseMaterial(e.target.value)}>
           <option value="">--- Chọn chất liệu vỏ ---</option>
           <option value="Thép không gỉ">Thép không gỉ</option>
           <option value="Nhựa">Nhựa</option>
           <option value="Titan">Titan</option>
           <option value="Gốm">Gốm</option>
           <option value="Hợp kim">Hợp kim</option>
           <option value="Tinh thể sapphire">Tinh thể sapphire</option>
           <option value="Vàng hồng 18k và titan">Vàng hồng 18k và titan</option>
           <option value="Da cá sấu">Da cá sấu</option>
           <option value="Kim loại">Kim loại</option>
         </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh chính <span style={{color: "red"}}>*</span></label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button
                type="button"
                className={`${styles.imageTab} ${activeImageTab == 'upload' ? styles.imageTabActive : ''}`}
                onClick={() => {
                  setActiveImageTab('upload');
                  document.getElementById('mainImageInput')?.click();
                }}
              >
                Chọn tệp
              </button>
              <button
                type="button"
                className={`${styles.imageTab} ${activeImageTab == 'preview' ? styles.imageTabActive : ''}`}
                onClick={() => setActiveImageTab('preview')}
              >
                {selectedFile ? selectedFile.name : 'Chưa có tệp nào được chọn'}
              </button>
              
              <input
                id="mainImageInput"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  setActiveImageTab('preview');
                }}
                style={{ display: 'none' }}
              />

              {selectedFile && activeImageTab == 'preview' && (
                <div className={styles.imagePreview}>
                  <Image
                    src={URL.createObjectURL(selectedFile)}
                    alt="Ảnh chính"
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
          <label className={styles.label}>Ảnh phụ</label>
          <div className={styles.imageSection}>
            <div className={styles.imageTabs}>
              <button
                type="button"
                className={`${styles.imageTab} ${activeImageTab == 'upload' ? styles.imageTabActive : ''}`}
                onClick={() => document.getElementById('subImagesInput')?.click()}
              >
                Chọn nhiều tệp
              </button>

              <input
                id="subImagesInput"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    setSubImages(Array.from(files));
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
              
            {subImages.length > 0 && (
              <div className={styles.subImagePreviewList}>
                {subImages.map((file, index) => (
                  <Image
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Ảnh phụ ${index + 1}`}
                    width={100}
                    height={100}
                    className={styles.previewImage}
                    style={{ objectFit: 'cover', marginRight: '10px', borderRadius: '8px' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <p></p>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.createButton}>Tạo mới</button>
          <Link href="/admin/products" className={styles.cancelButton}>Hủy</Link>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{color: "red"}}>*</strong> là bắt buộc phải nhập.</li>
              <li>Các trường như <em>Giá, Giá giảm, Số lượng, Độ dày, Đường kính mặt</em> chỉ cho phép nhập số.</li>
              <li>Chỉ cho phép tải ảnh định dạng: .jpg, .jpeg, .png, .webp.</li>
              <li>Dung lượng tối đa mỗi ảnh: <strong>10MB</strong>.</li>
              <li>Có thể chọn nhiều ảnh phụ.</li>
              <li>Các mục chọn danh mục, thương hiệu, kiểu dáng, màu sắc, chất liệu... đều là bắt buộc để đảm bảo dữ liệu đầy đủ.</li>
              <li>Hãy nhập đầy đủ mô tả sản phẩm để tăng hiệu quả SEO và trải nghiệm người dùng.</li>
            </ul>
          </div>
        </div>

      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default AddProduct;

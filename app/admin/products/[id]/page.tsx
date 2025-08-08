"use client";



import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import styles from "../../assets/css/detailPro.module.css";
import { useAppContext } from '../../../context/AppContext';
import { IProduct } from '@/app/(site)/cautrucdata';
import { ToastContainer, toast } from "react-toastify";

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useAppContext();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [subImageUrls, setSubImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const productId = params?.id as string;
  const baseImageUrl = "/images/product/";

  useEffect(() => {
    document.documentElement.classList.toggle(styles['dark-mode'], isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/product/${productId}`);
        const data = await res.json();

        const prod: IProduct = data.product || data;
        setProduct(prod);

        const mainImage = prod.images?.find(img => img.is_main)?.image || '';
        const subImages = prod.images
          ?.filter(img => !img.is_main)
          .map(img => baseImageUrl + img.image) || [];

        setMainImageUrl(mainImage ? baseImageUrl + mainImage : '');
        setSubImageUrls(subImages);

      } catch {
        toast.error('Có lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const formatCurrency = (num: number) =>
    num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const getDiscountPercent = () => {
    if (!product || product.price <= product.sale_price) return 0;
    return Math.round(((product.price - product.sale_price) / product.price) * 100);
  };

  const handleGoBack = () => router.back();
  const handleEdit = () => product && router.push(`/admin/products/edit?id=${product._id}`);
  const handleDelete = async () => {
    if (!product) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/product/xoa/${product._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Sản phẩm đã được xóa thành công!');
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        const data = await res.json();
        toast.error(`Không thể xóa: ${data.message || 'Lỗi không xác định'}`);
      }
    } catch {
      toast.error('Có lỗi khi xóa sản phẩm');
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <div className={styles.loadingContainer}><p>Đang tải...</p></div>;
  if (!product) return <div className={styles.errorContainer}><p>Không tìm thấy sản phẩm</p></div>;

  const discountPercent = getDiscountPercent();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chi tiết sản phẩm</h1>
        <button className={styles.returnButton} onClick={handleGoBack}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      <div className={styles.form}>
        <div className={styles.productMain}>
          <div className={styles.columnImage}>
            <div className={styles.productImage}>
              {mainImageUrl ? (
                <Image
                  src={mainImageUrl}
                  alt="Ảnh chính"
                  width={400}
                  height={400}
                  className={styles.imagePreview}
                  unoptimized
                />
              ) : (
                <div className={styles.imagePreview}></div>
              )}

              {subImageUrls.length > 0 && (
                <div className={styles.subImages}>
                  {subImageUrls.map((url, idx) => (
                    <Image
                      key={idx}
                      src={url}
                      alt={`Ảnh phụ ${idx + 1}`}
                      width={80}
                      height={80}
                      className={styles.subImage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.columnInfo}>
            <div className={styles.productInfo}>
              <h2 className={styles.productName}>{product.name}</h2>
              <div className={styles.productBrand}>
                Thương hiệu: {typeof product.brand_id == 'object' ? product.brand_id?.name : product.brand_id}
              </div>
              <span className={styles.productBrand}>Danh mục: {product.categories?.map(c => c.name).join(', ')}</span>
              <div className={styles.priceSection}>
                {(product.sale_price > 0 && product.sale_price < product.price) ? (
                  <>
                    <span className={styles.currentPrice}>Giá: {formatCurrency(product.sale_price)}</span>
                    <span className={styles.originalPrice}>{formatCurrency(product.price)}</span>
                    <span className={styles.discount}>-{discountPercent}%</span>
                  </>
                ) : (
                  <span className={styles.currentPrice}>Giá: {formatCurrency(product.price)}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.columnDetails}>
            <h4 className={styles.sectionTitle}>Thông tin chi tiết</h4>

            <br />

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{product._id}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Số lượng:</span>
              <span className={styles.detailValue}>{product.quantity}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Đã bán:</span>
              <span className={styles.detailValue}>{product.sold}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Lượt xem:</span>
              <span className={styles.detailValue}>{product.views}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Giới tính:</span>
              <span className={styles.detailValue}>{product.sex}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Phong cách:</span>
              <span className={styles.detailValue}>{product.style}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Chống nước:</span>
              <span className={styles.detailValue}>{product.water_resistance}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Độ dày:</span>
              <span className={styles.detailValue}>{product.thickness}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Đường kính mặt:</span>
              <span className={styles.detailValue}>{product.case_diameter}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Chất liệu dây:</span>
              <span className={styles.detailValue}>{product.strap_material}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Chất liệu vỏ:</span>
              <span className={styles.detailValue}>{product.case_material}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Loại máy:</span>
              <span className={styles.detailValue}>{product.machine_type}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tính năng:</span>
              <span className={styles.detailValue}>{product.features}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Màu sắc:</span>
              <span className={styles.detailValue}>{product.color}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ngày tạo:</span>
              <span className={styles.detailValue}>{new Date(product.created_at).toLocaleString('vi-VN', { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cập nhật:</span>
              <span className={styles.detailValue}>{new Date(product.updated_at).toLocaleString('vi-VN', { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        <div className={styles.description}>
          <h3 className={styles.sectionTitle}>Mô tả sản phẩm</h3>
          <div className={styles.contentBox}>
            <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>

        <div className={styles.statusSection}>
          <div className={styles.statusLabel}>Trạng thái</div>
          <span className={`${styles.statusBadge} ${product.quantity > 0 ? styles.statusActive : styles.statusInactive}`}>
            {product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
          </span>
        </div>

        <div className={styles.formActions}>
          <button className={styles.createButton} onClick={handleEdit}>
            <Edit size={16} /> Chỉnh sửa
          </button>
          <button className={styles.cancelButton} onClick={() => setShowModal(true)}>
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}><h3>Xác nhận xóa</h3></div>
            <div className={styles.modalBody}>
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{product.name}</strong> không?</p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>Hành động này không thể hoàn tác!</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalcancelButton} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.deleteButton} onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProductDetailPage;

'use client';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../assets/css/detailNews.module.css";
import { useAppContext } from "../../../context/AppContext";
import { INews } from "@/app/(site)/cautrucdata";
import { ToastContainer, toast } from "react-toastify";

const NewsDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<INews | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { isDarkMode } = useAppContext();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle(styles["dark-mode"], isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!params?.id) return;

      try {
        const res = await fetch(`http://localhost:3000/api/admin/news/${params.id}`);
        const data = await res.json();
        setNews(data.news || data);
      } catch {
        toast.error("Không thể tải tin tức");
      }
    };

    fetchNewsDetail();
  }, [params?.id]);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Chưa rõ";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Công khai", class: styles.statusActive };
      case 1:
        return { text: "Bản nháp", class: styles.statusInactive };
      default:
        return { text: "Không xác định", class: styles.statusInactive };
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/news/xoa/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Xóa thành công!");
        setTimeout(() => {
          router.push("/admin/news");
        }, 1500);
      } else {
        toast.error(`Lỗi: ${data.error}`);
      }
    } catch {
      toast.error("Lỗi khi xóa tin tức!");
    } finally {
      setShowModal(false);
      setDeletingId(null);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!news) return null;

  const statusInfo = getStatusInfo(news.news_status ?? -1);
  const imageUrl = news.image?.startsWith("http")
    ? news.image
    : `/images/news/${news.image}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chi tiết tin tức</h1>
        <button onClick={handleBack} className={styles.returnButton}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      <div className={styles.form}>
        <div className={styles.topGrid}>
          {/* BÊN TRÁI: Tiêu đề & mô tả */}
          <div className={styles.leftColumn}>
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Tiêu đề</h4>
              <h2 className={styles.productName}>{news.title}</h2>
            </div>

            <div style={{height: "100%"}} className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Nội dung</h4>
              <div style={{height: "90%"}} className={styles.contentBox}>
                <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: news.content }} />
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Hình ảnh</h4>
              <div className={styles.productImage}>
                <Image
                  src={imageUrl}
                  alt={news.title}
                  className={styles.image}
                  width={400}
                  height={250}
                  style={{ objectFit: "cover" }}
                />
                <div className={styles.imageName}>
                  {`${news.title}.jpg`}
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Thông tin cơ bản</h4>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ID:</span>
                <span className={styles.detailValue}>{news._id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Danh mục:</span>
                <span className={styles.detailValue}>
                  {news.category?.name || "Không có danh mục"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Lượt xem:</span>
                <span className={styles.detailValue}>{news.views || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ngày tạo:</span>
                <span className={styles.detailValue}>{formatDate(news.created_at)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ngày cập nhật:</span>
                <span className={styles.detailValue}>{formatDate(news.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statusSection}>
          <div className={styles.statusLabel}>Trạng thái</div>
          <span className={`${styles.statusBadge} ${statusInfo.class}`}>
            {statusInfo.text}
          </span>
        </div>

        <div className={styles.formActions}>
          <Link href={`editNew/?id=${news._id}`}>
            <button className={styles.createButton}>
              <Edit size={16} /> Chỉnh sửa
            </button>
          </Link>
          <button className={styles.cancelButton} onClick={() => handleDeleteClick(news._id)}>
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}><h3>Xác nhận xóa</h3></div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xóa bài viết <strong>&quot;{news.title}&quot;</strong> không?
              </p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>
                Lưu ý: Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalcancelButton} onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className={styles.deleteButton} onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default NewsDetailPage;

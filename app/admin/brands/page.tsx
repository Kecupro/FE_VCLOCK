"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import styles from "../assets/css/all.module.css";
import { useAppContext } from "../../context/AppContext";
import { IBrand } from "@/app/(site)/cautrucdata";
import { getBrandImageUrl } from "@/app/utils/imageUtils";
const BrandPage = () => {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<IBrand | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  const { isDarkMode } = useAppContext();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle(styles["dark-mode"], isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          search: searchTerm,
          status: statusFilter,
          sortBy: sortBy,
        });

        const res = await fetch(
          `http://localhost:3000/api/admin/brand?${params}`
        );
        const data = await res.json();
        setBrands(data.list);
        setTotalBrands(data.total);
      } catch (error) {
        console.error("Lỗi khi tải thương hiệu:", error);
        toast.error("Có lỗi xảy ra khi tải danh sách thương hiệu!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [searchTerm, statusFilter, sortBy, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const refreshBrandList = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        status: statusFilter,
        sortBy: sortBy,
      });

      const res = await fetch(
        `http://localhost:3000/api/admin/brand?${params}`
      );
      const data = await res.json();
      setBrands(data.list);
      setTotalBrands(data.total);
    } catch (error) {
              console.error("Lỗi khi làm mới danh sách thương hiệu:", error);
      toast.error("Có lỗi xảy ra khi làm mới danh sách thương hiệu!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
    toast.info("Đã đặt lại bộ lọc!");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleDeleteClick = (brand: IBrand) => {
    setBrandToDelete(brand);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;

    try {
      const deleteResponse = await fetch(
        `http://localhost:3000/api/admin/brand/xoa/${brandToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const deleteData = await deleteResponse.json();

      if (deleteResponse.ok) {
        await refreshBrandList();
        toast.success(deleteData.thong_bao || "Xóa thương hiệu thành công!");
      } else {
        const errorMessage =
          deleteData.thong_bao ||
          deleteData.error ||
          deleteData.message ||
          "Có lỗi xảy ra khi xóa thương hiệu";
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
              console.error("Lỗi khi xóa thương hiệu:", error);
      toast.error("Không thể kết nối đến server. Vui lòng thử lại!");
    } finally {
      setShowDeleteModal(false);
      setBrandToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBrandToDelete(null);
  };

  const totalPages = Math.ceil(totalBrands / limit);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thương hiệu</h1>
        <Link href={"brands/addBrand"}>
          <button className={styles.addButton}>
            <Plus size={16} />
            Thêm thương hiệu
          </button>
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tên</label>
            <div style={{ position: "relative" }}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Tìm thương hiệu"
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className={styles.select}
            >
              <option value="all">Tất cả</option>
              <option value="0">Hoạt động</option>
              <option value="1">Dừng hoạt động</option>
            </select>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Sắp xếp</label>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className={styles.select}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="a-z">Tên A-Z</option>
              <option value="z-a">Tên Z-A</option>
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div>Đang tải...</div>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th style={{ width: "50px" }}>STT</th>
                <th>Tên thương hiệu</th>
                <th>Ảnh</th>
                <th>Mô tả</th>
                <th>Thời gian tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, index) => (
                <tr key={brand._id} className={styles.tableRow}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td>{brand.name}</td>
                  <td className={styles.tableCell}>
                    <Image
                      src={getBrandImageUrl(brand.image) || `/images/logo/logoV.png`}
                      alt={brand.name}
                      width={90}
                      height={50}
                      style={{ objectFit: "cover" }}
                      unoptimized={getBrandImageUrl(brand.image)?.startsWith('http')}
                    />
                  </td>
                  <td
                    style={{
                      maxWidth: "250px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {brand.description || "Không có mô tả"}
                  </td>
                  <td>{formatDate(brand.created_at)}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        brand.brand_status === 0
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {brand.brand_status === 0
                        ? "Hoạt động"
                        : "Dừng hoạt động"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`brands/${brand._id}`}>
                        <button className={styles.actionButton}>
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link href={`brands/editBrand/${brand._id}`}>
                        <button className={styles.actionButton}>
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteClick(brand)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị {(currentPage - 1) * limit + 1}
            &nbsp;đến&nbsp;
            {Math.min(currentPage * limit, totalBrands)} trong {totalBrands} thương hiệu
          </div>

          <div className={styles.paginationButtons}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`${styles.paginationButton} ${
                currentPage === 1 ? styles.paginationButtonInactive : ''
              }`}
            >
              Trang đầu
            </button>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={`${styles.paginationButton} ${
                currentPage === 1 ? styles.paginationButtonInactive : ''
              }`}
            >
              &laquo;
            </button>

            {totalPages > 0 && Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                className={`${styles.paginationButton} ${
                  currentPage === page ? styles.paginationButtonActive : ''
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={`${styles.paginationButton} ${
                currentPage === totalPages || totalPages === 0 ? styles.paginationButtonInactive : ''
              }`}
            >
              &raquo;
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`${styles.paginationButton} ${
                currentPage === totalPages || totalPages === 0 ? styles.paginationButtonInactive : ''
              }`}
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xóa danh mục <strong>&quot;{brandToDelete?.name}&quot;</strong> không?
              </p>
              <p style={{ color: "#ff4757", fontSize: "14px" }}>
                Lưu ý: Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalcancelButton}
                onClick={handleDeleteCancel}
              >
                Hủy
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteConfirm}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

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
        theme="light"
      />
    </div>
  );
};

export default BrandPage;
'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Zap, Truck, CheckCircle, XCircle, Clock, RefreshCw, DollarSign,} from 'lucide-react';
import styles from '../assets/css/order.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer, toast } from 'react-toastify';
import { IOrder } from '@/app/(site)/cautrucdata';

const OrdersPage = () => {
  const { isSidebarCollapsed = false } = useAppContext();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [total, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [fullStatusCounts, setFullStatusCounts] = useState<Record<string, number>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'cancel' | 'nextStatus' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [paymentStatusCounts, setPaymentStatusCounts] = useState<Record<string, number>>({});
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string | null>(null);

  // ! <== Logic status == >
  const openConfirmModal = (
  order: IOrder,
  index: number,
  action: 'cancel' | 'nextStatus'
  ) => {
  setSelectedOrder(order);
  setSelectedIndex(index);
  setModalAction(action);
  setModalVisible(true);
  };

  const handleConfirmAction = async () => {
  if (!selectedOrder || !modalAction) return;

  if (modalAction == 'cancel') {
    await updateOrderStatus(selectedOrder._id, 'cancelled');

    if (selectedOrder.payment_status == 'paid') {
      await updatePaymentStatus(selectedOrder._id, 'refunding');
    } else {
      await updatePaymentStatus(selectedOrder._id, 'unpaid');
    }
  } else if (modalAction == 'nextStatus') {
    if (selectedOrder.order_status) {
      const next = getNextStatus(selectedOrder.order_status);
      if (next) await updateOrderStatus(selectedOrder._id, next);
    }
  }

  setModalVisible(false);
  setSelectedOrder(null);
  setModalAction(null);
  };

  const getNextStatus = (current: string) => {
    const orderFlow = [
        "pending",
        "processing",
        "shipping",
        "delivered",
        "cancelled",
        "returned"
      ];
    const currentIndex = orderFlow.indexOf(current);
    if (currentIndex >= 0 && currentIndex < orderFlow.length - 1) {
      return orderFlow[currentIndex + 1];
    }
    return null;
  };
  // ! <== End Logic status == >

  const limit = 6;
  const { isDarkMode } = useAppContext();

  const statusMap = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    returned: 'Hoàn trả',
  };

  const paymentStatuses = [
    'Chưa thanh toán',
    'Đã thanh toán',
    'Chờ hoàn tiền',
    'Đã hoàn tiền',
  ];

  const paymentStatusMap: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    refunding: 'Chờ hoàn tiền',
    refunded: 'Đã hoàn tiền',
    failed: 'Thanh toán thất bại',
  };

  const paymentBadgeClass: Record<string, string> = {
    unpaid: styles.statuschuaThanhToan,
    paid: styles.statusthanhToan,
    refunding: styles.statuschoHoanTien,
    refunded: styles.statushoanTien,
    failed: styles.statusUnknown,
  };

  const paymentStatusIcons: Record<string, React.ReactNode> = {
    unpaid: <Clock size={18} />,
    paid: <CheckCircle size={18} />,
    refunding: <RefreshCw size={18}/>,
    refunded: <DollarSign size={18} />,
    failed: <XCircle size={18} />,
  };

  const reverseStatusMap = Object.fromEntries(
    Object.entries(statusMap).map(([key, value]) => [value, key])
  );

  const statusConfigs = {
    'Chờ xử lý': { icon: <Clock size={14} />, className: styles.statuschoXuLy },
    'Đang xử lý': { icon: <Zap size={14} />, className: styles.statusdangXuLy },
    'Đang giao hàng': { icon: <Truck size={14} />, className: styles.statusdangGiaoHang },
    'Đã giao hàng': { icon: <CheckCircle size={14} />, className: styles.statusdaGiaoHang },
    'Đã hủy': { icon: <XCircle size={14} />, className: styles.statusdaHuy },
    'Hoàn trả': { icon: <RefreshCw size={14} />, className: styles.statushoanTra },
    'Hoàn thành': { icon: <CheckCircle size={14} />, className: styles.statushoanThanh },
  };

  const displayStatuses = Object.values(statusMap);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle(styles['dark-mode'], isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption]);

  useEffect(() => {
  const fetchOrdersAndCounts = async () => {
    try {
      const res = await fetch(
        `https://bevclock-production.up.railway.app/api/admin/order?statusFilter=${statusFilter}&paymentStatusFilter=${selectedPaymentStatus || 'all'}&page=${currentPage}&limit=${limit}&searchTerm=${encodeURIComponent(searchTerm)}&sort=${sortOption}`
      );

      const data = await res.json();

      setOrders(data.list);
      setTotalOrders(data.totalCount || data.list.length);
      setFullStatusCounts(data.statusCounts || {});
      setPaymentStatusCounts(data.paymentCounts || {});
    } catch {
      toast.error("Lỗi khi tải đơn hàng!");
    }
  };

  fetchOrdersAndCounts();
  }, [currentPage, searchTerm, statusFilter, sortOption, selectedPaymentStatus]);

  const handleReset = () => {
  setSearchTerm('');
  setStatusFilter('all');
  setSelectedPaymentStatus(null);
  setSortOption('newest');
  toast.info("Đã đặt lại bộ lọc!");
  };

  const totalPages = Math.ceil(total / limit);
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(startPage + 4, totalPages);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`https://bevclock-production.up.railway.app/api/admin/order/suaStatus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Cập nhật trạng thái thành công!");

        setOrders((prev) =>
          prev.map((order) =>
            order._id == id
              ? { ...order, order_status: newStatus as IOrder['order_status'] }
              : order
          )
        );

        setFullStatusCounts((prev) => {
          const oldStatus = orders.find(o => o._id == id)?.order_status || "";
          const next = { ...prev };
          if (oldStatus) next[oldStatus] = (next[oldStatus] || 1) - 1;
          next[newStatus] = (next[newStatus] || 0) + 1;
          return next;
        });
      } else {
        toast.error(data.error || "Lỗi cập nhật trạng thái.");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ.");
    }
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
  try {
    const res = await fetch(`https://bevclock-production.up.railway.app/api/admin/order/suaStatus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: newStatus }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || 'Cập nhật trạng thái thanh toán thành công!');

      setOrders((prev) =>
        prev.map((order) =>
          order._id == id ? { ...order, payment_status: newStatus as IOrder['payment_status'] } : order
        )
      );
    } else {
      toast.error(data.error || 'Lỗi cập nhật trạng thái thanh toán.');
    }
  } catch {
    toast.error('Lỗi kết nối máy chủ.');
  }
  };

  function countByStatus(status: string): number {
  const key = reverseStatusMap[status];
  return fullStatusCounts[key] ?? 0;
  }

  return (
    <div className={`${styles.container} ${isSidebarCollapsed ? styles.containerExpanded : ''}`}>
      <div className={styles.header}><h1 className={styles.title}>Đơn hàng</h1></div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {displayStatuses.map((status) => {
          const config = statusConfigs[status as keyof typeof statusConfigs];
          const count = countByStatus(status);
          const isSelected = reverseStatusMap[status] == statusFilter;
          return (
            <div
              key={status}
              className={`${styles.statusFlex} ${config.className} ${isSelected ? styles.activeStatus : ''}`}
              onClick={() => {
                setStatusFilter(reverseStatusMap[status]);
                setSelectedPaymentStatus(null);
                setCurrentPage(1);
              }}
              style={{ cursor: 'pointer'}}
            >
              <span className={styles.statusIconText}>
                {config.icon}
                <span>{status}</span>
              </span>
              <span className={styles.statusBadge}>
                {count}
              </span>
            </div>
          );
          })}

          {paymentStatuses.map((label) => {
          const key = Object.keys(paymentStatusMap).find(k => paymentStatusMap[k] == label);
          if (!key) return null;
                
          const count = paymentStatusCounts[key] ?? 0;
          const isSelected = selectedPaymentStatus == key;
                
          return (
            <div
              key={label}
              className={`${styles.statusFlex} ${paymentBadgeClass[key]} ${isSelected ? styles.activeStatus : ''}`}
              onClick={() => {
                setSelectedPaymentStatus(key);
                setStatusFilter('all');
                setCurrentPage(1);
              }}

              style={{ cursor: 'pointer' }}
              >
              <span className={styles.statusIconText}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {paymentStatusIcons[key]}
                  {label}
                </span>
              </span>
              <span className={styles.statusBadge}>
                {count}
              </span>
            </div>
          );
          })}
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Tìm kiếm</label>
            <div style={{ position: 'relative' }}>
              <Search className={styles.searchIcon} size={16} />
              <input type="text" placeholder="Tên người dùng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.filterGroupFixed}>
            <label className={styles.label}>Sắp xếp theo</label>
            <select value={sortOption} onChange={e => setSortOption(e.target.value)} className={styles.select}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price-asc">Tổng tiền A-Z</option>
              <option value="price-desc">Tổng tiền Z-A</option>
            </select>
          </div>

          <button className={styles.resetButton} onClick={handleReset}>Đặt lại</button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>STT</th>
                <th>Người dùng</th>
                <th>Hình ảnh</th>
                <th>Sản phẩm</th>
                <th>Tổng</th>
                <th>Ngày mua</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const user = order.user_id;
                const username = typeof user === 'object' ? user?.username || 'Không rõ' : 'Không rõ';
                const item = order.details?.[0];
                const product = item?.product_id;
                const productName = product?.name || 'Không rõ';
                const productImage = product?.main_image;
                const imagePath = productImage?.image ? `/images/product/${productImage.image}` : null;
                const orderStatusText = order.order_status ? statusMap[order.order_status] || 'Không rõ' : 'Không rõ';
                const orderStatusLabel = orderStatusText as keyof typeof statusConfigs;
                const lockedStatuses = ['delivered', 'returned', 'cancelled'];
                const isLocked = order.order_status ? lockedStatuses.includes(order.order_status) : false;
                const isBankTransfer = order.payment_method_id?.name == 'Chuyển khoản Ngân hàng';
                const canRefund =
                  isBankTransfer &&
                  order.order_status == 'returned' &&
                  order.payment_status == 'refunding';
                const isCOD = order.payment_method_id?.name == 'Thanh toán khi nhận hàng (COD)';
                const canMarkPaid =
                  isCOD &&
                  order.order_status == 'delivered' &&
                  order.payment_status == 'unpaid' ||
                  order?.order_status == 'cancelled' && 
                  order.payment_status == 'refunding'; 

                return (
                  <tr key={order._id}>
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    <td>{username}</td>
                    <td><Image src={imagePath ? `${imagePath}` : `/images/logo/logoV.png`} alt={imagePath ?? 'Product image'} width={80} height={80} style={{ objectFit: "cover" }} /></td>
                    <td>{productName}</td>
                    <td>{order.total_amount?.toLocaleString('vi-VN')}đ</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'Không rõ'}</td>
                    <td style={{ transform: "translateX(0px)" }}>
                      <span className={`${styles.statusFlex} ${order.payment_status ? paymentBadgeClass[order.payment_status] || '' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {order.payment_status ? paymentStatusIcons[order.payment_status] : null}
                        {order.payment_status ? paymentStatusMap[order.payment_status] || order.payment_status : 'Không rõ'}
                      </span>
                    </td>

                    <td>
                      <span className={`${styles.statusFlex} ${statusConfigs[orderStatusLabel]?.className}`}>
                        {statusConfigs[orderStatusLabel]?.icon}
                        {orderStatusText}
                      </span>
                    </td> 
                    <td>
                      <div className={styles.actions}>
                        <Link href={`orders/${order._id}`}><button className={styles.actionButton}><Eye size={16} /></button></Link>

                        <button
                          className={`${styles.badgeButton} ${isLocked ? styles.disabledButton : styles.nextButton}`}
                          disabled={isLocked}
                          onClick={() => openConfirmModal(order, index, 'nextStatus')}
                        >
                          Chuyển trạng thái
                        </button>

                        <button
                          className={`${styles.badgeButton} ${isLocked ? styles.disabledButton : styles.cancelButton}`}
                          disabled={isLocked}
                          onClick={() => openConfirmModal(order, index, 'cancel')}
                        >
                          Hủy
                        </button>

                        {canRefund && (
                          <button
                            className={`${styles.badgeButton} ${order.payment_status == 'refunded' ? styles.disabledButton : styles.refundButton}`}
                            disabled={order.payment_status == 'refunded'}
                            onClick={() => updatePaymentStatus(order._id, 'refunded')}
                          >
                            Hoàn tiền
                          </button>
                        )}

                        {canMarkPaid && (
                          <button
                            className={`${styles.badgeButton} ${styles.nextButton}`}
                            onClick={() => updatePaymentStatus(order._id, 'paid')}
                          >
                            Cập nhật thanh toán
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length == 0 && <tr><td colSpan={9} style={{ textAlign: 'center' }}>Không có đơn hàng nào.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, total)} trong {total} đơn hàng</div>
          <div className={styles.paginationButtons}>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(1)} className={styles.paginationButton}>Trang đầu</button>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(currentPage - 1)} className={styles.paginationButton}>&laquo;</button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`${styles.paginationButton} ${currentPage == page ? styles.paginationButtonActive : ''}`}>{page}</button>
            ))}
            <button disabled={currentPage == totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={styles.paginationButton}>&raquo;</button>
            <button onClick={() => setCurrentPage(totalPages)} className={styles.paginationButton}>Trang cuối</button>
          </div>
        </div>
      </div>

      {modalVisible && selectedOrder && (
         <div className={styles.modalOverlay}>
           <div className={styles.modalBox}>
             <div className={styles.modalHeader}>
               <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <span style={{ color: '#facc15' }}>⚠️</span>
                 <strong className={styles.headingModel}>Xác nhận {modalAction == 'cancel' ? 'hủy đơn' : 'chuyển trạng thái'}</strong>
               </span>
             </div>
             <div className={styles.modalBody}>
               <p>
                 Bạn có chắc chắn muốn {modalAction == 'cancel' ? 'hủy' : 'chuyển trạng thái'} đơn hàng số <strong>{(currentPage - 1) * limit + selectedIndex + 1}</strong> không?
               </p>
               <p style={{ color: 'red', marginTop: 6 }}>Lưu ý: Hành động này không thể hoàn tác!</p>
             </div>
             <div className={styles.modalFooter}>
               <button onClick={() => setModalVisible(false)} className={styles.cancelButtonModal}>Hủy</button>
               <button onClick={handleConfirmAction} className={styles.deleteButtonModal}>Xác nhận</button>
             </div>
           </div>
         </div>
       )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default OrdersPage;

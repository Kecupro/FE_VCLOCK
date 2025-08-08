"use client";



import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Info, ShoppingCart } from "lucide-react";
import Image from "next/image";
import styles from '../../assets/css/detailOrder.module.css';
import { useAppContext } from '../../../context/AppContext';
import { IOrder, IOrderDetail } from '@/app/(site)/cautrucdata';
import { ToastContainer, toast } from "react-toastify";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [details, setDetails] = useState<IOrderDetail[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'cancel' | 'nextStatus' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  // ! <== Xử lý logic order ==>
  const openConfirmModal = (
      order: IOrder,
      action: 'cancel' | 'nextStatus'
      ) => {
      setSelectedOrder(order);
      setModalAction(action);
      setModalVisible(true);
    };
  
  const handleConfirmAction = async () => {
      if (!selectedOrder || !modalAction) return;

      if (modalAction == 'cancel') {
        await updateOrderStatus(selectedOrder._id, 'daHuy');
      
        if (selectedOrder.payment_status == 'thanhToan') {
          await updatePaymentStatus(selectedOrder._id, 'choHoanTien');
        } else {
          await updatePaymentStatus(selectedOrder._id, 'chuaThanhToan');
        }
      } else if (modalAction == 'nextStatus') {
        const next = getNextStatus(selectedOrder.order_status);
        if (next) await updateOrderStatus(selectedOrder._id, next);
      }
    
      setModalVisible(false);
      setSelectedOrder(null);
      setModalAction(null);
  };

  const getNextStatus = (current: string) => {
    const orderFlow = [
        "choXuLy",
        "dangXuLy",
        "dangGiaoHang",
        "daGiaoHang",
        "daHuy",
        "hoanTra",
        "hoanThanh"
      ];
    const currentIndex = orderFlow.indexOf(current);
    if (currentIndex >= 0 && currentIndex < orderFlow.length - 1) {
      return orderFlow[currentIndex + 1];
    }
    return null;
  };

  const lockedStatuses = ['daGiaoHang', 'hoanTra', 'hoanThanh', 'daHuy'];
  const isLocked = lockedStatuses.includes(order?.order_status ?? '');
  const isBankTransfer = order?.payment_method_id?.name == 'Chuyển khoản Ngân hàng';
  const canRefund =
    isBankTransfer &&
    order.order_status == 'hoanTra' &&
    order.payment_status == 'choHoanTien';
  const isCOD = order?.payment_method_id?.name == 'Thanh toán khi nhận hàng (COD)';
  const canMarkPaid =
    isCOD &&
    order.order_status == 'daGiaoHang' &&
    order.payment_status == 'chuaThanhToan' ||
    order?.order_status == 'daHuy' && 
    order.payment_status == 'choHoanTien';
  // ! <== Xử lý logic order ==>
  const getStatusLabel = (status?: string) => {
      switch (status) {
        case 'choXuLy':
          return 'Chờ xử lý';
        case 'dangXuLy':
          return 'Đang xử lý';
        case 'dangGiaoHang':
          return 'Đang giao';
        case 'daGiaoHang':
          return 'Đã giao';
        case 'hoanTra':
          return 'Hoàn trả';
        case 'daHuy':
          return 'Đã hủy';
        case 'hoanThanh':
          return 'Hoàn thành';
        default:
          return 'Không rõ';
      }
  };

  const getStatusStyle = (status?: string) => {
      switch (status) {
        case 'choXuLy':
          return styles.statuschoXuLy;
        case 'dangXuLy':
          return styles.statusdangXuLy;
        case 'dangGiaoHang':
          return styles.statusdangGiaoHang;
        case 'daGiaoHang':
          return styles.statusdaGiaoHang;
        case 'hoanTra':
          return styles.statushoanTra;
        case 'daHuy':
          return styles.statusdaHuy;
        case 'hoanThanh':
          return styles.statushoanThanh;
        default:
          return styles.statusUnknown;
      }
  };

  const paymentLabels: Record<string, string> = {
      chuaThanhToan: 'Chưa thanh toán',
      thanhToan: 'Đã thanh toán',
      choHoanTien: 'Chờ hoàn tiền',
      hoanTien: 'Đã hoàn tiền',
  };

  const paymentBadgeStyles: Record<string, string> = {
      chuaThanhToan: styles.statuschuaThanhToan,
      thanhToan: styles.statusthanhToan,
      choHoanTien: styles.statuschoHoanTien,
      hoanTien: styles.statushoanTien,
  };

  const { isDarkMode } = useAppContext();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle(styles["dark-mode"], isDarkMode);
  }, [isDarkMode]);

  const fetchOrder = React.useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/order`);
      const data = await res.json();
      const found = data.list.find((o: IOrder) => o._id == id);
      setOrder(found);
    } catch {
      toast.error('Lỗi khi tải đơn hàng');
    }
  }, [id]);

  const fetchOrderDetails = React.useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/order/chitiet/${id}`);
      const data = await res.json();
      setDetails(data);
    } catch {
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    }
  }, [id]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/order/suaStatus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: newStatus }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || "Cập nhật trạng thái thành công!");
      setOrder((prev) => {
        if (!prev) return prev;
        return { ...prev, order_status: newStatus as IOrder['order_status'] };
      });
    }
  } catch {
    toast.error("Lỗi khi cập nhật trạng thái đơn hàng");
  }
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/order/suaStatus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: newStatus }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || 'Cập nhật trạng thái thanh toán thành công!');
      setOrder((prev) => {
        if (!prev) return prev;
        return { ...prev, payment_status: newStatus as IOrder['payment_status'] };
      });
    } else {
      toast.error(data.error || 'Lỗi cập nhật trạng thái thanh toán.');
    }
  } catch {
    toast.error('Lỗi kết nối máy chủ.');
  }
  };

  useEffect(() => {
    fetchOrder();
    fetchOrderDetails();
  }, [fetchOrder, fetchOrderDetails]);

  const formatCurrency = (num: number) =>
    num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const handleBack = () => {
    router.back();
  };

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

  return (
    <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chi tiết đơn hàng</h1>
          <button onClick={handleBack} className={styles.returnButton}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className={styles.form}>
            <div className={styles.productDetailsGrid}>

             <div className={styles.customerInfoWrapper}>
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <User size={18} /> &nbsp;Thông tin cơ bản
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Người đặt:</span>
                    <span className={styles.detailValue}>{order?.user_id.username}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{order?.user_id.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Người nhận:</span>
                    <span className={styles.detailValue}>{order?.user_id.addresses[0]?.receiver_name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>SĐT:</span>
                    <span className={styles.detailValue}>{order?.user_id.addresses[0]?.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Địa chỉ:</span>
                    <span className={styles.detailValue}>{order?.user_id.addresses[0]?.address}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ghi chú:</span>
                    <span className={styles.detailValue}>{order?.note != "" ? order?.note : "Không có ghi chú"}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <Info size={18} /> &nbsp;Thông tin thêm
                  </h3>
                  <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Voucher:</span>
                      <span className={styles.detailValue}>
                        {order?.voucher_id ? (
                          <>
                            <div><strong>Tên:</strong> {order.voucher_id.voucher_name}</div>
                            <div><strong>Mã:</strong> {order.voucher_id.voucher_code}</div>
                            <div>
                              <strong>Loại:</strong>{' '}
                              {order.voucher_id.discount_type == 'percentage' ? 'Giảm theo %' : 'Giảm cố định'}
                            </div>
                            <div>
                              <strong>Giá trị:</strong>{' '}
                              {order.voucher_id.discount_type == 'percentage'
                                ? `${order.voucher_id.discount_value}%`
                                : `${formatCurrency(order.voucher_id.discount_value)}`}
                            </div>
                          </>
                        ) : (
                          'Không áp dụng voucher'
                        )}
                      </span>
                    </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phương thức thanh toán:</span>
                    <span className={styles.detailValue}>{order?.payment_method_id?.name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ngày tạo:</span>
                    <span className={styles.detailValue}>{formatDate(order?.created_at)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ngày cập nhật:</span>
                    <span className={styles.detailValue}>{formatDate(order?.updated_at)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phí vận chuyển</span>
                    <span className={styles.detailValue}>
                      {order?.shipping_fee != undefined ? formatCurrency(order.shipping_fee) : 'Không'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Số tiền giảm</span>
                    <span className={styles.detailValue}>
                      {order?.discount_amount != undefined ? formatCurrency(order.discount_amount) : 'Không'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tổng tiền:</span>
                    <span className={styles.detailValue}>
                      {order?.total_amount != undefined ? formatCurrency(order.total_amount) : 'Không'}
                    </span>
                  </div>
                </div>
             </div>

             <div className={styles.productListWrapper}>
               <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <ShoppingCart size={18} /> &nbsp;Sản phẩm trong đơn hàng
                  </h3>

                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Ảnh</th>
                          <th>Tên</th>
                          <th>Giá</th>
                          <th>Số lượng</th>
                          <th>Tạm tính</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((item, idx) => {
                          const { product_id } = item;
                          const price = product_id.sale_price > 0 ? product_id.sale_price : product_id.price;
                          return (
                            <tr key={idx}>
                              <td>
                                {product_id?.main_image?.image ? (
                                  <Image
                                    src={`/images/product/${product_id.main_image.image}`}
                                    alt={product_id.main_image.alt || 'Ảnh sản phẩm'}
                                    width={80}                                    
                                    height={80}
                                    className={styles.imageOrderDetail}
                                  />
                                ) : '---'}
                              </td>
                              <td>{product_id.name}</td>
                              <td>{formatCurrency(price)}</td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(price * item.quantity)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
             </div>
            </div>
              
            <div className={styles.statusSection}>
              <div className={styles.statusLabel}>Trạng thái</div>
              <span className={`${styles.statusBadge} ${getStatusStyle(order?.order_status)}`}>
                {getStatusLabel(order?.order_status)}
              </span>
            </div>

            <div className={styles.statusSection}>
              <div className={styles.statusLabel}>Trạng thái thanh toán</div>
              <span
                className={`${styles.statusBadge} ${
                  paymentBadgeStyles[order?.payment_status ?? 'chuaThanhToan'] ?? ''
                }`}
              >

                {paymentLabels[order?.payment_status ?? ''] ?? 'Không rõ'}
              </span>
            </div>

            <div className={styles.formActions}>
              <button
                className={`${styles.badgeButton} ${isLocked ? styles.disabledButton : styles.nextButton}`}
                disabled={['daHuy', 'daGiaoHang'].includes(order?.order_status ?? '')}
                onClick={() => order && openConfirmModal(order, 'nextStatus')}
              >
                Chuyển trạng thái
              </button>

              <button
                className={`${styles.badgeButton} ${isLocked ? styles.disabledButton : styles.cancelButton}`}
                disabled={isLocked}
                onClick={() => order && openConfirmModal(order, 'cancel')}
              >
                Hủy đơn hàng
              </button>

              {canRefund && (
                <button
                  className={`${styles.badgeButton} ${order?.payment_status == 'hoanTien' ? styles.disabledButton : styles.refundButton}`}
                  disabled={isLocked}
                  onClick={() => order?._id && updatePaymentStatus(order._id, 'hoanTien')}
                >
                  Hoàn tiền
                </button>
              )}

              {canMarkPaid && (
                <button
                  className={`${styles.badgeButton} ${styles.nextButton}`}
                  onClick={() => order && updatePaymentStatus(order._id, 'thanhToan')}
                >
                  Cập nhật thanh toán
                </button>
              )}

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
                 Bạn có chắc chắn muốn {modalAction == 'cancel' ? 'hủy' : 'chuyển trạng thái'} đơn hàng này không?
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

      <ToastContainer />
    </div>
  );
};

export default OrderDetailPage;

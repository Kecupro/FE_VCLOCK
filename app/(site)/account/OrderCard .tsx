

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { IOrder, IOrderDetail } from "../cautrucdata";
import FormBinhLuan from "./FormBinhLuan";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, RefreshCw, CreditCard, Clock, Loader2, Truck, Undo2 } from "lucide-react";
import Link from "next/link";
import { getProductImageUrl } from '@/app/utils/imageUtils';
interface OrderCardProps {
  user_id: string;
}

const PAGE_SIZE = 5; 

function mapOrderStatus(status?: string) {
  switch (status) {
    case "pending": return "choXuLy";
    case "processing": return "dangXuLy";
    case "shipping": return "dangGiaoHang";
    case "delivered": return "daGiaoHang";
    case "returned": return "hoanTra";
    case "cancelled": return "daHuy";
    case "completed": return "hoanThanh";
    default: return status || "choXuLy";
  }
}
function mapPaymentStatus(status?: string) {
  switch (status) {
    case "unpaid": return "chuaThanhToan";
    case "paid": return "thanhToan";
    case "refunding": return "choHoanTien";
    case "refunded": return "hoanTien";
    case "failed": return "thatBai";
    default: return status || "chuaThanhToan";
  }
}

export default function OrderCard({ user_id }: OrderCardProps) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [orderDetailsMap, setOrderDetailsMap] = useState<Record<string, IOrderDetail[]>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewedDetails, setReviewedDetails] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [returnReason, setReturnReason] = useState("");

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);
  const selectedDetails = selectedOrderId ? orderDetailsMap[selectedOrderId] || [] : [];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders?user_id=${user_id}`);
        const data = await res.json();
      
        if (!Array.isArray(data)) {
          console.warn("API trả về dữ liệu không phải array:", data);
          setOrders([]);
          setOrderDetailsMap({});
          return;
        }
        
        const mapped = data.map((order: IOrder) => ({
          ...order,
          order_status: mapOrderStatus(order.order_status) as IOrder['order_status'],
          payment_status: mapPaymentStatus(order.payment_status) as IOrder['payment_status'],
        }));
        setOrders(mapped);

        const detailMap: Record<string, IOrderDetail[]> = {};
        await Promise.all(
          mapped.map(async (order) => {
            try {
              const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order-details/${order._id}`);
              const details = await detailRes.json();
              detailMap[order._id] = Array.isArray(details) ? details : [];
            } catch (error) {
              console.error(`Lỗi khi tải chi tiết đơn hàng ${order._id}:`, error);
              detailMap[order._id] = [];
            }
          })
        );
        setOrderDetailsMap(detailMap);
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        setOrders([]);
        setOrderDetailsMap({});
      } finally {
        setLoading(false);
      }
    };
    
    if (user_id && user_id.trim() !== '') {
      fetchOrders();
    } else {
      setOrders([]);
      setOrderDetailsMap({});
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/user`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
      
        if (!Array.isArray(data)) {
          console.warn("API reviews trả về dữ liệu không phải array:", data);
          setReviewedDetails({});
          return;
        }
        
        const map: Record<string, number> = {};
        data.forEach((review: { order_detail_id: string, rating: number }) => {
          map[review.order_detail_id] = review.rating;
        });
        setReviewedDetails(map);
      } catch (err) {
        console.error("Lỗi tải đánh giá:", err);
        setReviewedDetails({});
      }
    };
    fetchReviews();
  }, []);

  const handleCancelOrder = async (order_id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cancel-order/${order_id}`, {
        method: "PUT",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể hủy đơn hàng");
      }
      
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order_id ? { ...o, order_status: "daHuy" } : o
        )
      );
      toast.success("Đơn hàng đã được hủy thành công");
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      toast.error(err instanceof Error ? err.message : "Không thể hủy đơn. Vui lòng thử lại.");
    }
  };

  const handleReturnOrder = async (order_id: string, reason: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/return-order/${order_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Có lỗi xảy ra khi trả hàng");
    }
    setOrders((prev) =>
      prev.map((o) =>
        o._id === order_id
          ? {
              ...o,
              order_status: "hoanTra",
              payment_status: o.payment_status === "thanhToan" ? "choHoanTien" : o.payment_status,
              note: (o.note || "") + `\nTrả hàng: ${reason}`,
            }
          : o
      )
    );
    toast.success("Đã yêu cầu trả hàng thành công, chờ xử lý từ shop.");
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Lỗi khi trả đơn: " + err.message);
      } else {
        toast.error("Lỗi khi trả đơn, vui lòng thử lại.");
      }
    }
  };

  const statusColorMap = {
    choXuLy: "text-yellow-500",
    dangXuLy: "text-blue-500",
    dangGiaoHang: "text-purple-500",
    daGiaoHang: "text-green-500",
    hoanTra: "text-orange-500",
    daHuy: "text-red-500",
    hoanThanh: "text-green-600",
  };

  const paymentStatusTextMap = {
    chuaThanhToan: "Chưa thanh toán",
    thanhToan: "Đã thanh toán",
    choHoanTien: "Đang hoàn tiền",
    hoanTien: "Đã hoàn tiền",
    thatBai: "Thất bại",
  };

  const paymentStatusColorMap = {
    chuaThanhToan: "text-yellow-500",
    thanhToan: "text-green-600",
    choHoanTien: "text-blue-500",
    hoanTien: "text-green-500",
    thatBai: "text-red-500",
  };

  const statusIconMap: Record<string, React.ReactNode> = {
    choXuLy: <Clock size={16} className="inline mr-1" />,
    dangXuLy: <Loader2 size={16} className="inline mr-1 animate-spin" />,
    dangGiaoHang: <Truck size={16} className="inline mr-1" />,
    daGiaoHang: <CheckCircle size={16} className="inline mr-1 text-green-500" />,
    hoanTra: <Undo2 size={16} className="inline mr-1 text-orange-500" />,
    daHuy: <XCircle size={16} className="inline mr-1 text-red-500" />,
    hoanThanh: <CheckCircle size={16} className="inline mr-1 text-green-600" />,
  };

  const paymentStatusIconMap: Record<string, React.ReactNode> = {
    chuaThanhToan: <CreditCard size={16} className="inline mr-1" />,
    thanhToan: <CheckCircle size={16} className="inline mr-1" />,
    choHoanTien: <RefreshCw size={16} className="inline mr-1" />,
    hoanTien: <CheckCircle size={16} className="inline mr-1" />,
    thatBai: <XCircle size={16} className="inline mr-1" />,
  };

  const statusTextMap: Record<string, string> = {
    choXuLy: "Chờ xác nhận",
    dangXuLy: "Đang xử lý",
    dangGiaoHang: "Đang giao",
    daGiaoHang: "Đã giao",
    hoanTra: "Đã trả hàng",
    daHuy: "Đã hủy",
    hoanThanh: "Hoàn thành",
  };


  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  if (loading) return <div className="p-4">Đang tải đơn hàng...</div>;
  if (orders.length === 0) return <div className="p-4">Không có đơn hàng nào.</div>;

  return (
    <>

      {paginatedOrders.map((order) => (
        <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white space-y-2 shadow-sm mb-4">
          <div className="flex justify-between text-sm text-gray-700">
            <div>
              <p>Mã đơn: <strong>#{order.orderCode || `DH-${order._id.slice(-8)}`}</strong></p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`${statusColorMap[order.order_status || "choXuLy"]} font-medium`}>
                {statusIconMap[order.order_status || "choXuLy"]}
                {statusTextMap[order.order_status || "choXuLy"]}
              </span>
              <span className={`flex items-center text-xs mt-1 ${paymentStatusColorMap[order.payment_status || "chuaThanhToan"]}`}>
                {paymentStatusIconMap[order.payment_status || "chuaThanhToan"]}
                {paymentStatusTextMap[order.payment_status || "chuaThanhToan"]}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm mt-2">
            <p>Phương thức thanh toán: <strong>{order.payment_method_id.name}</strong></p>
            <p>
              Thành tiền:{" "}
              <span className="text-red-600 font-semibold text-lg">
                {(order.total_amount || 0).toLocaleString("vi-VN")}₫
              </span>
            </p>
          </div>
          <p>Tên người nhận: {order.address_id?.receiver_name}</p>

          <div className="text-sm text-gray-500 mt-2">
            <p>Ngày đặt: {new Date(order.created_at || "").toLocaleDateString("vi-VN")}</p>
            {order.note && <p>Ghi chú: {order.note}</p>}
          </div>

          <div className="flex justify-end items-center gap-2 flex-wrap">

            {order.order_status === "choXuLy" && (
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className="border border-red-500 text-red-500 px-4 py-1.5 rounded text-sm hover:bg-red-50">
                    Hủy đơn
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                  <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 z-50">
                    <Dialog.Title className="text-lg font-semibold text-red-600">Xác nhận hủy đơn</Dialog.Title>
                    <div className="text-sm text-gray-600">
                      Bạn có chắc chắn muốn hủy đơn hàng này không?
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close asChild>
                        <button className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100">
                          Không
                        </button>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Đồng ý
                        </button>
                      </Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            )}


            <button
              className="border border-gray-400 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50"
              onClick={() => setSelectedOrderId(order._id)}
            >
              Xem chi tiết
            </button>

              <button
                onClick={() => window.location.href = "/shop"}
                className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded text-sm hover:bg-blue-50"
              >
                Tiếp tục mua sắm
              </button>

            {order.order_status === "daGiaoHang" && (
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded text-sm hover:bg-orange-50">
                    Trả đơn
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                  <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 z-50">
                    <Dialog.Title className="text-lg font-semibold text-orange-600">Yêu cầu trả hàng</Dialog.Title>
                    <div className="text-sm text-gray-600">
                      Vui lòng nhập lý do trả hàng:
                    </div>
                    <textarea
                      rows={3}
                      className="w-full mt-2 p-2 border rounded text-sm leading-[1.5rem] resize-none box-border"
                      placeholder="Ví dụ: Sản phẩm không đúng mô tả, bị lỗi, giao sai..."
                      onChange={(e) => setReturnReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close asChild>
                        <button className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100">
                          Hủy
                        </button>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <button
                          onClick={() => handleReturnOrder(order._id, returnReason)}
                          disabled={!returnReason.trim()}
                          className="px-4 py-1.5 text-sm rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                        >
                          Gửi yêu cầu
                        </button>
                      </Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            )}
          </div>
        </div>
      ))}

      <Dialog.Root open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-semibold mb-4">Chi tiết đơn hàng</Dialog.Title>
      {selectedOrder && (
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Mã đơn:</strong> #{selectedOrder.orderCode || `DH-${selectedOrder._id.slice(-8)}`}</p>
                <p><strong>Phương thức:</strong> {selectedOrder.payment_method_id.name}</p>
                <p><strong>Trạng thái đơn hàng: </strong> 
                    <span className={`${statusColorMap[selectedOrder.order_status || "choXuLy"]} font-medium`}>
                    {statusIconMap[selectedOrder.order_status || "choXuLy"]}
                      {statusTextMap[selectedOrder.order_status || "choXuLy"]}
                    </span>
                </p>
                <p><strong>Trạng thái thanh toán: </strong><span className={`${paymentStatusColorMap[selectedOrder.payment_status || "chuaThanhToan"]}`}>
                    {paymentStatusIconMap[selectedOrder.payment_status || "chuaThanhToan"]}
                      {paymentStatusTextMap[selectedOrder.payment_status || "chuaThanhToan"]}
                    </span>
                </p>
                <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.created_at || "").toLocaleDateString("vi-VN")}</p>
                <p><strong>Ghi chú:</strong> {selectedOrder.note || "Không có"}</p>
                <p><strong>Tên người nhận:</strong> {selectedOrder.address_id?.receiver_name}</p>
                <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.address_id?.address}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.address_id?.phone}</p>
                  </div>
            )}

            <hr className="my-4  text-gray-200" />

            <div className="space-y-4">
              {selectedDetails.map((item) => (
                <div key={item._id} className="flex gap-3 items-start border-b pb-3">
                  <Image
                    src={getProductImageUrl(
                      typeof item.product_id.main_image === 'string' ? 
                        item.product_id.main_image : 
                        item.product_id.main_image?.image
                    )}
                    alt={typeof item.product_id.main_image === 'string' ? 
                      item.product_id.name : 
                      (item.product_id.main_image?.alt || item.product_id.name)
                    }
                    width={60}
                    height={60}
                    className="rounded border object-cover"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/product/${item.product_id._id}`}
                      className="text-sm font-medium text-gray-800 hover:underline"
                    >
                      {item.product_id.name}
                    </Link>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {item.price.toLocaleString("vi-VN")}₫
                    </p>
                    {selectedOrder?.order_status === "daGiaoHang" && (
                      reviewedDetails[item._id] ? (
                        <div className="mt-2 text-sm text-green-600">
                          <i className="fa-solid fa-star text-red-500"></i> Bạn đã đánh giá ({reviewedDetails[item._id]}/5)
                        </div>
                      ) : (
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:underline transition">
                              <i className="fa-regular fa-pen-to-square"></i> Đánh giá sản phẩm
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
                            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                                      bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl
                                                      max-h-[90vh] overflow-y-auto border border-gray-200 space-y-4">
                              <Dialog.Title className="text-lg font-semibold mb-4">Đánh giá sản phẩm</Dialog.Title>
                              <FormBinhLuan
                                productId={item.product_id._id}
                                orderDetailId={item._id}
                                onSuccess={(rating) => {
                                  toast.success("Đánh giá thành công");
                                  setReviewedDetails(prev => ({ ...prev, [item._id]: rating }));
                                }}
                              />
                              <div className="text-right">
                                <Dialog.Close asChild>
                                  <button className="mt-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Đóng</button>
                                </Dialog.Close>
                              </div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4 text-gray-200" />
            <div className="text-right text-lg font-bold text-red-600">
              Tổng: {(selectedOrder?.total_amount ?? 0).toLocaleString("vi-VN")}₫
              </div>

            <div className="text-right pt-4">
                <Dialog.Close asChild>
                <button className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Đóng</button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Trang trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect } from "react";
import { IOrder } from "../cautrucdata";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock, Loader2, Truck, CheckCircle, Undo2, XCircle, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderCardProps {
  user_id: string;
}

const PAGE_SIZE = 5;

export default function OrderCard({ user_id }: OrderCardProps) {
  const [orders, setOrders] = useState<IOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/orders?user_id=${user_id}`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data || []);
        } else {
          console.error("Lỗi khi tải đơn hàng:", data.error);
        }
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };



    if (user_id) {
      fetchOrders();
    }
  }, [user_id]);

  const handleCancelOrder = async (order_id: string) => {
    try {
      await fetch(`http://localhost:3000/api/cancel-order/${order_id}`, {
        method: "PUT",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order_id ? { ...o, order_status: "daHuy" } : o
        )
      );
      toast.success("Đơn hàng đã được hủy thành công");
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      alert("Không thể hủy đơn. Vui lòng thử lại.");
    }
  };

  const handleReturnOrder = async (order_id: string, reason: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/return-order/${order_id}`, {
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
  };

  const paymentStatusColorMap = {
    chuaThanhToan: "text-yellow-500",
    thanhToan: "text-green-600",
    choHoanTien: "text-blue-500",
    hoanTien: "text-green-500",
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

  // Phân trang
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Khi đổi filter thì về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  if (loading) return <div className="p-4">Đang tải đơn hàng...</div>;
  if (orders.length === 0) return <div className="p-4">Không có đơn hàng nào.</div>;

  return (
    <>
      {/* Danh sách đơn hàng */}
      {paginatedOrders.map((order) => (
        <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white space-y-2 shadow-sm mb-4">
          <div className="flex justify-between text-sm text-gray-700">
            <div>
              <p>Mã đơn: <strong>DH-{order._id.slice(-8)}</strong></p>
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
            {/* Nút tuỳ trạng thái */}
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
                          className="px-4 py-1.5 text-sm rounded bg-orange-600 text-white hover:bg-orange-700"
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

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <Dialog.Root open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30" />
            <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 z-50 max-h-[80vh] overflow-y-auto">
              <Dialog.Title className="text-lg font-semibold">Chi tiết đơn hàng</Dialog.Title>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <p>Mã đơn: <strong>DH-{selectedOrder._id.slice(-8)}</strong></p>
                    <p>Ngày đặt: {new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="text-right">
                    <span className={`${statusColorMap[selectedOrder.order_status || "choXuLy"]} font-medium`}>
                      {statusTextMap[selectedOrder.order_status || "choXuLy"]}
                    </span>
                    <br />
                    <span className={`${paymentStatusColorMap[selectedOrder.payment_status || "chuaThanhToan"]} text-xs`}>
                      {paymentStatusTextMap[selectedOrder.payment_status || "chuaThanhToan"]}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Thông tin giao hàng</h4>
                  <p>Tên người nhận: {selectedOrder.address_id?.receiver_name}</p>
                  <p>Địa chỉ: {selectedOrder.address_id?.address}</p>
                  <p>Số điện thoại: {selectedOrder.address_id?.phone}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Sản phẩm</h4>
                  {selectedOrder.details?.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{detail.product_id.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Tổng tiền:</span>
                    <span className="font-semibold text-lg">
                      {(selectedOrder.total_amount || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  {selectedOrder.note && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Ghi chú: {selectedOrder.note}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100">
                    Đóng
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  );
}

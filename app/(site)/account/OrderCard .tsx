import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { IOrder, IOrderDetail } from "../cautrucdata";
import FormBinhLuan from "./FormBinhLuan";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, RefreshCw, CreditCard, Clock, Loader2, Truck, Undo2 } from "lucide-react";
import Link from "next/link";

interface OrderCardProps {
  user_id: string;
}

const PAGE_SIZE = 5; // Số đơn mỗi trang

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
        const res = await fetch(`http://localhost:3000/api/orders?user_id=${user_id}`);
        const data: IOrder[] = await res.json();
        setOrders(data);

        // fetch chi tiết từng đơn hàng
        const detailMap: Record<string, IOrderDetail[]> = {};
        await Promise.all(
          data.map(async (order) => {
            const detailRes = await fetch(`http://localhost:3000/api/order-details/${order._id}`);
            const details: IOrderDetail[] = await detailRes.json();
            detailMap[order._id] = details;
          })
        );
        setOrderDetailsMap(detailMap);
      } catch (err) {
        console.error("Lỗi khi fetch đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user_id]);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:3000/reviews/user`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const map: Record<string, number> = {};
        data.forEach((review: { order_detail_id: string, rating: number }) => {
          map[review.order_detail_id] = review.rating;
        });
        setReviewedDetails(map);
      } catch (err) {
        console.error("Lỗi fetch review:", err);
      }
    };
    fetchReviews();
  }, []);

  const handleCancelOrder = async (order_id: string) => {
    try {
      await fetch(`http://localhost:3000/api/cancel-order/${order_id}`, {
        method: "PUT",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order_id ? { ...o, order_status: "cancelled" } : o
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
        "Content-Type": "application/json", // ⬅️ THIẾU DÒNG NÀY
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
              order_status: "returned",
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
    pending: "text-yellow-500",
    processing: "text-blue-500",
    shipping: "text-purple-500",
    delivered: "text-green-500",
    returned: "text-orange-500",
    cancelled: "text-red-500",
  };

  const paymentStatusTextMap = {
    unpaid: "Chưa thanh toán",
    paid: "Đã thanh toán",
    refunding: "Đang hoàn tiền",
    refunded: "Đã hoàn tiền",
    failed: "Thất bại",
  };

  const paymentStatusColorMap = {
    unpaid: "text-yellow-500",
    paid: "text-green-600",
    refunding: "text-blue-500",
    refunded: "text-green-500",
    failed: "text-red-500",
  };

  const statusIconMap: Record<string, React.ReactNode> = {
    pending: <Clock size={16} className="inline mr-1" />,
    processing: <Loader2 size={16} className="inline mr-1 animate-spin" />,
    shipping: <Truck size={16} className="inline mr-1" />,
    delivered: <CheckCircle size={16} className="inline mr-1 text-green-500" />,
    returned: <Undo2 size={16} className="inline mr-1 text-orange-500" />,
    cancelled: <XCircle size={16} className="inline mr-1 text-red-500" />,
  };

  const paymentStatusIconMap: Record<string, React.ReactNode> = {
    unpaid: <CreditCard size={16} className="inline mr-1" />,
    paid: <CheckCircle size={16} className="inline mr-1" />,
    refunding: <RefreshCw size={16} className="inline mr-1" />,
    refunded: <CheckCircle size={16} className="inline mr-1" />,
    failed: <XCircle size={16} className="inline mr-1" />,
  };

  const statusTextMap: Record<string, string> = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    returned: "Đã trả hàng",
    cancelled: "Đã hủy",
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
              <p>Mã đơn: <strong>DH-{order.orderCode}</strong></p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`${statusColorMap[order.order_status || "pending"]} font-medium`}>
                {statusIconMap[order.order_status || "pending"]}
                {statusTextMap[order.order_status || "pending"]}
              </span>
              <span className={`flex items-center text-xs mt-1 ${paymentStatusColorMap[order.payment_status || "unpaid"]}`}>
                {paymentStatusIconMap[order.payment_status || "unpaid"]}
                {paymentStatusTextMap[order.payment_status || "unpaid"]}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm mt-2">
            <p>Phương thức thanh toán: <strong>{order.payment_method_id.name}</strong></p>
            <p>
              Thành tiền:{" "}
              <span className="text-red-600 font-semibold text-lg">
                {order.total_amount.toLocaleString("vi-VN")}₫
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
            {order.order_status === "pending" && (
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

            {order.order_status === "delivered" && (
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
                          disabled={!returnReason.trim()} // ✅ Chặn gửi nếu chưa nhập lý do
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

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  onClick={() => setSelectedOrderId(order._id)}
                  className="px-4 py-1.5 border border-black text-sm rounded hover:bg-black hover:text-white"
                >
                  Xem chi tiết
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg">
                  <Dialog.Title className="text-xl font-semibold mb-4">Chi tiết đơn hàng</Dialog.Title>
                  {selectedOrder && (
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>Mã đơn:</strong> DH-{selectedOrder.orderCode}</p>
                      <p><strong>Phương thức:</strong> {selectedOrder.payment_method_id.name}</p>
                      <p><strong>Trạng thái đơn hàng: </strong> 
                        <span className={`${statusColorMap[order.order_status || "pending"]} font-medium`}>
                          {statusIconMap[order.order_status || "pending"]}
                          {statusTextMap[order.order_status || "pending"]}
                        </span>
                      </p>
                      <p><strong>Trạng thái thanh toán: </strong><span className={`${paymentStatusColorMap[order.payment_status || "unpaid"]}`}>
                          {paymentStatusIconMap[order.payment_status || "unpaid"]}
                          {paymentStatusTextMap[order.payment_status || "unpaid"]}
                        </span>
                      </p>
                      <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.created_at || "").toLocaleDateString("vi-VN")}</p>
                      <p><strong>Ghi chú:</strong> {selectedOrder.note || "Không có"}</p>
                      <p><strong>Tên người nhận:</strong> {selectedOrder.address_id?.receiver_name}</p>
                      <p><strong>Địa chỉ giao hàng:</strong> {order.address_id?.address}</p>
                      <p><strong>Số điện thoại:</strong> {order.address_id?.phone}</p>
                    </div>
                  )}

                  <hr className="my-4" />

                  <div className="space-y-4">
                    {selectedDetails.map((item) => (
                      <div key={item._id} className="flex gap-3 items-start border-b pb-3">
                        <Image
                          src={`/images/product/${item.product_id.main_image.image}`}
                          alt={item.product_id.main_image.alt}
                          width={60}
                          height={60}
                          className="rounded border object-cover"
                        />
                        <div className="flex-1">
                          {/* Thêm link sang trang sản phẩm */}
                          <Link
                            href={`/product/${item.product_id._id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {item.product_id.name}
                          </Link>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {item.price.toLocaleString("vi-VN")}₫
                          </p>
                          {/* Nút đánh giá nếu đơn đã giao */}
                          {selectedOrder?.order_status === "delivered" && (
                            reviewedDetails[item._id] ? (
                              <div className="mt-2 text-sm text-green-600">
                                <i className="fa-solid fa-star text-yellow-400"></i> Bạn đã đánh giá ({reviewedDetails[item._id]}/5)
                              </div>
                            ) : (
                              <Dialog.Root>
                                <Dialog.Trigger asChild>
                                  <button className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline transition">
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

                  <hr className="my-4" />
                  <div className="text-right text-lg font-bold text-red-600">
                    Tổng: {selectedOrder?.total_amount.toLocaleString("vi-VN")}₫
                  </div>

                  <div className="text-right pt-4">
                    <Dialog.Close asChild>
                      <button className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Đóng</button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      ))}

      {/* Phân trang */}
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

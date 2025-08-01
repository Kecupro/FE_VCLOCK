"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";
import { useCart } from "../components/CartContext";

// Force dynamic rendering to avoid build issues
export const dynamic = 'force-dynamic';

export default function CartPage() {
  const {
  cart,
  selectedItems,
  total,
  updateQuantity,
  removeItem,
  toggleSelectItem,
  toggleSelectAll,
  clearCart,
} = useCart();

  const router = useRouter();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="w-full bg-gray-50 pt-42 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Giỏ hàng của bạn</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="fas fa-shopping-cart text-6xl"></i>
            </div>
            <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
            <Link
              href="/shop"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center mb-2">
                {/* chọn tất cả sản phảma trong giỏ */}
              <button
                onClick={toggleSelectAll}
                className="flex items-center m-3 gap-2 px-3 py-2 rounded text-sm transition-colors bg-gray-100 hover:bg-gray-200"
              >
                {selectedItems.length === cart.length ? (
                  <CheckCircle className="text-red-600 w-5 h-5" />
                ) : (
                  <Circle className="text-gray-500 w-5 h-5" />
                )}
                {selectedItems.length === cart.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>  
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item._id} className="p-4 sm:p-6">
                      <button onClick={() => toggleSelectItem(item._id)} className="focus:outline-none">
                        {selectedItems.includes(item._id) ? (
                          <CheckCircle className="text-red-600" />
                        ) : (
                          <Circle className="text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="w-full sm:w-20 h-20 flex-shrink-0">
                          <Link href={`/product/${item._id}`} className="relative w-full h-full">
                              <Image
                                src={`/images/product/${item.main_image.image}`}
                                alt={item.name}
                                className="w-full h-full object-contain rounded-lg bg-gray-50"
                                width={80}
                                height={80}
                              />
                          </Link>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <Link href={`/product/${item._id}`}>
                              <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {(item.sale_price > 0 ? item.sale_price : item.price).toLocaleString("vi-VN")}đ
                              </p>
                              {item.sale_price > 0 && (
                                <p className="text-xs text-gray-500 line-through">
                                  {item.price.toLocaleString("vi-VN")}đ
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => {
                                if (item.so_luong > 1) {
                                  updateQuantity(item._id, item.so_luong - 1);
                                } else {
                                  toast.error("Số lượng không hợp lệ hoặc đã đạt giới hạn tối thiểu.");
                                }
                              }}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <i className="fas fa-minus text-xs"></i>
                            </button>

                            <input
                              type="number"
                              min={1}
                              value={item.so_luong}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (isNaN(val)) return;

                                const product = cart.find((p) => p._id === item._id);
                                if (!product) return;

                                if (val > product.quantity) {
                                  toast.error(`Số lượng hàng không đủ. Chỉ còn ${product.quantity} sản phẩm.`);
                                  updateQuantity(item._id, product.quantity); // auto set về tối đa
                                } else {
                                  updateQuantity(item._id, val);
                                }
                              }}
                              className="w-12 text-center text-sm text-gray-900 focus:outline-none"
                            />

                            <button
                              onClick={() => {
                                if (item.so_luong < item.quantity) {
                                  updateQuantity(item._id, item.so_luong + 1);
                                } else {
                                  toast.error("Số lượng không hợp lệ hoặc đã đạt giới hạn tối đa.");
                                }
                              }}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <i className="fas fa-plus text-xs"></i>
                            </button>
                          </div>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <i className="fas fa-trash-alt text-sm"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="mt-2 w-70 my-5 bg-white border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-trash-alt"></i>
                Xoá toàn bộ giỏ hàng
              </button>
              {showConfirmModal && (
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 h-full min-h-screen"
                  onClick={() => setShowConfirmModal(false)} // click ngoài modal
                >
                  <div
                    className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()} // chặn click bên trong lan ra
                  >
                    <h2 className="text-lg font-semibold mb-4">Xác nhận xoá</h2>
                    <p className="mb-4 text-gray-700">Bạn có chắc chắn muốn xoá toàn bộ giỏ hàng không?</p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={clearCart}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              )}


            </div>
          

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng đơn hàng</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-medium text-gray-900">
                      <span>Tổng cộng</span>
                      <span>{total.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                    className={`w-full py-3 rounded-lg transition-all duration-300 ${
                      selectedItems.length > 0
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-300 text-white cursor-not-allowed"
                    }`}
                  >
                    Thanh toán
                  </button>

                  <Link
                    href="/shop"
                    className="block text-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
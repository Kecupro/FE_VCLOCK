"use client";


import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect, Suspense } from "react";

export const dynamic = 'force-dynamic';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    if (orderCode) {
      // Kiểm tra xem có phải là mua ngay không
      const buyNowSession = localStorage.getItem("buyNowSession");
      
      if (buyNowSession) {
        // Nếu là mua ngay, chỉ cần xóa session
        localStorage.removeItem("buyNowSession");
      } else {
        // Xử lý giỏ hàng bình thường
        const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
        const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const updatedCart = fullCart.filter((item: { _id: string }) => !selectedIds.includes(item._id));

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        localStorage.removeItem("selectedItems");
      }
    }
  }, [orderCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Đặt hàng thành công</h2>
        {orderCode && (
          <p className="text-gray-600 mb-4">
            Mã đơn hàng: <strong>{orderCode}</strong>
          </p>
        )}
        <p className="text-gray-500 mb-6">
          Cảm ơn bạn đã mua hàng! Đơn hàng đang được xử lý.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={`/account`}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}



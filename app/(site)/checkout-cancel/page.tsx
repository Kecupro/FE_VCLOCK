"use client";


import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Suspense } from "react";

// Force dynamic rendering to avoid build issues
export const dynamic = 'force-dynamic';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4 text-red-500">
          <XCircle size={64} />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Thanh toán đã bị huỷ</h2>
        {orderCode && (
          <p className="text-gray-600 mb-4">
            Mã đơn hàng: <strong>{orderCode}</strong>
          </p>
        )}
        <p className="text-gray-500 mb-6">
          Trạng thái: <strong>{status || "CANCELLED"}</strong>
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/cart"
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Quay lại giỏ hàng
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    }>
      <CheckoutCancelContent />
    </Suspense>
  );
}

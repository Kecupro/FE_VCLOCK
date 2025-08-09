

import React, { useEffect, useState } from "react";
import { IVoucher } from "../cautrucdata"; 
import Link from "next/link"; 
import { FaTicketAlt } from "react-icons/fa";
function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

interface Props {
  user_id: string;
}

const VoucherList: React.FC<Props> = ({ user_id }) => {

  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setVouchers([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setVouchers(data);
          } else {
            setVouchers([]);
          }
        } else {
          setVouchers([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải voucher:", err);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [user_id]);

  if (loading) return <p>Đang tải voucher...</p>;
  const unusedVouchers = vouchers.filter((v: IVoucher & { used?: boolean }) => !v.used);
  if (unusedVouchers.length === 0) return (
    <div className="text-center py-12">
      <i className="fa-solid fa-ticket text-6xl text-gray-400 mb-4"></i>
      <p className="text-gray-500 text-lg">Bạn chưa có voucher nào.</p>
    </div>
  );
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
      {unusedVouchers.map((v) => (
        <div
        key={v._id}
        className="relative flex w-full max-w-[420px] h-[96px] sm:h-[110px] md:h-[120px] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mx-auto"
      >
        <div className="flex flex-col items-center justify-center bg-red-700 text-white px-2 py-1 w-[100px] sm:w-[120px] md:w-[140px] rounded-l-lg relative z-20">
          <FaTicketAlt className="hidden sm:block" size={28} color="#fff" />
          <FaTicketAlt className="block sm:hidden" size={20} color="#fff" />
          <span className="font-bold text-[10px] sm:text-xs text-center leading-tight line-clamp-2">{v.voucher_name}</span>
          <span className="bg-white text-[8px] sm:text-[10px] font-semibold px-1 py-0.5 rounded text-[#333] mt-1">{v.voucher_code}</span>
          <span className="text-[8px] sm:text-[9px] mt-1 text-center">HSD: {formatDate(v.end_date)}</span>
        </div>
      
        <div className="flex-1 min-w-0 max-w-[220px] sm:max-w-[260px] md:max-w-[300px] flex flex-col justify-between pl-4 px-1 sm:px-2 py-1 sm:py-2 bg-white">
          <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
            <div className="text-red-500 font-bold text-xs sm:text-sm leading-tight truncate">
              {v.discount_type === "percentage" ? `Giảm ${v.discount_value}%` : `Giảm ${formatCurrency(v.discount_value)}`}
              {v.max_discount && v.discount_type === "percentage" && (<span className="text-[10px] sm:text-xs text-gray-500 ml-1 whitespace-nowrap">(Tối đa {formatCurrency(v.max_discount)})</span>)}
            </div>
            <div className="text-gray-700 font-semibold text-[10px] sm:text-xs truncate">Đơn tối thiểu: {formatCurrency(v.minimum_order_value || 0)}</div>
            <span className={`font-semibold px-1.5 py-0.5 rounded inline-block w-fit text-[9px] sm:text-[10px] mt-1 ${new Date(v.end_date) > new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
              {new Date(v.end_date) > new Date() ? "Còn hiệu lực" : "Hết hạn"}
            </span>
          </div>
          <div className="flex justify-end">
            <Link href={new Date(v.end_date) > new Date() ? "/shop" : "#"}>
              <button
                disabled={new Date(v.end_date) <= new Date()}
                className={`px-2 sm:px-3 py-1 rounded font-bold text-[10px] sm:text-xs shadow transition
                  ${new Date(v.end_date) <= new Date()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"}
                `}
              >
                Sử Dụng
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      ))}
    </div>
  );
};

export default VoucherList;

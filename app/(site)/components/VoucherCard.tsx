

"use client";
import React, { useEffect, useState } from "react";
import { FaTicketAlt } from "react-icons/fa";
import { IVoucher } from "../cautrucdata"; 
import { calcStatus, VoucherStatus, checkEligibility, getEligibilityMessage } from "../utils/voucherUtils";
import Link from "next/link"; 

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
  const [userOrderCount, setUserOrderCount] = useState<number>(0);

  const fetchUserOrderCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3000/user/orders/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserOrderCount(data.count || 0);
      }
    } catch (error) {
      console.error("Lỗi tải số đơn hàng:", error);
      // Fallback: try to get from orders list
      try {
        const ordersRes = await fetch(`http://localhost:3000/user/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (Array.isArray(ordersData)) {
            const completedOrders = ordersData.filter((order: { order_status: string }) => 
              order.order_status === 'hoanThanh' || order.order_status === 'daGiaoHang'
            );
            setUserOrderCount(completedOrders.length);
          }
        }
      } catch (fallbackError) {
        console.error("Lỗi fallback tải đơn hàng:", fallbackError);
      }
    }
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setVouchers([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3000/voucher-user`, {
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
    fetchUserOrderCount();
  }, [user_id]);

  if (loading) return <p>Đang tải voucher...</p>;
  const unusedVouchers = vouchers
    .filter((v: IVoucher & { used?: boolean }) => !v.used && calcStatus(v) !== VoucherStatus.EXPIRED)
    .filter((v) => checkEligibility(v, userOrderCount).eligible);
  if (unusedVouchers.length === 0) return (
    <div className="text-center py-12">
      <i className="fa-solid fa-ticket text-6xl text-gray-400 mb-4"></i>
      <p className="text-gray-500 text-lg">Bạn chưa có voucher nào.</p>
    </div>
  );
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
      {unusedVouchers.map((v) => {
        const status = calcStatus(v);
        const eligibility = checkEligibility(v, userOrderCount);
        const eligibilityMessage = getEligibilityMessage(eligibility.reason, eligibility.reason === 'min_orders' ? 3 : undefined);
        
        return (
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
            {(() => { return (
              <span className={`font-semibold px-1.5 py-0.5 rounded inline-block w-fit text-[9px] sm:text-[10px] mt-1 ${status === VoucherStatus.ACTIVE ? 'bg-green-100 text-green-700' : status === VoucherStatus.EXPIRED ? 'bg-gray-200 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                {status === VoucherStatus.ACTIVE ? 'Còn hiệu lực' : status === VoucherStatus.EXPIRED ? 'Hết hạn' : 'Sắp bắt đầu'}
              </span>
            ); })()}
            
            {!eligibility.eligible && eligibility.reason && (
              <span className="bg-red-100 text-red-700 text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block w-fit">
                {eligibilityMessage}
              </span>
            )}
          </div>
          <div className="flex justify-end">
            {(() => { return (
            <Link href={status === VoucherStatus.ACTIVE && eligibility.eligible ? "/shop" : "#"}>
              <button
                disabled={status !== VoucherStatus.ACTIVE || !eligibility.eligible}
                className={`px-2 sm:px-3 py-1 rounded font-bold text-[10px] sm:text-xs shadow transition
                  ${status !== VoucherStatus.ACTIVE || !eligibility.eligible
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"}
                `}
                title={!eligibility.eligible ? eligibilityMessage : ''}
              >
                {status === VoucherStatus.ACTIVE 
                  ? (eligibility.eligible ? 'Sử Dụng' : 'Không đủ điều kiện')
                  : (status === VoucherStatus.UPCOMING ? 'Sắp bắt đầu' : 'Hết hạn')}
              </button>
            </Link>
            ); })()}
          </div>
        </div>
      </div>
      );
      })}
    </div>
  );
};

export default VoucherList;

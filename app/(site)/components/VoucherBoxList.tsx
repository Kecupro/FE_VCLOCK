"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaTicketAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { IVoucher } from "../cautrucdata";
import { calcStatus, VoucherStatus, checkEligibility, getEligibilityMessage } from "../utils/voucherUtils";
import type { Swiper as SwiperType } from 'swiper';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(date: string | number | Date) {
  return new Date(date).toLocaleDateString('vi-VN');
}

const VoucherBoxList = () => {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVoucher, setSavingVoucher] = useState<string | null>(null);
  const [savedVoucherStates, setSavedVoucherStates] = useState<{ id: string, used: boolean }[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [userOrderCount, setUserOrderCount] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchUserOrderCount = async () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const userId = userRaw ? (JSON.parse(userRaw)?._id as string | undefined) : undefined;
    if (!token || !userId) return;

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        params: { user_id: userId },
      });
      if (res.status === 200 && Array.isArray(res.data)) {
        const completedOrders = (res.data as Array<{ order_status?: string }>).filter((order) => {
          const st = (order.order_status || '').toLowerCase();
          return st === 'hoanthanh' || st === 'dagiaohang' || st === 'completed' || st === 'delivered';
        });
        setUserOrderCount(completedOrders.length);
      }
    } catch (error) {
      console.error("Lỗi tải số đơn hàng:", error);
    }
  };

  const formatTimeRemaining = (target: Date, current: Date) => {
    const diff = Math.max(0, target.getTime() - current.getTime());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) {
      return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const refreshVoucherStates = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSavedVoucherStates([]);
      return;
    }
    
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/voucher-user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 200 && Array.isArray(res.data)) {
        const arr = (res.data as (IVoucher & { used?: boolean })[]).map(v => ({ 
          id: v._id, 
          used: !!v.used 
        }));
        setSavedVoucherStates(arr);
      } else {
        setSavedVoucherStates([]);
      }
    } catch (error) {
      console.error("Lỗi làm mới trạng thái voucher:", error);
      setSavedVoucherStates([]);
    }
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher`);
        const allVouchers = (res.data as { list: IVoucher[] }).list || [];
        
        // Lọc bỏ các voucher đã hết hạn
        const activeVouchers = allVouchers.filter(voucher => calcStatus(voucher, now) !== VoucherStatus.EXPIRED);
        
        setVouchers(activeVouchers);
      } catch {
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [now]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshVoucherStates();
      fetchUserOrderCount();
    }
  }, []);

  const handleSaveVoucher = async (voucherId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để lưu voucher!");
      return;
    }

    setSavingVoucher(voucherId);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/voucher-user/save`,
        { voucher_id: voucherId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success((response.data as { message: string }).message);
      
      setSavedVoucherStates((prev) => [...prev, { id: voucherId, used: false }]);
      
      setTimeout(() => {
        refreshVoucherStates();
      }, 1000);
      
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || "Có lỗi xảy ra khi lưu voucher!";
      toast.error(errorMessage);
    } finally {
      setSavingVoucher(null);
    }
  };

  const handleMouseEnter = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
    }
  };

  const handleMouseLeave = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  if (loading) return null;
  if (!vouchers.length) return null;

  return (
    <div className="w-full bg-gray-50 py-8">
        <h3 className="text-center font-bold text-xl mb-4 text-gray-800">
          VOUCHER KHUYẾN MÃI
        </h3>
        <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
        <div 
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        
        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            380: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="voucher-swiper"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {vouchers
            .slice()
            .sort((a, b) => calcStatus(a, now) - calcStatus(b, now))
            .filter((v) => checkEligibility(v, userOrderCount, now).eligible)
            .map((v) => {
            const savedState = savedVoucherStates.find(s => s.id === v._id);
            const isSaved = !!savedState;
            const isUsed = savedState?.used;
            const status = calcStatus(v, now);
            const eligibility = checkEligibility(v, userOrderCount, now);
            const eligibilityMessage = getEligibilityMessage(eligibility.reason, eligibility.reason === 'min_orders' ? 3 : undefined);
            
            return (
              <SwiperSlide key={v._id}>
                <div className="relative flex w-full h-[120px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white px-3 py-2 w-[120px] rounded-l-lg relative z-20">
                    <FaTicketAlt size={24} color="#fff" />
                    <span className="font-bold text-xs text-center leading-tight line-clamp-2 mt-1">{v.voucher_name}</span>
                    <span className="bg-white text-[10px] font-semibold px-2 py-1 rounded text-gray-800 mt-1">{v.voucher_code}</span>
                    <span className="text-[9px] mt-1 text-center">HSD: {formatDate(v.end_date)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between pl-4 px-3 py-2 bg-white">
                    <div className="space-y-1 overflow-hidden">
                      <div className="text-red-500 font-bold text-sm leading-tight truncate">
                        {v.discount_type === "percentage" ? `Giảm ${v.discount_value}%` : `Giảm ${formatCurrency(v.discount_value)}`}
                        {v.max_discount && v.discount_type === "percentage" && (
<span className="text-xs text-gray-500 ml-1 whitespace-nowrap">(Tối đa {formatCurrency(v.max_discount)})</span>
                        )}
                      </div>
                      <div className="text-gray-700 font-semibold text-xs truncate">Đơn tối thiểu: {formatCurrency(v.minimum_order_value || 0)}</div>
                      <span className={
                        (status === VoucherStatus.ACTIVE ? "bg-green-100 text-green-700" :
                        status === VoucherStatus.EXPIRED ? "bg-gray-200 text-gray-500" :
                        "bg-yellow-100 text-yellow-700 animate-pulse") +
                        " text-[9px] font-semibold px-2 py-1 rounded inline-block w-fit mt-1"
                      }>
                        {status === VoucherStatus.ACTIVE ? "Còn hạn" :
                        status === VoucherStatus.EXPIRED ? "Hết hạn" : `Sắp bắt đầu • ${formatTimeRemaining(new Date(v.start_date), now)}`}
                      </span>
                      {!eligibility.eligible && eligibility.reason && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-semibold px-2 py-1 rounded inline-block w-fit">
                          {eligibilityMessage}
                        </span>
                      )}
                    </div>
                    <button
                      className={
                        `self-end mt-2 px-3 py-1 rounded-md font-bold transition text-xs disabled:opacity-50 disabled:cursor-not-allowed ` +
                        (status !== VoucherStatus.ACTIVE || !eligibility.eligible
                          ? 'bg-gray-400 text-white'
                          : isUsed
                          ? 'bg-gray-600 text-white'
                          : isSaved
                          ? 'bg-black text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white')
                      }
                      onClick={() => handleSaveVoucher(v._id)}
                      disabled={status !== VoucherStatus.ACTIVE || !eligibility.eligible || savingVoucher === v._id || isSaved || isUsed}
                      title={!eligibility.eligible ? eligibilityMessage : ''}
                    >
                      {status === VoucherStatus.EXPIRED
                        ? "Hết hạn"
                        : status === VoucherStatus.UPCOMING
                        ? "Sắp bắt đầu"
                        : !eligibility.eligible
                        ? "Không đủ điều kiện"
                        : isUsed
                        ? "Đã sử dụng"
                        : isSaved
                        ? "Đã lưu"
                        : savingVoucher === v._id
                        ? "Đang lưu..."
                        : "Lưu"}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        </div>
      </div>
  );
};

export default VoucherBoxList;
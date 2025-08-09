import React, { useEffect, useState } from "react";
import { FaTicketAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { IVoucher } from "../cautrucdata";
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(date: string | number | Date) {
  return new Date(date).toLocaleDateString('vi-VN');
}

function getVoucherStatus(start: string | number | Date, end: string | number | Date) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now < startDate) return 2; 
  if (now > endDate) return 1; 
  return 0; 
}

const VoucherBoxList = () => {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVoucher, setSavingVoucher] = useState<string | null>(null);
  const [savedVoucherStates, setSavedVoucherStates] = useState<{ id: string, used: boolean }[]>([]);

  const refreshVoucherStates = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSavedVoucherStates([]);
      return;
    }
    
    try {
      const res = await axios.get(`http://localhost:3000/voucher-user`, {
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
        const res = await axios.get(`http://localhost:3000/api/admin/voucher`);
        setVouchers((res.data as { list: IVoucher[] }).list || []);
      } catch {
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshVoucherStates();
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
        `http://localhost:3000/api/voucher-user/save`,
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
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message
: "Có lỗi xảy ra khi lưu voucher!";
      toast.error(errorMessage);
    } finally {
      setSavingVoucher(null);
    }
  };


  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  if (loading) return null;
  if (!vouchers.length) return null;

  return (
    <div className="w-full bg-gray-50 py-8">
        <h3 className="text-center font-bold text-2xl mb-3">
          VOUCHER KHUYẾN MÃI
        </h3>
        <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
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
        >
          {vouchers.map((v) => {
            const savedState = savedVoucherStates.find(s => s.id === v._id);
            const isSaved = !!savedState;
            const isUsed = savedState?.used;
            

            
            return (
              <SwiperSlide key={v._id}>
                <div className="relative flex w-full h-[120px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Left column */}
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white px-3 py-2 w-[120px] rounded-l-lg relative z-20">
                    <FaTicketAlt size={24} color="#fff" />
                    <span className="font-bold text-xs text-center leading-tight line-clamp-2 mt-1">{v.voucher_name}</span>
                    <span className="bg-white text-[10px] font-semibold px-2 py-1 rounded text-gray-800 mt-1">{v.voucher_code}</span>
                    <span className="text-[9px] mt-1 text-center">HSD: {formatDate(v.end_date)}</span>
                  </div>
                  
                  {/* Right column */}
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
                        (getVoucherStatus(v.start_date || '', v.end_date) === 0 ? "bg-green-100 text-green-700" :
                        getVoucherStatus(v.start_date || '', v.end_date) === 1 ? "bg-gray-200 text-gray-500" :
                        "bg-yellow-100 text-yellow-700") +
                        " text-[9px] font-semibold px-2 py-1 rounded inline-block w-fit mt-1"
                      }>
                        {getVoucherStatus(v.start_date || '', v.end_date) === 0 ? "Còn hạn" :
                        getVoucherStatus(v.start_date || '', v.end_date) === 1 ? "Hết hạn" : "Sắp bắt đầu"}
                      </span>
                    </div>
                    <button
                      className={
                        `self-end mt-2 px-3 py-1 rounded-md font-bold transition text-xs disabled:opacity-50 disabled:cursor-not-allowed ` +
                        (getVoucherStatus(v.start_date || '', v.end_date) === 1
                          ? 'bg-gray-400 text-white'
                          : isUsed
                          ? 'bg-gray-600 text-white'
                          : isSaved
                          ? 'bg-black text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white')
                      }
                      onClick={() => handleSaveVoucher(v._id)}
                      disabled={getVoucherStatus(v.start_date || '', v.end_date) === 1 || savingVoucher === v._id || isSaved || isUsed}
                    >
                      {getVoucherStatus(v.start_date || '', v.end_date) === 1
                        ? "Hết hạn"
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
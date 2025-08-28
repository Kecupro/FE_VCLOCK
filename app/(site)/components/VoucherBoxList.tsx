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
import { useAuth } from "../context/AuthContext";

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
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const { openAuthModal } = useAuth();

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
      // Lấy thông tin user để biết ngày tạo
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (user) {
        setUserCreatedAt(user.createdAt || user.created_at || null);
      }

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
          const token = localStorage.getItem("token");
        
                if (token) {
          try {
            // Sử dụng API mới để lấy tất cả voucher phù hợp với target_audience của user
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/voucher-user/available`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const userVouchers = (res.data as IVoucher[]) || [];
            
            // Lọc bỏ các voucher đã hết hạn
            const activeVouchers = userVouchers.filter(voucher => calcStatus(voucher, now) !== VoucherStatus.EXPIRED);
            
            // Sắp xếp: voucher chưa lưu trước, đã lưu sau
            const sortedVouchers = activeVouchers.sort((a, b) => {
              const aSaved = savedVoucherStates.find(s => s.id === a._id);
              const bSaved = savedVoucherStates.find(s => s.id === b._id);
              
              // Nếu a chưa lưu và b đã lưu -> a trước
              if (!aSaved && bSaved) return -1;
              // Nếu a đã lưu và b chưa lưu -> b trước  
              if (aSaved && !bSaved) return 1;
              // Cả hai cùng trạng thái -> giữ nguyên thứ tự
              return 0;
            });
            
            setVouchers(sortedVouchers);
            return; // Thoát nếu thành công
          } catch (userError) {
            console.warn("⚠️ Không thể fetch user vouchers, fallback to public:", userError);
            // Fallback to public vouchers nếu user API fail
          }
        }
        
                // Fallback: Lấy voucher public cho tất cả
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher`);
          const allVouchers = (res.data as { list: IVoucher[] }).list || [];
          
          // Chỉ lấy voucher dành cho tất cả và chưa hết hạn
          const publicVouchers = allVouchers.filter(voucher => 
            (voucher.target_audience === 'all' || !voucher.target_audience) && 
            calcStatus(voucher, now) !== VoucherStatus.EXPIRED
          );
            
            // Sắp xếp: voucher chưa lưu trước, đã lưu sau
            const sortedPublicVouchers = publicVouchers.sort((a, b) => {
              const aSaved = savedVoucherStates.find(s => s.id === a._id);
              const bSaved = savedVoucherStates.find(s => s.id === b._id);
              
              // Nếu a chưa lưu và b đã lưu -> a trước
              if (!aSaved && bSaved) return -1;
              // Nếu a đã lưu và b chưa lưu -> b trước  
              if (aSaved && !bSaved) return 1;
              // Cả hai cùng trạng thái -> giữ nguyên thứ tự
              return 0;
            });
            
            setVouchers(sortedPublicVouchers);
        } catch (publicError) {
          console.error("❌ Không thể fetch public vouchers:", publicError);
          setVouchers([]);
        }
      } catch (error) {
        console.error("❌ Lỗi fetch voucher:", error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [userOrderCount, userCreatedAt, savedVoucherStates]); // Chỉ chạy khi cần thiết

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshVoucherStates();
      fetchUserOrderCount();
    }
  }, []);

  // Thêm function để refresh voucher list
  const refreshVoucherList = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/voucher-user/available`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userVouchers = (res.data as IVoucher[]) || [];
        const activeVouchers = userVouchers.filter(voucher => 
          checkEligibility(voucher, userOrderCount, now, userCreatedAt || undefined).eligible
        );
        
        // Sắp xếp: voucher chưa lưu trước, đã lưu sau
        const sortedVouchers = activeVouchers.sort((a, b) => {
          const aSaved = savedVoucherStates.find(s => s.id === a._id);
          const bSaved = savedVoucherStates.find(s => s.id === b._id);
          
          // Nếu a chưa lưu và b đã lưu -> a trước
          if (!aSaved && bSaved) return -1;
          // Nếu a đã lưu và b chưa lưu -> b trước  
          if (aSaved && !bSaved) return 1;
          // Cả hai cùng trạng thái -> giữ nguyên thứ tự
          return 0;
        });
        
        setVouchers(sortedVouchers);
      } catch (error) {
        console.error("Lỗi refresh voucher list:", error);
      }
    } else {
      // Khi đăng xuất, chỉ hiển thị voucher public
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher`);
        const allVouchers = (res.data as { list: IVoucher[] }).list || [];
        const publicVouchers = allVouchers.filter(voucher => 
          (voucher.target_audience === 'all' || !voucher.target_audience) && 
          calcStatus(voucher, now) !== VoucherStatus.EXPIRED
        );
        setVouchers(publicVouchers);
      } catch (error) {
        console.error("Lỗi refresh public voucher list:", error);
      }
    }
  };

  // Refresh voucher list khi token thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    // Kiểm tra token mỗi 1 giây để detect thay đổi
    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== localStorage.getItem("lastToken")) {
        localStorage.setItem("lastToken", currentToken || "");
        refreshVoucherList();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []); // Bỏ dependency [now] để tránh vòng lặp vô hạn

  const handleSaveVoucher = async (voucherId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      openAuthModal();
      return;
    }

          // Bỏ debug logs
    
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
      
      const newSavedState = { id: voucherId, used: false };
      
      setSavedVoucherStates((prev) => {
        const newState = [...prev, newSavedState];
        return newState;
      });
      
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
        <h3 className="text-center font-bold text-2xl mb-4 text-gray-800">
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
            .sort((a, b) => {
              // Sắp xếp theo thứ tự: trạng thái -> đã lưu/đã sử dụng -> thời gian
              const statusA = calcStatus(a, now);
              const statusB = calcStatus(b, now);
              
              // Nếu trạng thái khác nhau, ưu tiên trạng thái
              if (statusA !== statusB) {
                return statusA - statusB;
              }
              
              // Nếu cùng trạng thái, ưu tiên voucher chưa lưu trước
              const aSaved = savedVoucherStates.find(s => s.id === a._id);
              const bSaved = savedVoucherStates.find(s => s.id === b._id);
              const aIsSaved = !!aSaved;
              const bIsSaved = !!bSaved;
              
              if (aIsSaved !== bIsSaved) {
                return aIsSaved ? 1 : -1; // Chưa lưu trước, đã lưu sau
              }
              
              // Nếu cùng trạng thái lưu, giữ nguyên thứ tự
              return 0;
            })
            .filter((v) => {
              const savedState = savedVoucherStates.find(s => s.id === v._id);
              const isUsed = savedState?.used;
              // Chỉ hiển thị voucher chưa sử dụng và đủ điều kiện
              return !isUsed && checkEligibility(v, userOrderCount, now, userCreatedAt || undefined).eligible;
            })
            .map((v) => {
            const savedState = savedVoucherStates.find(s => s.id === v._id);
            const isSaved = !!savedState;
            const isUsed = savedState?.used;
            const status = calcStatus(v, now);
            const eligibility = checkEligibility(v, userOrderCount, now, userCreatedAt || undefined);
            const eligibilityMessage = getEligibilityMessage(eligibility.reason, eligibility.customerType);
            
            return (
              <SwiperSlide key={v._id}>
                <div className={`relative flex w-full h-[120px] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  isUsed 
                    ? 'bg-gray-100 opacity-75' 
                    : isSaved 
                    ? 'bg-gray-50' 
                    : 'bg-white'
                }`}>
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white px-3 py-2 w-[120px] rounded-l-lg relative z-20">
                    <FaTicketAlt size={24} color="#fff" />
                    <span className="font-bold text-xs text-center leading-tight line-clamp-2 mt-1">{v.voucher_name}</span>
                    <span className="bg-white text-[10px] font-semibold px-2 py-1 rounded text-gray-800 mt-1">{v.voucher_code}</span>
                    <span className="text-[9px] mt-1 text-center">HSD: {formatDate(v.end_date)}</span>
                  </div>
                  
                  {/* Badge trạng thái - chỉ hiển thị khi đã sử dụng */}
                  {isUsed && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white z-30 bg-gray-600">
                      Đã sử dụng
                    </div>
                  )}
                  
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
                          ? 'bg-gray-500 text-white cursor-not-allowed'
                          : isSaved
                          ? 'bg-gray-500 text-white cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white')
                      }
                      onClick={() => !isSaved && !isUsed ? handleSaveVoucher(v._id) : undefined}
                      disabled={status !== VoucherStatus.ACTIVE || !eligibility.eligible || savingVoucher === v._id || isSaved || isUsed}
                      title={
                        isUsed ? 'Voucher đã được sử dụng' :
                        isSaved ? 'Voucher đã được lưu' :
                        !eligibility.eligible ? eligibilityMessage : ''
                      }
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
                        : "Lưu voucher"}
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
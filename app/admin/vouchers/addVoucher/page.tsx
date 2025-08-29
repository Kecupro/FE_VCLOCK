"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import styles from '../../assets/css/add.module.css';
import 'react-toastify/dist/ReactToastify.css';

const AddVoucher = () => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | ''>('');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minOrderValue, setMinOrderValue] = useState<string>('');
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('all');

  // Validation states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voucherNameRef = useRef<HTMLInputElement>(null);
  const voucherCodeRef = useRef<HTMLInputElement>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  // Real-time validation cho discountValue
  useEffect(() => {
    if (discountType === 'percentage' && discountValue !== '' && Number(discountValue) > 50) {
      setDiscountValue('');
      toast.warning('Giá trị giảm giá đã vượt quá 50% cho loại giảm theo phần trăm.');
    }
  }, [discountType, discountValue]);

  // Real-time validation cho maxDiscount
  useEffect(() => {
    if (discountType && discountValue && maxDiscount) {
      const discount = Number(discountValue);
      const maxDisc = Number(maxDiscount);
      
      if (discountType === 'fixed' && maxDisc < discount) {
        setErrors(prev => ({
          ...prev,
          maxDiscount: 'Giá trị giảm tối đa phải lớn hơn hoặc bằng giá trị giảm'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.maxDiscount;
          return newErrors;
        });
      }
    }
  }, [discountType, discountValue, maxDiscount]);

  // Real-time validation cho ngày
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        setErrors(prev => ({
          ...prev,
          startDate: 'Ngày bắt đầu phải từ hôm nay trở đi'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.startDate;
          return newErrors;
        });
      }

      if (end <= start) {
        setErrors(prev => ({
          ...prev,
          endDate: 'Ngày kết thúc phải sau ngày bắt đầu'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.endDate;
          return newErrors;
        });
      }
    }
  }, [startDate, endDate]);

  // Validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    const voucher_name = voucherNameRef.current?.value.trim();
    const voucher_code = voucherCodeRef.current?.value.trim();

    // Validation tên voucher
    if (!voucher_name) {
      newErrors.voucherName = 'Vui lòng nhập tên mã khuyến mãi.';
    } else if (voucher_name.length < 3) {
      newErrors.voucherName = 'Tên mã khuyến mãi phải có ít nhất 3 ký tự.';
    } else if (voucher_name.length > 100) {
      newErrors.voucherName = 'Tên mã khuyến mãi không được vượt quá 100 ký tự.';
    }

    // Validation mã voucher
    if (!voucher_code) {
      newErrors.voucherCode = 'Vui lòng nhập mã khuyến mãi.';
    } else if (voucher_code.length < 3) {
      newErrors.voucherCode = 'Mã khuyến mãi phải có ít nhất 3 ký tự.';
    } else if (voucher_code.length > 20) {
      newErrors.voucherCode = 'Mã khuyến mãi không được vượt quá 20 ký tự.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(voucher_code)) {
      newErrors.voucherCode = 'Mã khuyến mãi chỉ được chứa chữ cái, số, dấu gạch ngang và dấu gạch dưới.';
    }

    // Validation loại giảm giá
    if (!discountType) {
      newErrors.discountType = 'Vui lòng chọn loại giảm giá.';
    }

    // Validation giá trị giảm
    if (discountValue === '') {
      newErrors.discountValue = 'Vui lòng nhập giá trị giảm giá.';
    } else {
      const discount = Number(discountValue);
      if (isNaN(discount) || discount <= 0) {
        newErrors.discountValue = 'Giá trị giảm giá phải là số dương.';
      } else if (discountType === 'percentage' && discount > 50) {
        newErrors.discountValue = 'Giảm giá theo phần trăm tối đa chỉ được 50%.';
      }
    }

    // Validation giá trị đơn hàng tối thiểu
    if (minOrderValue !== '') {
      const minOrder = Number(minOrderValue);
      if (isNaN(minOrder) || minOrder < 0) {
        newErrors.minOrderValue = 'Giá trị đơn hàng tối thiểu phải là số dương.';
      }
    }

    // Validation giá trị giảm tối đa
    if (maxDiscount === '') {
      newErrors.maxDiscount = 'Vui lòng nhập giá trị giảm tối đa.';
    } else {
      const maxDisc = Number(maxDiscount);
      if (isNaN(maxDisc) || maxDisc <= 0) {
        newErrors.maxDiscount = 'Giá trị giảm tối đa phải là số dương.';
      } else if (discountType === 'fixed' && discountValue) {
        const discount = Number(discountValue);
        if (maxDisc < discount) {
          newErrors.maxDiscount = 'Giá trị giảm tối đa phải lớn hơn hoặc bằng giá trị giảm.';
        }
      }
    }

    // Validation ngày bắt đầu
    if (!startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu.';
    } else {
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        newErrors.startDate = 'Ngày bắt đầu phải từ hôm nay trở đi.';
      }
    }

    // Validation ngày kết thúc
    if (!endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc.';
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra và sửa các lỗi trong form.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const voucher_name = voucherNameRef.current?.value.trim();
    const voucher_code = voucherCodeRef.current?.value.trim();

    const discount = Number(discountValue);
    const minOrder = minOrderValue === '' ? 0 : Number(minOrderValue);
    const maxDisc = Number(maxDiscount);

    const body = {
      voucher_name,
      voucher_code,
      discount_type: discountType,
      discount_value: discount,
      start_date: startDate,
      end_date: endDate,
      minimum_order_value: minOrder,
      max_discount: maxDisc,
      target_audience: targetAudience,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/voucher/them`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Thêm voucher thành công!');
        setTimeout(() => router.push('/admin/vouchers'), 1500);
      } else {
        toast.error(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi thêm voucher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thêm khuyến mãi</h1>
        <Link href="/admin/vouchers" className={styles.returnButton}>
          Quay lại
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên mã khuyến mãi <span style={{color: "red"}}>*</span></label>
          <input 
            ref={voucherNameRef} 
            type="text" 
            className={`${styles.input} ${errors.voucherName ? styles.error : ''}`} 
            placeholder="Nhập tên khuyến mãi (3-100 ký tự)..." 
            maxLength={100}
          />
          {errors.voucherName && (
            <small className={styles.errorText}>{errors.voucherName}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mã khuyến mãi <span style={{color: "red"}}>*</span></label>
          <input 
            ref={voucherCodeRef} 
            type="text" 
            className={`${styles.input} ${errors.voucherCode ? styles.error : ''}`} 
            placeholder="Nhập mã khuyến mãi (3-20 ký tự, chỉ chữ cái, số, -_)..." 
            maxLength={20}
          />
          {errors.voucherCode && (
            <small className={styles.errorText}>{errors.voucherCode}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Loại giảm giá <span style={{color: "red"}}>*</span></label>
          <select
            className={`${styles.select} ${errors.discountType ? styles.error : ''}`}
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
          >
            <option value="">--- Chọn loại giảm giá ---</option>
            <option value="percentage">Giảm theo phần trăm (%)</option>
            <option value="fixed">Giảm theo số tiền cố định (đ)</option>
          </select>
          {errors.discountType && (
            <small className={styles.errorText}>{errors.discountType}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị giảm <span style={{color: "red"}}>*</span></label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={`${styles.input} ${errors.discountValue ? styles.error : ''}`}
            max={discountType === 'percentage' ? 50 : undefined}
            min={0}
            placeholder={
              discountType === 'percentage'
                ? 'Nhập phần trăm giảm (tối đa 50%)'
                : discountType === 'fixed'
                ? 'Nhập số tiền giảm (VD: 500.000đ)'
                : 'Chọn loại giảm giá trước'
            }
          />
          {errors.discountValue && (
            <small className={styles.errorText}>{errors.discountValue}</small>
          )}
          {discountType === 'percentage' && discountValue !== '' && Number(discountValue) > 50 && (
            <small style={{ fontSize: '12px', color: '#ff4757', display: 'block', marginTop: '5px' }}>
              ⚠️ Giá trị giảm không được vượt quá 50%
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị đơn hàng tối thiểu (đ)</label>
          <input
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            className={`${styles.input} ${errors.minOrderValue ? styles.error : ''}`}
            placeholder="Nhập giá trị tối thiểu (VD: 200.000đ)"
            min={0}
          />
          {errors.minOrderValue && (
            <small className={styles.errorText}>{errors.minOrderValue}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị giảm tối đa (đ) <span style={{color: "red"}}>*</span></label>
          <input
            type="number"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            className={`${styles.input} ${errors.maxDiscount ? styles.error : ''}`}
            placeholder="Nhập giảm tối đa (VD: 100.000đ)"
            min={0}
            required
          />
          {errors.maxDiscount && (
            <small className={styles.errorText}>{errors.maxDiscount}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày bắt đầu <span style={{color: "red"}}>*</span></label>
          <input 
            type="date" 
            className={`${styles.input} ${errors.startDate ? styles.error : ''}`} 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && (
            <small className={styles.errorText}>{errors.startDate}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày kết thúc <span style={{color: "red"}}>*</span></label>
          <input 
            type="date" 
            className={`${styles.input} ${errors.endDate ? styles.error : ''}`} 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}  
            min={startDate || new Date().toISOString().split('T')[0]}
          />
          {errors.endDate && (
            <small className={styles.errorText}>{errors.endDate}</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Đối tượng áp dụng <span style={{color: "red"}}>*</span></label>
          <select
            className={styles.select}
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          >
            <option value="all">Tất cả khách hàng</option>
            <option value="new_customer">Khách hàng mới</option>
            <option value="loyal_customer">Khách hàng thân thiết</option>
            <option value="vip_customer">Khách hàng VIP</option>
          </select>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.createButton} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
          </button>
          <Link href="/admin/vouchers" className={styles.cancelButton}>Hủy</Link>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{ color: "red" }}>*</strong> là bắt buộc phải nhập.</li>
              <li><strong>Tên mã khuyến mãi</strong>: 3-100 ký tự, <strong>Mã khuyến mãi</strong>: 3-20 ký tự (chỉ chữ cái, số, dấu -_)</li>
              <li>Phải chọn <strong>Loại giảm giá</strong> trước khi nhập <em>Giá trị giảm</em>.</li>
              <li><strong>Giá trị giảm tối đa</strong> là bắt buộc và phải lớn hơn 0.</li>
              <li>Khi chọn giảm theo phần trăm (%), <strong>giá trị giảm tối đa chỉ được 50%</strong>.</li>
              <li>Với giảm theo số tiền cố định, <strong>giá trị giảm tối đa phải ≥ giá trị giảm</strong>.</li>
              <li>Trường <em>Giá trị đơn hàng tối thiểu</em> chỉ chấp nhận số dương (đ).</li>
              <li><strong>Ngày bắt đầu</strong> phải từ hôm nay trở đi, <strong>Ngày kết thúc</strong> phải sau ngày bắt đầu.</li>
            </ul>
          </div>
        </div>

      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default AddVoucher;

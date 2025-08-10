"use client";



import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../assets/css/add.module.css';
import { toast, ToastContainer } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';

const EditVoucher = () => {
  const [voucherName, setVoucherName] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedDiscountType, setSelectedDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const searchParams = useSearchParams();
  const { isDarkMode } = useAppContext();
  const router = useRouter();
  const id = searchParams?.get('id');

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/voucher/${id}`);
        const data = await res.json();
        const v = data.voucher;
        setVoucherName(v.voucher_name);
        setVoucherCode(v.voucher_code);
        setSelectedDiscountType(v.discount_type);
        setDiscountValue(v.discount_value);
        setMinOrderValue(v.minimum_order_value);
        setMaxDiscount(v.max_discount || '');
        setStartDate(v.start_date?.slice(0, 10));
        setEndDate(v.end_date?.slice(0, 10));
      } catch {
        toast.error('Lỗi khi tải dữ liệu voucher!');
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voucherName.trim() || !voucherCode.trim()) {
      toast.error('Vui lòng nhập tên và mã khuyến mãi.');
      return;
    }

    const start = new Date(startDate);
      const end = new Date(endDate);
    
      if (end <= start) {
        toast.error('Ngày kết thúc phải sau ngày bắt đầu.');
        return;
      }
    
      const today = new Date();
      today.setHours(0, 0, 0, 0);
    
      let status: 0 | 1 | 2;
      if (today < start) {
        status = 2;
      } else if (today > end) {
        status = 1;
      } else {
        status = 0;
    }

    const payload = {
      voucher_name: voucherName,
      voucher_code: voucherCode,
      discount_type: selectedDiscountType,
      discount_value: Number(discountValue),
      minimum_order_value: Number(minOrderValue) || 0,
      max_discount: Number(maxDiscount) || 0,
      start_date: startDate,
      end_date: endDate,
      status,
    };

    try {
      const res = await fetch(`http://localhost:3000/api/admin/voucher/sua/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cập nhật thành công!');
        setTimeout(() => {
          router.push('/admin/vouchers');
        }, 1500);
      } else {
        toast.error(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch {
      toast.error('Lỗi khi cập nhật voucher.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chỉnh sửa khuyến mãi</h1>
        <button className={styles.returnButton} onClick={() => router.back()}>Quay lại</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên mã khuyến mãi <span style={{color: "red"}}>*</span></label>
          <input type="text" className={styles.input} value={voucherName} onChange={(e) => setVoucherName(e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mã khuyến mãi <span style={{color: "red"}}>*</span></label>
          <input type="text" className={styles.input} value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Loại giảm giá <span style={{color: "red"}}>*</span></label>
          <select className={styles.select} value={selectedDiscountType} onChange={(e) => setSelectedDiscountType(e.target.value as 'percentage' | 'fixed')}>
            <option value="fixed">Giảm theo số tiền cố định (đ)</option>
            <option value="percentage">Giảm theo phần trăm (%)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị giảm <span style={{color: "red"}}>*</span></label>
          <input type="number" className={styles.input} value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị đơn hàng tối thiểu (đ)</label>
          <input type="number" className={styles.input} value={minOrderValue} onChange={(e) => setMinOrderValue(Number(e.target.value))} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị giảm tối đa (đ)</label>
          <input type="number" className={styles.input} value={maxDiscount} onChange={(e) => setMaxDiscount(Number(e.target.value))} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày bắt đầu <span style={{color: "red"}}>*</span></label>
          <input type="date" className={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày kết thúc <span style={{color: "red"}}>*</span></label>
          <input type="date" className={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]}/>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.createButton}>Cập nhật</button>
          <button type="button" className={styles.cancelButton} onClick={() => router.back()}>Hủy</button>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>📋 Thông tin quan trọng:</h4>
            <ul className={styles.infoList}>
              <li>Các trường có dấu <strong style={{ color: "red" }}>*</strong> là bắt buộc phải nhập.</li>
              <li>Trường <em>Tên mã khuyến mãi</em> và <em>Mã khuyến mãi</em> là bắt buộc và phải duy nhất.</li>
              <li>Phải chọn <strong>Loại giảm giá</strong> trước khi nhập <em>Giá trị giảm</em>.</li>
              <li>Các trường <em>Giá trị đơn hàng tối thiểu</em> và <em>Giá trị giảm tối đa</em> chỉ chấp nhận số dương (đ).</li>
              <li><strong>Ngày kết thúc</strong> phải lớn hơn hoặc bằng <strong>ngày bắt đầu</strong>.</li>
            </ul>
          </div>
        </div>
        
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
};

export default EditVoucher;

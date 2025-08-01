'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import styles from '../../assets/css/add.module.css';
import 'react-toastify/dist/ReactToastify.css';

const AddVoucher = () => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | ''>('');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minOrderValue, setMinOrderValue] = useState<number | ''>('');
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');


  const voucherNameRef = useRef<HTMLInputElement>(null);
  const voucherCodeRef = useRef<HTMLInputElement>(null);

  const { isDarkMode } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add(styles['dark-mode']);
    else html.classList.remove(styles['dark-mode']);
  }, [isDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const voucher_name = voucherNameRef.current?.value.trim();
  const voucher_code = voucherCodeRef.current?.value.trim();

  const discount = Number(discountValue);
  const minOrder = Number(minOrderValue);
  const maxDisc = maxDiscount === '' ? 0 : Number(maxDiscount);

  if (isNaN(discount) || discount < 0) {
    toast.error('Giá trị giảm giá không được âm.');
    return;
  }

  if (isNaN(minOrder) || minOrder < 0) {
    toast.error('Giá trị đơn hàng tối thiểu không được âm.');
    return;
  }

  if (!isNaN(maxDisc) && maxDisc < 0) {
    toast.error('Giá trị giảm tối đa không được âm.');
    return;
  }

  if (!voucher_name || !voucher_code || !discountType || discountValue === '' || !startDate || !endDate) {
  toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
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

  const body = {
    voucher_name,
    voucher_code,
    discount_type: discountType,
    discount_value: Number(discountValue),
    start_date: startDate,
    end_date: endDate,
    minimum_order_value: Number(minOrderValue) || 0,
    max_discount: Number(maxDiscount) || 0,
    status,
  };

  try {
    const res = await fetch('http://localhost:3000/api/admin/voucher/them', {
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
          <input ref={voucherNameRef} type="text" className={styles.input} placeholder="Nhập tên khuyến mãi..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mã khuyến mãi <span style={{color: "red"}}>*</span></label>
          <input ref={voucherCodeRef} type="text" className={styles.input} placeholder="Nhập mã khuyến mãi..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Loại giảm giá <span style={{color: "red"}}>*</span></label>
          <select
            className={styles.select}
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
          >
            <option value="">--- Chọn loại giảm giá ---</option>
            <option value="percentage">Giảm theo phần trăm (%)</option>
            <option value="fixed">Giảm theo số tiền cố định (đ)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị giảm <span style={{color: "red"}}>*</span></label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            className={styles.input}
            placeholder={
              discountType == 'percentage'
                ? 'Nhập phần trăm giảm (VD: 10%)'
                : discountType == 'fixed'
                ? 'Nhập số tiền giảm (VD: 500.000đ)'
                : 'Chọn loại giảm giá trước'
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị đơn hàng tối thiểu (đ)</label>
          <input
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(Number(e.target.value))}
            className={styles.input}
            placeholder="Nhập giá trị tối thiểu (VD: 200.000đ)"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giá trị giảm tối đa (đ)</label>
          <input
            type="number"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(Number(e.target.value))}
            className={styles.input}
            placeholder="Nhập giảm tối đa (VD: 100.000đ)"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày bắt đầu <span style={{color: "red"}}>*</span></label>
          <input type="date" className={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày kết thúc <span style={{color: "red"}}>*</span></label>
          <input type="date" className={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)}  min={startDate || new Date().toISOString().split('T')[0]}/>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.createButton}>Tạo mới</button>
          <Link href="/admin/vouchers" className={styles.cancelButton}>Hủy</Link>
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

export default AddVoucher;

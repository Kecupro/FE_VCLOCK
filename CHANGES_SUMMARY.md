# Tóm Tắt Thay Đổi Cấu Hình API URLs

## ✅ Đã Hoàn Thành

### 1. Tạo File Cấu Hình API
- ✅ Tạo `app/config/api.ts` - File cấu hình tập trung cho tất cả API endpoints
- ✅ Sử dụng environment variable `NEXT_PUBLIC_API_URL` để quản lý URL động

### 2. Cập Nhật Files Đã Hoàn Thành
- ✅ `app/utils/avatarUtils.ts` - Cập nhật URL avatar
- ✅ `app/(site)/components/Header.tsx` - Cập nhật avatar và search suggestions
- ✅ `app/(site)/components/AuthModal.tsx` - Cập nhật tất cả auth endpoints
- ✅ `app/(site)/components/chatbox.tsx` - Cập nhật socket và messages API
- ✅ `app/(site)/context/AuthContext.tsx` - Cập nhật user profile API
- ✅ `app/(site)/components/News.tsx` - Cập nhật news API

### 3. Tạo Scripts và Hướng Dẫn
- ✅ `scripts/update-api-urls.js` - Script tự động cập nhật URLs
- ✅ `DEPLOYMENT_GUIDE.md` - Hướng dẫn deployment chi tiết

## 🔄 Cần Cập Nhật Tiếp

### Files Còn Lại (Có thể chạy script để tự động cập nhật)
- `app/(site)/news/page.tsx`
- `app/(site)/news/[id]/page.tsx`
- `app/(site)/search/page.tsx`
- `app/(site)/shop/page.tsx`
- `app/(site)/product/FormBinhLuan.tsx`
- `app/(site)/product/SPLienQuan.tsx`
- `app/(site)/product/HienBinhLuanSP.tsx`
- `app/(site)/product/[id]/page.tsx`
- `app/(site)/checkout/page.tsx`
- `app/(site)/contact/page.tsx`
- `app/(site)/components/Categories.tsx`
- `app/(site)/components/ProductNew.tsx`
- `app/(site)/components/Show1SP.tsx`
- `app/(site)/components/VoucherBoxList.tsx`
- `app/(site)/components/VoucherCard.tsx`
- `app/(site)/components/WishlistButton.tsx`
- `app/(site)/components/ProductSale.tsx`
- `app/(site)/components/AddressSelector.tsx`
- `app/(site)/components/Feedback.tsx`
- `app/(site)/account/FormBinhLuan.tsx`
- `app/(site)/account/page.tsx`
- `app/(site)/account/OrderCard .tsx`
- `app/admin/users/page.tsx`
- `app/admin/account/page.tsx`

## 🚀 Bước Tiếp Theo

### 1. Cập Nhật URL Railway Thực Tế
```bash
# Trong file app/config/api.ts, thay đổi:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-actual-railway-app.railway.app';
```

### 2. Chạy Script Tự Động Cập Nhật
```bash
cd duantn
node scripts/update-api-urls.js
```

### 3. Tạo Environment Variables
```bash
# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=https://your-actual-railway-app.railway.app" > .env.local
```

### 4. Cấu Hình Vercel
- Vào Vercel Dashboard > Settings > Environment Variables
- Thêm: `NEXT_PUBLIC_API_URL=https://your-actual-railway-app.railway.app`

### 5. Cấu Hình Railway
- Cập nhật callback URLs cho OAuth
- Thêm environment variables cần thiết

## 📝 Lưu Ý Quan Trọng

1. **Backend URLs**: Cần cập nhật callback URLs trong Google/Facebook OAuth
2. **CORS**: Đảm bảo backend cho phép requests từ Vercel domain
3. **Environment Variables**: Kiểm tra tất cả biến môi trường đã được cấu hình đúng
4. **Testing**: Test kỹ tất cả chức năng sau khi deploy

## 🔧 Troubleshooting

Nếu gặp lỗi:
1. Kiểm tra console browser
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra Railway logs
4. Đảm bảo CORS được cấu hình đúng 